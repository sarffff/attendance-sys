import { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Modal,
  Progress,
  Row,
  Skeleton,
  Space,
  Table,
  Typography,
} from 'antd';
import {
  BellOutlined,
  BulbOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useFetch } from '@/hooks/useFetch';
import {
  countLeaveInfoApi,
  countLeaveStatusApi,
  countLeaveTypeApi,
} from '@/api/login';
import { formatTime } from '@/utils/formatTime';
import { useAppSelector } from '@/hooks/useAppSelector';

const { Paragraph, Title, Text } = Typography;

const pageSizeOptions = ['5', '10', '20'];

const OtherRole = () => {
  const user = useAppSelector((state) => state.user.userInfo);
  const [messagePage, setMessagePage] = useState({ pageNum: 1, pageSize: 5 });
  const [selectedMessage, setSelectedMessage] = useState(null);

  const { data: leaveTypeData, loading: typeLoading } =
    useFetch(countLeaveTypeApi);
  const { data: leaveStatusData } = useFetch(countLeaveStatusApi);
  const { data: leaveInfoData, loading: infoLoading } = useFetch(
    () => countLeaveInfoApi(messagePage),
    [messagePage],
  );

  const leaveTypes = Array.isArray(leaveTypeData) ? leaveTypeData : [];
  const statusItems = useMemo(
    () => buildStatusItems(leaveStatusData),
    [leaveStatusData],
  );
  const totalTypeCount = leaveTypes.reduce(
    (sum, item) => sum + Number(item.requestCount || item.count || 0),
    0,
  );

  const messageColumns = [
    {
      title: '消息内容',
      dataIndex: 'content',
      ellipsis: true,
      render: (content, record) => (
        <Space align="start">
          <Avatar
            size={34}
            icon={<BellOutlined />}
            style={{ background: '#eef6ff', color: '#1677ff' }}
          />
          <div>
            <div style={styles.strongText}>{content || '暂无内容'}</div>
            <Text type="secondary" style={styles.metaText}>
              {record.senderName || '系统消息'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '发送时间',
      dataIndex: 'createdAt',
      width: 190,
      render: safeFormatTime,
    },
    {
      title: '操作',
      width: 80,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => setSelectedMessage(record)}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <Title level={3} style={styles.title}>
            控制台
          </Title>
          <Text type="secondary">
            查看请假概览、消息提醒与系统公告
          </Text>
        </div>
      </div>

      {/* 欢迎横幅 */}
      <Card bordered={false} style={styles.welcomeCard}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space align="start" size={20}>
              <Avatar
                size={64}
                icon={<UserOutlined />}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontSize: 28,
                }}
              />
              <div>
                <Title level={4} style={{ color: '#fff', margin: 0 }}>
                  欢迎回来，{user?.empName || user?.username || '用户'}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
                  祝你今天工作顺利！以下是你的请假概览与最新动态。
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space size={12}>
              <div style={styles.welcomeStat}>
                <div style={styles.welcomeStatValue}>
                  {statusItems.reduce(
                    (sum, item) => sum + Number(item.value || 0),
                    0,
                  )}
                </div>
                <div style={styles.welcomeStatLabel}>总申请数</div>
              </div>
              <div style={styles.welcomeDivider} />
              <div style={styles.welcomeStat}>
                <div style={styles.welcomeStatValue}>
                  {Number(
                    leaveStatusData?.pendingCount ||
                      statusItems.find((s) => s.key === 'pending')?.value ||
                      0,
                  )}
                </div>
                <div style={styles.welcomeStatLabel}>待审批</div>
              </div>
              <div style={styles.welcomeDivider} />
              <div style={styles.welcomeStat}>
                <div style={styles.welcomeStatValue}>
                  {Number(
                    leaveStatusData?.approvedCount ||
                      statusItems.find((s) => s.key === 'approved')?.value ||
                      0,
                  )}
                </div>
                <div style={styles.welcomeStatLabel}>已通过</div>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 请假类型统计 + 消息提醒 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            style={styles.card}
            title={
              <Space>
                <CalendarOutlined />
                请假类型统计
              </Space>
            }
          >
            <Skeleton active loading={typeLoading} paragraph={{ rows: 4 }}>
              {leaveTypes.length > 0 ? (
                <Row gutter={[12, 12]}>
                  {leaveTypes.map((item) => {
                    const count = Number(item.requestCount || item.count || 0);
                    const percent = totalTypeCount
                      ? Math.round((count / totalTypeCount) * 100)
                      : 0;

                    return (
                      <Col xs={24} sm={12} key={item.leaveTypeId}>
                        <div style={styles.typeItem}>
                          <div style={styles.typeHeader}>
                            <Text strong>
                              {item.leaveTypeName || item.leaveName || '未命名'}
                            </Text>
                            <Text style={styles.countText}>{count}</Text>
                          </div>
                          <Progress
                            percent={percent}
                            showInfo={false}
                            strokeColor="#1677ff"
                            trailColor="#eef2f7"
                          />
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Skeleton>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            style={styles.card}
            title={
              <Space>
                <BellOutlined />
                消息提醒
              </Space>
            }
          >
            <Table
              rowKey={(record) =>
                record.id || `${record.createdAt}-${record.content}`
              }
              columns={messageColumns}
              dataSource={leaveInfoData?.records || []}
              loading={infoLoading}
              pagination={{
                current: messagePage.pageNum,
                pageSize: messagePage.pageSize,
                total: leaveInfoData?.total || 0,
                showSizeChanger: true,
                pageSizeOptions,
                showTotal: (total) => `共 ${total} 条`,
              }}
              onChange={(pagination) =>
                setMessagePage({
                  pageNum: pagination.current,
                  pageSize: pagination.pageSize,
                })
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 公告与提示 */}
      <div style={styles.sectionTitle}>
        <BulbOutlined style={{ color: '#3b82f6' }} />
        <span>公告与提示</span>
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card bordered={false} style={styles.tipCard}>
            <div style={styles.tipIconWrap}>
              <SafetyCertificateOutlined
                style={{ fontSize: 28, color: '#10b981' }}
              />
            </div>
            <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 8 }}>
              签名管理须知
            </Text>
            <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.8 }}>
              请假审批前请确保已上传电子签名，申请人与班组长签名均为必需项。
              可在"个人设置"中随时更新签名图片。
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={styles.tipCard}>
            <div style={styles.tipIconWrap}>
              <CalendarOutlined style={{ fontSize: 28, color: '#3b82f6' }} />
            </div>
            <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 8 }}>
              请假流程说明
            </Text>
            <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.8 }}>
              提交请假申请后，需经班组长初审、部门领导复审。
              审批通过后系统将自动生成请假单，支持批量打印功能。
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={styles.tipCard}>
            <div style={styles.tipIconWrap}>
              <TeamOutlined style={{ fontSize: 28, color: '#f59e0b' }} />
            </div>
            <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 8 }}>
              考勤纪律提醒
            </Text>
            <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.8 }}>
              请按照公司考勤制度及时提交请假申请，病假需附相关证明。
              无故缺勤将影响月度考勤评定，请合理安排假期。
            </Text>
          </Card>
        </Col>
      </Row>

      <Modal
        title={selectedMessage?.title || '消息详情'}
        open={Boolean(selectedMessage)}
        footer={null}
        width={620}
        onCancel={() => setSelectedMessage(null)}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div style={styles.messageMeta}>
            <Text type="secondary">
              发送人：{selectedMessage?.senderName || '系统消息'}
            </Text>
            <Text type="secondary">
              发送时间：{safeFormatTime(selectedMessage?.createdAt)}
            </Text>
          </div>
          <Paragraph style={styles.messageContent}>
            {selectedMessage?.content || '暂无内容'}
          </Paragraph>
        </Space>
      </Modal>
    </div>
  );
};

const buildStatusItems = (data = {}) => [
  {
    key: 'pending',
    label: '待审批',
    value: Number(data?.pendingCount || 0),
    color: '#d97706',
    bg: '#fff7e6',
  },
  {
    key: 'approved',
    label: '已通过',
    value: Number(data?.approvedCount || 0),
    color: '#16a34a',
    bg: '#f0fdf4',
  },
];

const safeFormatTime = (time) => {
  if (!time) {
    return '-';
  }

  return formatTime(time);
};

const styles = {
  container: {
    minHeight: '100%',
    padding: '12px 0',
    background: '#f5f7fb',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  title: {
    margin: 0,
    color: '#111827',
    fontWeight: 800,
  },
  card: {
    height: '100%',
    borderRadius: 8,
    border: '1px solid #e7edf5',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
  },
  typeItem: {
    padding: 14,
    borderRadius: 8,
    background: '#f8fafc',
    border: '1px solid #eef2f7',
  },
  typeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  countText: {
    color: '#1677ff',
    fontSize: 18,
    fontWeight: 800,
  },
  strongText: {
    maxWidth: 320,
    color: '#111827',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  metaText: {
    fontSize: 12,
  },
  messageMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '12px 14px',
    borderRadius: 8,
    background: '#f8fafc',
  },
  messageContent: {
    marginBottom: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    color: '#111827',
    lineHeight: 1.8,
  },
  welcomeCard: {
    marginBottom: 20,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
    border: 'none',
    boxShadow: '0 8px 32px rgba(37, 99, 235, 0.25)',
  },
  welcomeStat: {
    textAlign: 'center',
    padding: '4px 20px',
  },
  welcomeStatValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 800,
    lineHeight: 1.2,
  },
  welcomeStatLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginTop: 4,
  },
  welcomeDivider: {
    width: 1,
    height: 40,
    background: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 16,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 12,
  },
  tipCard: {
    height: '100%',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    border: '1px solid #f0f0f0',
  },
  tipIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    background: '#f0fdf4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
};

export default OtherRole;

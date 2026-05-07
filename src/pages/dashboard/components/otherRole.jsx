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
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useFetch } from '@/hooks/useFetch';
import {
  countLeaveInfoApi,
  countLeaveStatusApi,
  countLeaveTypeApi,
} from '@/api/login';
import { leacesListThreeMonthApi } from '@/api/leaves';
import { formatTime } from '@/utils/formatTime';
import { applicantType, leaveStatusMap } from '@/constants/constantsMap';

const { Paragraph, Title, Text } = Typography;

const pageSizeOptions = ['5', '10', '20'];

const OtherRole = () => {
  const [messagePage, setMessagePage] = useState({ pageNum: 1, pageSize: 5 });
  const [leavePage, setLeavePage] = useState({ pageNum: 1, pageSize: 5 });
  const [selectedMessage, setSelectedMessage] = useState(null);

  const { data: leaveTypeData, loading: typeLoading } =
    useFetch(countLeaveTypeApi);
  const { data: leaveStatusData, loading: statusLoading } =
    useFetch(countLeaveStatusApi);
  const { data: leaveInfoData, loading: infoLoading } = useFetch(
    () => countLeaveInfoApi(messagePage),
    [messagePage],
  );
  const { data: leaveListData, loading: listLoading } = useFetch(
    () => leacesListThreeMonthApi(leavePage),
    [leavePage],
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
  const totalStatusCount = statusItems.reduce(
    (sum, item) => sum + Number(item.value || 0),
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

  const leaveColumns = [
    {
      title: '申请人',
      dataIndex: 'applicantName',
      width: 110,
      fixed: 'left',
      render: (name) => <Text strong>{name || '-'}</Text>,
    },
    {
      title: '人员类型',
      dataIndex: 'applicantType',
      width: 130,
      render: (type) => applicantType[type] || type || '-',
    },
    {
      title: '请假类型',
      dataIndex: 'leaveTypeName',
      width: 110,
      render: (type) => <Tag color="blue">{type || '-'}</Tag>,
    },
    {
      title: '天数',
      dataIndex: 'leaveDays',
      width: 90,
      render: (days) => `${days ?? 0} 天`,
    },
    {
      title: '请假时间',
      width: 310,
      render: (_, record) =>
        `${safeFormatTime(record.startTime)} ~ ${safeFormatTime(record.endTime)}`,
    },
    {
      title: '原因',
      dataIndex: 'reason',
      ellipsis: true,
      render: (reason) => reason || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (status) => {
        const statusConfig = leaveStatusMap[status];
        return (
          <Tag color={statusConfig?.color || 'default'}>
            {statusConfig?.text || status || '-'}
          </Tag>
        );
      },
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      width: 190,
      render: safeFormatTime,
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
            查看请假概览、审批状态、消息提醒与申请记录
          </Text>
        </div>
      </div>

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
                <CheckCircleOutlined />
                审批状态统计
              </Space>
            }
          >
            <Skeleton active loading={statusLoading} paragraph={{ rows: 4 }}>
              <Row gutter={[12, 12]}>
                {statusItems.map((item) => (
                  <Col xs={12} key={item.key}>
                    <div style={styles.statusCard}>
                      <Avatar
                        size={38}
                        icon={item.icon}
                        style={{ background: item.bg, color: item.color }}
                      />
                      <Statistic
                        title={item.label}
                        value={item.value}
                        valueStyle={{ color: '#111827', fontWeight: 800 }}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
              <div style={styles.statusFooter}>
                <Text style={styles.statusFooterText}>合计</Text>
                <Text strong style={styles.statusFooterText}>
                  {totalStatusCount} 条
                </Text>
              </div>
            </Skeleton>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={9}>
          <Card
            bordered={false}
            style={styles.card}
            title={
              <Space>
                <InboxOutlined />
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

        <Col xs={24} xl={15}>
          <Card
            bordered={false}
            style={styles.card}
            title={
              <Space>
                <FileTextOutlined />
                请假申请记录
              </Space>
            }
          >
            <Table
              rowKey="id"
              columns={leaveColumns}
              dataSource={leaveListData?.records || []}
              loading={listLoading}
              scroll={{ x: 1180 }}
              pagination={{
                current: leavePage.pageNum,
                pageSize: leavePage.pageSize,
                total: leaveListData?.total || 0,
                showQuickJumper: true,
                showSizeChanger: true,
                pageSizeOptions,
                showTotal: (total) => `共 ${total} 条`,
              }}
              onChange={(pagination) =>
                setLeavePage({
                  pageNum: pagination.current,
                  pageSize: pagination.pageSize,
                })
              }
            />
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
    icon: <ClockCircleOutlined />,
    color: '#d97706',
    bg: '#fff7e6',
  },
  {
    key: 'approved',
    label: '已通过',
    value: Number(data?.approvedCount || 0),
    icon: <CheckCircleOutlined />,
    color: '#16a34a',
    bg: '#f0fdf4',
  }
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
  statusCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 86,
    padding: 14,
    borderRadius: 8,
    background: '#f8fafc',
    border: '1px solid #eef2f7',
  },
  statusFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 14,
    padding: '12px 14px',
    borderRadius: 8,
    background: '#111827',
    color: '#fff',
  },
  statusFooterText: {
    color: '#fff',
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
};

export default OtherRole;

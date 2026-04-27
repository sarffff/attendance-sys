import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Avatar,
  Button,
  Typography,
  Tag,
  Space,
  Table,
  Modal,
  Select,
  Input,
  Segmented,
  Progress,
  message,
  Form,
} from 'antd';
import {
  ThunderboltOutlined,
  UsergroupAddOutlined,
  RadarChartOutlined,
  SendOutlined,
  CloudServerOutlined,
  SafetyOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { useFetch } from '@/hooks/useFetch';
import { messageSendApi, userListApi } from '@/api/super_admin';

const { Title, Text } = Typography;
const { TextArea } = Input;
const ALL_USERS_VALUE = '__ALL_USERS__';

const SuperAdmin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const searchUserParams = {
    pageNum: 1,
    pageSize: 999,
  };

  const { data: userData } = useFetch(() => userListApi(searchUserParams));

  const users = userData?.records || [];
  const allUserIds = users
    .filter((user) => user.id !== 1)
    .map((user) => user.id);
  const userOptions = [
    {
      label: '全站',
      value: ALL_USERS_VALUE,
    },
    ...users.map((user) => ({
      label: user.empName,
      value: user.id,
    })),
  ];

  const resourceStats = [
    { title: 'CPU 负载', percent: 24, color: '#3b82f6' },
    { title: '内存占用', percent: 68, color: '#f59e0b' },
    { title: '磁盘 IO', percent: 12, color: '#10b981' },
  ];

  const columns = [
    {
      title: '操作对象',
      dataIndex: 'target',
      key: 'target',
    },
    {
      title: '指令动作',
      dataIndex: 'action',
      key: 'action',
      render: (t) => <Tag color="orange">{t}</Tag>,
    },
    {
      title: 'IP 地址',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: '执行时间',
      dataIndex: 'time',
      key: 'time',
    },
  ];

  const tableData = [
    {
      key: '1',
      target: 'Auth_Service',
      action: 'RESTART',
      ip: '192.168.1.102',
      time: '2026-04-19 14:20',
    },
    {
      key: '2',
      target: 'DB_Cluster',
      action: 'BACKUP',
      ip: '10.0.0.5',
      time: '2026-04-19 12:00',
    },
    {
      key: '3',
      target: 'Gateway',
      action: 'CONFIG_UPDATE',
      ip: '172.16.0.1',
      time: '2026-04-19 09:30',
    },
  ];

  const openModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };
  const handleSendMessage = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const isAllUsers = values.targetUserIds.includes(ALL_USERS_VALUE);
      const targetUserIds = isAllUsers ? allUserIds : values.targetUserIds;

      await messageSendApi({
        targetUserIds,
        title: values.title,
        content: values.content,
      });

      message.success(
        isAllUsers
          ? '成功向全站用户发送系统指令'
          : `成功向 ${targetUserIds.length} 位用户发送系统指令`,
      );
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.log('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sectionHeader}>
        <Title level={3} style={styles.sectionTitle}>
          <RadarChartOutlined style={{ marginRight: 12, color: '#3b82f6' }} />
          系统资源监控
        </Title>
      </div>
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {resourceStats.map((item) => (
          <Col xs={24} md={8} key={item.title}>
            <Card bordered={false} style={styles.monitorCard}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text strong>{item.title}</Text>
                <Tag color={item.percent > 80 ? 'red' : 'blue'}>健康</Tag>
              </div>
              <Progress
                percent={item.percent}
                strokeColor={item.color}
                showInfo={false}
                style={{ marginTop: 20 }}
              />
              <div style={{ marginTop: 8, textAlign: 'right' }}>
                <Text style={{ fontSize: 20, fontWeight: 800 }}>
                  {item.percent}%
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <SafetyOutlined /> 系统安全审计日志
              </Space>
            }
            bordered={false}
            style={styles.mainCard}
            extra={<Button type="link">导出报告</Button>}
          >
            <Table
              pagination={{ pageSize: 5 }}
              columns={columns}
              dataSource={tableData}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card bordered={false} style={styles.actionCenterCard}>
            <div style={styles.actionHeader}>
              <div style={styles.actionIcon}>
                <ThunderboltOutlined style={{ color: '#fff' }} />
              </div>
              <Title level={4} style={{ margin: 0, color: '#fff' }}>
                紧急指令中心
              </Title>
            </div>

            <div style={styles.actionBody}>
              <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
                需要向特定人员或部门下发临时通知、维护公告或管理指令？
              </Text>
              <Button
                type="primary"
                block
                icon={<SendOutlined />}
                style={styles.modalTriggerBtn}
                onClick={openModal}
              >
                分发系统消息
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <Space>
            <div style={styles.modalTitleIcon}>
              <SendOutlined />
            </div>
            <span>发送系统消息</span>
          </Space>
        }
        open={isModalOpen}
        onOk={handleSendMessage}
        confirmLoading={loading}
        onCancel={() => setIsModalOpen(false)}
        okText="确认发送"
        cancelText="取消"
        centered
        width={520}
        styles={{ body: { padding: '24px 0' } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="targetUserIds"
            label="接收用户 (支持多选)"
            rules={[{ required: true, message: '请选择接收用户' }]}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="搜索用户、部门或角色"
              options={userOptions}
              maxTagCount="responsive"
              showSearch
              optionFilterProp="label"
              onChange={(value) => {
                if (value.includes(ALL_USERS_VALUE)) {
                  form.setFieldValue('targetUserIds', [ALL_USERS_VALUE]);
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="title"
            label="消息标题"
            rules={[{ required: true, message: '请输入消息标题' }]}
          >
            <Input placeholder="请输入消息标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="消息内容"
            rules={[{ required: true, message: '请输入消息内容' }]}
          >
            <TextArea rows={6} placeholder="请输入需要下发的具体指令内容..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const styles = {
  container: { padding: '12px 0' },
  sectionHeader: { marginBottom: 20 },
  sectionTitle: {
    fontWeight: 800,
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
  },

  monitorCard: {
    borderRadius: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    border: '1px solid #f1f5f9',
  },

  mainCard: {
    borderRadius: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
  },

  actionCenterCard: {
    borderRadius: '28px',
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    height: '100%',
    padding: '10px',
  },
  actionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: 24,
  },
  actionIcon: {
    width: 44,
    height: 44,
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '14px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 22,
  },
  actionBody: {
    background: 'rgba(255,255,255,0.05)',
    padding: '24px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  modalTriggerBtn: {
    marginTop: 24,
    height: 50,
    borderRadius: '14px',
    border: 'none',
    background: '#3b82f6',
    fontWeight: 600,
    boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
  },

  modalTitleIcon: {
    width: 32,
    height: 32,
    background: '#eff6ff',
    color: '#3b82f6',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default SuperAdmin;

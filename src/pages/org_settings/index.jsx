import { useState, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Tag,
  Popconfirm,
  message,
  Typography,
  Badge,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  PoweroffOutlined,
  ApartmentOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  orgAddApi,
  orgListApi,
  orgEditApi,
  orgToggleApi,
} from '@/api/super_admin';
import { orgMap } from '@/constants/constantsMap';
import BaseTable from '@/components/BaseTable';

const { Title, Text } = Typography;

const OrganizationSettings = () => {
  const [isRefresh, setIsRefresh] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [orgName, setOrgName] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    orgName: '',
  });

  const columns = [
    {
      title: '组织ID',
      dataIndex: 'orgCode',
      width: 100,
    },
    {
      title: '组织名称',
      dataIndex: 'orgName',
      render: (text) => (
        <Space>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #e8f4fd 0%, #bdd7f5 100%)',
              color: '#1677ff',
              fontSize: 13,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {text?.[0]}
          </span>
          <Text strong style={{ fontSize: 14 }}>
            {text}
          </Text>
        </Space>
      ),
    },
    {
      title: '组织类型',
      dataIndex: 'orgType',
      width: 120,
      render: (orgType) => orgMap[orgType],
    },
    {
      title: '是否启用',
      dataIndex: 'isEnabled',
      width: 120,
      render: (isEnabled) => {
        return (
          <Badge
            status={isEnabled ? 'success' : 'default'}
            text={isEnabled ? '是' : '否'}
          />
        );
      },
    },
    {
      title: '操作',
      width: 140,
      fixed: 'right',
      render: (_, record) => {
        return orgOpreations(record);
      },
    },
  ];

  const refresh = () => setIsRefresh((prev) => !prev);

  const openAdd = () => {
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditRecord(record);
    form.setFieldsValue({
      orgName: record.orgName,
      orgType: record.orgType,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const params = {
      orgName: form.getFieldValue('orgName'),
      orgType: form.getFieldValue('orgType'),
    };
    const values = await form.validateFields();
    setConfirmLoading(true);
    if (editRecord) {
      Object.assign(params, {
        ...values,
        sortNo: editRecord.sortNo,
        isEnabled: editRecord.isEnabled,
      });
    }
    editRecord
      ? await orgEditApi(editRecord.id, params)
      : await orgAddApi(params);
    message.success(editRecord ? '编辑成功' : '添加成功');
    setModalOpen(false);
    refresh();

    setConfirmLoading(false);
  };

  const handleToggle = useCallback(async (record) => {
    await orgToggleApi(record.id, {
      isEnabled: record.isEnabled === 1 ? 0 : 1,
    });
    message.success(record.isEnabled === 1 ? '已停用' : '已启用');
    refresh();
  }, []);

  const handleClear = () => {
    setOrgName('');
    handlePressEnter(null, '');
  };

  const handlePressEnter = (e, overrideValue) => {
    const valueToSearch =
      overrideValue !== undefined ? overrideValue : e.target.value;

    setSearchParams((prev) => {
      return {
        ...prev,
        orgName: valueToSearch,
      };
    });
  };

  const orgOpreations = (record) => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
        }}
      >
        <div style={{ flex: 1 }}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
            style={{
              width: '100%',
              color: '#fff',
              background: 'linear-gradient(135deg, #409EFF 0%, #1677ff 100%)',
              border: 'none',
              borderRadius: '9999px',
              padding: '4px 10px',
              fontSize: '13px',
              fontWeight: '500',
              boxShadow: '0 2px 6px rgba(64, 158, 255, 0.3)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            编辑
          </Button>
        </div>

        <div style={{ flex: 1 }}>
          <Popconfirm
            title={
              record.isEnabled === 1 ? '确定停用该组织？' : '确定启用该组织？'
            }
            onConfirm={() => handleToggle(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              size="small"
              icon={<PoweroffOutlined />}
              style={{
                width: '100%',
                color: '#fff',
                background:
                  record.isEnabled === 1
                    ? 'linear-gradient(135deg, #F56C6C 0%, #ff4d4f 100%)'
                    : 'linear-gradient(135deg, #67C23A 0%, #52c41a 100%)',
                border: 'none',
                borderRadius: '9999px',
                padding: '4px 10px',
                fontSize: '13px',
                fontWeight: '500',
                boxShadow:
                  record.isEnabled === 1
                    ? '0 2px 6px rgba(255, 77, 79, 0.3)'
                    : '0 2px 6px rgba(82, 196, 26, 0.3)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {record.isEnabled === 1 ? '停用' : '启用'}
            </Button>
          </Popconfirm>
        </div>
      </div>
    );
  };
  return (
    <div
      style={{
        padding: '24px',
        background: '#f5f7fa',
      }}
    >
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(22,119,255,0.3)',
          }}
        >
          <ApartmentOutlined style={{ color: '#fff', fontSize: 18 }} />
        </div>
        <div>
          <Title level={4} style={{ margin: 0, lineHeight: 1.2 }}>
            组织管理
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            管理企业组织架构信息
          </Text>
        </div>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        {
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <Space>
              <Input
                prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                placeholder="搜索组织名称"
                allowClear
                style={{ width: 220, borderRadius: 8 }}
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                onPressEnter={(e) => {
                  handlePressEnter(e);
                }}
                onClear={handleClear}
              />
            </Space>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAdd}
              style={{
                borderRadius: 8,
                background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
                border: 'none',
                boxShadow: '0 3px 10px rgba(22,119,255,0.3)',
                fontWeight: 500,
              }}
            >
              新增组织
            </Button>
          </div>
        }

        <BaseTable
          rowKey="id"
          columns={columns}
          request={orgListApi}
          params={searchParams}
          isRefresh={isRefresh}
        />
      </Card>

      <Modal
        title={
          <Space>
            <ApartmentOutlined style={{ color: '#1677ff' }} />
            {editRecord ? '编辑组织' : '新增组织'}
          </Space>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={confirmLoading}
        okText="确定"
        cancelText="取消"
        width={480}
        styles={{ body: { paddingTop: 8 } }}
        style={{ borderRadius: 12 }}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item
            label="组织名称"
            name="orgName"
            rules={[{ required: true, message: '请输入组织名称' }]}
          >
            <Input
              placeholder="请输入组织名称"
              maxLength={50}
              showCount
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
          <Form.Item
            label="组织类型"
            name="orgType"
            rules={[{ required: true, message: '请选择组织类型' }]}
          >
            <Select placeholder="请选择组织类型">
              {Object.entries(orgMap).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
                .table-row-stripe td { background: #fafbfc !important; }
                .ant-table-thead > tr > th {
                    background: #f0f5ff !important;
                    font-weight: 600 !important;
                    color: #2c3e50 !important;
                    font-size: 13px !important;
                }
                .ant-table-row:hover td { background: #f0f7ff !important; }
            `}</style>
    </div>
  );
};

export default OrganizationSettings;

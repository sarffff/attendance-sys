import { useState, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Space,
  Popconfirm,
  message,
  Typography,
  Badge,
  Select,
  Tag,
  Tooltip,
  Empty,
  InputNumber,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  PoweroffOutlined,
  SearchOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  ApartmentOutlined,
  EditOutlined,
  SwapRightOutlined,
  InfoCircleOutlined,
  ForkOutlined,
} from '@ant-design/icons';

import {
  orgListApi,
  approveAuthSaveApi,
  approveAuthListApi,
  approveAuthToggleApi,
} from '@/api/super_admin';
import { useFetch } from '@/hooks/useFetch';
import BaseTable from '@/components/BaseTable';
import { allRoles } from '@/constants/roleCode';
import { leaveScopeMap } from '@/constants/constantsMap';

const { Title, Text } = Typography;

const ApproveSettings = () => {
  const [isRefresh, setIsRefresh] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterOrgId, setFilterOrgId] = useState(null);
  const [filterLeaveScope, setFilterLeaveScope] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const queryParams = {
    orgUnitId: filterOrgId,
    leaveScope: filterLeaveScope,
  };

  const refresh = () => setIsRefresh((prev) => !prev);

  const { data: orgData } = useFetch(() =>
    orgListApi({ pageNum: 1, pageSize: 999 }),
  );
  const orgOptions = (orgData?.records || []).map((o) => ({
    label: o.orgName,
    value: o.id,
  }));

  const roleCodeOptions = Object.entries(allRoles).map((value) => ({
    label: value[1],
    value: value[0],
  }));

  const leaveScopeOptions = Object.entries(leaveScopeMap).map((value) => ({
    label: value[1],
    value: value[0],
  }));

  const openEdit = (record) => {
    form.resetFields();
    form.setFieldsValue({
      id: record.id,
      leaveScope: record.leaveScope,
      orgUnitId: record.orgUnitId,
      roleCode: allRoles[record.roleCode],
      maxDays: record.maxDays || 0,
      minDays: record.minDays || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setConfirmLoading(true);
    await approveAuthSaveApi(values);
    message.success('审批权限保存成功');
    setModalOpen(false);
    refresh();
    setConfirmLoading(false);
  };

  const handleToggle = useCallback(async (record) => {
    await approveAuthToggleApi(record.id, {
      isEnabled: record.isEnabled === 1 ? 0 : 1,
    });
    message.success(record.isEnabled === 1 ? '已停用' : '已启用');
    refresh();
  }, []);

  const resetQueryParams = () => {
    setFilterOrgId(null);
    setFilterLeaveScope(null);
  };

  const columns = [
    {
      title: '所属组织',
      dataIndex: 'orgUnitId',
      render: (orgId) => {
        const org = orgOptions.find((o) => o.value === orgId);
        return org ? org.label : '—';
      },
    },
    {
      title: '适用身份',
      dataIndex: 'roleCode',
      render: (code) => {
        return (
          <Tag color="blue" style={{ borderRadius: 6, fontWeight: 500 }}>
            {allRoles[code] || code}
          </Tag>
        );
      },
    },
    {
      title: '请假类别',
      dataIndex: 'leaveScope',
      render: (scope) => {
        return (
          <Tag color="geekblue" style={{ borderRadius: 6, fontWeight: 500 }}>
            {leaveScopeMap[scope] || scope}
          </Tag>
        );
      },
    },
    {
      title: '是否启用',
      dataIndex: 'isEnabled',
      render: (status) => {
        const color = status === 1 ? 'green' : 'red';
        const text = status === 1 ? '启用中' : '已停用';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '请假最长天数',
      dataIndex: 'maxDays',
      render: (maxDays, record) => {
        return record.maxDays ? maxDays : '无限制';
      },
    },
    {
      title: '请假最短天数',
      dataIndex: 'minDays',
      render: (minDays, record) => {
        return record.minDays ? minDays : '无限制';
      },
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        return approvalOpretions(record);
      },
    },
  ];

  const approvalOpretions = (record) => {
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
            编辑权限
          </Button>
        </div>

        <div style={{ flex: 1 }}>
          <Popconfirm
            title={
              record.isEnabled === 1
                ? '确定停用该审批权限？'
                : '确定启用该审批权限？'
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
        minHeight: '100vh',
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
            background: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(250,140,22,0.3)',
          }}
        >
          <SafetyCertificateOutlined style={{ color: '#fff', fontSize: 18 }} />
        </div>
        <div>
          <Title level={4} style={{ margin: 0, lineHeight: 1.2 }}>
            审批权限
          </Title>
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
            <Select
              allowClear
              placeholder="按组织筛选"
              style={{ width: 180, borderRadius: 8 }}
              options={orgOptions}
              value={filterOrgId}
              onChange={(val) => {
                setFilterOrgId(val ?? null);
              }}
              suffixIcon={<ApartmentOutlined style={{ color: '#bbb' }} />}
            />

            <Select
              allowClear
              placeholder="按请假类别筛选"
              style={{ width: 180, borderRadius: 8 }}
              options={leaveScopeOptions}
              value={filterLeaveScope}
              onChange={(val) => {
                setFilterLeaveScope(val ?? null);
              }}
              suffixIcon={<ForkOutlined style={{ color: '#bbb' }} />}
            />

            <Button type="primary" onClick={resetQueryParams}>
              重置
            </Button>
          </Space>
        </div>

        <BaseTable
          rowKey="id"
          columns={columns}
          request={approveAuthListApi}
          params={queryParams}
          isRefresh={isRefresh}
        />
      </Card>

      {/* 编辑弹窗 */}
      <Modal
        title={
          <Space size="small">
            <div
              style={{
                background: '#fff7e6',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
              }}
            >
              <SafetyCertificateOutlined
                style={{ color: '#fa8c16', fontSize: '18px' }}
              />
            </div>
            <span style={{ fontWeight: 600 }}>修改审批权限</span>
          </Space>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={confirmLoading}
        okText="保存配置"
        cancelText="取消"
        width={520}
        centered
        styles={{
          body: { paddingTop: 20, paddingBottom: 8 },
          mask: { backdropFilter: 'blur(4px)' },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
          initialValues={{ minDays: 0, maxDays: 1 }}
        >
          <Form.Item name="id" hidden={true} />

          <Form.Item name="leaveScope" hidden={true} />

          <Form.Item name="orgUnitId" hidden={true} />

          <Form.Item
            label={<span style={{ fontWeight: 500 }}>适用身份</span>}
            name="roleCode"
            rules={[{ required: true, message: '请选择身份' }]}
            extra="设置该权限条目所关联的用户角色"
          >
            <Select
              placeholder="请选择身份角色"
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={roleCodeOptions}
              suffixIcon={<UserOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Form.Item>

          {/* 天数配置区 - 栅格布局并排 */}
          <div
            style={{
              background: '#fafafa',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #f0f0f0',
              marginTop: 24,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="最短天数"
                  name="minDays"
                  rules={[{ required: true, message: '必填' }]}
                >
                  <InputNumber
                    placeholder="0"
                    style={{
                      width: '100%',
                      borderRadius: 6,
                    }}
                    min={0}
                    addonAfter="天"
                    controls={false} // 隐藏调节按钮更清爽
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="最长天数"
                  name="maxDays"
                  rules={[{ required: true, message: '必填' }]}
                >
                  <InputNumber
                    placeholder="不限"
                    style={{
                      width: '100%',
                      borderRadius: 6,
                    }}
                    min={0}
                    addonAfter="天"
                    controls={false}
                  />
                </Form.Item>
              </Col>
            </Row>
            <div
              style={{
                fontSize: '12px',
                color: '#8c8c8c',
                marginTop: -8,
              }}
            >
              <InfoCircleOutlined style={{ marginRight: 4 }} />
              天数设置需符合：最短天数 ≤ 最长天数
            </div>
          </div>
        </Form>
      </Modal>
      <style>{`
                .table-row-stripe td { background: #fafbfc !important; }
                .ant-table-thead > tr > th {
                    background: #fff7e6 !important;
                    font-weight: 600 !important;
                    color: #2c3e50 !important;
                    font-size: 13px !important;
                }
                .ant-table-row:hover td { background: #fff7e6 !important; }
            `}</style>
    </div>
  );
};

export default ApproveSettings;

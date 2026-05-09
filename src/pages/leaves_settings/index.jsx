import { useState } from 'react';
import {
  Card,
  Button,
  Form,
  Input,
  Space,
  Tag,
  Typography,
  Modal,
  DatePicker,
  message,
  Select,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  SnippetsOutlined,
  EditOutlined,
  ReloadOutlined,
  ApartmentOutlined,
  UserOutlined,
  SearchOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import {
  orgListApi,
  allLeaveListApi,
  leaveApplyTimeEditApi,
} from '@/api/super_admin';
import { useFetch } from '@/hooks/useFetch';
import BaseTable from '@/components/BaseTable';
import { formatTime } from '@/utils/formatTime';
import { leaveStatusMap as map, applicantType } from '@/constants/constantsMap';

const { Title } = Typography;

const LeavesSettings = () => {
  const [isRefresh, setIsRefresh] = useState(false);
  const [filterApplicantName, setFilterApplicantName] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    applicantName: '',
  });

  const refresh = () => setIsRefresh((prev) => !prev);

  const { data: orgData } = useFetch(() =>
    orgListApi({ pageNum: 1, pageSize: 999 }),
  );

  const orgUnitName = (orgUnitId) => {
    const orgUnit = orgData?.records?.find((o) => o.id === orgUnitId);
    return orgUnit?.orgName || '';
  };

  const handleEditClick = (record) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      applicantName: record.applicantName,
      submittedAt: dayjs(record.submittedAt),
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditingRecord(null);
    editForm.resetFields();
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      setEditLoading(true);

      await leaveApplyTimeEditApi(editingRecord.id, {
        submittedAt: values.submittedAt.format('YYYY-MM-DD HH:mm:ss'),
      });

      message.success('申请时间修改成功');
      handleEditModalClose();
      refresh();
    } catch (error) {
      console.error('编辑失败:', error);
      if (error.errorFields) {
        message.error('请填写完整信息');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const operationButtons = (record) => {
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
            onClick={() => handleEditClick(record)}
            style={{
              width: '100%',
              color: '#fff',
              background: 'linear-gradient(135deg, #13c2c2 0%, #0e8a8a 100%)',
              border: 'none',
              borderRadius: '9999px',
              padding: '4px 10px',
              fontSize: '13px',
              fontWeight: '500',
              boxShadow: '0 2px 6px rgba(19, 194, 194, 0.3)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            编辑
          </Button>
        </div>
      </div>
    );
  };

   const handleClear = () => {
    setFilterApplicantName('');
    handlePressEnter(null, '');
  };

  const handlePressEnter = (e, overrideValue) => {
    const valueToSearch =
      overrideValue !== undefined ? overrideValue : e.target.value;

    setSearchParams((prev) => {
      return {
        ...prev,
        applicantName: valueToSearch,
      };
    });
  };

  const columns = [
    {
      title: '所属部门',
      dataIndex: 'orgUnitName',
      width: 250,
      render: (text, record) => {
        return orgUnitName(record.orgUnitId);
      },
    },
    {
      title: '申请人',
      dataIndex: 'applicantName',
      width: 120,
    },
    {
      title: '职位',
      dataIndex: 'applicantType',
      render: (type) => {
        return applicantType[type] || type;
      },
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'leaveTypeName',
      width: 100,
    },
    {
      title: '请假时间',
      render: (r) => `${formatTime(r.startTime)} ~ ${formatTime(r.endTime)}`,
    },
    {
      title: '申请时间',
      render: (r) => formatTime(r.submittedAt),
      width: 180,
    },
    {
      title: '天数',
      dataIndex: 'leaveDays',
      width: 70,
    },
    {
      title: '班组长',
      dataIndex: 'teamLeaderSnapshot',
      width: 100,
    },
    {
      title: '原因',
      dataIndex: 'reason',
      ellipsis: {
        showTitle: false,
      },
      render: (reason) => <Tooltip title={reason}>{reason}</Tooltip>,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: {
        showTitle: false,
      },
      render: (remark) => <Tooltip title={remark}>{remark}</Tooltip>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => {
        return <Tag color={map[status]?.color}>{map[status]?.text}</Tag>;
      },
      width: 100,
    },
    {
      title: '操作',
      fixed: 'right',
      width: 80,
      render: (_, record) => operationButtons(record),
    },
  ];

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
            background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(114, 46, 209, 0.3)',
          }}
        >
          <CalendarOutlined style={{ color: '#fff', fontSize: 18 }} />
        </div>
        <div>
          <Title level={4} style={{ margin: 0, lineHeight: 1.2 }}>
            请假记录
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
          <Space wrap>
            <Input
              placeholder="请输入申请人名称"
              style={{ width: 200, borderRadius: 8 }}
              value={filterApplicantName}
              onChange={(e) => setFilterApplicantName(e.target.value)}
              onPressEnter={(e) => handlePressEnter(e)}
              onClear={handleClear}
              allowClear
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
            />

            <Space>
              <Button type="primary" onClick={handleClear}>
                重置
              </Button>
            </Space>
          </Space>
        </div>

        <BaseTable
          rowKey="id"
          columns={columns}
          request={allLeaveListApi}
          params={searchParams}
          isRefresh={isRefresh}
        />
      </Card>

      <Modal
        title={
          <Space size="small">
            <div
              style={{
                background: '#f9f0ff',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
              }}
            >
              <SnippetsOutlined
                style={{ color: '#722ed1', fontSize: '18px' }}
              />
            </div>
            <span style={{ fontWeight: 600 }}>编辑申请时间</span>
          </Space>
        }
        open={editModalOpen}
        onOk={handleEditSubmit}
        onCancel={handleEditModalClose}
        confirmLoading={editLoading}
        okText="保存"
        cancelText="取消"
        width={520}
        centered
        styles={{
          body: { paddingTop: 20, paddingBottom: 8 },
          mask: { backdropFilter: 'blur(4px)' },
        }}
      >
        <Form form={editForm} layout="vertical" requiredMark="optional">
          <Form.Item
            label={<span style={{ fontWeight: 500 }}>申请人</span>}
            name="applicantName"
            rules={[{ required: true }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label={<span style={{ fontWeight: 500 }}>申请时间</span>}
            name="submittedAt"
            rules={[{ required: true, message: '请选择申请时间' }]}
            extra="修改请假单的申请提交时间"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeavesSettings;

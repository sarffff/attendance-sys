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
  Tooltip,
} from 'antd';
import {
  SnippetsOutlined,
  EditOutlined,
  SearchOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import {
  orgListApi,
  allLeaveListApi,
  leaveApplyTimeEditApi,
  leaveApproveTimeEditApi,
} from '@/api/super_admin';
import { useFetch } from '@/hooks/useFetch';
import BaseTable from '@/components/BaseTable';
import { formatTime } from '@/utils/formatTime';
import { leaveStatusMap as map, applicantType } from '@/constants/constantsMap';
import { leaveStatusMap } from '../../constants/constantsMap';

const { Title } = Typography;

const LeavesSettings = () => {
  const [isRefresh, setIsRefresh] = useState(false);
  const [filterApplicantName, setFilterApplicantName] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approvingRecord, setApprovingRecord] = useState(null);
  const [approveForm] = Form.useForm();
  const [approveLoading, setApproveLoading] = useState(false);
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
      startTime: dayjs(record.startTime),
    });
    setEditModalOpen(true);
  };

  const getApprovalDate = (approval) => {
    const date = approval?.signatureDate || approval?.approvedAt;
    return date ? dayjs(date) : null;
  };

  const handleApproveEditClick = (record) => {
    const approvals = Array.isArray(record.approvals) ? record.approvals : [];

    setApprovingRecord(record);
    approveForm.setFieldsValue({
      applicantName: record.applicantName,
      approvals: approvals.map((approval) => ({
        signatureDate: getApprovalDate(approval),
      })),
    });
    setApproveModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditingRecord(null);
    editForm.resetFields();
  };

  const handleApproveModalClose = () => {
    setApproveModalOpen(false);
    setApprovingRecord(null);
    approveForm.resetFields();
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      if (values.submittedAt && values.startTime) {
        if (values.submittedAt.isAfter(values.startTime)) {
          message.error('申请时间必须早于请假开始时间');
          return;
        }
      }
      setEditLoading(true);

      await leaveApplyTimeEditApi(editingRecord.id, {
        submittedAt: values.submittedAt.format('YYYY-MM-DDTHH:mm:ss'),
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

  const handleApproveSubmit = async () => {
    const approvals = Array.isArray(approvingRecord?.approvals)
      ? approvingRecord.approvals
      : [];

    if (!approvals.length) {
      message.warning('当前请假记录暂无审批流程');
      return;
    }

    try {
      const values = await approveForm.validateFields();
      setApproveLoading(true);

      await Promise.all(
        approvals.map((approval, index) =>
          leaveApproveTimeEditApi(approvingRecord.id, {
            stepNo: approval.stepNo,
            signatureDate: values.approvals[index].signatureDate.format(
              'YYYY-MM-DDTHH:mm:ss',
            ),
          }),
        ),
      );

      message.success('审批时间修改成功');
      handleApproveModalClose();
      refresh();
    } catch (error) {
      console.error('编辑审批时间失败:', error);
      if (error.errorFields) {
        message.error('请填写完整审批时间');
      }
    } finally {
      setApproveLoading(false);
    }
  };

  const operationButtons = (record) => {
    const baseButtonStyle = {
      width: '100%',
      border: 'none',
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 500,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      whiteSpace: 'nowrap',
    };

    return (
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEditClick(record)}
          style={{
            ...baseButtonStyle,
            color: '#fff',
            background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
          }}
        >
          修改申请时间
        </Button>
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleApproveEditClick(record)}
          style={{
            ...baseButtonStyle,
            color: '#fff',
            background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
          }}
        >
          修改审批时间
        </Button>
      </Space>
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
      width: 200,
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
            name="startTime"
            hidden
          ></Form.Item>
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
            <span style={{ fontWeight: 600 }}>编辑审批时间</span>
          </Space>
        }
        open={approveModalOpen}
        onOk={handleApproveSubmit}
        onCancel={handleApproveModalClose}
        confirmLoading={approveLoading}
        okText="保存"
        cancelText="取消"
        width={720}
        centered
        styles={{
          body: { paddingTop: 20, paddingBottom: 8 },
          mask: { backdropFilter: 'blur(4px)' },
        }}
      >
        <Form form={approveForm} layout="vertical" requiredMark="optional">
          <Form.Item
            label={<span style={{ fontWeight: 500 }}>申请人</span>}
            name="applicantName"
          >
            <Input disabled />
          </Form.Item>

          {Array.isArray(approvingRecord?.approvals) &&
          approvingRecord.approvals.length ? (
            approvingRecord.approvals.map((approval, index) => (
              <Card
                key={`${approval.stepNo}-${index}`}
                size="small"
                style={{ marginBottom: 12, borderRadius: 10 }}
                styles={{ body: { padding: 12 } }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 220px',
                    gap: 16,
                    alignItems: 'center',
                  }}
                >
                  <Space direction="vertical" size={4}>
                    <Space wrap size={6}>
                      <Tag color="purple">第 {approval.stepNo} 步</Tag>
                      <span style={{ fontWeight: 600 }}>
                        {approval.stepName || '审批流程'}
                      </span>
                      {approval.approvalStatus && (
                        <Tag
                          color={
                            approval.approvalStatus === 'APPROVED'
                              ? 'green'
                              : 'default'
                          }
                        >
                          {leaveStatusMap[approval.approvalStatus]?.text}
                        </Tag>
                      )}
                    </Space>
                    <span style={{ color: '#666' }}>
                      {approval.approverRoleName ||
                        approval.approverRoleCode ||
                        '-'}
                      {approval.approverName
                        ? ` / ${approval.approverName}`
                        : ''}
                    </span>
                  </Space>

                  <Form.Item
                    name={['approvals', index, 'signatureDate']}
                    rules={[{ required: true, message: '请选择审批时间' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="请选择审批时间"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>
              </Card>
            ))
          ) : (
            <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>
              暂无审批流程
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default LeavesSettings;

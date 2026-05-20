import {
  Card,
  Tabs,
  Button,
  Tag,
  message,
  Form,
  Select,
  Tooltip,
  Modal,
  Alert,
  Input,
  DatePicker,
} from 'antd';
import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import BaseTable from '@/components/BaseTable';
import NoOperation from '@/components/NoOperation';
import LeaveDetailModal from '@/components/LeaveDetailModal';
import { formatTime } from '@/utils/formatTime';
import {
  leacesMonthlyListApi,
  leacesTypeApi,
  leacesStatusApi,
  leacesDetailApi,
  leacesApproveApi,
  leacesBatchApproveApi,
  leacesSelectLeaderApi,
  leacesSelectLeaderListApi,
} from '@/api/leaves';
import { orgListApi } from '@/api/super_admin';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
  leave_step,
  leaveStatusMap as map,
  applicantType,
  leaderList,
} from '@/constants/constantsMap';
import dayjs from 'dayjs';

const { TextArea } = Input;
const Approval = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');
  const user = useAppSelector((state) => state.user.userInfo);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [isRefresh, setIsRefresh] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [leaderModalOpen, setLeaderModalOpen] = useState(false);
  const [batchLeaderList, setBatchLeaderList] = useState([]);
  const [approvedAt, setApprovedAt] = useState(null);
  const [approvedDateOpen, setApprovedDateOpen] = useState(false);
  const [filterForm] = Form.useForm();
  const [chooseLeaderForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const { data: typeData } = useFetch(leacesTypeApi);
  const { data: statusData } = useFetch(leacesStatusApi);
  const { data: orgData } = useFetch(() =>
    orgListApi({ pageNum: 1, pageSize: 999 }),
  );
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectMode, setRejectMode] = useState('single');
  const [filters, setFilters] = useState({
    status: '',
    leaveTypeId: null,
  });

  const needChooseLeaderStep = [3];
  const needOperation = ['PENDING', 'APPROVING'];


  const orgUnitName = (orgUnitId) => {
    const orgUnit = orgData?.records.find((o) => o.id === orgUnitId);
    return orgUnit?.orgName || '';
  };

  const columns = [
    {
      title: '所属部门',
      dataIndex: 'orgUnitName',
      render: (text, record) => {
        return orgUnitName(record.orgUnitId);
      },
      hidden: user?.roleCode === 'ORG_PRINCIPAL',
    },
    {
      title: '申请人',
      dataIndex: 'applicantName',
      render: (text, record) => (
        <a
          onClick={async () => {
            const data = await leacesDetailApi(record.id);
            setCurrentRow(data);
            setDetailOpen(true);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '职位',
      dataIndex: 'applicantType',
      render: (type) => {
        return applicantType[type];
      },
    },
    { title: '类型', dataIndex: 'leaveTypeName' },
    {
      title: '时间',
      render: (r) => `${formatTime(r.startTime)} ~ ${formatTime(r.endTime)}`,
    },
    { title: '天数', dataIndex: 'leaveDays' },
    { title: '班组长', dataIndex: 'teamLeaderSnapshot' },
    { title: '原因', dataIndex: 'reason' },
    { title: '备注', dataIndex: 'remark' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => {
        return <Tag color={map[status]?.color}>{map[status]?.text}</Tag>;
      },
    },
    {
      title: '操作',
      fixed: 'right',
      render: (_, record) => {
        return judgeNeedOperation(record) ? (
          judgeNeedChooseLeader(record) ? (
            chooseLeaderOperation(record)
          ) : (
            approvalOperations(record)
          )
        ) : (
          <NoOperation />
        );
      },
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: !judgeNeedOperation(record),
      name: record.name,
    }),
    selectedRowKeys: selectedRows.map((row) => row.id),
  };

  const approvalOperations = (record) => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Button
          size="small"
          style={{
            width: '100%',
            height: 32,
            padding: '0 16px',
            borderRadius: 16,
            border: 'none',
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            color: '#fff',
            boxShadow: '0 2px 6px rgba(24, 144, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 500,
          }}
          onClick={async () => {
            const data = await leacesDetailApi(record.id);
            setCurrentRow(data);
            setDetailOpen(true);
          }}
        >
          审批
        </Button>
        <Button
          size="small"
          style={{
            width: '100%',
            height: 32,
            padding: '0 16px',
            borderRadius: 16,
            border: 'none',
            background: 'linear-gradient(135deg, #67C23A 0%, #529b2e 100%)',
            color: '#fff',
            boxShadow: '0 2px 6px rgba(103, 194, 58, 0.3)',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 500,
          }}
          onClick={() => {
            setCurrentRow(record);
            setApprovedDateOpen(true);
          }}
        >
          上传审批时间
        </Button>
      </div>
    );
  };

  const chooseLeaderOperation = (record) => {
    const hasMatch = leaderList.some((role) =>
      record.approvedRoles.includes(role),
    );
    if (hasMatch) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            style={{
              width: '100%',
              border: 'none',
              borderRadius: '9999px',
              padding: '8px 24px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 2px 6px rgba(251, 146, 60, 0.25)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onClick={() => openLeaderModal(record)}
          >
            重选领导
          </Button>
        </div>
      );
    } else {
      return (
        <div style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            style={{
              width: '100%',
              border: 'none',
              borderRadius: '9999px',
              padding: '8px 24px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onClick={() => openLeaderModal(record)}
          >
            选择后续领导
          </Button>
        </div>
      );
    }
  };

  const judgeNeedOperation = (record) => {
    if (!record || !record.currentStep || !record.status || !user.roleCode) {
      return false;
    }

    if (!needOperation.includes(record.status)) {
      return false;
    }

    if(record.applicantType === 'WORKSHOP_DIRECTOR' && record.currentStep === 1) {
      return user.roleCode === 'WORKSHOP_PARTY_SECRETARY';
    }

    if (record.currentApproverId && record.currentApproverId !== user.roleCode) {
      return false;
    }

    const stepRoles = leave_step[record.currentStep];
    if (!stepRoles) {
      return false;
    }

    if (
      record.approvedRoles &&
      record.approvedRoles.includes(user.roleCode) &&
      record.currentStep > 3
    ) {
      return false;
    }

    if (typeof stepRoles === 'string') {
      return stepRoles === user.roleCode;
    } else if (Array.isArray(stepRoles)) {
      return stepRoles.includes(user.roleCode);
    }

    return false;
  };

  const judgeNeedChooseLeader = (record) => {
     if (record.currentApproverId && record.currentApproverId !== user.roleCode) {
      return false;
    }
    return needChooseLeaderStep.includes(record.currentStep);
  };

  const handleFilter = (values) => {
    setFilters({
      status: values.status || '',
      leaveTypeId: values.leaveTypeId || null,
    });
  };

  const handleResetFilter = () => {
    filterForm.resetFields();
    setFilters({ status: '', leaveTypeId: null });
  };

  const handleApprove = async (type, comment) => {
    const formData = new FormData();
    formData.append('approved', type === 'APPROVE');
    formData.append('comment', type === 'APPROVE' ? '同意' : comment);
    formData.append('signatureUrl', `${FILE_BASE_URL}${user.signatureUrl}`);
    if (!approvedAt) {
      message.warning('未选择审批时间，将使用当前日期作为审批时间');
    } else {
      formData.append('approvedAt', dayjs(approvedAt).format('YYYY-MM-DDT00:00:00'));
    }
    await leacesApproveApi(currentRow.id, formData);
    message.success(type === 'APPROVE' ? '审批通过' : '审批拒绝');
    setCurrentRow(null);
    setIsRefresh((prev) => !prev);
    setDetailOpen(false);
  };

  const handleBatchApprove = async (type, comment) => {
    const leaveIds = selectedRows.map((row) => row.id);
    const formData = new FormData();
    leaveIds.forEach((id) => {
      formData.append('leaveIds', id);
    });
    formData.append('approved', type === 'APPROVE');
    formData.append('comment', type === 'APPROVE' ? '同意' : comment);
    formData.append('signatureUrl', `${FILE_BASE_URL}${user.signatureUrl}`);
    await leacesBatchApproveApi(formData);
    message.success('操作成功');
    setSelectedRows([]);
    setIsRefresh((prev) => !prev);
    setBatchModalOpen(false);
  };

  const openRejectModal = (mode) => {
    rejectForm.resetFields();
    setRejectMode(mode);
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    const values = await rejectForm.validateFields();
    if (rejectMode === 'batch') {
      await handleBatchApprove('REJECT', values.comment);
    } else {
      await handleApprove('REJECT', values.comment);
    }
    setRejectModalOpen(false);
    rejectForm.resetFields();
  };

  const openLeaderModal = async (record) => {
    chooseLeaderForm.resetFields();
    const data = await leacesSelectLeaderListApi(record.id);
    const leaderOptions = data.map((item) => ({
      label: item.approverName,
      value: item.approverUserId,
    }));
    setBatchLeaderList(leaderOptions);
    setCurrentRow(record);
    setLeaderModalOpen(true);
  };

  const handleChooseLeader = async () => {
    try {
      const values = await chooseLeaderForm.validateFields();
      const data = {
        approverUserIds: values.approverUserIds,
        comment: values.comment,
      };

      await leacesSelectLeaderApi(currentRow.id, data);

      message.success('选择审批人成功');
      chooseLeaderForm.resetFields();
    } catch (error) {
      console.log(error);
    } finally {
      setLeaderModalOpen(false);
    }
    setIsRefresh((prev) => !prev);
  };

  return (
    <Card
      title="审批中心"
      extra={
        <Form form={filterForm} layout="inline" onFinish={handleFilter}>
          <Form.Item name="status" label="状态">
            <Select
              allowClear
              placeholder="请选择状态"
              options={
                statusData?.map((item) => ({
                  label: item.name,
                  value: item.code,
                })) || []
              }
            />
          </Form.Item>

          <Form.Item name="leaveTypeId" label="请假类型">
            <Select
              allowClear
              placeholder="请选择类型"
              options={
                typeData?.map((item) => ({
                  label: item.leaveName,
                  value: item.id,
                })) || []
              }
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              筛选
            </Button>
            <Button style={{ margin: '0 8px' }} onClick={handleResetFilter}>
              重置
            </Button>
            <Button
              type="primary"
              disabled={selectedRows.length === 0}
              onClick={() => setBatchModalOpen(true)}
            >
              批量审批 ({selectedRows.length})
            </Button>
          </Form.Item>
        </Form>
      }
    >
      <BaseTable
        rowkey="id"
        columns={columns}
        request={leacesMonthlyListApi}
        params={filters}
        rowSelection={rowSelection}
        isRefresh={isRefresh}
      />

      {detailOpen && currentRow && (
        <LeaveDetailModal
          open={detailOpen}
          data={currentRow}
          onCancel={() => setDetailOpen(false)}
          extra={
            judgeNeedOperation(currentRow) ? (
              <div
                style={{
                  textAlign: 'right',
                  marginTop: 16,
                }}
              >
                <Button type="primary" onClick={() => handleApprove('APPROVE')}>
                  同意
                </Button>

                <Button
                  danger
                  style={{ marginLeft: 10 }}
                  onClick={() => openRejectModal('single')}
                >
                  驳回
                </Button>
              </div>
            ) : null
          }
        />
      )}

      <Modal
        title="批量审批确认"
        open={batchModalOpen}
        onCancel={() => setBatchModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setBatchModalOpen(false)}>
            取消
          </Button>,
          <Button
            key="approve"
            type="primary"
            onClick={() => handleBatchApprove('APPROVE')}
          >
            批量同意
          </Button>,
          <Button key="reject" danger onClick={() => openRejectModal('batch')}>
            批量驳回
          </Button>,
        ]}
      >
        <p>您已选择 {selectedRows.length} 条记录进行批量审批。</p>
        <Alert
          message="注意"
          description="请确保已上传电子签名，批量审批将使用第一条记录的签名。"
          type="warning"
          showIcon
        />
      </Modal>

      <Modal
        title={rejectMode === 'batch' ? '填写批量驳回原因' : '填写驳回原因'}
        open={rejectModalOpen}
        onOk={handleRejectSubmit}
        onCancel={() => setRejectModalOpen(false)}
        okText="确认驳回"
        okButtonProps={{ danger: true }}
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="comment"
            label="驳回原因"
            rules={[
              { required: true, message: '请输入驳回原因' },
              { max: 200, message: '驳回原因不能超过 200 个字符' },
            ]}
          >
            <TextArea
              rows={5}
              showCount
              maxLength={200}
              placeholder="请输入驳回原因"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="选择后续审批领导"
        open={leaderModalOpen}
        onOk={handleChooseLeader}
        onCancel={() => setLeaderModalOpen(false)}
        centered
        width={520}
        styles={{ body: { padding: '24px 0' } }}
      >
        <Form form={chooseLeaderForm} layout="vertical">
          <Form.Item
            name="approverUserIds"
            label="可选择领导(支持多选)"
            rules={[{ required: true, message: '请选择审批领导' }]}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="搜索可选择领导"
              options={batchLeaderList}
              maxTagCount="responsive"
              showSearch={{
                optionFilterProp: 'label',
              }}
            />
          </Form.Item>

          <Form.Item
            name="comment"
            label="备注"
            rules={[{ required: true, message: '请输入备注' }]}
          >
            <TextArea rows={6} placeholder="请输入备注..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="选择审批时间"
        open={approvedDateOpen}
        onOk={() => {
          if (!approvedAt) {
            message.warning('请选择审批时间');
            return;
          }
          setApprovedDateOpen(false);
          message.success('审批时间已设置');
        }}
        onCancel={() => setApprovedDateOpen(false)}
        okText="确认"
        cancelText="取消"
      >
        <DatePicker
          placeholder="请选择审批时间"
          format="YYYY-MM-DD"
          value={approvedAt}
          onChange={(date) => setApprovedAt(date)}
          style={{ width: '100%' }}
        />
      </Modal>
    </Card>
  );
};

export default Approval;

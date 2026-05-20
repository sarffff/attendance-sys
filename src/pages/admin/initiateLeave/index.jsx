import {
  Card,
  Button,
  Tag,
  Modal,
  Form,
  message,
  Select,
  Popconfirm,
  DatePicker,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useState, useMemo } from 'react';
import BaseTable from '@/components/BaseTable';
import BaseForm from '@/components/BaseForm';
import NoOperation from '@/components/NoOperation';
import LeaveDetailModal from '@/components/LeaveDetailModal';
import HanwangSignatureModal from '@/components/HanwangSignatureModal';
import {
  leacesMonthlyListApi,
  leacesTypeApi,
  leacesStatusApi,
  leacesDetailApi,
  leacesApplyApi,
  leacesEditApi,
  leacesDeleteApi,
  leacesRevokeApi,
  leacesPrintApi,
  leacesBatchPrintApi,
  leacesUploadSignatureApi,
} from '@/api/leaves';
import { useFetch } from '@/hooks/useFetch';
import { formatTime } from '@/utils/formatTime';
import { base64ToFile } from '@/utils/base64ToFile';
import { useAppSelector } from '@/store/hooks';
import { leaveStatusMap as map, applicantType } from '@/constants/constantsMap';
import dayjs from 'dayjs';
const { RangePicker } = DatePicker;

const InitiateLeave = () => {
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [batchPrintForm] = Form.useForm();
  const user = useAppSelector((state) => state.user.userInfo);
  const [open, setOpen] = useState(false);
  const [batchPrintOpen, setBatchPrintOpen] = useState(false);
  const [signatureDateOpen, setSignatureDateOpen] = useState(false);
  const [batchPrintLoading, setBatchPrintLoading] = useState(false);
  const [uploadingLeaveIdApplicant, setUploadingLeaveIdApplicant] =
    useState(null);
  const [uploadingLeaveIdTeamLeader, setUploadingLeaveIdTeamLeader] =
    useState(null);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [signatureRecord, setSignatureRecord] = useState(null);
  const [signatureApplicantType, setSignatureApplicantType] = useState(null);
  const [signatureDate, setSignatureDate] = useState(null);
  const [hasEditId, setHasEditId] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentDetail, setCurrentDetail] = useState(null);
  const [isRefresh, setIsRefresh] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    leaveTypeId: null,
  });
  const { data } = useFetch(leacesTypeApi);
  const { data: statusData } = useFetch(leacesStatusApi);

  const applicantTypeOptions = useMemo(() => {
    return Object.entries(applicantType).map(([key, value]) => ({
      label: value,
      value: key,
    }));
  });

  const formSchema = useMemo(
    () => [
      {
        group: '基本信息',
        type: 'input',
        label: '申请人',
        rules: [{ required: true, message: '请输入申请人姓名' }],
        placeholder: '请输入申请人姓名',
        field: 'applicantName',
      },
      {
        group: '基本信息',
        type: 'input',
        label: '职位',
        rules: [{ required: true, message: '请输入职位' }],
        placeholder: '请输入职位',
        field: 'jobTitleSnapshot',
      },
      {
        group: '基本信息',
        type: 'input',
        label: '班组长',
        rules: [{ required: true, message: '请输入班组长姓名' }],
        placeholder: '请输入班组长姓名',
        field: 'teamLeaderSnapshot',
      },
      {
        group: '基本信息',
        type: 'radio',
        label: '是否提前党委书记签字',
        rules: [{ required: true, message: '请选择是否提前党委书记签字' }],
        placeholder: '请选择是否提前党委书记签字',
        options: [
          { label: '是', value: true },
          { label: '否', value: false },
        ],
        field: 'partySecretaryFirst',
      },
      {
        group: '请假信息',
        type: 'select',
        label: '申请人类型',
        field: 'applicantType',
        rules: [{ required: true, message: '请选择申请人类型' }],
        placeholder: '请选择申请人类型',
        options: applicantTypeOptions,
      },
      {
        group: '请假信息',
        type: 'select',
        label: '请假类型',
        field: 'leaveTypeId',
        rules: [{ required: true, message: '请选择请假类型' }],
        placeholder: '请选择请假类型',
        options: data?.map((item) => ({
          label: item.leaveName,
          value: item.id,
        })),
      },
      {
        group: '请假信息',
        type: 'datetime',
        label: '开始时间',
        field: 'startTime',
        placeholder: '请选择开始时间',
        rules: [{ required: true, message: '请选择开始时间' }],
      },
      {
        group: '请假信息',
        type: 'datetime',
        label: '结束时间',
        field: 'endTime',
        placeholder: '请选择结束时间',
        rules: [{ required: true, message: '请选择结束时间' }],
      },
      {
        group: '请假信息',
        type: 'number',
        label: '请假天数',
        field: 'leaveDays',
        placeholder: '请输入请假天数',
        rules: [{ required: true, message: '请输入请假天数' }],
        props: {
          min: 0,
          step: 0.5,
        },
      },
      {
        group: '请假信息',
        type: 'datetime',
        label: '申请时间',
        field: 'submittedAt',
        placeholder: '请选择申请时间',
        rules: [{ required: true, message: '请选择申请时间' }],
      },
      {
        group: '请假信息',
        type: 'textarea',
        label: '请假原因',
        field: 'reason',
        placeholder: '请输入请假原因',
        rules: [{ required: true, message: '请输入请假原因' }],
        span: 24,
      },
      {
        group: '请假信息',
        type: 'textarea',
        label: '备注',
        placeholder: '请输入备注',
        field: 'remark',
        span: 24,
      },
    ],
    [data, hasEditId],
  );

  const columns = [
    {
      title: '请假人姓名',
      dataIndex: 'applicantName',
      width: 150,
      render: (text, record) => (
        <a
          onClick={async () => {
            const data = await leacesDetailApi(record.id);
            setCurrentDetail(data);
            setDetailVisible(true);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '请假人身份',
      dataIndex: 'applicantType',
      width: 120,
      render: (type) => {
        return applicantType[type] || type;
      },
    },
    { title: '请假人职位', dataIndex: 'teamLeaderSnapshot' },
    { title: '请假类型', dataIndex: 'leaveTypeName', width: 120 },
    { title: '请假天数', dataIndex: 'leaveDays', width: 100 },
    { title: '请假原因', dataIndex: 'reason' },
    {
      title: '起始时间',
      dataIndex: 'startTime',
      render: (time) => formatTime(time),
      width: 160,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      render: (time) => formatTime(time),
      width: 160,
    },
    { title: '班组长', dataIndex: 'teamLeaderSnapshot' },
    {
      title: '申请时间',
      dataIndex: 'submittedAt',
      render: (time) => formatTime(time),
      width: 160,
    },
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
      valueType: 'option',
      fixed: 'right',
      width: 400,
      render: (_, record) => {
        return optionSetting(record);
      },
    },
  ];

  const handleUploadSignature = async (record, file, applicantType) => {
    const formData = new FormData();
    formData.append('signatureFile', file);
    formData.append('applicantType', applicantType);
    if (applicantType === 'TEAM_LEADER') {
      if (!signatureDate) {
        message.warning('未选择签名日期，将使用当前日期作为签名日期');
      } else {
        formData.append(
          'signatureDate',
          dayjs(signatureDate).format('YYYY-MM-DDT00:00:00'),
        );
      }
    }

    if (applicantType === 'APPLICANT') {
      setUploadingLeaveIdApplicant(record.id);
    } else if (applicantType === 'TEAM_LEADER') {
      setUploadingLeaveIdTeamLeader(record.id);
    }

    try {
      await leacesUploadSignatureApi(record.id, formData);
      message.success('签名上传成功');
      setIsRefresh((prev) => !prev);
    } catch (error) {
      message.error(error?.message || '签名上传失败');
      throw error;
    } finally {
      if (applicantType === 'APPLICANT') {
        setUploadingLeaveIdApplicant(null);
      } else if (applicantType === 'TEAM_LEADER') {
        setUploadingLeaveIdTeamLeader(null);
      }
    }
  };

  const openSignatureModal = (record, type) => {
    setSignatureRecord(record);
    setSignatureApplicantType(type);
    setSignatureOpen(true);
  };

  const handleSignatureSubmit = async (preview) => {
    if (!signatureRecord) return;

    const signatureFile = base64ToFile(
      preview,
      `signature-${signatureRecord.id}.png`,
    );

    await handleUploadSignature(
      signatureRecord,
      signatureFile,
      signatureApplicantType,
    );
    setSignatureOpen(false);
    setSignatureRecord(null);
    setSignatureApplicantType(null);
  };

  const optionSetting = (record) => {
    const isEmployee = record.applicantType === 'EMPLOYEE';
    switch (record.status) {
      case 'PENDING':
        return (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                marginBottom: 8,
              }}
            >
              <div style={{ flex: 1 }}>
                <Button
                  onClick={() => handleEdit(record)}
                  style={{
                    width: '100%',
                    color: '#fff',
                    background:
                      'linear-gradient(135deg, #409EFF 0%, #1677ff 100%)',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '8px 0',
                    fontSize: '14px',
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
                  title="确定撤销申请吗？"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => handleRevoke(record)}
                >
                  <Button
                    style={{
                      width: '100%',
                      color: '#fff',
                      background:
                        'linear-gradient(135deg, #606266 0%, #303133 100%)',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '8px 0',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 2px 6px rgba(67, 68, 68, 0.3)',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    撤销
                  </Button>
                </Popconfirm>
              </div>

              <div style={{ flex: 1 }}>
                <Popconfirm
                  title="确定删除申请吗？"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => handleDelete(record)}
                >
                  <Button
                    style={{
                      width: '100%',
                      color: '#fff',
                      background:
                        'linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%)',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '8px 0',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 2px 6px rgba(255, 77, 79, 0.3)',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    删除
                  </Button>
                </Popconfirm>
              </div>
            </div>
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
                  loading={uploadingLeaveIdApplicant === record.id}
                  style={{
                    width: '100%',
                    marginBottom: 8,
                    color: '#fff',
                    background:
                      'linear-gradient(135deg, #409EFF 0%, #1677ff 100%)',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '8px 24px',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 2px 6px rgba(64, 158, 255, 0.3)',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => openSignatureModal(record, 'APPLICANT')}
                >
                  申请人签字
                </Button>
              </div>
              {isEmployee ? (
                <div style={{ flex: 1 }}>
                  <Button
                    loading={uploadingLeaveIdTeamLeader === record.id}
                    style={{
                      width: '100%',
                      marginBottom: 8,
                      color: '#fff',
                      background:
                        'linear-gradient(135deg, #409EFF 0%, #1677ff 100%)',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '8px 24px',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 2px 6px rgba(64, 158, 255, 0.3)',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={() => openSignatureModal(record, 'TEAM_LEADER')}
                  >
                    班组长签字
                  </Button>
                </div>
              ) : null}
              {isEmployee ? (
                <div style={{ flex: 1 }}>
                  <Button
                    style={{
                      width: '100%',
                      color: '#fff',
                      background:
                        'linear-gradient(135deg, #67C23A 0%, #529b2e 100%)',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '8px 24px',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 2px 6px rgba(103, 194, 58, 0.3)',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={() => {
                      setSignatureRecord(record);
                      setSignatureDateOpen(true);
                    }}
                  >
                    班组长上传签名日期
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        );
      case 'APPROVED':
        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isEmployee ? '1fr 1fr' : '1fr',
              gridTemplateRows: isEmployee ? 'auto auto' : 'auto',
              gap: '8px',
            }}
          >
              <Button
                type="primary"
                style={{
                  width: '100%',
                  background: 'linear-gradient(to right, #10b981, #14b8a6)',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '8px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => printLeave(record)}
              >
                打印请假单
              </Button>
              <div>
                <Button
                  loading={uploadingLeaveIdApplicant === record.id}
                  style={{
                    width: '100%',
                    marginBottom: 8,
                    color: '#fff',
                    background:
                      'linear-gradient(135deg, #409EFF 0%, #1677ff 100%)',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '8px 24px',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 2px 6px rgba(64, 158, 255, 0.3)',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => openSignatureModal(record, 'APPLICANT')}
                >
                  申请人签字
                </Button>
              </div>
              {record.applicantType === 'EMPLOYEE' ? (
                <div>
                  <Button
                    loading={uploadingLeaveIdTeamLeader === record.id}
                    style={{
                      width: '100%',
                      marginBottom: 8,
                      color: '#fff',
                      background:
                        'linear-gradient(135deg, #409EFF 0%, #1677ff 100%)',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '8px 24px',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 2px 6px rgba(64, 158, 255, 0.3)',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={() => openSignatureModal(record, 'TEAM_LEADER')}
                  >
                    班组长签字
                  </Button>
                </div>
              ) : null}
              {record.applicantType === 'EMPLOYEE' ? (
                <div>
                  <Button
                    style={{
                      width: '100%',
                      color: '#fff',
                      background:
                        'linear-gradient(135deg, #67C23A 0%, #529b2e 100%)',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '8px 24px',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 2px 6px rgba(103, 194, 58, 0.3)',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={() => {
                      setSignatureRecord(record);
                      setSignatureDateOpen(true);
                    }}
                  >
                    班组长上传签名日期
                  </Button>
                </div>
              ) : null}
          </div>
        );
      case 'REJECTED':
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
                onClick={() => handleEdit(record)}
                style={{
                  width: '100%',
                  color: '#fff',
                  background:
                    'linear-gradient(135deg, #409EFF 0%, #1677ff 100%)',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '8px 0',
                  fontSize: '14px',
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
                title="确定删除申请吗？"
                okText="确定"
                cancelText="取消"
                onConfirm={() => handleDelete(record)}
              >
                <Button
                  style={{
                    width: '100%',
                    color: '#fff',
                    background:
                      'linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%)',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '8px 0',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 2px 6px rgba(255, 77, 79, 0.3)',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  删除
                </Button>
              </Popconfirm>
            </div>
          </div>
        );
      default:
        return <NoOperation />;
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
      partySecretaryFirst: record.partySecretaryFirst === 1 ? true : false,
      startTime: dayjs(record.startTime),
      endTime: dayjs(record.endTime),
      submittedAt: dayjs(record.submittedAt),
    });
    setHasEditId(record.id);
    setOpen(true);
  };

  const handleRevoke = async (record) => {
    await leacesRevokeApi(record.id);
    message.success('撤销成功');
    setIsRefresh((prev) => !prev);
    setDetailVisible(false);
  };

  const handleDelete = async (record) => {
    await leacesDeleteApi(record.id);
    message.success('删除成功');
    setIsRefresh((prev) => !prev);
    setDetailVisible(false);
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

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (values.submittedAt && values.startTime) {
      if (values.submittedAt.isAfter(values.startTime)) {
        message.error('申请时间必须早于请假开始时间');
        return;
      }
    }
    const data = {
      applicantId: user.userId,
      ...values,
      startTime: values.startTime
        .format('YYYY-MM-DD HH:mm:ss')
        .replace(' ', 'T'),
      endTime: values.endTime.format('YYYY-MM-DD HH:mm:ss').replace(' ', 'T'),
    };

    // console.log('申请数据', data);
    if (hasEditId) {
      await leacesEditApi(hasEditId, data);
      message.success('请假申请修改成功');
      setHasEditId(null);
    } else {
      await leacesApplyApi(data);
      message.success('请假申请提交成功');
    }
    setIsRefresh((prev) => !prev);
    setOpen(false);

    form.resetFields();
  };

  const validateSignatures = (record) => {
    if (!record.applicantSignatureUrl) {
      message.warning('请先上传申请人签名信息');
      return false;
    }

    if (record.applicantType === 'EMPLOYEE' && !record.teamLeaderSignatureUrl) {
      message.warning('请先上传班组长签名信息');
      return false;
    }

    return true;
  };

  const printLeave = async (record) => {
    if (!validateSignatures(record)) {
      return;
    }

    try {
      message.loading('正在下载请假单...', 0);

      const { pdfUrl: relativePath } = await leacesPrintApi(record.id);

      await printPdf(relativePath, record);
    } catch (error) {
      console.error('下载失败:', error);
      message.error('下载失败，请检查后端服务是否启动');
    } finally {
      message.destroy();
    }
  };

  const openBatchPrint = () => {
    batchPrintForm.resetFields();
    setBatchPrintOpen(true);
  };

  const handleBatchPrint = async () => {
    try {
      const values = await batchPrintForm.validateFields();
      const [startTime, endTime] = values.printTimeRange;
      const messageKey = 'batch-print-leave';

      setBatchPrintLoading(true);
      message.loading({
        content: '正在生成批量请假单...',
        key: messageKey,
        duration: 0,
      });

      const startDate = startTime.format('YYYY-MM-DD').replace(' ', 'T');
      const endDate = endTime.format('YYYY-MM-DD').replace(' ', 'T');

      const { pdfUrl: relativePath } = await leacesBatchPrintApi({
        startDate,
        endDate,
      });
      await printPdf(relativePath, null, messageKey, startDate, endDate);
    } catch (error) {
      if (!error?.errorFields) {
        console.error('批量打印失败:', error);
        message.error({
          content: '批量打印失败，请检查后端服务是否启动',
          key: 'batch-print-leave',
        });
      }
    } finally {
      message.destroy('batch-print-leave');
      setBatchPrintLoading(false);
    }
  };

  const printPdf = async (
    relativePath,
    record = null,
    key = null,
    startTime = null,
    endTime = null,
  ) => {
    if (typeof relativePath !== 'string' || !relativePath) {
      message.error({
        content: 'PDF路径获取失败',
        key: key,
      });
      return;
    }

    const response = await fetch(relativePath, {
      headers: {
        Authorization: localStorage.getItem('attendance-token'),
      },
    });

    const blob = await response.blob();

    if (blob.size < 2000) {
      throw new Error('文件过小，不是有效的PDF');
    }

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    if (key != null && startTime && endTime) {
      link.download = `批量请假单_${startTime}_${endTime}.pdf`;
    } else {
      link.download = `${record.applicantName}请假单-${new Date().toISOString().slice(0, 10)}.pdf`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(downloadUrl);
    message.success('请假单下载成功！');
    if (key != null) {
      setBatchPrintOpen(false);
      batchPrintForm.resetFields();
    }
  };

  return (
    <Card
      title="请假管理"
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
                data?.map((item) => ({
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
            <Button style={{ marginRight: 8 }} onClick={openBatchPrint}>
              批量打印
            </Button>
            <Button
              type="primary"
              onClick={() => {
                form.resetFields();
                setOpen(true);
              }}
            >
              申请请假
            </Button>
          </Form.Item>
        </Form>
      }
    >
      <BaseTable
        columns={columns}
        request={leacesMonthlyListApi}
        params={filters}
        rowKey="id"
        isRefresh={isRefresh}
      />

      <Modal
        title="请假申请"
        open={open}
        onOk={handleSubmit}
        onCancel={() => setOpen(false)}
        destroyOnHidden={true}
      >
        <BaseForm schema={formSchema} form={form} />
      </Modal>

      <Modal
        title="批量打印请假单"
        open={batchPrintOpen}
        onOk={handleBatchPrint}
        onCancel={() => setBatchPrintOpen(false)}
        confirmLoading={batchPrintLoading}
        okText="开始打印"
        cancelText="取消"
        destroyOnHidden={true}
      >
        <Form form={batchPrintForm} layout="vertical">
          <Form.Item
            name="printTimeRange"
            label="起止时间"
            rules={[{ required: true, message: '请选择起止时间' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder={['开始时间', '结束时间']}
            />
          </Form.Item>
        </Form>
      </Modal>

      <HanwangSignatureModal
        open={signatureOpen}
        onOk={handleSignatureSubmit}
        onCancel={() => {
          setSignatureOpen(false);
          setSignatureRecord(null);
          setSignatureApplicantType(null);
        }}
        okText="确认上传"
        cancelText="取消"
        confirmLoading={
          signatureApplicantType === 'APPLICANT'
            ? uploadingLeaveIdApplicant === signatureRecord?.id
            : uploadingLeaveIdTeamLeader === signatureRecord?.id
        }
        destroyOnHidden
      />

      <LeaveDetailModal
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        data={currentDetail}
      />

      <Modal
        title="选择签名日期"
        open={signatureDateOpen}
        onOk={() => {
          if (!signatureDate) {
            message.warning('请选择签名日期');
            return;
          }
          setSignatureDateOpen(false);
          message.success('签名日期已设置');
        }}
        onCancel={() => setSignatureDateOpen(false)}
        okText="确认"
        cancelText="取消"
      >
        <DatePicker
          placeholder="请选择签名日期"
          format="YYYY-MM-DD"
          value={signatureDate}
          onChange={(date) => setSignatureDate(date)}
          style={{ width: '100%' }}
        />
      </Modal>
    </Card>
  );
};

export default InitiateLeave;

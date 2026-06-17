import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Input,
  Select,
  Space,
  Switch,
  Table,
  Typography,
  message,
  DatePicker
} from 'antd';
import {
  ReloadOutlined,
  SaveOutlined,
  TeamOutlined,
  UploadOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import {
  getEmployeeBasic,
  updateEmployeeBasic,
  submitBasic,
  getConfig,
  exportBasic
} from '@/api/ledger';
import { useFetch } from '@/hooks/useFetch';
import { useAppSelector } from '@/store/hooks';
import { getTeamNameApi } from '@/api/super_admin';
import { workType, LaborShifts } from '@/constants/constantsMap';
import BaseTable from '@/components/BaseTable';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const AdminEmployeeBasic = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.userInfo);
  const orgUnitId = searchParams.get('orgUnitId') || null;
  const readOnly = !!orgUnitId;
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: teamNameList } = useFetch(() =>
    getTeamNameApi({ orgUnitId: user.orgUnitId }),
  );

  const { data: config } = useFetch(getConfig);

  const TEAM_OPTIONS = useMemo(
    () =>
      teamNameList?.records.map((team) => ({
        label: team.teamName,
        value: team.teamName,
      })) || [],
    [teamNameList],
  );

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmployeeBasic({ pageNum, pageSize, orgUnitId });
      setList(Array.isArray(data?.records) ? data.records : []);
      setTotal(data.total);
    } catch (err) {
      message.error(err?.message || '加载现员基础表失败');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize, orgUnitId]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const updateCell = (id, field, value) => {
    setList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleSave = async (record) => {
    setSavingId(record.id);
    try {
      await updateEmployeeBasic({
        id: record.id,
        actualWorkType: record.actualWorkType || '',
        teamName: record.teamName || '',
        laborShift: record.laborShift || '',
        isTeamLeader: record.isTeamLeader || '否',
        workType: record.workType || '',
        retirementDate: record.retirementDate || '',
      });
      message.success('保存成功');
      await loadList();
    } catch (err) {
      message.error(err?.message || '保存失败');
    } finally {
      setSavingId(null);
    }
  };

  const handleExport = async (params, filename) => {
    try {
      message.loading('正在生成Excel...', 0);
      const blob = await exportBasic(orgUnitId || user.orgUnitId, params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.destroy();
      message.success('Excel下载成功');
    } catch {
      message.destroy();
      message.error('导出失败');
    }
  };

  const submitToHR = async () => {
    setSubmitting(true);
    try {
      await submitBasic();
      message.success('提交到人事科成功');
    } catch (err) {
      message.error(err?.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 90 },
    { title: '身份证号', dataIndex: 'idCardNo', width: 180 },
    { title: '姓名', dataIndex: 'empName', width: 100 },
    {
      title: '年龄',
      dataIndex: 'age',
      width: 80,
      align: 'center',
      hidden: !config?.show_age,
    },
    { title: '性别', dataIndex: 'gender', width: 80 },
    { title: '出生日期', dataIndex: 'birthDate', width: 120 },
    { title: '身份', dataIndex: 'identityType', width: 120 },
    { title: '科室车间名称', dataIndex: 'orgUnitName', width: 160 },
    { title: '人员类别大类', dataIndex: 'categoryMajor', width: 140 },
    { title: '人员类别小类', dataIndex: 'categoryMinor', width: 140 },
    {
      title: '工种',
      dataIndex: 'workType',
      width: 140,
    },
    {
      title: '实际工种',
      dataIndex: 'actualWorkType',
      width: 140,
      render: readOnly
        ? (value) => value || '-'
        : (value, record) => (
            <Select
              options={workType.map((item) => ({ label: item, value: item }))}
              value={value || undefined}
              style={{ width: '100%' }}
              placeholder="请选择"
              onChange={(nextValue) =>
                updateCell(record.id, 'actualWorkType', nextValue)
              }
            />
          ),
    },
    {
      title: '班制',
      dataIndex: 'laborShift',
      width: 140,
      render: readOnly
        ? (value) => value || '-'
        : (value, record) => (
            <Select
              size="small"
              value={value || undefined}
              style={{ width: '100%' }}
              placeholder="请选择"
              options={LaborShifts.map((item) => ({
                label: item,
                value: item,
              }))}
              onChange={(nextValue) =>
                updateCell(record.id, 'laborShift', nextValue)
              }
            />
          ),
    },
    {
      title: '是否班组长',
      dataIndex: 'isTeamLeader',
      width: 110,
      align: 'center',
      render: (value) => <Text>{value}</Text>,
    },
    {
      title: '班组名称',
      dataIndex: 'teamName',
      width: 160,
      render: readOnly
        ? (value) => value || '-'
        : (value, record) => (
            <Select
              size="small"
              value={value || undefined}
              style={{ width: '100%' }}
              placeholder="请选择"
              options={TEAM_OPTIONS}
              onChange={(nextValue) =>
                updateCell(record.id, 'teamName', nextValue)
              }
            />
          ),
    },
    ...(!readOnly
      ? [
          {
            title: '操作',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
              <Button
                type="primary"
                size="small"
                icon={<SaveOutlined />}
                loading={savingId === record.id}
                onClick={() => handleSave(record)}
              >
                保存
              </Button>
            ),
          },
        ]
      : []),
  ];

  const nonWorkingColumns = [
    {
      title: '车间', dataIndex: 'orgUnitName', width: 120,
      hidden: !readOnly,
     },
    { title: '班组', dataIndex: 'teamName', width: 120 },
    { title: '姓名', dataIndex: 'empName', width: 100 },
    { title: '性别', dataIndex: 'gender', width: 70 },
    { title: '出生日期', dataIndex: 'birthDate', width: 120 },
    { title: '年龄', dataIndex: 'age', width: 70, align: 'center' },
    { title: '工种', dataIndex: 'workType', width: 120 },
    { title: '非在岗原因', dataIndex: 'categoryMinor', width: 160 },
  ];

  const [retiringSavingId, setRetiringSavingId] = useState(null);
  const handleSaveRetiring = async (record) => {
    setRetiringSavingId(record.id);
    try {
      await updateEmployeeBasic({
       ...record,
      });
      message.success('保存成功');
      await loadList();
    } catch (err) {
      message.error(err?.message || '保存失败');
    } finally {
      setRetiringSavingId(null);
    }
  };

  const retiringColumns = [
    { title: '车间', dataIndex: 'orgUnitName', width: 120, hidden: !readOnly },
    { title: '班组', dataIndex: 'teamName', width: 120 },
    { title: '姓名', dataIndex: 'empName', width: 100 },
    { title: '性别', dataIndex: 'gender', width: 70 },
    { title: '身份证号', dataIndex: 'idCardNo', width: 180 },
    { title: '出生日期', dataIndex: 'birthDate', width: 120 },
    { title: '年龄', dataIndex: 'age', width: 70, align: 'center' },
    { title: '工种', dataIndex: 'workType', width: 120 },
    {
      title: '退休日期',
      dataIndex: 'retirementDate',
      width: 140,
      render: (value, record) => (
       !readOnly ?  <DatePicker
          value={value ? dayjs(value) : null}
          picker="month"
          style={{ width: '100%' }}
          onChange={(date) =>
            updateCell(record.id, 'retirementDate', date ? date.format('YYYY-MM') : '')
          }
        /> : value || '-'
      ),
    },
    {
      hidden: readOnly,
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<SaveOutlined />}
          loading={retiringSavingId === record.id}
          onClick={() => handleSaveRetiring(record)}
        >
          保存
        </Button>
      ),
    },
  ];

  return (
    <div
      className="admin-employee-basic"
      style={{
        padding: 24,
        // minHeight: '100vh',
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
        {readOnly && (
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/all-employee-basic')}
          >
            返回
          </Button>
        )}
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
          <TeamOutlined style={{ color: '#fff', fontSize: 18 }} />
        </div>
        <div>
          <Title level={4} style={{ margin: 0, lineHeight: 1.2 }}>
            现员表
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            现员基础信息维护
          </Text>
        </div>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          marginBottom: 16,
        }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <Space wrap>
            {!readOnly && (
              <>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={submitting}
                  onClick={submitToHR}
                >
                  提交到人事科
                </Button>
              </>
            )}
            <Button icon={<ReloadOutlined />} onClick={loadList}>
              刷新
            </Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: pageNum,
            pageSize: pageSize,
            total,
            showQuickJumper: true,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPageNum(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <Card
          title="非在岗人员"
          extra={
            readOnly && (
              <Button
                icon={<FileExcelOutlined />}
                style={{ color: '#52c41a', borderColor: '#52c41a' }}
                onClick={() =>
                  handleExport(
                    { categoryMajor: '非在岗', ...(orgUnitId ? { orgUnitId } : {}) },
                    `非在岗人员_${dayjs().format('YYYY-MM-DD')}.xlsx`,
                  )
                }
              >
                导出Excel
              </Button>
            )
          }
        >
          <BaseTable
            columns={nonWorkingColumns}
            request={getEmployeeBasic}
            params={{ categoryMajor: '非在岗', ...(readOnly && orgUnitId ? { orgUnitId } : {}) }}
            rowKey="id"
            size="small"
          />
        </Card>
        <Card
          title="即将退休的人员"
          extra={
            readOnly && (
              <Button
                icon={<FileExcelOutlined />}
                style={{ color: '#52c41a', borderColor: '#52c41a' }}
                onClick={() =>
                  handleExport(
                    { retirementAge: config?.retirement_age_threshold, ...(orgUnitId ? { orgUnitId } : {}) },
                    `即将退休人员_${dayjs().format('YYYY-MM-DD')}.xlsx`,
                  )
                }
              >
                导出Excel
              </Button>
            )
          }
        >
          <BaseTable
            columns={retiringColumns}
            request={getEmployeeBasic}
            params={{ retirementAge: config?.retirement_age_threshold, ...(readOnly && orgUnitId ? { orgUnitId } : {}) }}
            rowKey="id"
            size="small"
          />
        </Card>
      </div>

      <style>{`
        .admin-employee-basic .ant-table-thead > tr > th {
          background: #f0f5ff !important;
          font-weight: 600 !important;
          color: #2c3e50 !important;
          font-size: 13px !important;
        }
        .admin-employee-basic .ant-table-row:hover td { background: #f0f7ff !important; }
      `}</style>
    </div>
  );
};

export default AdminEmployeeBasic;

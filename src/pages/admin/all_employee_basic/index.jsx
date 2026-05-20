import { useCallback, useEffect, useMemo, useState } from 'react';
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
} from 'antd';
import { ReloadOutlined, SaveOutlined, TeamOutlined, UploadOutlined } from '@ant-design/icons';
import { getEmployeeBasic, updateEmployeeBasic, syncBasic } from '@/api/ledger';

const { Title, Text } = Typography;

const SHIFT_OPTIONS = [
  '白班',
  '夜班',
  '两班倒',
  '四班间歇',
  '四班制',
  '三班制',
  '日勤',
  '其他',
];

const isTruthy = (value) => Number(value) === 1 || value === true;

const isNonWorkingEmployee = (item) =>
  Number(item.isNonWorking) === 1 ||
  Number(item.isWorking) === 0 ||
  item.workStatus === '非在岗' ||
  item.workState === '非在岗' ||
  item.categoryMajor === '非在岗' ||
  item.categoryMinor === '非在岗';

const calcAge = (birthDate) => {
  if (!birthDate) return undefined;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return undefined;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
};

const AllEmployeeBasic = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmployeeBasic({ pageNum: 1, pageSize: 9999 });
      setList(Array.isArray(data?.records) ? data.records : []);
    } catch (err) {
      message.error(err?.message || '加载现员基础表失败');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
        workType: record.workType || '',
        teamName: record.teamName || '',
        laborShift: record.laborShift || '',
        isTeamLeader: isTruthy(record.isTeamLeader) ? 1 : 0,
      });
      message.success('保存成功');
      await loadList();
    } catch (err) {
      message.error(err?.message || '保存失败');
    } finally {
      setSavingId(null);
    }
  };

  const syncToLedger = async () => {
    message.warning('请确认已保存所有修改，否则未保存的数据将无法同步到台账');
    const month = new Date().toISOString().slice(0, 7); // 当前年月，格式为 YYYY-MM
    try {
      await syncBasic(month);
      message.success('同步到台账成功');
    } catch (err) {
      message.error(err?.message || '同步到台账失败');
    }
  };

  const nonWorkingList = useMemo(
    () =>
      list
        .filter((item) => isNonWorkingEmployee(item))
        .map((item) => ({
          id: item.id,
          empName: item.empName,
          age: item.age ?? calcAge(item.birthDate),
          remark: item.nonWorkingReason || item.remark || '',
        })),
    [list],
  );

  const ageSixtyList = useMemo(
    () =>
      list
        .filter((item) => Number(item.age ?? calcAge(item.birthDate)) === 60)
        .map((item) => ({
          id: item.id,
          empName: item.empName,
          birthDate: item.birthDate,
        })),
    [list],
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 90 },
    { title: '身份证号', dataIndex: 'idCardNo', width: 180 },
    { title: '姓名', dataIndex: 'empName', width: 100 },
    { title: '性别', dataIndex: 'gender', width: 80 },
    { title: '出生日期', dataIndex: 'birthDate', width: 120 },
    { title: '身份', dataIndex: 'identityType', width: 120 },
    { title: '科室车间名称', dataIndex: 'orgUnitName', width: 160 },
    { title: '人员类别大类', dataIndex: 'categoryMajor', width: 140 },
    { title: '人员类别小类', dataIndex: 'categoryMinor', width: 140 },
    { title: '年龄', dataIndex: 'age', width: 80, align: 'center' },
    {
      title: '工种',
      dataIndex: 'workType',
      width: 140,
      render: (value, record) => (
        <Input
          size="small"
          value={value || ''}
          onChange={(e) => updateCell(record.id, 'workType', e.target.value)}
        />
      ),
    },
    {
      title: '班制',
      dataIndex: 'laborShift',
      width: 140,
      render: (value, record) => (
        <Select
          size="small"
          value={value || undefined}
          style={{ width: '100%' }}
          placeholder="请选择"
          options={SHIFT_OPTIONS.map((item) => ({ label: item, value: item }))}
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
      render: (value, record) => (
        <Switch
          checked={isTruthy(value)}
          checkedChildren="是"
          unCheckedChildren="否"
          onChange={(checked) =>
            updateCell(record.id, 'isTeamLeader', checked ? 1 : 0)
          }
        />
      ),
    },
    {
      title: '班组名称',
      dataIndex: 'teamName',
      width: 160,
      render: (value, record) => (
        <Input
          size="small"
          value={value || ''}
          onChange={(e) => updateCell(record.id, 'teamName', e.target.value)}
        />
      ),
    },
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
  ];

  const nonWorkingColumns = [
    { title: '姓名', dataIndex: 'empName', width: 120 },
    { title: '年龄', dataIndex: 'age', width: 80, align: 'center' },
    { title: '备注', dataIndex: 'remark' },
  ];

  const ageSixtyColumns = [
    { title: '姓名', dataIndex: 'empName', width: 120 },
    { title: '出生日期', dataIndex: 'birthDate', width: 140 },
  ];

  return (
    <div
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
            <Button type="primary" icon={<UploadOutlined />} onClick={syncToLedger}>
              同步到台账
            </Button>
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
            showQuickJumper: true,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        <Card title="非在岗人员" bordered={false}>
          <Table
            rowKey="id"
            size="small"
            columns={nonWorkingColumns}
            dataSource={nonWorkingList}
            pagination={false}
          />
        </Card>
        <Card title="年龄60岁人员" bordered={false}>
          <Table
            rowKey="id"
            size="small"
            columns={ageSixtyColumns}
            dataSource={ageSixtyList}
            pagination={false}
          />
        </Card>
      </div>

      <style>{`
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

export default AllEmployeeBasic;

import { useState, useMemo } from 'react';
import { Card, Tag, Select, Space, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import BaseTable from '@/components/BaseTable';
import { getSubmitStatus } from '@/api/ledger';
import dayjs from 'dayjs';

const STATUS_MAP = {
  SUBMITTED: { text: '已提交', color: 'processing' },
  NOT_SUBMITTED: { text: '未提交', color: 'default' },
};

const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '未提交', value: 'NOT_SUBMITTED' },
];

const AllEmployeeBasic = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [isRefresh, setIsRefresh] = useState(false);

  const params = useMemo(() => {
    const p = {};
    if (status) p.status = status;
    return p;
  }, [status]);

  const columns = [
    { title: '部门ID', dataIndex: 'orgUnitId', width: 100, align: 'center' },
    {
      title: '部门名称',
      dataIndex: 'orgUnitName',
      width: 160,
      render: (text, record) => (
        <a onClick={() => navigate(`/admin-employee-basic?orgUnitId=${record.orgUnitId}`)}>
          {text}
        </a>
      ),
    },
    { title: '现员人数', dataIndex: 'employeeCount', width: 100, align: 'center' },
    {
      title: '提交状态',
      dataIndex: 'status',
      width: 120,
      render: (v) => {
        const s = STATUS_MAP[v];
        return <Tag color={s?.color}>{s?.text || v || '-'}</Tag>;
      },
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      width: 180,
      render: (v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'),
    },
  ];

  return (
    <Card
      title="现员提交状态"
      extra={
        <Space>
          <Select
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            style={{ width: 120 }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => setIsRefresh((p) => !p)}>
            刷新
          </Button>
        </Space>
      }
    >
      <BaseTable
        columns={columns}
        request={getSubmitStatus}
        params={params}
        rowKey="orgUnitId"
        isRefresh={isRefresh}
      />
    </Card>
  );
};

export default AllEmployeeBasic;

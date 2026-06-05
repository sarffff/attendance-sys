import { getAllLedgers } from '@/api/ledger';
import { Card, Table, Tag, Select, Space, Button } from 'antd';
import { useMemo, useState } from 'react';
import { ReloadOutlined } from '@ant-design/icons';
import BaseTable from '@/components/BaseTable';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '主任已审批', value: 'DIRECTOR_APPROVED' },
  { label: '已退回', value: 'RETURNED' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已拒绝', value: 'REJECTED' },
];

const STATUS_MAP = {
  DRAFT: { text: '草稿', color: 'default' },
  SUBMITTED: { text: '已提交', color: 'processing' },
  DIRECTOR_APPROVED: { text: '主任已审批', color: 'blue' },
  RETURNED: { text: '已退回', color: 'error' },
  APPROVED: { text: '已通过', color: 'success' },
  REJECTED: { text: '已拒绝', color: 'error' },
};

const AllLedger = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [isRefresh, setIsRefresh] = useState(false);

  const params = useMemo(() => {
    const p = {};
    if (status) p.status = status;
    return p;
  }, [status]);

  const columns = useMemo(
    () => [
      { title: '部门ID', dataIndex: 'orgUnitId', width: 100 },
      {
        title: '部门名称',
        dataIndex: 'orgUnitName',
        width: 160,
        render: (text, record) => (
          <span
            style={{ fontWeight: 'bold' }}
            onClick={() => navigate(`/hr-ledger-detail?id=${record.id}`)}
          >
            {text}
          </span>
        ),
      },
      { title: '账本月份', dataIndex: 'ledgerMonth', width: 120 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        render: (status) => {
          const s = STATUS_MAP[status];
          return <Tag color={s?.color}>{s?.text || status || '-'}</Tag>;
        },
      },
      { title: '在岗人数', dataIndex: 'inWorkCount', width: 100 },
      { title: '创建人', dataIndex: 'creatorName', width: 140 },
      {
        title: '提交时间',
        dataIndex: 'submittedAt',
        width: 180,
        render: (value) =>
          value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 180,
        render: (value) =>
          value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
    ],
    [navigate],
  );

  return (
    <Card
      title="台账列表"
      style={{ margin: 24 }}
      extra={
        <Space>
          <Select
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            style={{ width: 140 }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => setIsRefresh((p) => !p)}>
            刷新
          </Button>
        </Space>
      }
    >
      <BaseTable
        columns={columns}
        request={getAllLedgers}
        rowKey="id"
        params={params}
        isRefresh={isRefresh}
      />
    </Card>
  );
};

export default AllLedger;

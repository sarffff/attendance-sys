import { getAllLedgers } from '@/api/ledger';
import { Card, Table, Tag } from 'antd';
import { useMemo } from 'react';
import BaseTable from '@/components/BaseTable';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const AllLedger = () => {
  const navigate = useNavigate();

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
            onClick={() => navigate(`/super_admin/ledger_detail/${record.orgUnitId}`)}
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
        render: (status) => <Tag>{status || '-'}</Tag>,
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
    <Card title="台账列表" style={{ margin: 24 }}>
      <BaseTable
        columns={columns}
        request={getAllLedgers}
        rowKey="id"
        params={{}}
      />
    </Card>
  );
};

export default AllLedger;

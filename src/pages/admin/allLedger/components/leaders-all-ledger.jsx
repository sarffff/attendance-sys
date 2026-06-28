import { useState, useMemo } from "react";
import { Card, Button, Tag, Select, Space } from "antd";
import { EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { getSharedLedgers } from "@/api/ledger";
import { useNavigate } from "react-router-dom";
import BaseTable from "@/components/BaseTable";
import dayjs from "dayjs";

const STATUS_MAP = {
  SUBMITTED: { text: "已提交", color: "processing" },
  DIRECTOR_APPROVED: { text: "主任已审批", color: "blue" },
  RETURNED: { text: "已驳回", color: "error" },
  APPROVED: { text: "已通过", color: "success" },
  REJECTED: { text: "已拒绝", color: "error" },
};

const STATUS_OPTIONS = [
  { label: "全部", value: "" },
  { label: "已提交", value: "SUBMITTED" },
  { label: "主任已审批", value: "DIRECTOR_APPROVED" },
  { label: "已通过", value: "APPROVED" },
  { label: "已拒绝", value: "REJECTED" },
];

const styles = {
  cardExtra: { display: "flex", alignItems: "center", gap: 8 },
  detailBtn: {
    color: "#fff",
    background: "linear-gradient(135deg, #409EFF, #1677ff)",
    border: "none",
    borderRadius: 9999,
    fontWeight: 500,
    boxShadow: "0 2px 6px rgba(64, 158, 255, 0.3)",
  },
};

const LeadersAllLedger = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState("");
  const [isRefresh, setIsRefresh] = useState(false);

  const params = useMemo(() => {
    const p = {};
    if (status) p.status = status;
    return p;
  }, [status]);

  const columns = useMemo(
    () => [
      { title: "车间", dataIndex: "orgUnitName", width: 150 },
      { title: "台账月份", dataIndex: "ledgerMonth", width: 110 },
      {
        title: "状态",
        dataIndex: "status",
        width: 100,
        render: (v) => {
          const s = STATUS_MAP[v];
          return <Tag color={s?.color}>{s?.text || v}</Tag>;
        },
      },
      {
        title: "在岗人数",
        dataIndex: "inWorkCount",
        align: "center",
      },
      { title: "创建人", dataIndex: "creatorName", width: 150 },
      {
        title: "提交时间",
        dataIndex: "submittedAt",
        width: 170,
        render: (v) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-"),
      },
      {
        title: "更新时间",
        dataIndex: "updatedAt",
        width: 170,
        render: (v) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-"),
      },
      {
        title: "操作",
        fixed: "right",
        width: 100,
        render: (_, record) => (
          <Button
            size="small"
            icon={<EyeOutlined />}
            style={styles.detailBtn}
            onClick={() => navigate(`/hr-ledger-detail?id=${record.id}`)}
          >
            详情
          </Button>
        ),
      },
    ],
    [navigate],
  );

  return (
    <Card
      title="分发给我的台账"
      extra={
        <div style={styles.cardExtra}>
          <Select
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            style={{ width: 140 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => setIsRefresh((p) => !p)}
          >
            刷新
          </Button>
        </div>
      }
    >
      <BaseTable
        columns={columns}
        request={getSharedLedgers}
        params={params}
        rowKey="id"
        isRefresh={isRefresh}
      />
    </Card>
  );
};

export default LeadersAllLedger;

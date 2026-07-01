import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Card,
  Button,
  Tag,
  Select,
  Space,
  Modal,
  Input,
  message,
  Checkbox,
  List,
  Avatar,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  SendOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  getPendingLedgers,
  hrReviewLedger,
  distributeLedgerToLeaders,
  exportLedgerBatch,
  // revokeShareLedger,
  getLeaders,
  getLeaderLedgerPageAccess,
  setLeaderLedgerPageAccess,
} from "@/api/ledger";
import { useNavigate } from "react-router-dom";
import BaseTable from "@/components/BaseTable";
import dayjs from "dayjs";

const { TextArea } = Input;

const STATUS_MAP = {
  SUBMITTED: { text: "已提交", color: "processing" },
  DIRECTOR_APPROVED: { text: "主任已审批", color: "blue" },
  RETURNED: { text: "已驳回", color: "error" },
  APPROVED: { text: "已通过", color: "success" },
  REJECTED: { text: "已拒绝", color: "error" },
};

const STATUS_OPTIONS = [
  { label: "全部", value: "" },
  { label: "主任已审批", value: "DIRECTOR_APPROVED" },
  { label: "已通过", value: "APPROVED" },
  { label: "已拒绝", value: "REJECTED" },
];

const REVIEWABLE_STATUS = ["DIRECTOR_APPROVED"];

const styles = {
  cardExtra: { display: "flex", alignItems: "center", gap: 8 },
  approveBtn: {
    color: "#fff",
    background: "linear-gradient(135deg, #52c41a, #389e0d)",
    border: "none",
    borderRadius: 9999,
    fontWeight: 500,
    boxShadow: "0 2px 6px rgba(82, 196, 26, 0.3)",
  },
  rejectBtn: {
    color: "#fff",
    background: "linear-gradient(135deg, #ff7875, #ff4d4f)",
    border: "none",
    borderRadius: 9999,
    fontWeight: 500,
    boxShadow: "0 2px 6px rgba(255, 77, 79, 0.3)",
  },
  detailBtn: {
    color: "#fff",
    background: "linear-gradient(135deg, #409EFF, #1677ff)",
    border: "none",
    borderRadius: 9999,
    fontWeight: 500,
    boxShadow: "0 2px 6px rgba(64, 158, 255, 0.3)",
  },
};

const HrAllLedger = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState("");
  const [isRefresh, setIsRefresh] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalRecord, setModalRecord] = useState(null);
  const [opinion, setOpinion] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  // 分发台账相关状态
  const [distributeModalOpen, setDistributeModalOpen] = useState(false);
  const [leaders, setLeaders] = useState([]);
  const [selectedLeaders, setSelectedLeaders] = useState([]);
  const [distributeLoading, setDistributeLoading] = useState(false);

  // 页面访问权限相关状态
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [accessLeaders, setAccessLeaders] = useState([]);
  const [selectedAccessLeaders, setSelectedAccessLeaders] = useState([]);
  const [accessLoading, setAccessLoading] = useState(false);

  // 获取领导列表
  useEffect(() => {
    const loadLeaders = async () => {
      try {
        const data = await getLeaders();
        // 过滤掉ID为7的领导
        const filteredLeaders = data.filter((item) => item.userId != 7);
        setLeaders(filteredLeaders);
      } catch (error) {
        console.error("获取领导列表失败:", error);
      }
    };
    loadLeaders();
  }, []);

  // 获取有页面访问权限的领导列表
  useEffect(() => {
    const loadAccessLeaders = async () => {
      try {
        const data = await getLeaderLedgerPageAccess();
        if (Array.isArray(data)) {
          setSelectedAccessLeaders(data.map((item) => item.userId || item.id));
        }
      } catch (error) {
        console.error("获取页面访问权限列表失败:", error);
      }
    };
    loadAccessLeaders();
  }, []);

  const params = useMemo(() => {
    const p = {};
    if (status) p.status = status;
    return p;
  }, [status]);

  // 打开分发弹窗
  const handleOpenDistribute = () => {
    if (!selectedRowKeys.length) {
      message.warning("请先勾选要分发的台账");
      return;
    }
    setSelectedLeaders([]);
    setDistributeModalOpen(true);
  };

  // 确认分发
  const handleDistribute = async () => {
    if (!selectedLeaders.length) {
      message.warning("请选择要分发的领导");
      return;
    }
    setDistributeLoading(true);
    console.log(selectedRowKeys, selectedLeaders);
    try {
      await distributeLedgerToLeaders(selectedRowKeys, selectedLeaders);
      message.success("分发成功");
      setDistributeModalOpen(false);
    } catch (error) {
      message.error("分发失败");
      console.error(error);
    } finally {
      setDistributeLoading(false);
    }
  };

  // 打开设置页面访问权限弹窗
  const handleOpenAccess = () => {
    setAccessLeaders(leaders);
    setAccessModalOpen(true);
  };

  // 确认设置页面访问权限
  const handleSetAccess = async (enabled) => {
    if (!selectedAccessLeaders.length && enabled) {
      message.warning("请选择要授权的领导");
      return;
    }
    setAccessLoading(true);
    try {
      await setLeaderLedgerPageAccess(selectedAccessLeaders, enabled);
      message.success(enabled ? "已授权访问" : "已取消授权");
      setAccessModalOpen(false);
    } catch (error) {
      message.error("设置失败");
      console.error(error);
    } finally {
      setAccessLoading(false);
    }
  };

  const handleBatchExport = useCallback(async () => {
    if (!selectedRowKeys.length) return;
    try {
      message.loading("正在批量导出台账Excel...", 0);
      const blob = await exportLedgerBatch(selectedRowKeys);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `台账批量导出` + dayjs().format("YYYY-MM-DD") + ".xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.destroy();
      message.success("批量导出成功");
    } catch {
      message.destroy();
      message.error("批量导出失败");
    }
  }, [selectedRowKeys]);

  const openModal = (record, action) => {
    setModalRecord(record);
    setModalAction(action);
    setOpinion("");
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!modalRecord || !modalAction) return;
    setConfirmLoading(true);
    try {
      await hrReviewLedger(modalRecord.id, {
        action: modalAction,
        opinion: opinion || "",
      });
      message.success(modalAction === "APPROVE" ? "审批通过" : "已驳回");
      setModalOpen(false);
      setIsRefresh((prev) => !prev);
    } catch (err) {
      message.error(err?.message || "操作失败");
    } finally {
      setConfirmLoading(false);
    }
  };

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
        // width: 90,
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
        width: 260,
        render: (_, record) => (
          <Space size={8}>
            <Button
              size="small"
              icon={<EyeOutlined />}
              style={styles.detailBtn}
              onClick={() => navigate(`/hr-ledger-detail?id=${record.id}`)}
            >
              详情
            </Button>
            {REVIEWABLE_STATUS.includes(record.status) && (
              <>
                <Button
                  size="small"
                  icon={<CheckCircleOutlined />}
                  style={styles.approveBtn}
                  onClick={() => openModal(record, "APPROVE")}
                >
                  通过
                </Button>
                <Button
                  size="small"
                  icon={<CloseCircleOutlined />}
                  style={styles.rejectBtn}
                  onClick={() => openModal(record, "REJECT")}
                >
                  驳回
                </Button>
              </>
            )}
          </Space>
        ),
      },
    ],
    [navigate],
  );

  return (
    <Card
      title="台账审核"
      extra={
        <div style={styles.cardExtra}>
          <Button
            icon={<FileExcelOutlined />}
            style={{ color: "#52c41a", borderColor: "#52c41a" }}
            disabled={!selectedRowKeys.length}
            onClick={handleBatchExport}
          >
            批量导出
          </Button>
          <Button
            icon={<SendOutlined />}
            type="primary"
            disabled={!selectedRowKeys.length}
            onClick={handleOpenDistribute}
          >
            分发台账
          </Button>
          <Button icon={<SettingOutlined />} onClick={handleOpenAccess}>
            设置页面访问
          </Button>
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
        request={getPendingLedgers}
        params={params}
        rowKey="id"
        isRefresh={isRefresh}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          preserveSelectedRowKeys: true,
        }}
      />

      <Modal
        title={modalAction === "APPROVE" ? "审批通过" : "驳回台账"}
        open={modalOpen}
        onOk={handleConfirm}
        onCancel={() => setModalOpen(false)}
        confirmLoading={confirmLoading}
        okText="确认"
        cancelText="取消"
        destroyOnHidden
        width={480}
      >
        {modalAction && (
          <div
            style={{
              background: modalAction === "REJECT" ? "#fff7e6" : "#f6ffed",
              border: `1px solid ${modalAction === "REJECT" ? "#ffd591" : "#b7eb8f"}`,
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 16,
              fontSize: 13,
              color: "#666",
            }}
          >
            {modalAction === "REJECT"
              ? "驳回后，台账将退回考勤管理员重新编辑并再次提交"
              : "确认通过后，台账将进入下一审批环节或完成审批"}
          </div>
        )}
        {modalRecord && (
          <div style={{ marginBottom: 16, color: "#333" }}>
            <div>
              <strong>车间：</strong>
              {modalRecord.orgUnitName}
            </div>
            <div style={{ marginTop: 4 }}>
              <strong>月份：</strong>
              {modalRecord.ledgerMonth}
            </div>
            <div style={{ marginTop: 4 }}>
              <strong>在岗人数：</strong>
              {modalRecord.inWorkCount}
            </div>
          </div>
        )}
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            {modalAction === "REJECT" ? "驳回原因" : "审批意见"}（选填）
          </div>
          <TextArea
            rows={3}
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            placeholder={
              modalAction === "REJECT" ? "请输入驳回原因" : "请输入审批意见"
            }
          />
        </div>
      </Modal>

      {/* 分发台账弹窗 */}
      <Modal
        title="分发台账给领导查看"
        open={distributeModalOpen}
        onOk={handleDistribute}
        onCancel={() => setDistributeModalOpen(false)}
        confirmLoading={distributeLoading}
        okText="确认分发"
        cancelText="取消"
        destroyOnHidden
        width={520}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, color: "#666" }}>
            已选择 <strong>{selectedRowKeys.length}</strong> 个台账
          </div>
          <div
            style={{
              background: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
              color: "#666",
            }}
          >
            选择的领导将可以查看这些台账的详情
          </div>
        </div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>选择领导：</div>
        <div
          style={{
            maxHeight: 300,
            overflow: "auto",
            border: "1px solid #d9d9d9",
            borderRadius: 8,
            padding: 8,
          }}
        >
          {leaders.length > 0 ? (
            <Checkbox.Group
              value={selectedLeaders}
              onChange={setSelectedLeaders}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              {leaders.map((leader) => (
                <Checkbox
                  key={leader.id || leader.userId}
                  value={leader.id || leader.userId}
                >
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <span>{leader.name || leader.userName}</span>
                    {leader.roleName && (
                      <Tag color="blue" style={{ marginLeft: 4 }}>
                        {leader.roleName}
                      </Tag>
                    )}
                  </Space>
                </Checkbox>
              ))}
            </Checkbox.Group>
          ) : (
            <div style={{ textAlign: "center", color: "#999", padding: 20 }}>
              暂无领导数据
            </div>
          )}
        </div>
      </Modal>

      {/* 设置页面访问权限弹窗 */}
      <Modal
        title="设置领导页面访问权限"
        open={accessModalOpen}
        onCancel={() => setAccessModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setAccessModalOpen(false)}>
            取消
          </Button>,
          <Button
            key="revoke"
            danger
            loading={accessLoading}
            onClick={() => handleSetAccess(false)}
          >
            取消授权
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={accessLoading}
            onClick={() => handleSetAccess(true)}
          >
            确认授权
          </Button>,
        ]}
        destroyOnHidden
        width={520}
      >
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              background: "#e6f7ff",
              border: "1px solid #91d5ff",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
              color: "#666",
            }}
          >
            设置哪些领导可以访问"现员分布台账"页面
          </div>
        </div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>选择领导：</div>
        <div
          style={{
            maxHeight: 300,
            overflow: "auto",
            border: "1px solid #d9d9d9",
            borderRadius: 8,
            padding: 8,
          }}
        >
          {accessLeaders.length > 0 ? (
            <Checkbox.Group
              value={selectedAccessLeaders}
              onChange={setSelectedAccessLeaders}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              {accessLeaders.map((leader) => (
                <Checkbox
                  key={leader.userId || leader.id}
                  value={leader.userId || leader.id}
                >
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <span>{leader.name || leader.userName}</span>
                    {leader.roleName && (
                      <Tag color="blue" style={{ marginLeft: 4 }}>
                        {leader.roleName}
                      </Tag>
                    )}
                  </Space>
                </Checkbox>
              ))}
            </Checkbox.Group>
          ) : (
            <div style={{ textAlign: "center", color: "#999", padding: 20 }}>
              暂无领导数据
            </div>
          )}
        </div>
      </Modal>
    </Card>
  );
};

export default HrAllLedger;

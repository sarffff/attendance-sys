import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Card,
  Tag,
  Select,
  Space,
  Button,
  message,
  Modal,
  Checkbox,
  Avatar,
} from "antd";
import {
  ReloadOutlined,
  FileExcelOutlined,
  SendOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import BaseTable from "@/components/BaseTable";
import {
  getSubmitStatus,
  exportBasicBatch,
  getLeaders,
  distributeLeaderToEmployee,
  getLeaderEmployeePageAccess,
  setLeaderEmployeePageAccess,
} from "@/api/ledger";
import dayjs from "dayjs";

const STATUS_MAP = {
  SUBMITTED: { text: "已提交", color: "processing" },
  NOT_SUBMITTED: { text: "未提交", color: "default" },
};

const STATUS_OPTIONS = [
  { label: "全部", value: "" },
  { label: "已提交", value: "SUBMITTED" },
  { label: "未提交", value: "NOT_SUBMITTED" },
];

const HrAllEmployeeBasic = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [isRefresh, setIsRefresh] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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
        const data = await getLeaderEmployeePageAccess();
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
      message.warning("请先勾选要分发的部门");
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
    try {
      await distributeLeaderToEmployee(selectedRowKeys, selectedLeaders);
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
      await setLeaderEmployeePageAccess(selectedAccessLeaders, enabled);
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
      message.loading("正在批量导出Excel...", 0);
      const blob = await exportBasicBatch(selectedRowKeys);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `现员信息批量导出${dayjs().format("YYYY-MM-DD")}.xlsx`;
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

  const columns = [
    { title: "部门ID", dataIndex: "orgUnitId", width: 100, align: "center" },
    {
      title: "部门名称",
      dataIndex: "orgUnitName",
      width: 160,
    },
    {
      title: "现员人数",
      dataIndex: "employeeCount",
      width: 100,
      align: "center",
    },
    {
      title: "提交状态",
      dataIndex: "status",
      width: 120,
      render: (v) => {
        const s = STATUS_MAP[v];
        return <Tag color={s?.color}>{s?.text || v || "-"}</Tag>;
      },
    },
    {
      title: "操作",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() =>
            navigate(`/admin-employee-basic?orgUnitId=${record.orgUnitId}`)
          }
        >
          查看详情
        </Button>
      ),
    },
    {
      title: "提交时间",
      dataIndex: "submittedAt",
      width: 180,
      render: (v) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-"),
    },
  ];

  return (
    <Card
      title="现员提交状态"
      extra={
        <Space>
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
            分发数据
          </Button>
          <Button icon={<SettingOutlined />} onClick={handleOpenAccess}>
            设置页面访问
          </Button>
          <Select
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            style={{ width: 120 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => setIsRefresh((p) => !p)}
          >
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
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          preserveSelectedRowKeys: true,
        }}
      />

      {/* 分发数据给领导弹窗 */}
      <Modal
        title="分发现员数据给领导查看"
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
            已选择 <strong>{selectedRowKeys.length}</strong> 个部门
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
            选择的领导将可以查看这些部门的现员数据
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
            设置哪些领导可以访问"现员基础台账"页面
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

export default HrAllEmployeeBasic;

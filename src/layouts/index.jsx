import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Typography,
  theme,
  message,
  Modal,
  Form,
  Input,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  FormOutlined,
  RightOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/modules/user";
// import { ApprovableRoleList } from "@/constants/roleCode";
import { menuConfig } from "@/config/menuConfig";
import { userResetPasswordApi } from "@/api/super_admin";
import {
  getLeaderLedgerPageAccess,
  getLeaderEmployeePageAccess,
} from "@/api/ledger";
const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const allLedgerRoles = [1, 4];
const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordForm] = Form.useForm();
  const [hasLedgerAccess, setHasLedgerAccess] = useState(false);
  const [hasEmployeeAccess, setHasEmployeeAccess] = useState(false);
  const user = useAppSelector((state) => state.user.userInfo);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  // 获取领导的页面访问权限
  useEffect(() => {
    const loadPageAccess = async () => {
      try {
        const userId = user?.userId || user?.id;

        // userId 为 6 或 7 时直接拥有全部权限
        if (userId === 6 || userId === 7) {
          setHasLedgerAccess(true);
          setHasEmployeeAccess(true);
          return;
        }

        const [ledgerAccess, employeeAccess] = await Promise.all([
          getLeaderLedgerPageAccess(),
          getLeaderEmployeePageAccess(),
        ]);

        // 检查当前用户是否在授权列表中
        if (Array.isArray(ledgerAccess)) {
          setHasLedgerAccess(
            ledgerAccess.some((item) => (item.userId || item.id) === userId),
          );
        }
        if (Array.isArray(employeeAccess)) {
          setHasEmployeeAccess(
            employeeAccess.some((item) => (item.userId || item.id) === userId),
          );
        }
      } catch (error) {
        console.error("获取页面访问权限失败:", error);
      }
    };
    loadPageAccess();
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    message.success("退出登录成功");
    navigate("/login");
  };

  const openPasswordModal = () => {
    passwordForm.resetFields();
    setPasswordModalOpen(true);
  };

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields();
      const userId = user?.userId || user?.id;

      if (!userId) {
        message.error("未获取到当前用户信息");
        return;
      }

      setPasswordLoading(true);
      await userResetPasswordApi(userId, values);
      message.success("密码修改成功");
      setPasswordModalOpen(false);
      passwordForm.resetFields();
      handleLogout();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || "密码修改失败");
    } finally {
      setPasswordLoading(false);
    }
  };

  const menuItems = menuConfig
    .filter((item) => item.key !== "/hr-ledger-detail")
    .filter(
      (item) => item.roles === null || item.roles.includes(user?.roleCode),
    )
    .filter((item) => {
      // 领导页面权限检查 - 根据 userId 判断
      if (item.dynamicAccess === "ledger") {
        // console.log(item);
        return hasLedgerAccess;
      }
      if (item.dynamicAccess === "employee") {
        // console.log(item);
        return hasEmployeeAccess;
      }
      return true;
    })
    .filter((item) => {
      if (!allLedgerRoles.includes(user?.orgUnitId)) {
        return !item.isAll;
      } else {
        return !item.isCommon;
      }
    })
    .map(({ key, icon, label }) => ({
      key,
      icon: React.createElement(icon),
      label: <span style={styles.menuLabel}>{label}</span>,
    }));

  const dropdownItems = [
    {
      key: "1",
      label: "修改密码",
      icon: <FormOutlined />,
      onClick: openPasswordModal,
    },
    {
      key: "2",
      label: "退出登录",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout style={styles.outerLayout}>
      <div style={styles.bgGlowTop} />
      <div style={styles.bgGlowBottom} />

      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={272}
        collapsedWidth={88}
        style={styles.sider}
      >
        <div style={styles.logoContainer}>
          <div style={styles.logoBrand}>
            <div style={styles.logoDotOuter}>
              <div style={styles.logoDotInner} />
            </div>
          </div>

          {!collapsed && (
            <div>
              <div style={styles.logoText}>LeaveFlow</div>
              <div style={styles.logoSubText}>智能请假与审批平台</div>
            </div>
          )}
        </div>

        {!collapsed && (
          <div style={styles.workspaceCard}>
            <div style={styles.workspaceTag}>Workspace</div>
            <div style={styles.workspaceTitle}>企业考勤中心</div>
            <div style={styles.workspaceDesc}>统一管理申请、审批与人员流程</div>
          </div>
        )}

        <div style={styles.menuSectionTitleWrap}>
          {!collapsed && <span style={styles.menuSectionTitle}>功能导航</span>}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={styles.menu}
          inlineCollapsed={collapsed}
        />
      </Sider>

      <Layout style={styles.mainLayout}>
        <Header style={styles.header}>
          <div style={styles.headerLeft}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={styles.toggleBtn}
            />
          </div>

          <div style={styles.headerRight}>
            <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
              <div style={styles.userProfile}>
                <Avatar
                  size={40}
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  style={styles.userAvatar}
                />
                <div style={styles.userInfoText}>
                  <Text strong style={styles.userName}>
                    {user?.username || "管理员"}
                  </Text>
                  <Text style={styles.userSubName}>
                    {user?.empName || "系统用户"}
                  </Text>
                </div>
                <RightOutlined style={styles.userArrow} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={styles.content}>
          <div
            style={{
              ...styles.pageWrapper,
              borderColor: token.colorBorderSecondary,
            }}
          >
            <div style={styles.pageInnerGlow} />
            <Outlet />
          </div>
        </Content>
      </Layout>

      <Modal
        title={
          <span style={styles.modalTitle}>
            <LockOutlined style={styles.modalTitleIcon} />
            修改密码
          </span>
        }
        open={passwordModalOpen}
        onOk={handlePasswordSubmit}
        onCancel={() => setPasswordModalOpen(false)}
        confirmLoading={passwordLoading}
        okText="确认修改"
        cancelText="取消"
        width={420}
        destroyOnHidden
        styles={{ body: { paddingTop: 8 } }}
      >
        <Form form={passwordForm} layout="vertical" requiredMark="optional">
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 6, max: 16, message: "密码必须在6-16个字符之间" },
            ]}
          >
            <Input.Password
              placeholder="请输入新密码"
              style={styles.passwordInput}
            />
          </Form.Item>

          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "请再次输入新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次密码输入不一致"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="请再次输入新密码"
              style={styles.passwordInput}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

const styles = {
  outerLayout: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(59,130,246,0.08), transparent 28%), linear-gradient(180deg, #f8fbff 0%, #f4f7fb 45%, #eef4f9 100%)",
    position: "relative",
    overflow: "hidden",
  },
  bgGlowTop: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0) 72%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  bgGlowBottom: {
    position: "absolute",
    bottom: -160,
    left: -100,
    width: 360,
    height: 360,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0) 72%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  sider: {
    background: "rgba(255, 255, 255, 0.72)",
    backdropFilter: "blur(18px)",
    borderRight: "1px solid rgba(226, 232, 240, 0.9)",
    boxShadow: "12px 0 40px rgba(15, 23, 42, 0.05)",
    padding: "18px 14px 16px",
    position: "relative",
    zIndex: 2,
  },
  mainLayout: {
    background: "transparent",
    position: "relative",
    zIndex: 1,
  },
  logoContainer: {
    height: 74,
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "0 10px",
    marginBottom: 14,
  },
  logoBrand: {
    width: 42,
    height: 42,
    borderRadius: 14,
    background: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.28)",
    flexShrink: 0,
  },
  logoDotOuter: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.28)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoDotInner: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#fff",
  },
  logoText: {
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: "-0.04em",
    color: "#0f172a",
    lineHeight: 1.1,
  },
  logoSubText: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
  },
  workspaceCard: {
    margin: "6px 6px 18px",
    padding: "16px 16px 15px",
    borderRadius: 20,
    background:
      "linear-gradient(135deg, #eff6ff 0%, #f8fbff 55%, #ffffff 100%)",
    border: "1px solid #dbeafe",
    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.08)",
  },
  workspaceTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 10px",
    borderRadius: 999,
    fontSize: 12,
    color: "#2563eb",
    background: "rgba(37, 99, 235, 0.08)",
    marginBottom: 10,
  },
  workspaceTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 6,
  },
  workspaceDesc: {
    fontSize: 12,
    lineHeight: 1.7,
    color: "#64748b",
  },
  menuSectionTitleWrap: {
    padding: "0 10px",
    marginBottom: 10,
    minHeight: 20,
  },
  menuSectionTitle: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: 600,
    letterSpacing: "0.08em",
  },
  menu: {
    borderRight: 0,
    background: "transparent",
    padding: "0 6px",
  },
  menuLabel: {
    fontWeight: 600,
    letterSpacing: "0.01em",
  },
  header: {
    height: 84,
    margin: "18px 22px 0",
    padding: "0 22px",
    background: "rgba(255, 255, 255, 0.68)",
    border: "1px solid rgba(226, 232, 240, 0.9)",
    borderRadius: 24,
    backdropFilter: "blur(18px)",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    minWidth: 0,
  },

  toggleBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    color: "#475569",
    background: "rgba(248, 250, 252, 0.95)",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    padding: "8px 10px",
    borderRadius: 18,
    background: "rgba(248, 250, 252, 0.96)",
    border: "1px solid #e2e8f0",
    boxShadow: "0 6px 16px rgba(15, 23, 42, 0.04)",
  },
  userAvatar: {
    border: "2px solid #dbeafe",
    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    flexShrink: 0,
  },
  userInfoText: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.15,
  },
  userName: {
    fontSize: 13,
    color: "#0f172a",
  },
  userSubName: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
  },
  userArrow: {
    fontSize: 12,
    color: "#94a3b8",
  },
  modalTitle: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  modalTitleIcon: {
    color: "#2563eb",
  },
  passwordInput: {
    borderRadius: 8,
  },
  content: {
    padding: "22px",
    overflowY: "auto",
  },
  pageWrapper: {
    position: "relative",
    overflow: "hidden",
    background: "rgba(255, 255, 255, 0.84)",
    padding: "28px",
    borderRadius: "28px",
    minHeight: "calc(100vh - 146px)",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
    border: "1px solid #eef2f7",
    backdropFilter: "blur(12px)",
  },
  pageInnerGlow: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(96,165,250,0.14) 0%, rgba(96,165,250,0) 72%)",
    pointerEvents: "none",
  },
};

export default AppLayout;

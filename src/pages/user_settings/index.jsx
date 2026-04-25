import { useState, useCallback } from "react";
import {
    Card,
    Table,
    Button,
    Modal,
    Form,
    Input,
    Space,
    Popconfirm,
    message,
    Typography,
    Badge,
    Select,
    Tag,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    PoweroffOutlined,
    UserOutlined,
    SearchOutlined,
    ReloadOutlined,
    LockOutlined,
    TeamOutlined,
} from "@ant-design/icons";

import {
    orgListApi,
    userAddApi,
    userListApi,
    userEditApi,
    userToggleApi,
    userResetPasswordApi,
} from "@/api/super_admin";
import { useFetch } from "@/hooks/useFetch";
import { allRoles } from "@/constants/roleCode";
import BaseTable from "@/components/BaseTable";
import { applicantType } from "@/constants/constantsMap";
// import { debounce } from "lodash";

const { Title, Text } = Typography;

const UserSettings = () => {
    const [isRefresh, setIsRefresh] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [editRecord, setEditRecord] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [filterEmpName, setFilterEmpName] = useState('');
    const [form] = Form.useForm();
    const [resetForm] = Form.useForm();
    const [searchParams, setSearchParams] = useState({
        empName: '',
    })
    const refresh = () => setIsRefresh((prev) => !prev);

    const { data: orgData } = useFetch(() =>
        orgListApi({ pageNum: 1, pageSize: 999 }),
    );

    const orgOptions = (orgData?.records || []).map((o) => ({
        label: o.orgName,
        value: o.id,
    }));

    const roleCodeOptions = Object.entries(allRoles).map(([key, value]) => ({
        label: value,
        value: key,
    }));

    const applicantTypeOptions = Object.entries(applicantType).map(
        ([key, value]) => ({
            label: value,
            value: key,
        }),
    );

    const columns = [
        {
            title: "用户",
            dataIndex: "username",
            render: (name, record) => (
                <Space>
                    <div>
                        <Text
                            strong
                            style={{
                                fontSize: 14,
                                display: "block",
                                lineHeight: 1.3,
                            }}
                        >
                            {record.username || "—"}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: "姓名",
            dataIndex: "empName",
            render: (name) => (
                <Text style={{ fontSize: 13 }}>{name || "—"}</Text>
            ),
        },
        {
            title: "角色",
            dataIndex: "roleCode",
            width: 100,
            render: (_, record) => (
                <Text style={{ fontSize: 13 }}>
                    {allRoles[record.roleCode] || "—"}
                </Text>
            ),
        },
        {
            title: "所属组织",
            dataIndex: "orgUnitId",
            render: (_, record) => (
                <Space size={4}>
                    <TeamOutlined style={{ color: "#1677ff", fontSize: 12 }} />
                    <Text style={{ fontSize: 13 }}>
                        {orgData?.records.map((i) => {
                            if (i.sortNo === record.orgUnitId) {
                                return i.orgName;
                            }
                        }) || "—"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "是否启用",
            dataIndex: "isEnabled",
            render: (isEnabled) => {
                return (
                    <Badge
                        status={isEnabled ? "success" : "default"}
                        text={isEnabled ? "是" : "否"}
                    />
                );
            },
        },
        {
            title: "操作",
            width: 180,
            fixed: "right",
            render: (_, record) => (
                <Space size={2}>
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        style={{ color: "#1677ff" }}
                        onClick={() => openEdit(record)}
                    >
                        编辑
                    </Button>
                    <Button
                        type="text"
                        size="small"
                        icon={<LockOutlined />}
                        style={{ color: "#faad14" }}
                        onClick={() => openReset(record)}
                    >
                        重置密码
                    </Button>
                    <Popconfirm
                        title={
                            record.isEnabled === 1
                                ? "确定停用该用户？"
                                : "确定启用该用户？"
                        }
                        onConfirm={() => handleToggle(record)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="text"
                            size="small"
                            icon={<PoweroffOutlined />}
                            danger={record.isEnabled === 0}
                            style={
                                record.isEnabled === 1
                                    ? { color: "#52c41a" }
                                    : {}
                            }
                        >
                            {record.isEnabled === 1 ? "停用" : "启用"}
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const openAdd = () => {
        setEditRecord(null);
        form.resetFields();
        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditRecord(record);
        form.setFieldsValue({
            username: record.username,
            roleCode: record.roleCode,
            orgUnitId: record.orgUnitId,
            empName: record.empName,
            applicantType: record.applicantType,
        });
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setConfirmLoading(true);
            if (editRecord) {
                await userEditApi(editRecord.id, values);
                message.success("用户更新成功");
            } else {
                await userAddApi(values);
                message.success("用户新增成功");
            }
            setModalOpen(false);
            refresh();
        } catch (err) {
            if (err?.errorFields) return;
            message.error(err?.message || "操作失败");
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleToggle = useCallback(async (record) => {
        try {
            await userToggleApi(record.id, {
                isEnabled: record.isEnabled === 1 ? 0 : 1,
            });
            message.success(record.isEnabled === 1 ? "已停用" : "已启用");
            refresh();
        } catch (err) {
            message.error(err?.message || "操作失败");
        }
    }, []);

    const openReset = (record) => {
        setEditRecord(record);
        resetForm.resetFields();
        setResetModalOpen(true);
    };

    const handleReset = async () => {
        try {
            const values = await resetForm.validateFields();
            setConfirmLoading(true);
            await userResetPasswordApi(editRecord.id, values);
            message.success("密码重置成功");
            setResetModalOpen(false);
        } catch (err) {
            if (err?.errorFields) return;
            message.error(err?.message || "重置失败");
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleClear = () => {
        setFilterEmpName('');
        handlePressEnter(null, '');
    };

    const handlePressEnter = (e, overrideValue) => {
        const valueToSearch = overrideValue !== undefined ? overrideValue : e.target.value;

        setSearchParams((prev) => {
            return {
                ...prev,
                empName: valueToSearch,
            };
        });
    };

    return (
        <div
            style={{
                padding: "24px",
                minHeight: "100vh",
                background: "#f5f7fa",
            }}
        >
            <div
                style={{
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background:
                            "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(82,196,26,0.3)",
                    }}
                >
                    <UserOutlined style={{ color: "#fff", fontSize: 18 }} />
                </div>
                <div>
                    <Title level={4} style={{ margin: 0, lineHeight: 1.2 }}>
                        用户管理
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        管理系统用户账号与权限
                    </Text>
                </div>
            </div>

            <Card
                bordered={false}
                style={{
                    borderRadius: 12,
                    boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                }}
                styles={{ body: { padding: "16px 20px" } }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                        flexWrap: "wrap",
                        gap: 10,
                    }}
                >
                    <Space>
                        <Input
                            prefix={
                                <SearchOutlined style={{ color: "#bbb" }} />
                            }
                            placeholder="搜索用户名 / 姓名"
                            allowClear
                            style={{ width: 220, borderRadius: 8 }}
                            value={filterEmpName}
                            onChange={(e)=> setFilterEmpName(e.target.value)}
                            onPressEnter={(e) => handlePressEnter(e)}
                            onClear={handleClear}
                        />
                    </Space>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={openAdd}
                        style={{
                            borderRadius: 8,
                            background:
                                "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                            border: "none",
                            boxShadow: "0 3px 10px rgba(82,196,26,0.3)",
                            fontWeight: 500,
                        }}
                    >
                        新增用户
                    </Button>
                </div>

                <BaseTable
                    rowKey="id"
                    columns={columns}
                    request={userListApi}
                    params={searchParams}
                    isRefresh={isRefresh}
                />
            </Card>

            {/* 新增 / 编辑弹窗 */}
            <Modal
                title={
                    <Space>
                        <UserOutlined style={{ color: "#52c41a" }} />
                        {editRecord ? "编辑用户" : "新增用户"}
                    </Space>
                }
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => setModalOpen(false)}
                confirmLoading={confirmLoading}
                okText="确定"
                cancelText="取消"
                width={520}
                styles={{ body: { paddingTop: 8 } }}
            >
                <Form form={form} layout="vertical" requiredMark="optional">
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "0 16px",
                        }}
                    >
                        <Form.Item
                            label="用户名"
                            name="username"
                            rules={[
                                { required: true, message: "请输入用户名" },
                            ]}
                        >
                            <Input
                                prefix={
                                    <UserOutlined style={{ color: "#bbb" }} />
                                }
                                placeholder="请输入用户名"
                                disabled={!!editRecord}
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>
                        {!editRecord ? (
                            <Form.Item
                                label="密码"
                                name="password"
                                rules={[
                                    { required: true, message: "请输入密码" },
                                ]}
                            >
                                <Input
                                    placeholder="请输入密码"
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>
                        ) : null}
                        <Form.Item
                            label="角色"
                            name="roleCode"
                            rules={[{ required: true, message: "请选择角色" }]}
                        >
                            <Select
                                placeholder="请选择角色"
                                style={{ borderRadius: 8 }}
                                options={roleCodeOptions}
                            />
                        </Form.Item>
                        <Form.Item
                            label="姓名"
                            name="empName"
                            rules={[{ required: true, message: "请输入姓名" }]}
                        >
                            <Input
                                placeholder="请输入姓名"
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>
                        <Form.Item
                            label="职位"
                            name="applicantType"
                            rules={[{ required: true, message: "请选择职位" }]}
                        >
                            <Select
                                placeholder="请选择职位"
                                style={{ borderRadius: 8 }}
                                options={applicantTypeOptions}
                            />
                        </Form.Item>
                        <Form.Item
                            label="所属组织"
                            name="orgUnitId"
                            rules={[{ required: true, message: "请选择组织" }]}
                        >
                            <Select
                                placeholder="请选择组织"
                                style={{ borderRadius: 8 }}
                                options={orgOptions}
                                showSearch
                                filterOption={(input, option) =>
                                    option?.label
                                        ?.toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            {/* 重置密码弹窗 */}
            <Modal
                title={
                    <Space>
                        <LockOutlined style={{ color: "#faad14" }} />
                        重置密码 — {editRecord?.username}
                    </Space>
                }
                open={resetModalOpen}
                onOk={handleReset}
                onCancel={() => setResetModalOpen(false)}
                confirmLoading={confirmLoading}
                okText="确认重置"
                cancelText="取消"
                width={400}
                styles={{ body: { paddingTop: 8 } }}
            >
                <Form
                    form={resetForm}
                    layout="vertical"
                    requiredMark="optional"
                >
                    <Form.Item
                        label="新密码"
                        name="newPassword"
                        rules={[
                            { required: true, message: "请输入新密码" },
                            {
                                min: 6,
                                max: 16,
                                message: "密码必须在6-16个字符之间",
                            },
                        ]}
                    >
                        <Input.Password
                            placeholder="请输入新密码"
                            style={{ borderRadius: 8 }}
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
                                    if (
                                        !value ||
                                        getFieldValue("newPassword") === value
                                    ) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error("两次密码输入不一致"),
                                    );
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            placeholder="请再次输入新密码"
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <style>{`
                .table-row-stripe td { background: #fafbfc !important; }
                .ant-table-thead > tr > th {
                    background: #f6ffed !important;
                    font-weight: 600 !important;
                    color: #2c3e50 !important;
                    font-size: 13px !important;
                }
                .ant-table-row:hover td { background: #f6ffed !important; }
            `}</style>
        </div>
    );
};

export default UserSettings;

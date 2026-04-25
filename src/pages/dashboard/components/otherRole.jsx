import {
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Tag,
    Space,
    Skeleton,
    Empty,
    Avatar,
    Divider,
} from "antd";
import {
    UserOutlined,
    CheckCircleOutlined,
    FileTextOutlined,
    BellOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import { useFetch } from "@/hooks/useFetch";
import { accountApi } from "@/api/login";
import { formatTime } from "@/utils/formatTime";

const OtherRole = () => {
    const { data: accountData, loading } = useFetch(accountApi);

    const leaveTypeRequestCounts = accountData?.leaveTypeRequestCounts || [];
    const monthlyApprovalStats = accountData?.monthlyApprovalStats || {};
    const pendingCount = monthlyApprovalStats.pendingCount ?? 0;
    const approvedCount = monthlyApprovalStats.approvedCount ?? 0;
    const totalRequests = leaveTypeRequestCounts.reduce(
        (sum, item) => sum + (item.requestCount || 0),
        0,
    );
    const messages = accountData?.messages || [];

    const columns = [
        { title: "请假类型", dataIndex: "leaveTypeName", key: "type" },
        {
            title: "申请次数",
            dataIndex: "requestCount",
            key: "count",
            render: (value) => <strong>{value}</strong>,
        },
    ];

    const getMessageColor = (index) => {
        const colors = ["#e6f7ff", "#f6ffed", "#fff7e6"];
        return colors[index % colors.length];
    };

    const getMessageBorderColor = (index) => {
        const colors = ["#1890ff", "#52c41a", "#faad14"];
        return colors[index % colors.length];
    };

    return (
        <div style={{ padding: 24, background: "#f0f2f5" }}>
            <Skeleton active loading={loading}>
                <Card
                    bordered={false}
                    style={{
                        borderRadius: 20,
                        boxShadow: "0 16px 40px rgba(12, 35, 72, 0.08)",
                        marginBottom: 24,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 16,
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: "#162447",
                                }}
                            >
                                欢迎进入请假管理后台
                            </div>
                            <div style={{ marginTop: 8, color: "#5f6c8a" }}>
                                实时显示本月审批与请假类型申请趋势，支持快速决策
                            </div>
                        </div>
                        <Space size="large">
                            <Statistic
                                title="本月待审批"
                                value={pendingCount}
                                valueStyle={{
                                    color: "#fa8c16",
                                    fontSize: 28,
                                    fontWeight: 700,
                                }}
                                prefix={
                                    <CheckCircleOutlined
                                        style={{ color: "#fa8c16" }}
                                    />
                                }
                            />
                            <Statistic
                                title="本月已审批"
                                value={approvedCount}
                                valueStyle={{
                                    color: "#3f8600",
                                    fontSize: 28,
                                    fontWeight: 700,
                                }}
                            />
                            <Statistic
                                title="本月申请总数"
                                value={totalRequests}
                                valueStyle={{
                                    color: "#1d39c4",
                                    fontSize: 28,
                                    fontWeight: 700,
                                }}
                            />
                        </Space>
                    </div>
                </Card>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={14}>
                        <Card
                            title="本月请假类型申请分布"
                            bordered={false}
                            style={{ borderRadius: 20 }}
                        >
                            <Table
                                columns={columns}
                                dataSource={leaveTypeRequestCounts}
                                rowKey="leaveTypeId"
                                pagination={false}
                                locale={{
                                    emptyText: (
                                        <Empty description="暂无请假类型申请数据" />
                                    ),
                                }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} lg={10}>
                        <Card
                            title={
                                <Space>
                                    <BellOutlined style={{ color: "#1890ff" }} />
                                    系统消息
                                </Space>
                            }
                            bordered={false}
                            style={{ borderRadius: 20 }}
                        >
                            {messages.length ? (
                                <Space
                                    direction="vertical"
                                    style={{ width: "100%", gap: 12 }}
                                >
                                    {messages.map((item, index) => (
                                        <div
                                            key={item.id || index}
                                            style={{
                                                borderRadius: 12,
                                                background: getMessageColor(
                                                    index,
                                                ),
                                                border: `2px solid ${getMessageBorderColor(
                                                    index,
                                                )}`,
                                                padding: "14px 16px",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {/* 消息头部：发送者和时间 */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                    marginBottom: 10,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <Avatar
                                                        size={28}
                                                        icon={<UserOutlined />}
                                                        style={{
                                                            background:
                                                                getMessageBorderColor(
                                                                    index,
                                                                ),
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                            color: "#162447",
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        {item.senderName ||
                                                            "系统管理员"}
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                        fontSize: 12,
                                                        color: "#8c8c8c",
                                                    }}
                                                >
                                                    <ClockCircleOutlined />
                                                    {formatTime(
                                                        item.createdAt,
                                                    )}
                                                </div>
                                            </div>

                                            <Divider
                                                style={{ margin: "8px 0" }}
                                            />

                                            {/* 消息标题 */}
                                            {item.title && (
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: 14,
                                                        color: "#162447",
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    {item.title}
                                                </div>
                                            )}

                                            {/* 消息内容 */}
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    color: "#595959",
                                                    lineHeight: 1.6,
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {item.content || "暂无详细内容"}
                                            </div>
                                        </div>
                                    ))}
                                </Space>
                            ) : (
                                <Empty description="暂无消息" />
                            )}
                        </Card>
                    </Col>
                </Row>
            </Skeleton>
        </div>
    );
};

export default OtherRole;

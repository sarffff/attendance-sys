import {
    Card,
    Tabs,
    Button,
    Tag,
    message,
    Form,
    Select,
    Upload,
    Tooltip,
    Modal,
    Alert,
    Input,
} from "antd";
import { UploadOutlined, AuditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import BaseTable from "@/components/BaseTable";
import NoOperation from "@/components/NoOperation";
import LeaveDetailModal from "@/components/LeaveDetailModal";
import { formatTime } from "../../utils/formatTime";
import {
    leacesListApi,
    leacesTypeApi,
    leacesStatusApi,
    leacesDetailApi,
    leacesApproveApi,
    leacesBatchApproveApi,
    leacesSelectLeaderApi,
    leacesSelectLeaderListApi,
} from "@/api/leaves";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
    leave_step,
    leaveStatusMap as map,
    applicantType,
} from "@/constants/constantsMap";

const { TextArea } = Input;
const Approval = () => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
    const user = useAppSelector((state) => state.user.userInfo);
    const [detailOpen, setDetailOpen] = useState(false);
    const [signatureMap, setSignatureMap] = useState({});
    const [currentRow, setCurrentRow] = useState(null);
    const [isRefresh, setIsRefresh] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [batchModalOpen, setBatchModalOpen] = useState(false);
    const [leaderModalOpen, setLeaderModalOpen] = useState(false);
    const [batchLeaderList, setBatchLeaderList] = useState([]);
    const [filterForm] = Form.useForm();
    const [chooseLeaderForm] = Form.useForm();
    const { data: typeData } = useFetch(leacesTypeApi);
    const { data: statusData } = useFetch(leacesStatusApi);
    const [filters, setFilters] = useState({
        status: "",
        leaveTypeId: null,
    });

    const needChooseLeaderStep = [3];
    const needOperation = ["PENDING", "APPROVING"];

    const columns = [
        {
            title: "申请人",
            dataIndex: "applicantName",
            render: (text, record) => (
                <a
                    onClick={async () => {
                        const data = await leacesDetailApi(record.id);
                        setCurrentRow(data);
                        setDetailOpen(true);
                    }}
                >
                    {text}
                </a>
            ),
        },
        {
            title: "职位",
            dataIndex: "applicantType",
            render: (type) => {
                return applicantType[type];
            },
        },
        { title: "类型", dataIndex: "leaveTypeName" },
        {
            title: "时间",
            render: (r) =>
                `${formatTime(r.startTime)} ~ ${formatTime(r.endTime)}`,
        },
        { title: "天数", dataIndex: "leaveDays" },
        { title: "班组长", dataIndex: "teamLeaderSnapshot" },
        { title: "原因", dataIndex: "reason" },
        { title: "备注", dataIndex: "remark" },
        {
            title: "状态",
            dataIndex: "status",
            render: (status) => {
                return (
                    <Tag color={map[status]?.color}>{map[status]?.text}</Tag>
                );
            },
        },
        {
            title: "操作",
            fixed: "right",
            render: (_, record) => {
                return judgeNeedOperation(record) ? (
                    judgeNeedChooseLeader(record) ? (
                        chooseLeaderOperation(record)
                    ) : (
                        approvalOperations(record)
                    )
                ) : (
                    <NoOperation />
                );
            },
        },
    ];

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRows(selectedRows);
        },
        getCheckboxProps: (record) => ({
            disabled: !judgeNeedOperation(record),
            name: record.name,
        }),
        selectedRowKeys: selectedRows.map((row) => row.id),
    };

    const approvalOperations = (record) => {
        const uploadProps = {
            name: "signatureFile",
            action: `${BASE_URL}/api/leaves/${record.id}/approval-signature`,
            headers: {
                Authorization: localStorage.getItem("attendance-token"),
            },
            maxCount: 1,
            onChange(info) {
                if (info.file.status === "done") {
                    if (info.file.response.success) {
                        setSignatureMap((prev) => ({
                            ...prev,
                            [record.id]:
                                BASE_URL + info.file.response.data.signatureUrl,
                        }));
                        message.success("签名上传成功");
                    } else {
                        message.error(
                            info.file.response.message || "签名上传失败",
                        );
                    }
                }
            },
        };
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "3px 12px 3px 4px",
                        border: "1px solid #e8e8e8",
                        borderRadius: 20,
                        background: "linear-gradient(145deg, #ffffff, #f0f2f5)",
                    }}
                >
                    <Upload {...uploadProps} showUploadList={false}>
                        <Button
                            size="small"
                            icon={<UploadOutlined />}
                            style={{
                                border: "none",
                                background: "transparent",
                                boxShadow: "none",
                                color: "#595959",
                                fontWeight: 500,
                                fontSize: "12px",
                            }}
                        >
                            上传签名
                        </Button>
                    </Upload>

                    {signatureMap[record.id] ? (
                        <Tooltip title="点击查看大图">
                            <img
                                src={signatureMap[record.id]}
                                alt="电子签名"
                                onClick={() =>
                                    window.open(signatureMap[record.id])
                                }
                                style={{
                                    width: 44,
                                    height: 24,
                                    objectFit: "contain",
                                    border: "1px solid #d9d9d9",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    background: "#fff",
                                    transition: "transform 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.transform =
                                        "scale(1.05)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.transform =
                                        "scale(1)")
                                }
                            />
                        </Tooltip>
                    ) : (
                        <span
                            style={{
                                fontSize: 12,
                                color: "#bfbfbf",
                                fontStyle: "italic",
                            }}
                        >
                            未上传
                        </span>
                    )}
                </div>

                <Button
                    size="small"
                    icon={<AuditOutlined />}
                    style={{
                        height: 32,
                        padding: "0 16px",
                        borderRadius: 16,
                        border: "none",
                        background:
                            "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                        color: "#fff",
                        boxShadow: "0 2px 6px rgba(24, 144, 255, 0.35)",
                        display: "flex",
                        alignItems: "center",
                        fontWeight: 500,
                    }}
                    onClick={async () => {
                        const data = await leacesDetailApi(record.id);
                        setCurrentRow(data);
                        setDetailOpen(true);
                    }}
                >
                    审批
                </Button>
            </div>
        );
    };

    const chooseLeaderOperation = (record) => {
        return (
            <div style={{ textAlign: "center" }}>
                <Button
                    type="primary"
                    style={{
                        border: "none",
                        borderRadius: "9999px",
                        padding: "8px 24px",
                        fontSize: "14px",
                        fontWeight: "500",
                        boxShadow: "0 2px 6px rgba(124, 58, 237, 0.25)",
                        transition: "all 0.2s ease",
                        whiteSpace: "nowrap",
                    }}
                    onClick={() => openLeaderModal(record)}
                >
                    选择后续领导
                </Button>
            </div>
        );
    };

    const judgeNeedOperation = (record) => {
        if (typeof leave_step[record?.currentStep] === "string") {
            return (
                leave_step[record?.currentStep] === user.roleCode &&
                needOperation.includes(record.status)
            );
        }
        return (
            leave_step[record?.currentStep].includes(user.roleCode) &&
            needOperation.includes(record.status)
        );
    };

    const judgeNeedChooseLeader = (record) => {
        return needChooseLeaderStep.includes(record.currentStep);
    };

    const handleFilter = (values) => {
        setFilters({
            status: values.status || "",
            leaveTypeId: values.leaveTypeId || null,
        });
    };

    const handleResetFilter = () => {
        filterForm.resetFields();
        setFilters({ status: "", leaveTypeId: null });
    };

    const handleApprove = async (type) => {
        const formData = new FormData();
        formData.append("approved", type === "APPROVE");
        formData.append("comment", type === "APPROVE" ? "同意" : "拒绝");
        if (signatureMap[currentRow.id]) {
            formData.append("signatureUrl", signatureMap[currentRow.id]);
        }
        await leacesApproveApi(currentRow.id, formData);
        message.success(type === "APPROVE" ? "审批通过" : "审批拒绝");
        setCurrentRow(null);
        setSignatureMap((prev) => {
            const newMap = { ...prev };
            delete newMap[currentRow.id];
            return newMap;
        });
        setIsRefresh((prev) => !prev);
        setDetailOpen(false);
    };

    const handleBatchApprove = async (type) => {
        const leaveIds = selectedRows.map((row) => row.id);
        const formData = new FormData();
        leaveIds.forEach((id) => {
            formData.append("leaveIds", id);
        });
        formData.append("approved", type === "APPROVE");
        formData.append("comment", type === "APPROVE" ? "同意" : "拒绝");
        if (signatureMap[selectedRows[0]?.id]) {
            formData.append("signatureUrl", signatureMap[selectedRows[0]?.id]);
        } else {
            message.warning("请先上传电子签名");
            return;
        }

        await leacesBatchApproveApi(formData);
        message.success(`批量${type === "APPROVE" ? "同意" : "拒绝"}成功`);
        setSelectedRows([]);
        setSignatureMap((prev) => {
            const newMap = { ...prev };
            selectedRows.forEach((row) => {
                delete newMap[row.id];
            });
            return newMap;
        });
        setIsRefresh((prev) => !prev);
        setBatchModalOpen(false);
    };

    const openLeaderModal = async (record) => {
        chooseLeaderForm.resetFields();
        const data = await leacesSelectLeaderListApi(record.id);
        const leaderOptions = data.map((item) => ({
            label: item.approverName,
            value: item.approverUserId,
        }));
        setBatchLeaderList(leaderOptions);
        setCurrentRow(record);
        setLeaderModalOpen(true);
    };

    const handleChooseLeader = async () => {
        try {
            const values = await chooseLeaderForm.validateFields();
            const data = {
                approverUserIds: values.approverUserIds,
                comment: values.comment,
            };

            await leacesSelectLeaderApi(currentRow.id, data);

            message.success("选择审批人成功");
            chooseLeaderForm.resetFields();
        } catch (error) {
            console.log(error);
        } finally {
            setLeaderModalOpen(false);
        }
        setIsRefresh((prev) => !prev);
    };

    return (
        <Card
            title="审批中心"
            extra={
                <Form form={filterForm} layout="inline" onFinish={handleFilter}>
                    <Form.Item name="status" label="状态">
                        <Select
                            allowClear
                            placeholder="请选择状态"
                            options={
                                statusData?.map((item) => ({
                                    label: item.name,
                                    value: item.code,
                                })) || []
                            }
                        />
                    </Form.Item>

                    <Form.Item name="leaveTypeId" label="请假类型">
                        <Select
                            allowClear
                            placeholder="请选择类型"
                            options={
                                typeData?.map((item) => ({
                                    label: item.leaveName,
                                    value: item.id,
                                })) || []
                            }
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            筛选
                        </Button>
                        <Button
                            style={{ margin: "0 8px" }}
                            onClick={handleResetFilter}
                        >
                            重置
                        </Button>
                        <Button
                            type="primary"
                            disabled={selectedRows.length === 0}
                            onClick={() => setBatchModalOpen(true)}
                        >
                            批量审批 ({selectedRows.length})
                        </Button>
                    </Form.Item>
                </Form>
            }
        >
            <BaseTable
                rowkey="id"
                columns={columns}
                request={leacesListApi}
                params={filters}
                rowSelection={rowSelection}
                isRefresh={isRefresh}
            />

            {detailOpen && currentRow && (
                <LeaveDetailModal
                    open={detailOpen}
                    data={currentRow}
                    onCancel={() => setDetailOpen(false)}
                    extra={
                        judgeNeedOperation(currentRow) ? (
                            <div
                                style={{
                                    textAlign: "right",
                                    marginTop: 16,
                                }}
                            >
                                <Button
                                    type="primary"
                                    onClick={() => handleApprove("APPROVE")}
                                >
                                    同意
                                </Button>

                                <Button
                                    danger
                                    style={{ marginLeft: 10 }}
                                    onClick={() => handleApprove("REJECT")}
                                >
                                    驳回
                                </Button>
                            </div>
                        ) : null
                    }
                />
            )}

            <Modal
                title="批量审批确认"
                open={batchModalOpen}
                onCancel={() => setBatchModalOpen(false)}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setBatchModalOpen(false)}
                    >
                        取消
                    </Button>,
                    <Button
                        key="approve"
                        type="primary"
                        onClick={() => handleBatchApprove("APPROVE")}
                    >
                        批量同意
                    </Button>,
                    <Button
                        key="reject"
                        danger
                        onClick={() => handleBatchApprove("REJECT")}
                    >
                        批量拒绝
                    </Button>,
                ]}
            >
                <p>您已选择 {selectedRows.length} 条记录进行批量审批。</p>
                <Alert
                    message="注意"
                    description="请确保已上传电子签名，批量审批将使用第一条记录的签名。"
                    type="warning"
                    showIcon
                />
            </Modal>

            <Modal
                title="选择后续审批领导"
                open={leaderModalOpen}
                onOk={handleChooseLeader}
                onCancel={() => setLeaderModalOpen(false)}
                centered
                width={520}
                styles={{ body: { padding: "24px 0" } }}
            >
                <Form form={chooseLeaderForm} layout="vertical">
                    <Form.Item
                        name="approverUserIds"
                        label="可选择领导(支持多选)"
                        rules={[{ required: true, message: "请选择审批领导" }]}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="搜索可选择领导"
                            options={batchLeaderList}
                            maxTagCount="responsive"
                            showSearch={{
                                optionFilterProp: "label",
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="comment"
                        label="备注"
                        rules={[{ required: true, message: "请输入备注" }]}
                    >
                        <TextArea rows={6} placeholder="请输入备注..." />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default Approval;

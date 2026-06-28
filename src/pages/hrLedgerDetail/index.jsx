import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Descriptions,
  Spin,
  Empty,
  Button,
  Space,
  message,
  Timeline,
  Divider,
} from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  SwapOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import {
  getLedgerDetail,
  exportLedgerExcel,
  compareLedger,
  getConfig,
  getLedgerTemplate,
} from "@/api/ledger";
import dayjs from "dayjs";
import { useAppSelector } from "@/store/hooks";
import { useNavigate } from "react-router-dom";
import {
  actionMap,
  STATUS_MAP,
  DEFAULT_CONFIG,
  leaderList,
} from "@/constants/constantsMap";
import { formatTime } from "@/utils/formatTime";

const COMPARE_TYPE_MAP = {
  CHANGED: { text: "变更", color: "blue" },
  ADDED: { text: "新增", color: "green" },
  REMOVED: { text: "减少", color: "red" },
};

const styles = {
  page: { display: "flex", flexDirection: "column", gap: 16 },
  exportBar: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    flexWrap: "wrap",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: 12,
  },
  approvalCard: {
    background: "#fafafa",
    borderRadius: 8,
    padding: "12px 16px",
    marginBottom: 0,
  },
  compareCard: {
    background: "#f6ffed",
    borderRadius: 8,
    padding: "12px 16px",
  },
  emptyWrap: { padding: "80px 0", textAlign: "center" },
};

const detailRoles = ["ATTENDANCE_ADMIN", "HR_SECTION_CHIEF", ...leaderList];
const compareRoles = ["ATTENDANCE_ADMIN", "HR_SECTION_CHIEF"];

const HRLedgerDetail = () => {
  const user = useAppSelector((state) => state.user.userInfo);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ledgerId = searchParams.get("orgUnitId") ?? searchParams.get("id");

  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cfg, setCfg] = useState(DEFAULT_CONFIG);
  const [templateFields, setTemplateFields] = useState(null);

  const [compareData, setCompareData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      const data = await getConfig();
      if (data) {
        setCfg({
          teamLeaderColor:
            data.team_leader_color || DEFAULT_CONFIG.teamLeaderColor,
          learnerColor: data.learner_color || DEFAULT_CONFIG.learnerColor,
          newEmployeeColor:
            data.new_employee_color || DEFAULT_CONFIG.newEmployeeColor,
          showTeamLeaderColor: data.show_team_leader_color !== "false",
          showLearnerColor: data.show_learner_color !== "false",
          showNewEmployeeColor: data.show_new_employee_color !== "false",
          showAge: data.show_age !== "false",
        });
      }
    } catch {
      // 使用默认配置
    }
  }, []);

  const loadLedger = useCallback(async () => {
    if (!ledgerId) return;
    setLoading(true);
    try {
      const data = await getLedgerDetail(ledgerId);
      setLedger(data || null);
      // 加载台账模板
      if (data?.orgUnitId) {
        loadTemplateFields(data.orgUnitId);
      }
    } catch {
      setLedger(null);
    } finally {
      setLoading(false);
    }
  }, [ledgerId]);

  const loadTemplateFields = useCallback(async (orgUnitId) => {
    try {
      const data = await getLedgerTemplate(orgUnitId);
      setTemplateFields(data || null);
    } catch {
      // 使用默认列配置
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  const rowClassName = (record) => {
    if (record.isTeamLeader === 1 && cfg.showTeamLeaderColor)
      return "row-team-leader";
    if (record.isNonWorking === 1) return "row-non-working";
    if (
      (record.categoryMinor === "学习" ||
        record.categoryMinor === "学习人员") &&
      cfg.showLearnerColor
    )
      return "row-learner";
    if (
      (record.categoryMinor === "新职" ||
        record.categoryMinor === "新职人员") &&
      cfg.showNewEmployeeColor
    )
      return "row-new-employee";
    return "";
  };

  const rowStyle = (record) => {
    if (record.isTeamLeader === 1 && cfg.showTeamLeaderColor)
      return { backgroundColor: cfg.teamLeaderColor };
    if (
      (record.categoryMinor === "学习" ||
        record.categoryMinor === "学习人员") &&
      cfg.showLearnerColor
    )
      return { backgroundColor: cfg.learnerColor };
    if (
      (record.categoryMinor === "新职" ||
        record.categoryMinor === "新职人员") &&
      cfg.showNewEmployeeColor
    )
      return { backgroundColor: cfg.newEmployeeColor };
    return {};
  };

  const handleExportExcel = async () => {
    if (!ledger) return;
    try {
      message.loading("正在生成Excel...", 0);
      const blob = await exportLedgerExcel(ledger.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `现员台账_${ledger.orgUnitName}_${ledger.ledgerMonth}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.destroy();
      message.success("Excel下载成功");
    } catch {
      message.destroy();
      message.error("Excel导出失败");
    }
  };

  const handleCompare = async () => {
    if (!ledger) return;
    setCompareLoading(true);
    try {
      const data = await compareLedger(ledger.id);
      setCompareData(data || null);
      if (!data) {
        message.info("暂无对比数据");
      }
    } catch {
      message.error("加载对比数据失败");
    } finally {
      setCompareLoading(false);
    }
  };

  // const hasCommonChar = (str1, str2) => {
  //   for (const char of str1) {
  //     if (str2.includes(char)) {
  //       return true;
  //     }
  //   }
  //   return false;
  // };

  const TEAM_KEYWORDS = ["甲班", "乙班", "丙班", "丁班", "预备"];

  const SHIFT_FIELDS = {
    甲班: ["jiaBan1", "jiaBan2"],
    乙班: ["yiBan1", "yiBan2"],
    丙班: ["bingBan1", "bingBan2"],
    丁班: ["dingBan1", "dingBan2"],
    预备: ["yuBei1", "yuBei2", "yuBei3", "yuBei4"],
  };

  /** 从 extraShiftJson 中读取额外班次的值 */
  const getExtraShiftValue = (record, field) => {
    if (!field.startsWith("extra:")) return record[field];
    const shiftName = field.replace("extra:", "");
    try {
      const obj = JSON.parse(record.extraShiftJson || "{}");
      return obj[shiftName] || "";
    } catch {
      return "";
    }
  };

  const columns = useMemo(() => {
    // 根据 templateFields 动态生成列（保持原始顺序）
    const templateColumns = [];
    // 存储连续的 shift 字段，用于合并为一个班别列
    const consecutiveShiftFields = [];

    const flushShiftFields = () => {
      if (consecutiveShiftFields.length === 0) return;

      // 按 label 分组，相同的 label 只渲染一个二级表头
      const groupedByLabel = {};
      consecutiveShiftFields.forEach((field) => {
        if (!groupedByLabel[field.label]) {
          groupedByLabel[field.label] = [];
        }
        groupedByLabel[field.label].push(field);
      });

      const shiftChildren = Object.keys(groupedByLabel).map((label) => ({
        title: label,
        align: "center",
        children: groupedByLabel[label].flatMap((field) => [
          {
            // title: `${field.name}1`,
            dataIndex: field.name.startsWith("extra:")
              ? "extraShiftJson"
              : field.name,
            width: 100,
            align: "center",
            render: (value, record) => {
              const displayVal = field.name.startsWith("extra:")
                ? getExtraShiftValue(record, field.name)
                : value;
              return displayVal || "";
            },
          },
        ]),
      }));

      templateColumns.push({
        title: "班别",
        align: "center",
        children: shiftChildren,
      });

      consecutiveShiftFields.length = 0;
    };

    if (templateFields && templateFields.fields) {
      templateFields.fields.forEach((field) => {
        if (field.shift) {
          // shift 字段先缓存，后面合并为一个班别列
          consecutiveShiftFields.push(field);
        } else {
          // 遇到非 shift 字段，先处理缓存的 shift 字段
          flushShiftFields();

          // 特殊处理：日勤字段需要二级表头
          if (field.label === "日勤") {
            templateColumns.push({
              title: field.label,
              align: "center",
              children: [
                {
                  title: "姓名",
                  dataIndex: field.name,
                  width: 110,
                  align: "center",
                  render: (value) => value || "",
                },
              ],
            });
          }
          // 其他普通字段
          else {
            templateColumns.push({
              title: field.label,
              dataIndex: field.name,
              width: 120,
              align: "center",
              render: (value) => value || "",
            });
          }
        }
      });

      // 处理最后可能剩余的 shift 字段
      flushShiftFields();

      return templateColumns;
    }

    // 默认列配置（没有 templateFields 时）
    return [
      {
        title: "岗点",
        dataIndex: "stationPoint",
        width: 120,
        align: "center",
      },
      {
        title: "班组",
        dataIndex: "teamName",
        width: 140,
        align: "center",
      },
      {
        title: "岗位",
        dataIndex: "workType",
        width: 140,
        align: "center",
      },
      {
        title: "班别",
        align: "center",
        children: TEAM_KEYWORDS.map((t) => ({
          title: t,
          align: "center",
          children: [
            {
              title: "姓名",
              children: SHIFT_FIELDS[t].map((field) => ({
                width: 100,
                align: "center",
                dataIndex: field,
                render: (value) => value || "",
              })),
            },
          ],
        })),
      },
      {
        title: "班制",
        dataIndex: "shiftCategory",
        width: 120,
        align: "center",
      },
      {
        title: "日勤",
        align: "center",
        children: [
          {
            title: "姓名",
            dataIndex: "dailyName",
            width: 110,
            align: "center",
            render: (value) => value || "",
          },
        ],
      },
      {
        title: "职务",
        dataIndex: "identityType",
        width: 120,
        align: "center",
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg, templateFields]);

  const compareColumns = [
    { title: "姓名", dataIndex: "empName", width: 90 },
    { title: "身份证号", dataIndex: "idCardNo", width: 175 },
    { title: "变更字段", dataIndex: "field", width: 100 },
    { title: "上月值", dataIndex: "previousValue", width: 150 },
    { title: "本月值", dataIndex: "currentValue", width: 150 },
    {
      title: "变更类型",
      dataIndex: "changeType",
      width: 90,
      render: (v) => {
        const t = COMPARE_TYPE_MAP[v];
        return <Tag color={t?.color}>{t?.text || v}</Tag>;
      },
    },
  ];

  if (!ledgerId) {
    return (
      <Card>
        <div style={styles.emptyWrap}>
          <Empty description="缺少台账ID参数" />
        </div>
      </Card>
    );
  }

  return (
    <Spin spinning={loading}>
      {!ledger && !loading ? (
        <Card>
          <div style={styles.emptyWrap}>
            <Empty description="台账不存在或加载失败" />
          </div>
        </Card>
      ) : ledger ? (
        <div style={styles.page}>
          <div style={styles.exportBar}>
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                返回
              </Button>
            </Space>
            {user.roleCode && detailRoles.includes(user.roleCode) ? (
              <Space>
                <Button
                  icon={<FileExcelOutlined />}
                  style={{
                    color: "#fff",
                    background: "linear-gradient(135deg, #52c41a, #389e0d)",
                    border: "none",
                    borderRadius: 9999,
                    fontWeight: 500,
                  }}
                  onClick={handleExportExcel}
                >
                  导出Excel
                </Button>
                <Button icon={<ReloadOutlined />} onClick={loadLedger}>
                  刷新
                </Button>
              </Space>
            ) : null}
            {compareRoles.includes(user.roleCode) ? (
              <Space>
                <Button
                  icon={<SwapOutlined />}
                  loading={compareLoading}
                  style={{
                    color: "#fff",
                    background: "linear-gradient(135deg, #409EFF, #1677ff)",
                    border: "none",
                    borderRadius: 9999,
                    fontWeight: 500,
                  }}
                  onClick={handleCompare}
                >
                  月度对比
                </Button>
                <Button icon={<ReloadOutlined />} onClick={loadLedger}>
                  刷新
                </Button>
              </Space>
            ) : null}
          </div>

          <Card size="small">
            <Descriptions size="small" column={4} bordered>
              <Descriptions.Item label="台账ID">{ledger.id}</Descriptions.Item>
              <Descriptions.Item label="组织ID">
                {ledger.orgUnitId}
              </Descriptions.Item>
              <Descriptions.Item label="车间">
                {ledger.orgUnitName}
              </Descriptions.Item>
              <Descriptions.Item label="台账月份">
                {ledger.ledgerMonth}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={STATUS_MAP[ledger.status]?.color}>
                  {STATUS_MAP[ledger.status]?.text || ledger.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="在岗人数">
                {ledger.inWorkCount}
              </Descriptions.Item>
              <Descriptions.Item label="创建人">
                {ledger.creatorName}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {ledger.createdAt
                  ? dayjs(ledger.createdAt).format("YYYY-MM-DD HH:mm")
                  : ""}
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {ledger.submittedAt
                  ? dayjs(ledger.submittedAt).format("YYYY-MM-DD HH:mm")
                  : ""}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {ledger.updatedAt
                  ? dayjs(ledger.updatedAt).format("YYYY-MM-DD HH:mm")
                  : ""}
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>
                {ledger.remark || "无"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 审批信息 */}
          {(ledger.directorName || ledger.hrName) && (
            <Card size="small" title="审批信息">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {ledger.directorName && (
                  <div style={styles.approvalCard}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                      主任审批
                    </div>
                    <div>审批人：{ledger.directorName}</div>
                    <div>审批意见：{ledger.directorOpinion || "无"}</div>
                    <div>
                      审批时间：
                      {ledger.directorApprovedAt
                        ? dayjs(ledger.directorApprovedAt).format(
                            "YYYY-MM-DD HH:mm",
                          )
                        : ""}
                    </div>
                  </div>
                )}
                {ledger.hrName && (
                  <div style={styles.approvalCard}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                      人事科审核
                    </div>
                    <div>审核人：{ledger.hrName}</div>
                    <div>审核意见：{ledger.hrOpinion || "无"}</div>
                    <div>
                      审核时间：
                      {ledger.hrApprovedAt
                        ? dayjs(ledger.hrApprovedAt).format("YYYY-MM-DD HH:mm")
                        : ""}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 在岗人员明细 */}
          <Card
            size="small"
            title={`在岗人员明细（${(ledger.details || []).length}人）`}
          >
            <Table
              columns={columns}
              dataSource={ledger.details || []}
              rowKey="id"
              rowClassName={rowClassName}
              onRow={(record) => ({ style: rowStyle(record) })}
              scroll={{ x: "max-content" }}
              size="small"
              bordered
              pagination={false}
            />
          </Card>

          {/* 审批记录 */}
          {(ledger.approvalRecords || []).length > 0 && (
            <Card size="small" title="审批记录">
              <Timeline
                items={ledger.approvalRecords.map((record) => ({
                  color:
                    record.action === "RETURN"
                      ? "orange"
                      : record.action === "REJECT"
                        ? "red"
                        : "green",
                  children: (
                    <div>
                      <div>
                        <strong>{record.operatorName}</strong>
                        <Tag
                          color={
                            record.action === "RETURN"
                              ? "orange"
                              : record.action === "REJECT"
                                ? "red"
                                : "green"
                          }
                          style={{ marginLeft: 8 }}
                        >
                          {record.step === "DIRECTOR" ? "主任审批" : "人事审核"}
                          {actionMap[record.action]
                            ? ` - ${actionMap[record.action]}`
                            : ""}
                        </Tag>
                        <span
                          style={{ color: "#999", marginLeft: 8, fontSize: 12 }}
                        >
                          {record.createdAt ? formatTime(record.createdAt) : ""}
                        </span>
                      </div>
                      {record.opinion && (
                        <div
                          style={{ color: "#666", marginTop: 4, fontSize: 13 }}
                        >
                          {record.opinion}
                        </div>
                      )}
                    </div>
                  ),
                }))}
              />
            </Card>
          )}

          {/* 月度对比 */}
          {compareData && (
            <Card
              size="small"
              title={`月度对比：${compareData.currentMonth} vs ${compareData.previousMonth}`}
            >
              {(compareData.differences || []).length === 0 ? (
                <Empty description="两个月份数据无差异" />
              ) : (
                <Table
                  columns={compareColumns}
                  dataSource={compareData.differences}
                  rowKey={(_, i) => i}
                  scroll={{ x: "max-content" }}
                  size="small"
                  bordered
                  pagination={false}
                />
              )}
            </Card>
          )}

          <style>{`
            .row-team-leader td { font-weight: 600 !important; }
            .row-non-working td { color: #999 !important; font-style: italic !important; }
          `}</style>
        </div>
      ) : null}
    </Spin>
  );
};

export default HRLedgerDetail;

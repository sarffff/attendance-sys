import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Input,
  DatePicker,
  Descriptions,
  message,
  Popconfirm,
  Timeline,
  Empty,
  Spin,
  Select,
  Upload,
} from "antd";
import {
  SaveOutlined,
  SendOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  ExportOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import {
  submitLedger,
  getConfig,
  getLedgerTemplate,
  exportLedgerExcelByTemplate,
  downloadLedgerTemplate,
  // uploadLedgerTemplate,
} from "@/api/ledger";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addDetail,
  updateDetail,
  removeDetail,
  setRemark,
  setTemplateFields,
  setDetails,
} from "@/store/modules/myLedger";
import dayjs from "dayjs";
import {
  actionMap,
  STATUS_MAP,
  DEFAULT_CONFIG,
  workType,
  LaborShifts,
} from "@/constants/constantsMap";
import { formatTime } from "@/utils/formatTime";

const styles = {
  page: { display: "flex", flexDirection: "column", gap: 16 },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  toolbarRight: { display: "flex", alignItems: "center", gap: 8 },
  bottomRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  dragHandle: { cursor: "grab", color: "#999", fontSize: 16 },
  cellInput: { width: "100%" },
  emptyWrap: { padding: "80px 0", textAlign: "center" },
  cellSelect: { width: "100%", textAlign: "left" },
};

const MyLedger = () => {
  const currentMonth = dayjs().format("YYYY-MM");
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userInfo);
  const ledger = useAppSelector((state) => state.myLedger);
  const details = useAppSelector((state) => state.myLedger.details);
  const formRemark = useAppSelector((state) => state.myLedger.remark);
  const templateFields = useAppSelector(
    (state) => state.myLedger.templateFields,
  );

  const loading = false;
  const [submitting, setSubmitting] = useState(false);
  // const [uploading, setUploading] = useState(false);

  const [cfg, setCfg] = useState(DEFAULT_CONFIG);

  const TEAM_KEYWORDS = ["甲班", "乙班", "丙班", "丁班", "预备"];

  const SHIFT_FIELDS = {
    甲班: ["jiaBan1", "jiaBan2"],
    乙班: ["yiBan1", "yiBan2"],
    丙班: ["bingBan1", "bingBan2"],
    丁班: ["dingBan1", "dingBan2"],
    预备: ["yuBei1", "yuBei2", "yuBei3", "yuBei4"],
  };

  const editable = useMemo(
    () => ledger && ["DRAFT", "RETURNED"].includes(ledger.status),
    [ledger],
  );

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
      message.error("加载配置失败，使用默认设置");
    }
  }, []);

  const loadTemplateFields = useCallback(async () => {
    if (!user?.orgUnitId) return;
    try {
      const data = await getLedgerTemplate(user.orgUnitId);
      if (data) {
        dispatch(setTemplateFields(data));
      }
    } catch {
      console.error("获取台账模板失败");
    }
  }, [user?.orgUnitId, dispatch]);

  useEffect(() => {
    loadConfig();
    loadTemplateFields();
  }, [loadConfig, loadTemplateFields]);

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

  const updateCell = (record, field, value) => {
    // 额外班次字段：写入 extraShiftJson
    if (field.startsWith("extra:")) {
      const shiftName = field.replace("extra:", "");
      let extraObj = {};
      try {
        extraObj = JSON.parse(record.extraShiftJson || "{}");
      } catch {
        extraObj = {};
      }
      extraObj[shiftName] = value;
      dispatch(
        updateDetail({
          id: record.id,
          field: "extraShiftJson",
          value: JSON.stringify(extraObj),
        }),
      );
      return;
    }
    dispatch(updateDetail({ id: record.id, field, value }));
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

  const handleAddRow = () => {
    dispatch(addDetail());
  };

  const handleSubmit = async () => {
    if (!ledger || !editable) return;

    setSubmitting(true);
    try {
      await submitLedger({ details, remark: formRemark });
      message.success("提交成功，等待审批");
    } catch (err) {
      message.error(err?.message || "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  // 下载台账模板
  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadLedgerTemplate(user.orgUnitId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `台账模板_${dayjs().format("YYYY-MM-DD")}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success("台账模板下载成功");
    } catch (error) {
      message.error("下载台账模板失败");
      console.error(error);
    }
  };

  // 上传台账模板
  // const handleUploadTemplate = async (file) => {
  //   const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
  //     file.type === 'application/vnd.ms-excel' ||
  //     file.name.endsWith('.xlsx') ||
  //     file.name.endsWith('.xls');

  //   if (!isExcel) {
  //     message.error('请上传Excel文件（.xlsx或.xls格式）');
  //     return false;
  //   }

  //   try {
  //     setUploading(true);
  //     const formData = new FormData();
  //     formData.append('file', file);
  //     await uploadLedgerTemplate(user.orgUnitId, formData);
  //     message.success('台账模板上传成功');
  //   } catch (error) {
  //     message.error('上传台账模板失败');
  //     console.error(error);
  //   } finally {
  //     setUploading(false);
  //   }
  //   return false; // 阻止antd Upload组件默认上传
  // };

  // 导出台账
  const handleExport = async () => {
    if (!ledger) {
      message.warning("暂无数据可导出");
      return;
    }
    try {
      const blob = await exportLedgerExcelByTemplate(user.orgUnitId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `现员台账_${ledger.orgUnitName}_${dayjs().format("YYYY-MM-DD")}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success("台账导出成功");
    } catch (error) {
      message.error("导出台账失败");
      console.error(error);
    }
  };

  // 上传台账数据（解析 Excel 并渲染到页面）
  const handleUploadData = async (file) => {
    const isExcel =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls");

    if (!isExcel) {
      message.error("请上传Excel文件（.xlsx或.xls格式）");
      return false;
    }

    if (!templateFields || !templateFields.fields) {
      message.error("台账模板未加载，请刷新页面后重试");
      return false;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      // 数据行，并过滤掉"编外人员"及之后的数据
      let dataRows = jsonData.slice(5);
      // console.log(dataRows);
      // 查找包含"编外人员"的行索引
      const excludeIndex = dataRows.findIndex((row) =>
        row.some((cell) => cell && String(cell).includes("编外人员")),
      );

      // 如果找到"编外人员"，截取该行之前的数据
      if (excludeIndex !== -1) {
        dataRows = dataRows.slice(0, excludeIndex);
      }

      if (dataRows.length === 0) {
        message.error("未解析到有效数据");
        return false;
      }

      // 将模板字段展平为有序的字段名列表
      const fieldNames = [];
      templateFields.fields.forEach((field) => {
        if (field.shift) {
          // shift 字段展开为两个子字段
          fieldNames.push(`${field.name}`);
          // fieldNames.push(`${field.name}2`);
        } else {
          fieldNames.push(field.name);
        }
      });

      console.log(fieldNames);

      // 按索引填充数据
      const parsedDetails = dataRows.map((row, rowIndex) => {
        const detail = {
          id: rowIndex + 1,
          sortNo: rowIndex + 1,
        };

        // 按索引将 Excel 数据填充到对应的字段
        fieldNames.forEach((fieldName, colIndex) => {
          const value =
            row[colIndex] !== undefined ? String(row[colIndex] || "") : "";
          detail[fieldName] = value;
        });

        return detail;
      });

      // 过滤掉空行
      const filteredDetails = parsedDetails.filter((detail) => {
        const keys = Object.keys(detail).filter(
          (k) => k !== "id" && k !== "sortNo",
        );
        return keys.some((k) => detail[k] && detail[k].trim() !== "");
      });

      if (filteredDetails.length === 0) {
        message.error("未解析到有效数据");
        return false;
      }

      // 写入 Redux
      dispatch(setDetails(filteredDetails));
      message.success(`成功导入 ${filteredDetails.length} 条数据`);
    } catch (error) {
      console.error("解析 Excel 失败:", error);
      message.error("解析 Excel 文件失败，请检查文件格式");
    }

    return false; // 阻止antd Upload组件默认上传
  };

  const columns = useMemo(() => {
    const renderEditableText = (field, value, record, placeholder) =>
      editable ? (
        <Input
          size="small"
          value={value || ""}
          placeholder={placeholder}
          onChange={(e) => updateCell(record, field, e.target.value)}
          style={styles.cellInput}
        />
      ) : (
        value || ""
      );

    const renderSelect = (field, value, record, options, placeholder) =>
      editable ? (
        <Select
          size="small"
          value={value || undefined}
          options={options.map((item) => ({ label: item, value: item }))}
          onChange={(v) => updateCell(record, field, v)}
          style={styles.cellSelect}
          placeholder={placeholder}
        />
      ) : (
        value || ""
      );

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
            title: "姓名",
            align: "center",
            render: (value, record) => {
              const displayVal = field.name.startsWith("extra:")
                ? getExtraShiftValue(record, field.name)
                : value;
              return renderEditableText(
                field.name,
                displayVal,
                record,
                "请输入姓名",
              );
            },
          },
          // {
          //   title: `${field.name}2`,
          //   dataIndex: `${field.name}2`,
          //   width: 100,
          //   align: 'center',
          //   render: (value, record) =>
          //     renderEditableText(`${field.name}2`, value, record, '请输入姓名'),
          // },
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

          // 特殊处理：岗位字段使用 Select
          if (field.label === "岗位") {
            templateColumns.push({
              title: field.label,
              dataIndex: field.name,
              width: 140,
              align: "center",
              render: (value, record) =>
                renderSelect(field.name, value, record, workType, "请选择岗位"),
            });
          }
          // 特殊处理：日勤字段需要二级表头
          else if (field.label === "日勤") {
            templateColumns.push({
              title: field.label,
              align: "center",
              children: [
                {
                  title: "姓名",
                  dataIndex: field.name,
                  width: 110,
                  align: "center",
                  render: (value, record) =>
                    renderEditableText(field.name, value, record, "请输入姓名"),
                },
              ],
            });
          }
          // 班制字段使用 Select
          else if (field.label === "班制") {
            templateColumns.push({
              title: field.label,
              dataIndex: field.name,
              width: 140,
              align: "center",
              render: (value, record) =>
                renderSelect(
                  field.name,
                  value,
                  record,
                  LaborShifts,
                  "请选择班制",
                ),
            });
          }
          // 其他普通字段
          else {
            templateColumns.push({
              title: field.label,
              dataIndex: field.name,
              width: 120,
              align: "center",
              render: (value, record) =>
                renderEditableText(
                  field.name,
                  value,
                  record,
                  `请输入${field.label}`,
                ),
            });
          }
        }
      });

      // 处理最后可能剩余的 shift 字段
      flushShiftFields();
    }

    // 操作列
    const actionColumn = editable
      ? [
          {
            title: "操作",
            width: 80,
            align: "center",
            render: (_, record) => (
              <Popconfirm
                title="确认删除该行？"
                onConfirm={() => dispatch(removeDetail(record.id))}
                okText="确认"
                cancelText="取消"
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                />
              </Popconfirm>
            ),
          },
        ]
      : [];

    return [...templateColumns, ...actionColumn];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable, cfg, details, templateFields]);

  return (
    <div style={styles.page}>
      <Card size="small">
        <div style={styles.toolbar}>
          <div style={styles.toolbarLeft}>
            <DatePicker
              picker="month"
              value={dayjs(currentMonth)}
              format="YYYY-MM"
              disabled
            />
            {ledger && (
              <Tag
                color={STATUS_MAP[ledger.status]?.color}
                style={{ fontSize: 14, padding: "4px 12px" }}
              >
                {STATUS_MAP[ledger.status]?.text || ledger.status}
              </Tag>
            )}
          </div>
          <div style={styles.toolbarRight}>
            <Button onClick={handleAddRow}>新增一行</Button>

            {/* <Upload
              accept=".xlsx,.xls"
              showUploadList={false}
              beforeUpload={handleUploadTemplate}
              disabled={uploading}
            >
              <Button
                icon={<UploadOutlined />}
                loading={uploading}
              >
                上传台账模板
              </Button>
            </Upload> */}

            <Upload
              accept=".xlsx,.xls"
              showUploadList={false}
              beforeUpload={handleUploadData}
            >
              <Button icon={<FileExcelOutlined />}>导入台账数据</Button>
            </Upload>

            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
            >
              下载台账模板
            </Button>

            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
              disabled={!ledger}
            >
              导出台账
            </Button>

            {/* <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              disabled={!editable}
              onClick={handleSave}
            >
              保存
            </Button> */}
            <Popconfirm
              title="提交后将无法修改，确认提交审批？"
              onConfirm={handleSubmit}
              okText="确认提交"
              cancelText="取消"
              disabled={!editable || !user?.orgUnitId}
            >
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={submitting}
                disabled={!editable || !user?.orgUnitId}
                style={{
                  background: editable
                    ? "linear-gradient(135deg, #52c41a, #389e0d)"
                    : undefined,
                  borderColor: editable ? "#52c41a" : undefined,
                }}
              >
                提交审批
              </Button>
            </Popconfirm>
          </div>
        </div>
      </Card>

      {!loading && !ledger && (
        <Card>
          <div style={styles.emptyWrap}>
            <Empty description="当前月份暂无台账，请联系管理员生成" />
          </div>
        </Card>
      )}
      {ledger && (
        <>
          <Card size="small">
            <Descriptions size="small" column={4} bordered>
              <Descriptions.Item label="车间">
                {ledger.orgUnitName}
              </Descriptions.Item>
              <Descriptions.Item label="台账月份">
                {ledger.ledgerMonth}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card size="small" title="现员台账明细">
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={details}
                rowKey={(r, index) => r.id ?? r.tempId ?? `fallback-${index}`}
                rowClassName={rowClassName}
                onRow={(record) => ({
                  style: rowStyle(record),
                })}
                scroll={{ x: "max-content" }}
                size="small"
                bordered
                pagination={false}
              />
            </Spin>
          </Card>

          <div style={styles.bottomRow}>
            <Card size="small" title="备注">
              <Input.TextArea
                rows={3}
                value={formRemark}
                onChange={(e) => dispatch(setRemark(e.target.value))}
                disabled={!editable}
                placeholder="请输入备注"
              />
            </Card>

            {ledger.approvalRecords && ledger.approvalRecords.length > 0 && (
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
                            {record.step === "DIRECTOR"
                              ? "主任审批"
                              : "人事审核"}
                            {actionMap[record.action]
                              ? ` - ${actionMap[record.action]}`
                              : ""}
                          </Tag>
                          <span
                            style={{
                              color: "#999",
                              marginLeft: 8,
                              fontSize: 12,
                            }}
                          >
                            {formatTime(record.createdAt)}
                          </span>
                        </div>
                        {record.opinion && (
                          <div
                            style={{
                              color: "#666",
                              marginTop: 4,
                              fontSize: 13,
                            }}
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
          </div>
        </>
      )}
      <style>{`
        .row-team-leader td { font-weight: 600 !important; }
        .row-non-working td { color: #999 !important; font-style: italic !important; }
        .row-learner td { }
        .row-new-employee td { }
      `}</style>
    </div>
  );
};

export default MyLedger;

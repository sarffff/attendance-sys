import { useState, useEffect, useCallback, useMemo } from 'react';
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
} from 'antd';
import {
  SaveOutlined,
  SendOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import {
  submitLedger,
  getConfig,
  getLedgerTemplate,
  exportLedgerExcelByTemplate,
  downloadLedgerTemplate,
  uploadLedgerTemplate
} from '@/api/ledger';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addDetail, updateDetail, removeDetail, setRemark, setTemplateFields } from '@/store/modules/myLedger';
import dayjs from 'dayjs';
import {
  actionMap,
  STATUS_MAP,
  DEFAULT_CONFIG,
  workType,
  LaborShifts
} from '@/constants/constantsMap';
import { formatTime } from '@/utils/formatTime';

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: 8 },
  bottomRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  dragHandle: { cursor: 'grab', color: '#999', fontSize: 16 },
  cellInput: { width: '100%' },
  emptyWrap: { padding: '80px 0', textAlign: 'center' },
  cellSelect: { width: '100%', textAlign: 'left' },
};

const MyLedger = () => {
  const currentMonth = dayjs().format('YYYY-MM');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userInfo);
  const ledger = useAppSelector((state) => state.myLedger);
  const details = useAppSelector((state) => state.myLedger.details);
  const formRemark = useAppSelector((state) => state.myLedger.remark);
  const templateFields = useAppSelector((state) => state.myLedger.templateFields);

  const loading = false;
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [cfg, setCfg] = useState(DEFAULT_CONFIG);

  const TEAM_KEYWORDS = ['甲班', '乙班', '丙班', '丁班', '预备'];

  const SHIFT_FIELDS = {
    甲班: ['jiaBan1', 'jiaBan2'],
    乙班: ['yiBan1', 'yiBan2'],
    丙班: ['bingBan1', 'bingBan2'],
    丁班: ['dingBan1', 'dingBan2'],
    预备: ['yuBei1', 'yuBei2'],
  };

  const editable = useMemo(
    () => ledger && ['DRAFT', 'RETURNED'].includes(ledger.status),
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
          showTeamLeaderColor: data.show_team_leader_color !== 'false',
          showLearnerColor: data.show_learner_color !== 'false',
          showNewEmployeeColor: data.show_new_employee_color !== 'false',
          showAge: data.show_age !== 'false',
        });
      }
    } catch {
      message.error('加载配置失败，使用默认设置');
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
      console.error('获取台账模板失败');
    }
  }, [user?.orgUnitId, dispatch]);

  useEffect(() => {
    loadConfig();
    loadTemplateFields();
  }, [loadConfig, loadTemplateFields]);

  const rowClassName = (record) => {
    if (record.isTeamLeader === 1 && cfg.showTeamLeaderColor)
      return 'row-team-leader';
    if (record.isNonWorking === 1) return 'row-non-working';
    if (
      (record.categoryMinor === '学习' ||
        record.categoryMinor === '学习人员') &&
      cfg.showLearnerColor
    )
      return 'row-learner';
    if (
      (record.categoryMinor === '新职' ||
        record.categoryMinor === '新职人员') &&
      cfg.showNewEmployeeColor
    )
      return 'row-new-employee';
    return '';
  };

  const rowStyle = (record) => {
    if (record.isTeamLeader === 1 && cfg.showTeamLeaderColor)
      return { backgroundColor: cfg.teamLeaderColor };
    if (
      (record.categoryMinor === '学习' ||
        record.categoryMinor === '学习人员') &&
      cfg.showLearnerColor
    )
      return { backgroundColor: cfg.learnerColor };
    if (
      (record.categoryMinor === '新职' ||
        record.categoryMinor === '新职人员') &&
      cfg.showNewEmployeeColor
    )
      return { backgroundColor: cfg.newEmployeeColor };
    return {};
  };

  const updateCell = (record, field, value) => {
    dispatch(updateDetail({ id: record.id, field, value }))
  };

  const handleAddRow = () => {
    dispatch(addDetail())
  };


  const handleSubmit = async () => {
    if (!ledger || !editable) return;

    setSubmitting(true);
    try {
      await submitLedger({ details, remark: formRemark });
      message.success('提交成功，等待审批');
    } catch (err) {
      message.error(err?.message || '提交失败');
    } finally {
      setSubmitting(false);
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

  // 下载台账模板
  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadLedgerTemplate(user.orgUnitId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `台账模板_${dayjs().format('YYYY-MM-DD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('台账模板下载成功');
    } catch (error) {
      message.error('下载台账模板失败');
      console.error(error);
    }
  };

  // 上传台账模板
  const handleUploadTemplate = async (file) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls');

    if (!isExcel) {
      message.error('请上传Excel文件（.xlsx或.xls格式）');
      return false;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      await uploadLedgerTemplate(user.orgUnitId, formData);
      message.success('台账模板上传成功');
    } catch (error) {
      message.error('上传台账模板失败');
      console.error(error);
    } finally {
      setUploading(false);
    }
    return false; // 阻止antd Upload组件默认上传
  };

  // 导出台账
  const handleExport = async () => {
    if (!ledger) {
      message.warning('暂无数据可导出');
      return;
    }
    try {
      const blob = await exportLedgerExcelByTemplate(user.orgUnitId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `现员台账_${ledger.orgUnitName}_${dayjs().format('YYYY-MM-DD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('台账导出成功');
    } catch (error) {
      message.error('导出台账失败');
      console.error(error);
    }
  };

  const columns = useMemo(() => {
    const renderEditableText = (field, value, record, placeholder) =>
      editable ? (
        <Input
          size="small"
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => updateCell(record, field, e.target.value)}
          style={styles.cellInput}
        />
      ) : (
        value || ''
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
        value || ''
      );

    // 根据 templateFields 动态生成列
    const templateColumns = [];
    const shiftFields = [];
    const normalFields = [];

    if (templateFields && templateFields.fields) {
      templateFields.fields.forEach((field) => {
        if (field.shift) {
          shiftFields.push(field);
        } else {
          normalFields.push(field);
        }
      });
    }

        // 生成普通列（shift=false 的字段）
    normalFields.forEach((field) => {
      // 特殊处理：岗位字段使用 Select
      if (field.label === '岗位') {
        templateColumns.push({
          title: field.label,
          dataIndex: field.name,
          width: 140,
          align: 'center',
          render: (value, record) =>
            renderSelect(field.name, value, record, workType, '请选择岗位'),
        });
      }
      // 特殊处理：日勤字段需要二级表头
      else if (field.label === '日勤') {
        templateColumns.push({
          title: field.label,
          align: 'center',
          children: [
            {
              title: '姓名',
              dataIndex: field.name,
              width: 110,
              align: 'center',
              render: (value, record) =>
                renderEditableText(field.name, value, record, '请输入姓名'),
            },
          ],
        });
      }
      // 班制字段使用 Select
      else if (field.label === '班制') {
        templateColumns.push({
          title: field.label,
          dataIndex: field.name,
          width: 140,
          align: 'center',
          render: (value, record) =>
            renderSelect(field.name, value, record, LaborShifts, '请选择班制'),
        });
      }
      // 其他普通字段
      else {
        templateColumns.push({
          title: field.label,
          dataIndex: field.name,
          width: 120,
          align: 'center',
          render: (value, record) =>
            renderEditableText(field.name, value, record, `请输入${field.label}`),
        });
      }
    });

    // 生成班别列（shift=true 的字段）
    if (shiftFields.length > 0) {
      // 按 label 分组，相同的 label 只渲染一个二级表头
      const groupedByLabel = {};
      shiftFields.forEach((field) => {
        if (!groupedByLabel[field.label]) {
          groupedByLabel[field.label] = [];
        }
        groupedByLabel[field.label].push(field);
      });

      const shiftChildren = Object.keys(groupedByLabel).map((label) => ({
        title: label,
        align: 'center',
        children: groupedByLabel[label].flatMap((field) => [
          {
            // title: `${field.name}1`,
            dataIndex: `${field.name}1`,
            width: 100,
            align: 'center',
            render: (value, record) =>
              renderEditableText(`${field.name}1`, value, record, '请输入姓名'),
          },

        ]),
      }));

      templateColumns.push({
        title: '班别',
        align: 'center',
        children: shiftChildren,
      });
    }

    // 操作列
    const actionColumn = editable
      ? [
          {
            title: '操作',
            width: 80,
            align: 'center',
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
                style={{ fontSize: 14, padding: '4px 12px' }}
              >
                {STATUS_MAP[ledger.status]?.text || ledger.status}
              </Tag>
            )}
          </div>
          <div style={styles.toolbarRight}>
            <Button onClick={handleAddRow}>新增一行</Button>

            <Upload
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
                    ? 'linear-gradient(135deg, #52c41a, #389e0d)'
                    : undefined,
                  borderColor: editable ? '#52c41a' : undefined,
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
                scroll={{ x: 'max-content' }}
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
                      record.action === 'RETURN'
                        ? 'orange'
                        : record.action === 'REJECT'
                          ? 'red'
                          : 'green',
                    children: (
                      <div>
                        <div>
                          <strong>{record.operatorName}</strong>
                          <Tag
                            color={
                              record.action === 'RETURN'
                                ? 'orange'
                                : record.action === 'REJECT'
                                  ? 'red'
                                  : 'green'
                            }
                            style={{ marginLeft: 8 }}
                          >
                            {record.step === 'DIRECTOR'
                              ? '主任审批'
                              : '人事审核'}
                            {actionMap[record.action]
                              ? ` - ${actionMap[record.action]}`
                              : ''}
                          </Tag>
                          <span
                            style={{
                              color: '#999',
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
                              color: '#666',
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

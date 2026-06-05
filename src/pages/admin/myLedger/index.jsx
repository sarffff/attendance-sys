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
} from 'antd';
import {
  SaveOutlined,
  SendOutlined,
} from '@ant-design/icons';
import {
  getMyLedger,
  saveLedgerDetails,
  submitLedger,
  getConfig,
} from '@/api/ledger';
import dayjs from 'dayjs';
import { actionMap, STATUS_MAP, DEFAULT_CONFIG } from '@/constants/constantsMap';
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
};


const MyLedger = () => {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [ledger, setLedger] = useState(null);
  const [details, setDetails] = useState([]);
  const [formInWorkCount, setFormInWorkCount] = useState(0);
  const [formRemark, setFormRemark] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [cfg, setCfg] = useState(DEFAULT_CONFIG);

  const editable = useMemo(
    () => ledger && ['DRAFT', 'RETURNED'].includes(ledger.status),
    [ledger],
  );

  const TEAM_KEYWORDS = ['甲班', '乙班', '丙班', '丁班', '预备', '日勤'];


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

  const loadLedger = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyLedger(month);
      if (data) {
        setLedger(data);
        setFormInWorkCount(data.inWorkCount || 0);
        setFormRemark(data.remark || '');

        const all = [
          ...(data.details || []),
          ...(data.nonWorkingDetails || []),
        ].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        setDetails(
          all.map((item, idx) => ({
            ...item,
            sortOrder: item.sortOrder ?? idx + 1,
          })),
        );
      } else {
        setLedger(null);
        setDetails([]);
        setFormInWorkCount(0);
        setFormRemark('');
      }
    } catch {
      message.error('加载台账失败');
      setLedger(null);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

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
    setDetails((prev) => {
      const idx = prev.findIndex((d) => d.id === record.id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === 'isNonWorking' && value === 0) {
        next[idx].nonWorkingReason = '';
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!ledger || !editable) return;
    setSaving(true);
    try {
      const payload = {
        inWorkCount: formInWorkCount,
        remark: formRemark,
        details: details.map((d) => ({
          id: d.id,
          stationPoint: d.stationPoint || '',
          teamName: d.teamName || '',
          workType: d.workType || '',
          sortNo: d.sortNo,
        })),
      };
      await saveLedgerDetails(ledger.id, payload);
      message.success('保存成功');
      await loadLedger();
    } catch (err) {
      message.error(err?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!ledger || !editable) return;
    try {
      await handleSave();
    } catch {
      return;
    }
    setSubmitting(true);
    try {
      await submitLedger(ledger.id);
      message.success('提交成功，等待审批');
      await loadLedger();
    } catch (err) {
      message.error(err?.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const hasCommonChar = (str1, str2) => {
    for (const char of str1) {
        if (str2.includes(char)) {
            return true;
        }
    }
    return false;
}

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

    const renderShiftName = (record, keyword) => {
      if(hasCommonChar(record.teamName, keyword)) {
        return (
          <span>{record.empName || ''}</span>
        );
      }
    }

    return [
      {
        title: '岗点',
        dataIndex: 'stationPoint',
        width: 120,
        align: 'center',
        render: (value, record) =>
          renderEditableText('stationPoint', value, record, '岗点'),
      },
      {
        title: '班组',
        dataIndex: 'teamName',
        width: 140,
        align: 'center',
      },
      {
        title: '岗位',
        dataIndex: 'workType',
        width: 140,
        align: 'center',
      },
      {
        title: '班别',
        align: 'center',
        children: TEAM_KEYWORDS.map((t,index) => ({
          title: TEAM_KEYWORDS[index],
          align: 'center',
          children: [
            {
              title: '姓名',
              dataIndex: 'empName',
              width: 110,
              align: 'center',
              render: (_, record) => renderShiftName(record, t),
            },
          ],
        })),
      },
      {
        title: '班制',
        dataIndex: 'shiftType',
        width: 120,
        align: 'center',
      },
      {
        title: '日勤',
        align: 'center',
        children: [
          {
            title: '姓名',
            dataIndex: 'empName',
            width: 110,
            align: 'center',
            render: (_, record) => renderShiftName(record, '日勤'),
          },
        ],
      },
      {
        title: '职务',
        dataIndex: 'identityType',
        width: 120,
        align: 'center',
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable, cfg, details]);

  return (
    <div style={styles.page}>
      <Card size="small">
        <div style={styles.toolbar}>
          <div style={styles.toolbarLeft}>
            <DatePicker
              picker="month"
              value={month ? dayjs(month) : null}
              format="YYYY-MM"
              onChange={(date) => {
                setMonth(date ? date.format('YYYY-MM') : '');
              }}
              allowClear
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
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              disabled={!editable}
              onClick={handleSave}
            >
              保存
            </Button>
            <Popconfirm
              title="提交后将无法修改，确认提交审批？"
              onConfirm={handleSubmit}
              okText="确认提交"
              cancelText="取消"
              disabled={!editable}
            >
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={submitting}
                disabled={!editable}
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
              <Descriptions.Item label="在岗人数">
                {ledger.inWorkCount}
              </Descriptions.Item>
              <Descriptions.Item label="创建人">
                {ledger.creatorName}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card size="small" title="现员台账明细">
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={details}
                rowKey={(r) => r.id ?? r.tempId ?? Math.random()}
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
                onChange={(e) => setFormRemark(e.target.value)}
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
                            {actionMap[record.action] ? ` - ${actionMap[record.action]}` : ''}
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

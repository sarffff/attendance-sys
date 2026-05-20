import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Select,
  Space,
  Modal,
  Input,
  message,
  Empty,
  Spin,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { getPendingLedgers, hrReviewLedger } from '@/api/ledger';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { TextArea } = Input;

const STATUS_MAP = {
  SUBMITTED: { text: '已提交', color: 'processing' },
  DIRECTOR_APPROVED: { text: '主任已审批', color: 'blue' },
  RETURNED: { text: '已驳回', color: 'error' },
  APPROVED: { text: '已通过', color: 'success' },
  REJECTED: { text: '已驳回', color: 'error' },
};

const ROLE_DEFAULT_STATUS = {
  ATTENDANCE_ADMIN: null,
  PARTY_SECRETARY: null,
  STATIONMASTER: null,
  DEPUTY_STATIONMASTER: null,
  HR_SECTION_CHIEF: null,
};

const ROLE_STATUS_OPTIONS = {
  ATTENDANCE_ADMIN: [
    { label: '全部', value: null },
    { label: '主任已审批', value: 'DIRECTOR_APPROVED' },
    { label: '已通过', value: 'APPROVED' },
    { label: '已驳回', value: 'REJECTED' },
  ],
  PARTY_SECRETARY: [
    { label: '全部', value: null },
    { label: '待审批', value: 'DIRECTOR_APPROVED' },
    { label: '已通过', value: 'APPROVED' },
    { label: '已驳回', value: 'REJECTED' },
  ],
  STATIONMASTER: [
    { label: '全部', value: null },
    { label: '待审批', value: 'DIRECTOR_APPROVED' },
    { label: '已通过', value: 'APPROVED' },
    { label: '已驳回', value: 'REJECTED' },
  ],
  DEPUTY_STATIONMASTER: [
    { label: '全部', value: null },
    { label: '待审批', value: 'DIRECTOR_APPROVED' },
    { label: '已通过', value: 'APPROVED' },
    { label: '已驳回', value: 'REJECTED' },
  ],
  HR_SECTION_CHIEF: [
    { label: '全部', value: null },
    { label: '待审批', value: 'DIRECTOR_APPROVED' },
    { label: '已通过', value: 'APPROVED' },
    { label: '已驳回', value: 'REJECTED' },
  ],
};

/** 当前节点可进行审批/驳回的状态 */
const REVIEWABLE_STATUS = ['DIRECTOR_APPROVED'];

const styles = {
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
    gap: 12,
  },
  approveBtn: {
    color: '#fff',
    background: 'linear-gradient(135deg, #52c41a, #389e0d)',
    border: 'none',
    borderRadius: 9999,
    fontWeight: 500,
    boxShadow: '0 2px 6px rgba(82, 196, 26, 0.3)',
  },
  rejectBtn: {
    color: '#fff',
    background: 'linear-gradient(135deg, #ff7875, #ff4d4f)',
    border: 'none',
    borderRadius: 9999,
    fontWeight: 500,
    boxShadow: '0 2px 6px rgba(255, 77, 79, 0.3)',
  },
  detailBtn: {
    color: '#fff',
    background: 'linear-gradient(135deg, #409EFF, #1677ff)',
    border: 'none',
    borderRadius: 9999,
    fontWeight: 500,
    boxShadow: '0 2px 6px rgba(64, 158, 255, 0.3)',
  },
};

const AllLedger = () => {
  const user = useAppSelector((state) => state.user.userInfo);
  const roleCode = user?.roleCode;
  const navigate = useNavigate();

  const [status, setStatus] = useState(ROLE_DEFAULT_STATUS[roleCode] || null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefresh, setIsRefresh] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalRecord, setModalRecord] = useState(null);
  const [opinion, setOpinion] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  const statusOptions = ROLE_STATUS_OPTIONS[roleCode] || [
    { label: '全部', value: null },
    { label: '待审批', value: 'DIRECTOR_APPROVED' },
    { label: '已通过', value: 'APPROVED' },
    { label: '已驳回', value: 'REJECTED' },
  ];

  const canReview = roleCode !== 'ATTENDANCE_ADMIN';

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPendingLedgers(status);
      setList(Array.isArray(data) ? data : []);
    } catch {
      message.error('加载列表失败');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadList();
  }, [loadList, isRefresh]);

  const openModal = (record, action) => {
    setModalRecord(record);
    setModalAction(action);
    setOpinion('');
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!modalRecord || !modalAction) return;
    setConfirmLoading(true);
    try {
      await hrReviewLedger(modalRecord.id, {
        action: modalAction,
        opinion: opinion || '',
      });

      message.success(
        modalAction === 'APPROVE' ? '审批通过' : '已驳回，考勤管理员可重新编辑提交',
      );
      setModalOpen(false);
      setIsRefresh((prev) => !prev);
    } catch (err) {
      message.error(err?.message || '操作失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    navigate(`/hr-ledger-detail?id=${record.id}`);
  };

  const columns = useMemo(
    () => [
      {
        title: '车间',
        dataIndex: 'orgUnitName',
        width: 150,
      },
      {
        title: '台账月份',
        dataIndex: 'ledgerMonth',
        width: 110,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        render: (status) => {
          const s = STATUS_MAP[status];
          return <Tag color={s?.color}>{s?.text || status}</Tag>;
        },
      },
      {
        title: '在岗人数',
        dataIndex: 'inWorkCount',
        width: 90,
        align: 'center',
      },
      {
        title: '创建人',
        dataIndex: 'creatorName',
        width: 150,
      },
      {
        title: '提交时间',
        dataIndex: 'submittedAt',
        width: 170,
        render: (v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : ''),
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 170,
        render: (v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : ''),
      },
      {
        title: '操作',
        fixed: 'right',
        width: 260,
        render: (_, record) => {
          const reviewable =
            canReview && REVIEWABLE_STATUS.includes(record.status);

          return (
            <Space size={8}>
              <Button
                size="small"
                icon={<EyeOutlined />}
                style={styles.detailBtn}
                onClick={() => handleViewDetail(record)}
              >
                详情
              </Button>

              {reviewable && (
                <>
                  <Button
                    size="small"
                    icon={<CheckCircleOutlined />}
                    style={styles.approveBtn}
                    onClick={() => openModal(record, 'APPROVE')}
                  >
                    审批
                  </Button>

                  <Button
                    size="small"
                    icon={<CloseCircleOutlined />}
                    style={styles.rejectBtn}
                    onClick={() => openModal(record, 'REJECT')}
                  >
                    驳回
                  </Button>
                </>
              )}
            </Space>
          );
        },
      },
    ],
    [canReview, navigate],
  );

  const modalTitle =
    modalAction === 'APPROVE' ? '审批通过' : '驳回台账';

  const modalAlert =
    modalAction === 'REJECT'
      ? '驳回后，台账将退回考勤管理员重新编辑并再次提交'
      : modalAction === 'APPROVE'
        ? '确认通过后，台账将进入下一审批环节或完成审批'
        : '';

  return (
    <Card
      title="台账审核"
      extra={
        <div style={styles.toolbar}>
          <div style={styles.toolbarLeft}>
            <Select
              value={status}
              onChange={setStatus}
              options={statusOptions}
              style={{ width: 150 }}
            />
            <Button icon={<ReloadOutlined />} onClick={loadList}>
              刷新
            </Button>
          </div>
        </div>
      }
    >
      <Spin spinning={loading}>
        {list.length === 0 && !loading ? (
          <Empty description="暂无待处理台账" style={{ padding: '60px 0' }} />
        ) : (
          <Table
            columns={columns}
            dataSource={list}
            rowKey="id"
            scroll={{ x: 'max-content' }}
            size="middle"
            pagination={false}
          />
        )}
      </Spin>

      <Modal
        title={modalTitle}
        open={modalOpen}
        onOk={handleConfirm}
        onCancel={() => setModalOpen(false)}
        confirmLoading={confirmLoading}
        okText="确认"
        cancelText="取消"
        destroyOnHidden
        width={480}
      >
        {modalAlert && (
          <div
            style={{
              background: modalAction === 'REJECT' ? '#fff7e6' : '#f6ffed',
              border: `1px solid ${modalAction === 'REJECT' ? '#ffd591' : '#b7eb8f'}`,
              borderRadius: 8,
              padding: '8px 12px',
              marginBottom: 16,
              fontSize: 13,
              color: '#666',
            }}
          >
            {modalAlert}
          </div>
        )}

        {modalRecord && (
          <div style={{ marginBottom: 16, color: '#333' }}>
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
            {modalAction === 'REJECT' ? '驳回原因' : '审批意见'}（选填）
          </div>
          <TextArea
            rows={3}
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            placeholder={
              modalAction === 'REJECT'
                ? '请输入驳回原因'
                : '请输入审批意见'
            }
          />
        </div>
      </Modal>
    </Card>
  );
};

export default AllLedger;

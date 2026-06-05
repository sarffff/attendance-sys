import { useState, useMemo } from 'react';
import { Card, Button, Tag, Select, Space, Modal, Input, message } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { getPendingLedgers, hrReviewLedger } from '@/api/ledger';
import { useNavigate } from 'react-router-dom';
import BaseTable from '@/components/BaseTable';
import dayjs from 'dayjs';

const { TextArea } = Input;

const STATUS_MAP = {
  SUBMITTED: { text: '已提交', color: 'processing' },
  DIRECTOR_APPROVED: { text: '主任已审批', color: 'blue' },
  RETURNED: { text: '已驳回', color: 'error' },
  APPROVED: { text: '已通过', color: 'success' },
  REJECTED: { text: '已拒绝', color: 'error' },
};

const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '主任已审批', value: 'DIRECTOR_APPROVED' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已拒绝', value: 'REJECTED' },
];

const REVIEWABLE_STATUS = ['DIRECTOR_APPROVED'];

const styles = {
  cardExtra: { display: 'flex', alignItems: 'center', gap: 8 },
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
  const navigate = useNavigate();

  const [status, setStatus] = useState('');
  const [isRefresh, setIsRefresh] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalRecord, setModalRecord] = useState(null);
  const [opinion, setOpinion] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  const params = useMemo(() => {
    const p = {};
    if (status) p.status = status;
    return p;
  }, [status]);

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
      message.success(modalAction === 'APPROVE' ? '审批通过' : '已驳回');
      setModalOpen(false);
      setIsRefresh((prev) => !prev);
    } catch (err) {
      message.error(err?.message || '操作失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      { title: '车间', dataIndex: 'orgUnitName', width: 150 },
      { title: '台账月份', dataIndex: 'ledgerMonth', width: 110 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        render: (v) => {
          const s = STATUS_MAP[v];
          return <Tag color={s?.color}>{s?.text || v}</Tag>;
        },
      },
      {
        title: '在岗人数',
        dataIndex: 'inWorkCount',
        width: 90,
        align: 'center',
      },
      { title: '创建人', dataIndex: 'creatorName', width: 150 },
      {
        title: '提交时间',
        dataIndex: 'submittedAt',
        width: 170,
        render: (v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'),
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 170,
        render: (v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'),
      },
      {
        title: '操作',
        fixed: 'right',
        width: 260,
        render: (_, record) => (
          <Space size={8}>
            <Button
              size="small"
              icon={<EyeOutlined />}
              style={styles.detailBtn}
              onClick={() => navigate(`/hr-ledger-detail?id=${record.id}`)}
            >
              详情
            </Button>
            {REVIEWABLE_STATUS.includes(record.status) && (
              <>
                <Button
                  size="small"
                  icon={<CheckCircleOutlined />}
                  style={styles.approveBtn}
                  onClick={() => openModal(record, 'APPROVE')}
                >
                  通过
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
        ),
      },
    ],
    [navigate],
  );

  return (
    <Card
      title="台账审核"
      extra={
        <div style={styles.cardExtra}>
          <Select
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            style={{ width: 140 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => setIsRefresh((p) => !p)}
          >
            刷新
          </Button>
        </div>
      }
    >
      <BaseTable
        columns={columns}
        request={getPendingLedgers}
        params={params}
        rowKey="id"
        isRefresh={isRefresh}
      />

      <Modal
        title={modalAction === 'APPROVE' ? '审批通过' : '驳回台账'}
        open={modalOpen}
        onOk={handleConfirm}
        onCancel={() => setModalOpen(false)}
        confirmLoading={confirmLoading}
        okText="确认"
        cancelText="取消"
        destroyOnHidden
        width={480}
      >
        {modalAction && (
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
            {modalAction === 'REJECT'
              ? '驳回后，台账将退回考勤管理员重新编辑并再次提交'
              : '确认通过后，台账将进入下一审批环节或完成审批'}
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
              modalAction === 'REJECT' ? '请输入驳回原因' : '请输入审批意见'
            }
          />
        </div>
      </Modal>
    </Card>
  );
};

export default AllLedger;

import { Modal, Descriptions, Tag, Steps, Card, Divider, Badge } from 'antd';
import { formatTime } from '../utils/formatTime';
import { applicantType } from '@/constants/constantsMap';

const LeaveDetailModal = ({ open, onCancel, data, extra = null }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');
  if (!data) return null;

  const statusMap = {
    PENDING: { color: 'orange', text: '待审批' },
    APPROVED: { color: 'green', text: '已通过' },
    REJECTED: { color: 'red', text: '已拒绝' },
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>请假详情</span>
          <Badge
            status={statusMap[data.status]?.color}
            text={statusMap[data.status]?.text}
          />
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={extra}
      width={900}
    >
      <Card
        bordered={false}
        style={{
          marginBottom: 16,
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <Descriptions
          title="基础信息"
          column={2}
          labelStyle={{ color: '#888' }}
        >
          <Descriptions.Item label="申请人">
            {data.applicantName}
          </Descriptions.Item>

          <Descriptions.Item label="职位">
            {applicantType[data.applicantType]}
          </Descriptions.Item>

          <Descriptions.Item label="请假类型">
            <Tag color="blue">{data.leaveTypeName}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="请假天数">
            {data.leaveDays} 天
          </Descriptions.Item>

          <Descriptions.Item label="时间" span={2}>
            {formatTime(data.startTime)} ~ {formatTime(data.endTime)}
          </Descriptions.Item>

          <Descriptions.Item label="请假原因" span={2}>
            <div style={{ color: '#555' }}>{data.reason || '暂无'}</div>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Divider />

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          height: 400,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 12 }}>审批流程</div>

        <Steps
          direction="vertical"
          current={
            data.orgUnitId === 4 ? data.currentStep - 2 : data.currentStep - 1
          }
          items={data?.approvals.map((step) => ({
            title: (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>{step.stepName}</span>
                <Tag color={statusMap[step.approvalStatus]?.color}>
                  {statusMap[step.approvalStatus]?.text}
                </Tag>
                {step.signatureUrl && (
                  <div style={{ marginTop: 8 }}>
                    <div
                      style={{
                        color: '#999',
                        marginBottom: 4,
                      }}
                    >
                      电子签名：
                    </div>
                    <img
                      src={step.signatureUrl}
                      alt="签名"
                      style={{
                        width: 120,
                        borderRadius: 6,
                        border: '1px solid #eee',
                      }}
                    />
                  </div>
                )}
              </div>
            ),
            description: (
              <div style={{ marginTop: 6 }}>
                <div style={{ color: '#666' }}>
                  审批人：{step.approverName || '待选择'}
                </div>

                {step.approvedAt && (
                  <div style={{ color: '#999' }}>
                    时间：{formatTime(step.approvedAt)}
                  </div>
                )}

                {step.approvalComment && (
                  <div
                    style={{
                      marginTop: 6,
                      padding: 8,
                      background: '#fafafa',
                      borderRadius: 6,
                    }}
                  >
                    意见：{step.approvalComment}
                  </div>
                )}
              </div>
            ),
          }))}
        />
      </Card>
    </Modal>
  );
};

export default LeaveDetailModal;

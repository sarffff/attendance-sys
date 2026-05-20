import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  Upload,
  message,
  Typography,
} from 'antd';
import {
  DownloadOutlined,
  ExportOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
  TeamOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  importBasic,
  exportBasic,
  distributeBasic,
  getEmployeeBasic,
  getAllAdmins
} from '@/api/ledger';
import BaseTable from '@/components/BaseTable';
import { useFetch } from '@/hooks/useFetch';

const { Title, Text } = Typography;

const boolText = (value) => (Number(value) === 1 ? '是' : '否');

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const EmployeeBasic = () => {
  const [isRefresh, setIsRefresh] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [distributeOpen, setDistributeOpen] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [form] = Form.useForm();
  const { data: admins } = useFetch(() => getAllAdmins(),);
  const adminOptions = useMemo(() => {
    if (!admins) return [];
    return admins.map((admin) => ({
      label: admin.empName,
      value: admin.userId,
    }));
  }, [admins]);

  const refresh = () => setIsRefresh((prev) => !prev);

  const handleImport = async (file) => {
    setUploading(true);
    try {
      await importBasic(file);
      message.success('导入成功');
      refresh();
    } catch (err) {
      message.error(err?.message || '导入失败');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportBasic();
      downloadBlob(
        blob,
        `现员表_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      message.success('导出成功');
    } catch (err) {
      message.error(err?.message || '导出失败');
    } finally {
      setExporting(false);
    }
  };

  const handleDistribute = async () => {
    try {
      const values = await form.validateFields();
      setDistributing(true);
      await distributeBasic({ userIds: values.ids });
      message.success('下发成功');
      setDistributeOpen(false);
      form.resetFields();
      refresh();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || '下发失败');
    } finally {
      setDistributing(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 90 },
    { title: '身份证号', dataIndex: 'idCardNo', width: 180 },
    { title: '姓名', dataIndex: 'empName', width: 100 },
    { title: '性别', dataIndex: 'gender', width: 80 },
    { title: '出生日期', dataIndex: 'birthDate', width: 120 },
    { title: '工种', dataIndex: 'workType', width: 120 },
    { title: '身份', dataIndex: 'identityType', width: 120 },
    { title: '人员类别大类', dataIndex: 'categoryMajor', width: 140 },
    { title: '人员类别小类', dataIndex: 'categoryMinor', width: 140 },
    { title: '年龄', dataIndex: 'age', width: 80, align: 'center' },
    { title: '劳动班制', dataIndex: 'laborShift', width: 120 },
    {
      title: '班组长',
      dataIndex: 'isTeamLeader',
      width: 90,
      align: 'center',
      render: (value) => (
        <Tag color={Number(value) === 1 ? 'orange' : 'default'}>
          {boolText(value)}
        </Tag>
      ),
    },
    { title: '科室车间名称', dataIndex: 'orgUnitName', width: 160 },
    { title: '部门班组', dataIndex: 'teamName', width: 160 },
  ];

  return (
    <div
      style={{
        padding: 24,
        minHeight: '100vh',
        background: '#f5f7fa',
      }}
    >
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(22,119,255,0.3)',
          }}
        >
          <TeamOutlined style={{ color: '#fff', fontSize: 18 }} />
        </div>
        <div>
          <Title level={4} style={{ margin: 0, lineHeight: 1.2 }}>
            现员表
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            现员基础信息维护、导入导出与部门下发
          </Text>
        </div>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <Space wrap>
            <Upload
              accept=".xls,.xlsx"
              maxCount={1}
              showUploadList={false}
              beforeUpload={handleImport}
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                导入
              </Button>
            </Upload>
            <Button
              icon={<DownloadOutlined />}
              loading={exporting}
              onClick={handleExport}
            >
              导出
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => setDistributeOpen(true)}
            >
              下发
            </Button>
          </Space>
        </div>

        <BaseTable
          columns={columns}
          request={getEmployeeBasic}
          params={{}}
          isRefresh={isRefresh}
        />
      </Card>

      <Modal
        title={
          <Space>
            <ExportOutlined style={{ color: '#1677ff' }} />
            下发现员表
          </Space>
        }
        open={distributeOpen}
        onOk={handleDistribute}
        onCancel={() => setDistributeOpen(false)}
        confirmLoading={distributing}
        okText="确认下发"
        cancelText="取消"
        width={520}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item
            label="下发部门"
            name="ids"
            rules={[{ required: true, message: '请选择下发部门' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择部门"
              options={adminOptions}
              showSearch
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .ant-table-thead > tr > th {
          background: #f0f5ff !important;
          font-weight: 600 !important;
          color: #2c3e50 !important;
          font-size: 13px !important;
        }
        .ant-table-row:hover td { background: #f0f7ff !important; }
      `}</style>
    </div>
  );
};

export default EmployeeBasic;

import { useState, useCallback } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Typography,
  Badge,
  Select,
  Upload,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  PoweroffOutlined,
  UserOutlined,
  SearchOutlined,
  LockOutlined,
  TeamOutlined,
  UploadOutlined,
  EyeOutlined,
} from '@ant-design/icons';

import {
  orgListApi,
  userAddApi,
  userListApi,
  userEditApi,
  userToggleApi,
  userResetPasswordApi,
} from '@/api/super_admin';
import { useFetch } from '@/hooks/useFetch';
import { allRoles } from '@/constants/roleCode';
import BaseTable from '@/components/BaseTable';
import { applicantType } from '@/constants/constantsMap';

const { Title, Text } = Typography;

const UserSettings = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');
  const [isRefresh, setIsRefresh] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [filterEmpName, setFilterEmpName] = useState('');
  const [signatureMap, setSignatureMap] = useState({});
  const [uploadingUserId, setUploadingUserId] = useState(null);
  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    empName: '',
  });
  const refresh = () => setIsRefresh((prev) => !prev);

  const { data: orgData } = useFetch(() =>
    orgListApi({ pageNum: 1, pageSize: 999 }),
  );

  const orgOptions = (orgData?.records || []).map((o) => ({
    label: o.orgName,
    value: o.id,
  }));

  const roleCodeOptions = Object.entries(allRoles).map(([key, value]) => ({
    label: value,
    value: key,
  }));

  const applicantTypeOptions = Object.entries(applicantType).map(
    ([key, value]) => ({
      label: value,
      value: key,
    }),
  );

  const columns = [
    {
      title: '用户',
      dataIndex: 'username',
      render: (name, record) => (
        <Space>
          <div>
            <Text
              strong
              style={{
                fontSize: 14,
                display: 'block',
                lineHeight: 1.3,
              }}
            >
              {record.username || '—'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '姓名',
      dataIndex: 'empName',
      render: (name) => <Text style={{ fontSize: 13 }}>{name || '—'}</Text>,
    },
    {
      title: '角色',
      dataIndex: 'roleCode',
      width: 100,
      render: (_, record) => (
        <Text style={{ fontSize: 13 }}>{allRoles[record.roleCode] || '—'}</Text>
      ),
    },
    {
      title: '所属组织',
      dataIndex: 'orgUnitId',
      render: (_, record) => (
        <Space size={4}>
          <TeamOutlined style={{ color: '#1677ff', fontSize: 12 }} />
          <Text style={{ fontSize: 13 }}>
            {orgData?.records.map((i) => {
              if (i.sortNo === record.orgUnitId) {
                return i.orgName;
              }
            }) || '—'}
          </Text>
        </Space>
      ),
    },
    {
      title: '是否启用',
      dataIndex: 'isEnabled',
      render: (isEnabled) => {
        return (
          <Badge
            status={isEnabled ? 'success' : 'default'}
            text={isEnabled ? '是' : '否'}
          />
        );
      },
    },
    {
      title: '操作',
      width: 350,
      fixed: 'right',
      render: (_, record) => {
        return userOperations(record);
      },
    },
  ];

  const openAdd = () => {
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditRecord(record);
    form.setFieldsValue({
      username: record.username,
      roleCode: record.roleCode,
      orgUnitId: record.orgUnitId,
      empName: record.empName,
      applicantType: record.applicantType,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      if (editRecord) {
        await userEditApi(editRecord.id, values);
        message.success('用户更新成功');
      } else {
        await userAddApi(values);
        message.success('用户新增成功');
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || '操作失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleToggle = useCallback(async (record) => {
    try {
      await userToggleApi(record.id, {
        isEnabled: record.isEnabled === 1 ? 0 : 1,
      });
      message.success(record.isEnabled === 1 ? '已停用' : '已启用');
      refresh();
    } catch (err) {
      message.error(err?.message || '操作失败');
    }
  }, []);

  const openReset = (record) => {
    setEditRecord(record);
    resetForm.resetFields();
    setResetModalOpen(true);
  };

  const handleReset = async () => {
    try {
      const values = await resetForm.validateFields();
      setConfirmLoading(true);
      await userResetPasswordApi(editRecord.id, values);
      message.success('密码重置成功');
      setResetModalOpen(false);
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || '重置失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleClear = () => {
    setFilterEmpName('');
    handlePressEnter(null, '');
  };

  const handlePressEnter = (e, overrideValue) => {
    const valueToSearch =
      overrideValue !== undefined ? overrideValue : e.target.value;

    setSearchParams((prev) => {
      return {
        ...prev,
        empName: valueToSearch,
      };
    });
  };

  const normalizeFileUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//.test(url)) return url;
    return `${FILE_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const getSignatureUrl = (record) => {
    return signatureMap[record.id] || normalizeFileUrl(record.signatureUrl);
  };

  const userOperations = (record) => {
    const signatureUrl = getSignatureUrl(record);
    const uploadProps = {
      name: 'signatureFile',
      action: `${API_BASE_URL}/admin/users/${record.id}/signature`,
      method: 'PATCH',
      headers: {
        Authorization: localStorage.getItem('attendance-token'),
      },
      accept: 'image/png,image/jpeg,image/jpg',
      maxCount: 1,
      showUploadList: false,
      beforeUpload(file) {
        const isImage = ['image/png', 'image/jpeg'].includes(file.type);
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isImage) {
          message.warning('请上传 PNG 或 JPG 格式的签名图片');
          return Upload.LIST_IGNORE;
        }

        if (!isLt2M) {
          message.warning('签名图片不能超过 2MB');
          return Upload.LIST_IGNORE;
        }

        setUploadingUserId(record.id);
        return true;
      },
      onChange(info) {
        if (info.file.status === 'uploading') {
          setUploadingUserId(record.id);
          return;
        }

        if (info.file.status === 'done') {
          setUploadingUserId(null);
          if (info.file.response?.success) {
            const uploadedUrl = info.file.response.data?.signatureUrl;
            setSignatureMap((prev) => ({
              ...prev,
              [record.id]: normalizeFileUrl(uploadedUrl),
            }));
            message.success('签名上传成功');
          } else {
            message.error(info.file.response?.message || '签名上传失败');
          }
        }

        if (info.file.status === 'error') {
          setUploadingUserId(null);
          message.error('签名上传失败');
        }
      },
    };
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '100%',
        }}
      >
        {record.roleCode !== 'ATTENDANCE_ADMIN' ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
            }}
          >
            <div style={{ flex: 1 }}>
              <Upload {...uploadProps} style={{ width: '100%' }}>
                <Button
                  size="small"
                  icon={<UploadOutlined />}
                  loading={uploadingUserId === record.id}
                  style={{
                    width: '100%',
                    color: '#fff',
                    background:
                      'linear-gradient(135deg, #409EFF 0%, #1677ff 100%)',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '4px 10px',
                    fontSize: '13px',
                    fontWeight: '500',
                    boxShadow: '0 2px 6px rgba(64, 158, 255, 0.3)',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  上传签名
                </Button>
              </Upload>
            </div>

            <div style={{ flex: 1 }}>
              <Tooltip title={signatureUrl ? '查看签名' : '暂无签名'}>
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  href={signatureUrl || undefined}
                  target="_blank"
                  disabled={!signatureUrl}
                  style={{
                    width: '100%',
                    color: '#fff',
                    background: signatureUrl
                      ? 'linear-gradient(135deg, #67C23A 0%, #52c41a 100%)'
                      : 'linear-gradient(135deg, #C0C4CC 0%, #909399 100%)',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '4px 10px',
                    fontSize: '13px',
                    fontWeight: '500',
                    boxShadow: signatureUrl
                      ? '0 2px 6px rgba(82, 196, 26, 0.3)'
                      : '0 2px 6px rgba(144, 147, 153, 0.25)',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    opacity: signatureUrl ? 1 : 0.7,
                    cursor: signatureUrl ? 'pointer' : 'not-allowed',
                  }}
                >
                  预览
                </Button>
              </Tooltip>
            </div>
          </div>
        ) : null}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
          }}
        >
          <div style={{ flex: 1 }}>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
              style={{
                width: '100%',
                color: '#fff',
                background: 'linear-gradient(135deg, #409EFF 0%, #1677ff 100%)',
                border: 'none',
                borderRadius: '9999px',
                padding: '4px 10px',
                fontSize: '13px',
                fontWeight: '500',
                boxShadow: '0 2px 6px rgba(64, 158, 255, 0.3)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              编辑
            </Button>
          </div>

          <div style={{ flex: 1 }}>
            <Button
              size="small"
              icon={<LockOutlined />}
              onClick={() => openReset(record)}
              style={{
                width: '100%',
                color: '#fff',
                background: 'linear-gradient(135deg, #E6A23C 0%, #faad14 100%)',
                border: 'none',
                borderRadius: '9999px',
                padding: '4px 10px',
                fontSize: '13px',
                fontWeight: '500',
                boxShadow: '0 2px 6px rgba(250, 173, 20, 0.3)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              重置密码
            </Button>
          </div>

          <div style={{ flex: 1 }}>
            <Popconfirm
              title={
                record.isEnabled === 1 ? '确定停用该用户？' : '确定启用该用户？'
              }
              onConfirm={() => handleToggle(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                size="small"
                icon={<PoweroffOutlined />}
                style={{
                  width: '100%',
                  color: '#fff',
                  background:
                    record.isEnabled === 1
                      ? 'linear-gradient(135deg, #F56C6C 0%, #ff4d4f 100%)'
                      : 'linear-gradient(135deg, #67C23A 0%, #52c41a 100%)',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '4px 10px',
                  fontSize: '13px',
                  fontWeight: '500',
                  boxShadow:
                    record.isEnabled === 1
                      ? '0 2px 6px rgba(255, 77, 79, 0.3)'
                      : '0 2px 6px rgba(82, 196, 26, 0.3)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {record.isEnabled === 1 ? '停用' : '启用'}
              </Button>
            </Popconfirm>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        padding: '24px',
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
            background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(82,196,26,0.3)',
          }}
        >
          <UserOutlined style={{ color: '#fff', fontSize: 18 }} />
        </div>
        <div>
          <Title level={4} style={{ margin: 0, lineHeight: 1.2 }}>
            用户管理
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            管理系统用户账号与权限
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
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <Space>
            <Input
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              placeholder="搜索用户名 / 姓名"
              allowClear
              style={{ width: 220, borderRadius: 8 }}
              value={filterEmpName}
              onChange={(e) => setFilterEmpName(e.target.value)}
              onPressEnter={(e) => handlePressEnter(e)}
              onClear={handleClear}
            />
          </Space>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAdd}
            style={{
              borderRadius: 8,
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              border: 'none',
              boxShadow: '0 3px 10px rgba(82,196,26,0.3)',
              fontWeight: 500,
            }}
          >
            新增用户
          </Button>
        </div>

        <BaseTable
          rowKey="id"
          columns={columns}
          request={userListApi}
          params={searchParams}
          isRefresh={isRefresh}
        />
      </Card>

      {/* 新增 / 编辑弹窗 */}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: '#52c41a' }} />
            {editRecord ? '编辑用户' : '新增用户'}
          </Space>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={confirmLoading}
        okText="确定"
        cancelText="取消"
        width={520}
        styles={{ body: { paddingTop: 8 } }}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0 16px',
            }}
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#bbb' }} />}
                placeholder="请输入用户名"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
            {!editRecord ? (
              <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input placeholder="请输入密码" style={{ borderRadius: 8 }} />
              </Form.Item>
            ) : null}
            <Form.Item
              label="角色"
              name="roleCode"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select
                placeholder="请选择角色"
                style={{ borderRadius: 8 }}
                options={roleCodeOptions}
              />
            </Form.Item>
            <Form.Item
              label="姓名"
              name="empName"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入姓名" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item
              label="职位"
              name="applicantType"
              rules={[{ required: true, message: '请选择职位' }]}
            >
              <Select
                placeholder="请选择职位"
                style={{ borderRadius: 8 }}
                options={applicantTypeOptions}
              />
            </Form.Item>
            <Form.Item
              label="所属组织"
              name="orgUnitId"
              rules={[{ required: true, message: '请选择组织' }]}
            >
              <Select
                placeholder="请选择组织"
                style={{ borderRadius: 8 }}
                options={orgOptions}
                showSearch
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* 重置密码弹窗 */}
      <Modal
        title={
          <Space>
            <LockOutlined style={{ color: '#faad14' }} />
            重置密码 — {editRecord?.username}
          </Space>
        }
        open={resetModalOpen}
        onOk={handleReset}
        onCancel={() => setResetModalOpen(false)}
        confirmLoading={confirmLoading}
        okText="确认重置"
        cancelText="取消"
        width={400}
        styles={{ body: { paddingTop: 8 } }}
      >
        <Form form={resetForm} layout="vertical" requiredMark="optional">
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              {
                min: 6,
                max: 16,
                message: '密码必须在6-16个字符之间',
              },
            ]}
          >
            <Input.Password
              placeholder="请输入新密码"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次密码输入不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="请再次输入新密码"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
                .table-row-stripe td { background: #fafbfc !important; }
                .ant-table-thead > tr > th {
                    background: #f6ffed !important;
                    font-weight: 600 !important;
                    color: #2c3e50 !important;
                    font-size: 13px !important;
                }
                .ant-table-row:hover td { background: #f6ffed !important; }
            `}</style>
    </div>
  );
};

export default UserSettings;

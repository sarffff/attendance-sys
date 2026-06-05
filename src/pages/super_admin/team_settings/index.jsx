import { useState, useMemo } from 'react';
import {
  Card,
  Button,
  Form,
  Input,
  Select,
  Space,
  Modal,
  Popconfirm,
  message,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  getTeamNameApi,
  addTeamNameApi,
  editTeamNameApi,
  deleteTeamNameApi,
  orgListApi,
} from '@/api/super_admin';
import { useFetch } from '@/hooks/useFetch';
import BaseTable from '@/components/BaseTable';
import BaseForm from '@/components/BaseForm';

const TeamSettings = () => {
  const [searchForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [isRefresh, setIsRefresh] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [searchParams, setSearchParams] = useState({
    orgUnitId: undefined,
    teamName: '',
  });

  const { data: orgData } = useFetch(() =>
    orgListApi({ pageNum: 1, pageSize: 999 }),
  );

  const orgOptions = useMemo(
    () =>
      (orgData?.records || []).map((org) => ({
        label: org.orgName,
        value: org.id,
      })),
    [orgData],
  );

  const refresh = () => setIsRefresh((prev) => !prev);

  const handleSearch = () => {
    setSearchParams({
      orgUnitId: searchForm.getFieldValue('orgUnitId') || undefined,
      teamName: searchForm.getFieldValue('teamName') || '',
    });
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({ orgUnitId: undefined, teamName: '' });
  };

  const openAdd = () => {
    setEditRecord(null);
    modalForm.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditRecord(record);
    modalForm.setFieldsValue({
      orgUnitId: record.orgUnitId,
      teamName: record.teamName,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await modalForm.validateFields();
      setConfirmLoading(true);

      if (editRecord) {
        await editTeamNameApi(editRecord.id, values);
        message.success('编辑成功');
      } else {
        await addTeamNameApi(values);
        message.success('添加成功');
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

  const handleDelete = async (record) => {
    try {
      await deleteTeamNameApi(record.id);
      message.success('删除成功');
      refresh();
    } catch (err) {
      message.error(err?.message || '删除失败');
    }
  };

  const modalSchema = [
    {
      type: 'select',
      label: '所属组织',
      field: 'orgUnitId',
      placeholder: '请选择组织',
      rules: [{ required: true, message: '请选择所属组织' }],
      options: orgOptions,
      span: 24,
    },
    {
      type: 'input',
      label: '班组名称',
      field: 'teamName',
      placeholder: '请输入班组名称',
      rules: [{ required: true, message: '请输入班组名称' }],
      span: 24,
    },
  ];

  const columns = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', width: 70, align: 'center' },
      { title: '所属组织', dataIndex: 'orgUnitName', width: 140 },
      { title: '班组名称', dataIndex: 'teamName', width: 140 },
      { title: '班制类型', dataIndex: 'shiftCategory', width: 100 },
      {
        title: '排序号',
        dataIndex: 'sortNo',
        width: 80,
        align: 'center',
      },
      {
        title: '是否启用',
        dataIndex: 'isEnabled',
        width: 100,
        align: 'center',
        render: (v) => (
          <Tag color={v === 1 ? 'success' : 'default'}>
            {v === 1 ? '是' : '否'}
          </Tag>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 170,
        render: (v) => (v ? v.replace('T', ' ').slice(0, 19) : ''),
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 170,
        render: (v) => (v ? v.replace('T', ' ').slice(0, 19) : ''),
      },
      {
        title: '操作',
        width: 160,
        fixed: 'right',
        render: (_, record) => (
          <Space size={8}>
            <Button
              size="small"
              icon={<EditOutlined />}
              style={{
                color: '#fff',
                background: 'linear-gradient(135deg, #409EFF, #1677ff)',
                border: 'none',
                borderRadius: 9999,
                fontWeight: 500,
                boxShadow: '0 2px 6px rgba(64, 158, 255, 0.3)',
              }}
              onClick={() => openEdit(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除该班组？"
              onConfirm={() => handleDelete(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                size="small"
                icon={<DeleteOutlined />}
                style={{
                  color: '#fff',
                  background: 'linear-gradient(135deg, #ff7875, #ff4d4f)',
                  border: 'none',
                  borderRadius: 9999,
                  fontWeight: 500,
                  boxShadow: '0 2px 6px rgba(255, 77, 79, 0.3)',
                }}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <Card
      title="班组管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          新增班组
        </Button>
      }
    >
      {/* 搜索栏 */}
      <Form
        form={searchForm}
        layout="inline"
        style={{ marginBottom: 16, flexWrap: 'wrap', gap: 8 }}
      >
        <Form.Item name="orgUnitId" label="所属组织">
          <Select
            allowClear
            placeholder="请选择组织"
            options={orgOptions}
            style={{ width: 200 }}
          />
        </Form.Item>
        <Form.Item name="teamName" label="班组名称">
          <Input
            allowClear
            placeholder="请输入班组名称"
            style={{ width: 180 }}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <BaseTable
        columns={columns}
        request={getTeamNameApi}
        params={searchParams}
        rowKey="id"
        isRefresh={isRefresh}
      />

      <Modal
        title={editRecord ? '编辑班组' : '新增班组'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={confirmLoading}
        okText="确认"
        cancelText="取消"
        destroyOnHidden
        width={460}
      >
        <BaseForm schema={modalSchema} form={modalForm} columns={1} />
      </Modal>
    </Card>
  );
};

export default TeamSettings;

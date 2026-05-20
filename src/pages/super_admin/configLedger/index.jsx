import { getConfig, updateConfig } from '@/api/ledger';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Space,
  Switch,
  Table,
  Typography,
  message,
} from 'antd';

const { Text } = Typography;

const ConfigLedger = () => {
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState('');
  const [form] = Form.useForm();

  const configMeta = useMemo(
    () => [
      {
        configKey: 'team_leader_color',
        desc: '是否显示班组长背景颜色',
        sample: '#FFFFCC',
        type: 'color',
      },
      {
        configKey: 'learner_color',
        desc: '是否显示学习人员背景颜色',
        sample: '#CCFFCC',
        type: 'color',
      },
      {
        configKey: 'new_employee_color',
        desc: '是否显示新职人员背景颜色',
        sample: '#FFCCCC',
        type: 'color',
      },
      {
        configKey: 'show_team_leader_color',
        desc: '是否显示班组长背景',
        sample: 'true/false',
        type: 'boolean',
      },
      {
        configKey: 'show_learner_color',
        desc: '是否显示学习人员背景',
        sample: 'true/false',
        type: 'boolean',
      },
      {
        configKey: 'show_new_employee_color',
        desc: '是否显示新职人员背景',
        sample: 'true/false',
        type: 'boolean',
      },
      {
        configKey: 'show_age',
        desc: '是否显示年龄',
        sample: 'true/false',
        type: 'boolean',
      },
    ],
    [],
  );

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConfig();
      const values = {};
      configMeta.forEach((item) => {
        const current = data?.[item.configKey];
        if (item.type === 'boolean') {
          values[item.configKey] = Boolean(current);
        } else if (item.type === 'color') {
          values[item.configKey] = current || '#FFFFFF';
        } else {
          values[item.configKey] = current ?? '';
        }
      });
      form.setFieldsValue(values);
    } catch {
      message.error('配置加载失败');
    } finally {
      setLoading(false);
    }
  }, [configMeta, form]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSaveOne = async (record) => {
    const value = form.getFieldValue(record.configKey);
    setSavingKey(record.configKey);
    console.log('Saving config', record.configKey, value);
    try {
      // await updateConfig([
      //   {
      //     configKey: record.configKey,
      //     configValue: value,
      //   },
      // ]);
      message.success('配置保存成功');
    } catch {
      message.error('配置保存失败');
    } finally {
      setSavingKey('');
    }
  };

  const renderValueEditor = (record) => {
    if (record.type === 'boolean') {
      return (
        <Form.Item
          name={record.configKey}
          valuePropName="checked"
          style={{ margin: 0 }}
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>
      );
    }

    return (
      <Form.Item
        name={record.configKey}
        style={{ margin: 0 }}
        rules={[
          { required: true, message: '请输入颜色值' },
          { pattern: /^#([0-9a-fA-F]{6})$/, message: '格式示例：#RRGGBB' },
        ]}
      >
        <Form.Item name={record.configKey} noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item
          shouldUpdate={(prev, cur) =>
            prev[record.configKey] !== cur[record.configKey]
          }
          noStyle
        >
          {({ getFieldValue, setFieldValue }) => {
            const colorVal = getFieldValue(record.configKey) || '#FFFFFF';
            return (
              <Space>
                <input
                  type="color"
                  value={colorVal}
                  style={{
                    width: 32,
                    height: 32,
                    padding: 0,
                    border: '1px solid #d9d9d9',
                    cursor: 'pointer',
                  }}
                  onChange={(e) =>
                    setFieldValue(record.configKey, e.target.value)
                  }
                />
                <Input
                  value={colorVal}
                  readOnly
                  placeholder={record.sample}
                  style={{ width: 120 }}
                />
              </Space>
            );
          }}
        </Form.Item>
      </Form.Item>
    );
  };

  const columns = [
    {
      title: '配置键',
      dataIndex: 'configKey',
      width: 260,
      render: (value) => <Text code>{value}</Text>,
    },
    {
      title: '说明',
      dataIndex: 'desc',
      width: 280,
    },
    {
      title: '配置值',
      width: 260,
      render: (_, record) => renderValueEditor(record),
    },
    {
      title: '操作',
      width: 120,
      render: (_, record) => (
        <div>
          <Button
            type="primary"
            size="small"
            loading={savingKey === record.configKey}
            onClick={async () => {
              if (record.type === 'color') {
                try {
                  await form.validateFields([record.configKey]);
                } catch {
                  return;
                }
              }
              handleSaveOne(record);
            }}
          >
            保存
          </Button>

        </div>
      ),
    },
  ];

  return (
    <Card
      title="台账配置"
    >
      <Form form={form} layout="vertical">
        <Table
          rowKey="configKey"
          loading={loading}
          columns={columns}
          dataSource={configMeta}
          pagination={false}
        />
      </Form>
    </Card>
  );
};

export default ConfigLedger;

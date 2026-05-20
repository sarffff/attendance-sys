import {
    Form,
    Input,
    Select,
    DatePicker,
    InputNumber,
    Row,
    Col,
    Card,
    Radio
} from "antd";

const { TextArea } = Input;

const BaseForm = ({ schema = [], form, columns = 2 }) => {
    const colSpan = 24 / columns;

    const renderItem = (item) => {
        const props = item.props || {};

        switch (item.type) {
            case "input":
                return <Input placeholder={item.placeholder} {...props} />;

            case "textarea":
                return (
                    <TextArea
                        rows={4}
                        placeholder={item.placeholder}
                        {...props}
                    />
                );

            case "select":
                return (
                    <Select placeholder={item.placeholder} {...props}>
                        {item.options?.map((opt) => (
                            <Select.Option key={opt.value} value={opt.value}>
                                {opt.label}
                            </Select.Option>
                        ))}
                    </Select>
                );

            case "datetime":
                return (
                    <DatePicker
                        placeholder={item.placeholder}
                        showTime
                        format="YYYY-MM-DD HH:mm"
                        style={{ width: "100%" }}
                        {...props}
                    />
                );

            case "number":
                return (
                    <InputNumber
                        placeholder={item.placeholder}
                        style={{ width: "100%" }}
                        {...props}
                    />
                );

            case "radio":
                return (
                    <Radio.Group {...props}>
                        {item.options?.map((opt) => (
                            <Radio value={opt.value} key={opt.value}>
                                {opt.label}
                            </Radio>
                        ))}
                    </Radio.Group>
                );

            default:
                return null;
        }
    };

    const groups = {};

    schema.forEach((item) => {
        const group = item.group || "default";
        if (!groups[group]) groups[group] = [];
        groups[group].push(item);
    });

    return (
        <Form form={form} layout="vertical" style={{ marginTop: 10 }}>
            {Object.keys(groups).map((groupName) => (
                <Card
                    key={groupName}
                    title={groupName === "default" ? "" : groupName}
                    size="small"
                    bordered={false}
                    style={{
                        marginBottom: 16,
                        borderRadius: 12,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                >
                    <Row gutter={16}>
                        {groups[groupName].map((item) => {
                            if (item.hidden) return null;

                            return (
                                <Col
                                    key={item.field}
                                    span={item.span || colSpan}
                                >
                                    <Form.Item
                                        label={
                                            <span style={{ fontWeight: 500 }}>
                                                {item.label}
                                            </span>
                                        }
                                        name={item.field}
                                        rules={item.rules}
                                    >
                                        {renderItem(item)}
                                    </Form.Item>
                                </Col>
                            );
                        })}
                    </Row>
                </Card>
            ))}
        </Form>
    );
}

export default BaseForm;

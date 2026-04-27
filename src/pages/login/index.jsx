import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Space, message } from "antd";
import {
    UserOutlined,
    LockOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { loginApi } from "@/api/login";
import { useAppDispatch } from "@/store/hooks";
import { setToken, setUserInfo } from "@/store/modules/user";
import { encryptMD5 } from "@/utils/encryptMD5";

const { Title, Text } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const onFinish = async (values) => {
        setLoading(true);
        try {
             const data = await loginApi({
            username: values.username,
            // password: encryptMD5(values.password),
            password: values.password,
        });

        localStorage.setItem("attendance-token", data.token);
        dispatch(setToken(data.token));
        delete data.token;
        dispatch(setUserInfo(data));

        message.success("欢迎回来，登录成功");
        navigate("/");
        setLoading(false);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.blob1}></div>
            <div style={styles.blob2}></div>

            <Card style={styles.loginCard} bordered={false}>
                <div style={styles.header}>
                    <div style={styles.logo}>
                        <SafetyCertificateOutlined
                            style={{ fontSize: 32, color: "#1890ff" }}
                        />
                    </div>
                    <Title level={3} style={{ marginBottom: 0 }}>
                        请假审批系统
                    </Title>
                    <Text type="secondary">请使用您的员工账号登录</Text>
                </div>

                <Form
                    name="login"
                    onFinish={onFinish}
                    size="large"
                    layout="vertical"
                    requiredMark={false}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: "请输入用户名" }]}
                    >
                        <Input
                            prefix={<UserOutlined style={styles.icon} />}
                            placeholder="用户名"
                            style={styles.input}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "请输入密码" }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={styles.icon} />}
                            placeholder="密码"
                            style={styles.input}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            style={styles.button}
                        >
                            登 录
                        </Button>
                    </Form.Item>

                    <div style={styles.footer}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            ©2026 行政人事部 · 内部系统
                        </Text>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f4f7f9",
        backgroundImage:
            "radial-gradient(at 0% 0%, hsla(210,100%,93%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,0.1) 0, transparent 50%)",
        overflow: "hidden",
        position: "relative",
    },
    loginCard: {
        width: 400,
        borderRadius: 16,
        boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        zIndex: 10,
        backdropFilter: "blur(10px)",
        background: "rgba(255, 255, 255, 0.95)",
    },
    header: {
        textAlign: "center",
        marginBottom: 32,
    },
    logo: {
        width: 64,
        height: 64,
        backgroundColor: "#e6f7ff",
        borderRadius: "16px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "0 auto 16px",
    },
    input: {
        borderRadius: 8,
        padding: "10px 12px",
    },
    icon: {
        color: "#bfbfbf",
    },
    button: {
        height: 45,
        borderRadius: 8,
        fontSize: 16,
        fontWeight: 600,
        marginTop: 8,
        background: "linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)",
        border: "none",
    },
    footer: {
        textAlign: "center",
        marginTop: 16,
    },
    // 装饰性背景
    blob1: {
        position: "absolute",
        width: 300,
        height: 300,
        background: "#1890ff",
        filter: "blur(80px)",
        borderRadius: "50%",
        top: "-50px",
        right: "-50px",
        opacity: 0.1,
    },
    blob2: {
        position: "absolute",
        width: 400,
        height: 400,
        background: "#722ed1",
        filter: "blur(100px)",
        borderRadius: "50%",
        bottom: "-100px",
        left: "-100px",
        opacity: 0.05,
    },
};

export default Login;

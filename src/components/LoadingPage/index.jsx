import React from "react";
import { Spin, Typography, Progress, Button } from "antd";
import { LoadingOutlined, ReloadOutlined } from "@ant-design/icons";
import "./LoadingPage.css";

const { Title, Text } = Typography;

const LoadingPage = ({
    tip = "页面正在加载中",
    description = "请稍候，我们正在为你准备内容。",
    percent,
    error = false,
    message = "加载失败",
    onRetry,
}) => {
    return (
        <div className="loading-page">
            <div className="loading-card">
                {!error ? (
                    <>
                        <Spin
                            indicator={
                                <LoadingOutlined
                                    style={{ fontSize: 48 }}
                                    spin
                                />
                            }
                        />

                        <Title level={4} className="loading-title">
                            {tip}
                        </Title>

                        <Text type="secondary">{description}</Text>

                        {typeof percent === "number" && (
                            <div className="loading-progress">
                                <Progress
                                    percent={percent}
                                    status="active"
                                    strokeLinecap="round"
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="loading-error-icon">!</div>

                        <Title level={4} className="loading-title">
                            {message}
                        </Title>

                        <Text type="secondary">
                            页面暂时无法正常展示，请检查网络后重试。
                        </Text>

                        {onRetry && (
                            <div className="loading-action">
                                <Button
                                    type="primary"
                                    icon={<ReloadOutlined />}
                                    onClick={onRetry}
                                >
                                    重新加载
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default LoadingPage;

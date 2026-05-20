import { useEffect, useCallback, useRef } from 'react';
import { Modal, Alert, Space, Button, message } from 'antd';
import { useHanwangSign } from '@/hooks/useHanwangSign';

const HanwangSignatureModal = ({
    open,
    onOk,
    onCancel,
    confirmLoading,
    okText = '确认上传',
    cancelText = '取消',
    destroyOnHidden = true,
    ...restProps
}) => {
    const { connected, signing, preview, startSign, reset } = useHanwangSign(open);
    const prevOpenRef = useRef(false);

    useEffect(() => {
        if (prevOpenRef.current && !open) {
            reset();
        }
        prevOpenRef.current = open;
    }, [open, reset]);

    const handleStartSign = useCallback(async () => {
        try {
            await startSign();
        } catch (error) {
            message.error(error?.message || '签名失败');
        }
    }, [startSign]);

    const handleOk = async () => {
        if (!preview) {
            message.warning('请先在签字板上完成签名');
            return Promise.reject();
        }
        await onOk?.(preview);
    };

    const handleCancel = () => {
        reset();
        onCancel?.();
    };

    const previewSrc = preview
        ? preview.startsWith('data:')
            ? preview
            : `data:image/png;base64,${preview}`
        : '';

    return (
        <Modal
            title="签名信息"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            okText={okText}
            cancelText={cancelText}
            confirmLoading={confirmLoading}
            destroyOnHidden={destroyOnHidden}
            {...restProps}
        >
            {!connected && (
                <Alert
                    type="warning"
                    showIcon
                    message="未连接汉王签名服务，请启动本地服务后重试"
                    style={{ marginBottom: 12 }}
                />
            )}
            <div style={{ textAlign: 'center', minHeight: 160 }}>
                {previewSrc ? (
                    <img
                        src={previewSrc}
                        alt="签名预览"
                        style={{ maxWidth: '100%', maxHeight: 220 }}
                    />
                ) : (
                    <span style={{ color: '#909399' }}>
                        请点击「开始签名」，在签字板上签名并确认
                    </span>
                )}
            </div>
            <Space style={{ marginTop: 12 }}>
                <Button
                    type="primary"
                    loading={signing}
                    disabled={!connected}
                    onClick={handleStartSign}
                >
                    开始签名
                </Button>
                <Button onClick={reset}>清空</Button>
            </Space>
        </Modal>
    );
};

export default HanwangSignatureModal;

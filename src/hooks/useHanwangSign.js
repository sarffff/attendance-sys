import { useCallback, useEffect, useRef, useState } from 'react';
import { hanwangSign as sign } from '@/vendor/hanwang/sign';

const DEFAULT_WND = { width: 600, height: 400, imgWidth: 250, imgHeight: 150 };

export function useHanwangSign(enabled = true) {
  const [connected, setConnected] = useState(false);
  const [signing, setSigning] = useState(false);
  const [preview, setPreview] = useState('');
  const aspectRatioRef = useRef(null);
  const deviceReadyRef = useRef(false);
  const signingRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setConnected(false);
      return undefined;
    }

    sign.connectWebSocket((ok) => setConnected(!!ok));
    return () => sign.disconnectWebSocket();
  }, [enabled]);

  const checkDevice = useCallback(() => {
    return new Promise((resolve, reject) => {
      sign.getDeviceStatus((res) => {
        if (res.msgID !== 0) {
          reject(new Error(res.message || '设备不可用'));
          return;
        }
        const [w, h] = res.aspectRatio.split(':').map(Number);
        aspectRatioRef.current = (w / h).toFixed(4);
        deviceReadyRef.current = true;
        resolve(res);
      });
    });
  }, []);

  const calcWindowSize = useCallback(() => {
    let { width: wndWidth, height: wndHeight } = DEFAULT_WND;
    const ar = aspectRatioRef.current;
    if (!ar) return { wndWidth, wndHeight, ...DEFAULT_WND };

    const ratio = (wndWidth / wndHeight).toFixed(4);
    if (+ratio > +ar) wndWidth = Math.round(wndHeight * ar);
    else wndHeight = Math.round(wndWidth / ar);

    return {
      wndWidth,
      wndHeight,
      imgWidth: DEFAULT_WND.imgWidth,
      imgHeight: DEFAULT_WND.imgHeight,
    };
  }, []);

  const waitForConnection = useCallback((timeout = 5000) => {
    return new Promise((resolve) => {
      if (connected) {
        resolve(true);
        return;
      }
      const startTime = Date.now();
      const checkConnection = () => {
        if (connected || sign.isConnectWS) {
          resolve(true);
          return true;
        }
        return false;
      };
      if (checkConnection()) return;
      const interval = setInterval(() => {
        if (checkConnection()) {
          clearInterval(interval);
          return;
        }
        if (Date.now() - startTime >= timeout) {
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
    });
  }, [connected]);

  const startSign = useCallback(async () => {
    if (!connected) {
      const connectedOk = await waitForConnection(5000);
      if (!connectedOk) {
        throw new Error('未连接签名服务，请确认汉王本地服务已启动');
      }
    }
    if (!deviceReadyRef.current) await checkDevice();

    setPreview('');
    const { wndWidth, wndHeight, imgWidth, imgHeight } = calcWindowSize();

    return new Promise((resolve, reject) => {
      sign.startSign(
        (res) => {
          if (res.msgID !== 0) {
            setSigning(false);
            reject(new Error(res.message || '打开签字板失败'));
            return;
          }
          setSigning(true);
          signingRef.current = true;
          sign.getSign((signRes) => {
            setSigning(false);
            signingRef.current = false;
            if (signRes.msgID !== 0) {
              reject(new Error(signRes.message || '获取签名失败'));
              return;
            }
            setPreview(signRes.message);
            sign.endSign(() => resolve(signRes.message));
          });
        },
        -1,
        -1,
        wndWidth,
        wndHeight,
        imgWidth,
        imgHeight,
        0, // 仅签名，不用指纹
        30,
        1, // showDialog
      );
    });
  }, [connected, checkDevice, calcWindowSize, waitForConnection]);

  const reset = useCallback(() => {
    setPreview('');
    setSigning(false);
    if (signingRef.current && sign.isConnectWS) {
      signingRef.current = false;
      sign.endSign(() => { });
    }
  }, []);

  return { connected, signing, preview, checkDevice, startSign, reset };
}
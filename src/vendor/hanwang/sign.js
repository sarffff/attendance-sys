const sign = {
  isConnectWS: false,
  shouldReconnect: true,
  websocket: null,
  wsUrls: ['ws://127.0.0.1:29999/', 'ws://localhost:29999/'],
  currentUrlIndex: 0,
  getOSParams: {
    HWPenSign: 'HWGetOS',
  },
  deviceStatusParams: {
    HWPenSign: 'HWGetDeviceStatus',
  },
  deviceIdParams: {
    HWPenSign: 'HWGetDeviceId',
  },
  startSignParams: {
    HWPenSign: 'HWInitialize',
    key: '7B68AA9F27255B17FCB7B14BED5514D4',
    title: '请在签字板上签名',
    showDialog: 1,
    nOrgX: 300,
    nOrgY: 300,
    nWidth: 500,
    nHeight: 300,
    nButtonHeight: 50,
    nImageWidth: -1,
    nImageHeight: -1,
    nFingerCap: 0,
    nConfirmTimeout: 30,
  },
  getSignSourceDataParams: {
    HWPenSign: 'HWGetSignSourceData',
  },
  loadSignSourceDataParams: {
    HWPenSign: 'HWLoadSignSourceData',
    data: '',
  },
  endSignParams: {
    HWPenSign: 'HWFinalize',
  },
  connectCallback: null,
  getOSCallback: null,
  getDeviceStatusCallback: null,
  getDeviceIdCallback: null,
  startSignCallback: null,
  endSignCallback: null,
  signConfirmCallback: null,
  getSignSourceDataCallback: null,
  loadSignSourceDataCallback: null,
  reSetSignParam: function () {
    sign.startSignParams.nOrgX = -1;
    sign.startSignParams.nOrgY = -1;
    sign.startSignParams.nWidth = 500;
    sign.startSignParams.nHeight = 300;
    sign.startSignParams.nImageWidth = -1;
    sign.startSignParams.nImageHeight = -1;
    sign.startSignParams.nConfirmTimeout = 30;
    sign.startSignParams.nFingerCap = 0;
    sign.startSignParams.nButtonHeight = 60;
    sign.startSignParams.showDialog = 1;
  },
  logMessage: function (message) {
    if (typeof window.onHandleMessage !== 'undefined') {
      window.onHandleMessage(message);
    } else {
      console.log(message);
    }
  },
  connectWebSocket: function (callback) {
    sign.connectCallback = callback;
    sign.shouldReconnect = true;

    if (sign.websocket) {
      const existing = sign.websocket;
      sign.websocket = null;
      existing.onopen = null;
      existing.onclose = null;
      existing.onerror = null;
      existing.onmessage = null;
      if (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING) {
        existing.close();
      }
    }

    let ws;
    const currentUrl = sign.wsUrls[sign.currentUrlIndex];
    if ('WebSocket' in window) {
      ws = new WebSocket(currentUrl);
    } else if ('MozWebSocket' in window) {
      ws = new MozWebSocket(currentUrl);
    } else {
      window.alert('浏览器不支持WebSocket');
      return;
    }

    sign.websocket = ws;
    ws.binaryType = 'arraybuffer';

    ws.onopen = function () {
      if (sign.websocket !== ws) {
        console.log('onopen ignored: websocket mismatch', { signWs: sign.websocket, ws });
        return;
      }
      console.log('链接签名服务成功，URL: ', currentUrl);
      sign.isConnectWS = true;
      sign.currentUrlIndex = 0; // 成功后重置回第一个URL
      sign.connectCallback?.(true);
    };

    ws.onmessage = function (evt) {
      if (sign.websocket !== ws) return;
      sign.wsMessage(evt);
    };

    ws.onclose = function (evt) {
      if (sign.websocket !== ws && sign.websocket !== null) {
        console.log('onclose ignored: websocket mismatch', { signWs: sign.websocket, ws, wasNull: sign.websocket === null });
        return;
      }

      console.log('链接关闭', evt, 'code:', evt.code, 'reason:', evt.reason);
      sign.isConnectWS = false;

      if (sign.websocket === ws) {
        sign.websocket = null;
      }

      console.log('calling connectCallback with false');
      sign.connectCallback?.(false);

      if (sign.shouldReconnect) {
        setTimeout(() => {
          if (sign.shouldReconnect && !sign.websocket) {
            sign.connectWebSocket(sign.connectCallback);
          }
        }, 1000);
      }
    };

    ws.onerror = function (evt) {
      if (sign.websocket !== ws) return;
      console.log('WebSocket错误', evt, 'URL:', currentUrl);
      // 尝试下一个URL
      sign.currentUrlIndex = (sign.currentUrlIndex + 1) % sign.wsUrls.length;
      // 调用connectCallback通知连接失败
      if (sign.websocket === ws) {
        sign.isConnectWS = false;
        sign.connectCallback?.(false);
      }
    };
  },
  sendMsg: function (param) {
    const ws = sign.websocket;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket 未就绪，跳过发送', param);
      return false;
    }

    console.log('发送信息', param);
    if (typeof param !== 'string') {
      ws.send(JSON.stringify(param));
    } else {
      ws.send(param);
    }
    return true;
  },
  wsMessage: function (res) {
    console.log('server response:', res);
    const data = JSON.parse(res.data);
    const cmd = data.HWPenSign;
    switch (cmd) {
      case 'HWGetOS':
        sign.getOSCallback?.(data);
        break;
      case 'HWGetDeviceStatus':
        sign.getDeviceStatusCallback?.(data);
        break;
      case 'HWGetDeviceId':
        sign.getDeviceIdCallback?.(data);
        break;
      case 'HWInitialize':
        sign.startSignCallback?.(data);
        break;
      case 'HWGetSign':
        sign.signConfirmCallback?.(data);
        break;
      case 'HWFinalize':
        sign.endSignCallback?.(data);
        break;
      default:
        break;
    }
  },
  disconnectWebSocket: function () {
    sign.shouldReconnect = false;

    if (!sign.websocket) {
      sign.isConnectWS = false;
      return false;
    }

    const ws = sign.websocket;
    sign.websocket = null;
    sign.isConnectWS = false;
    ws.onopen = null;
    ws.onclose = null;
    ws.onerror = null;
    ws.onmessage = null;

    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }

    return true;
  },
  onSocketError: function () {
    sign.logMessage('连接检测服务有问题...');
  },
  getOS: function (callback) {
    sign.getOSCallback = callback;
    sign.sendMsg(sign.getOSParams);
  },
  getDeviceStatus: function (callback) {
    sign.getDeviceStatusCallback = callback;
    sign.sendMsg(sign.deviceStatusParams);
  },
  getDeviceId: function (callback) {
    sign.getDeviceIdCallback = callback;
    sign.sendMsg({ HWPenSign: 'HWGetDeviceId' });
  },
  startSign: function (
    callback,
    orgX,
    orgY,
    width,
    height,
    imgwidth,
    imgheight,
    fgrCap,
    timeout,
    showDialog,
  ) {
    sign.reSetSignParam();
    sign.startSignCallback = callback;
    if (orgX > 0) sign.startSignParams.nOrgX = orgX;
    if (orgY > 0) sign.startSignParams.nOrgY = orgY;
    if (width > 0) sign.startSignParams.nWidth = width;
    if (height > 0) sign.startSignParams.nHeight = height;
    if (imgwidth > 0) sign.startSignParams.nImageWidth = imgwidth;
    if (imgheight > 0) sign.startSignParams.nImageHeight = imgheight;
    if (timeout > 0) sign.startSignParams.nConfirmTimeout = timeout;
    if (fgrCap >= 0) sign.startSignParams.nFingerCap = fgrCap;
    if (showDialog === 0 || showDialog === 1) {
      sign.startSignParams.showDialog = showDialog;
    }
    sign.sendMsg(sign.startSignParams);
  },
  getSign: function (callback) {
    sign.signConfirmCallback = callback;
  },
  endSign: function (callback) {
    sign.endSignCallback = callback;
    if (!sign.sendMsg(sign.endSignParams)) {
      sign.endSignCallback = null;
      callback?.({ msgID: -1, message: '签名服务未连接' });
    }
  },
};

export const hanwangSign = sign;

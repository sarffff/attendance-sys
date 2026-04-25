import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./store";
import { BrowserRouter } from "react-router-dom";

// Ant Design 相关
import zhCN from "antd/es/locale/zh_CN";
import { ConfigProvider } from "antd";
import 'dayjs/locale/zh-cn';

createRoot(document.getElementById("root")).render(
    <ConfigProvider locale={zhCN}>
        <StrictMode>
            <Provider store={store}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </Provider>
        </StrictMode>
    </ConfigProvider>,
);

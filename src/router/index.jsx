import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { menuConfig } from "@/config/menuConfig";
import Login from "@/pages/login";
import AppLayout from "@/layouts";


const hasPermission = (item, userInfo) => {
    if (item.roles === null) return true;
    return (
        item.roles.includes(userInfo?.roleCode)
    );
};

export const getRoutes = (userInfo) => {
    const children = menuConfig
        .filter(item => hasPermission(item, userInfo))
        .map(({ key, element }) => ({
            path: key === '/' ? '/' : key.replace('/', ''),
            element,
        }));

    // console.log("生成的路由：", children);

    return [
        {
            path: '/login',
            element: <Login />,
        },
        {
            path: '/',
            element: (
                <ProtectedRoute>
                    <AppLayout />
                </ProtectedRoute>
            ),
            children,
        },
    ];
};
export const createRouter = (userInfo) => {
    return createBrowserRouter(getRoutes(userInfo));
};

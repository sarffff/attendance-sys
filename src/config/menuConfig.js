import React, { lazy, Suspense } from 'react';
import {
    AppstoreOutlined,
    FileSearchOutlined,
    CalendarOutlined,
    UserAddOutlined,
    GroupOutlined,
    DeploymentUnitOutlined,
} from '@ant-design/icons';

import {
    ApprovableRoleList,
    superRoleList,
    commonRoleList,
} from '@/constants/roleCode';

import LoadingPage from '@/components/LoadingPage';

const Dashboard = lazy(() => import('@/pages/dashboard'));
const Approval = lazy(() => import('@/pages/approvaLeave'));
const InitiateLeave = lazy(() => import('@/pages/initiateLeave'));
const OrganizationSettings = lazy(() => import('@/pages/org_settings'));
const UserSettings = lazy(() => import('@/pages/user_settings'));
const ApproveSettings = lazy(() => import('@/pages/approve_settings'));

const withSuspense = (Component) => {
     React.createElement(
        Suspense,
        {
            fallback: React.createElement(LoadingPage),
        },
        React.createElement(Component)
    );

}

export const menuConfig = [
    {
        key: '/',
        icon: AppstoreOutlined,
        label: '控制台',
        roles: null,
        element: withSuspense(Dashboard),
    },
    {
        key: '/approve',
        icon: FileSearchOutlined,
        label: '审批流程',
        roles: ApprovableRoleList,
        element: withSuspense(Approval),
    },
    {
        key: '/initiate',
        icon: CalendarOutlined,
        label: '请假申请',
        roles: commonRoleList,
        element: withSuspense(InitiateLeave),
    },
    {
        key: '/organization-settings',
        icon: GroupOutlined,
        label: '组织管理',
        roles: superRoleList,
        element: withSuspense(OrganizationSettings),
    },
    {
        key: '/user-settings',
        icon: UserAddOutlined,
        label: '用户管理',
        roles: superRoleList,
        element: withSuspense(UserSettings),
    },
    {
        key: '/approve-settings',
        icon: DeploymentUnitOutlined,
        label: '权限管理',
        roles: superRoleList,
        element: withSuspense(ApproveSettings),
    },
];

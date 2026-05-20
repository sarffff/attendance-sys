import React, { lazy, Suspense } from 'react';
import {
    AppstoreOutlined,
    FileSearchOutlined,
    CalendarOutlined,
    UserAddOutlined,
    GroupOutlined,
    DeploymentUnitOutlined,
    SnippetsOutlined
} from '@ant-design/icons';

import {
    ApprovableRoleList,
    superRoleList,
    commonRoleList,
    AllLedgerRoleList
} from '@/constants/roleCode';

import LoadingPage from '@/components/LoadingPage';
const Dashboard = lazy(() => import('@/pages/dashboard'));
const Approval = lazy(() => import('@/pages/approver/approveLeave'));
const InitiateLeave = lazy(() => import('@/pages/admin/initiateLeave'));
const OrganizationSettings = lazy(() => import('@/pages/super_admin/org_settings'));
const UserSettings = lazy(() => import('@/pages/super_admin/user_settings'));
const ApproveSettings = lazy(() => import('@/pages/super_admin/approve_settings'));
const LeavesSettings = lazy(() => import('@/pages/super_admin/leaves_settings'));
const LeaveHistory = lazy(() => import('@/pages/leave_history'));
const MyLedger = lazy(() => import('@/pages/admin/myLedger'));
const AdminEmployeeBasic = lazy(() => import('@/pages/admin/employee_basic'));
const ApproveLedger = lazy(() => import('@/pages/approver/approveLedger'));
const AllLedger = lazy(() => import('@/pages/super_admin/allLedger'));
const BasicLedger = lazy(() => import('@/pages/super_admin/basicLedger'));
const ConfigLedger = lazy(() => import('@/pages/super_admin/configLedger'));
const EmployeeBasic = lazy(() => import('@/pages/super_admin/employee_basic'));
const HRLedgerDetail = lazy(() => import('@/pages/hrLedgerDetail'));
const HrAllLedger = lazy(() => import('@/pages/admin/allLedger'));
const AllEmployeeBasic = lazy(() => import('@/pages/admin/all_employee_basic'));


const withSuspense = (Component) => {
    return React.createElement(
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
        key: '/leave-history',
        icon: CalendarOutlined,
        label: '请假历史',
        roles: commonRoleList.concat(ApprovableRoleList),
        element: withSuspense(LeaveHistory),
    },
    {
        key: '/approve-ledger',
        icon: FileSearchOutlined,
        label: '待审批台账',
        roles: ApprovableRoleList.filter((item) => item === 'ORG_PRINCIPAL'),
        element: withSuspense(ApproveLedger),
    },
    {
        key: '/my-ledger',
        icon: CalendarOutlined,
        label: '我的台账',
        roles: commonRoleList,
        element: withSuspense(MyLedger),
        isCommon: true,
    },
    {
        key: '/admin-employee-basic',
        icon: CalendarOutlined,
        label: '现员表信息',
        roles: commonRoleList,
        element: withSuspense(AdminEmployeeBasic),
        isCommon: true,
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
    {
        key: '/leaves-settings',
        icon: SnippetsOutlined,
        label: '请假管理',
        roles: superRoleList,
        element: withSuspense(LeavesSettings),
    },
    {
        key: '/all-ledger',
        icon: CalendarOutlined,
        label: '所有台账',
        roles: superRoleList,
        element: withSuspense(AllLedger),
    },
    {
        key: '/employee-basic',
        icon: CalendarOutlined,
        label: '现员表信息',
        roles: superRoleList,
        element: withSuspense(EmployeeBasic),
    },
    {
        key: '/basic-ledger',
        icon: CalendarOutlined,
        label: '基础台账',
        roles: superRoleList,
        element: withSuspense(BasicLedger),
    },
    {
        key: '/config-ledger',
        icon: CalendarOutlined,
        label: '配置台账',
        roles: superRoleList,
        element: withSuspense(ConfigLedger),
    },
    {
        key: '/hr-ledger-detail',
        icon: FileSearchOutlined,
        label: '台账详情',
        roles: null,
        element: withSuspense(HRLedgerDetail),
    },
    {
        key: '/all-ledger',
        icon: CalendarOutlined,
        label: '所有台账',
        roles: AllLedgerRoleList,
        element: withSuspense(HrAllLedger),
        isAll: true,
    },
    {
        key: '/all-employee-basic',
        icon: CalendarOutlined,
        label: '所有现员表',
        roles: AllLedgerRoleList,
        element: withSuspense(AllEmployeeBasic),
        isAll: true,
    }
];

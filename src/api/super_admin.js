import request from '@/utils/request';

//新增组织
export const orgAddApi = (data) => {
  return request({
    url: '/admin/org-units',
    method: 'POST',
    data
  });
};

//获取组织列表
export const orgListApi = (params) => {
  return request({
    url: '/admin/org-units',
    method: 'GET',
    params
  });
};

//编辑组织
export const orgEditApi = (orgUnitId, data) => {
  return request({
    url: `/admin/org-units/${orgUnitId}`,
    method: 'PUT',
    data
  });
};

//启停用组织
export const orgToggleApi = (orgUnitId, data) => {
  return request({
    url: `/admin/org-units/${orgUnitId}/enabled`,
    method: 'PATCH',
    data
  });
};

//新增用户
export const userAddApi = (data) => {
  return request({
    url: '/admin/users',
    method: 'POST',
    data
  });
};

//获取用户列表
export const userListApi = (params) => {
  return request({
    url: '/admin/users',
    method: 'GET',
    params
  });
};

//编辑用户
export const userEditApi = (userId, data) => {
  return request({
    url: `/admin/users/${userId}`,
    method: 'PUT',
    data
  });
};

//启停用用户
export const userToggleApi = (userId, data) => {
  return request({
    url: `/admin/users/${userId}/enabled`,
    method: 'PATCH',
    data
  });
};

//重置密码
export const userResetPasswordApi = (userId, data) => {
  return request({
    url: `/admin/users/${userId}/reset-password`,
    method: 'POST',
    data
  });
};

//保存审批权限
export const approveAuthSaveApi = (data) => {
  return request({
    url: '/admin/approval-permissions',
    method: 'POST',
    data
  });
};

//获取审批权限列表
export const approveAuthListApi = (params) => {
  return request({
    url: '/admin/approval-permissions',
    method: 'GET',
    params
  });
};

//启停用审批权限
export const approveAuthToggleApi = (permissionId, data) => {
  return request({
    url: `/admin/approval-permissions/${permissionId}/enabled`,
    method: 'PATCH',
    data
  });
};

//保存签字要求
export const signatureRequireSaveApi = (data) => {
  return request({
    url: '/admin/leave-sign-requirements',
    method: 'POST',
    data
  });
};

//获取签字要求列表
export const signatureRequireListApi = () => {
  return request({
    url: '/admin/leave-sign-requirements',
    method: 'GET'
  });
};

//发送消息
export const messageSendApi = (data) => {
  return request({
    url: '/admin/messages',
    method: 'POST',
    data
  });
};

//获取所有请假记录列表
export const allLeaveListApi = (params) => {
  return request({
    url: '/admin/leaves',
    method: 'GET',
    params
  });
}

//修改请假单申请时间
export const leaveApplyTimeEditApi = (leaveId, data) => {
  return request({
    url: `/leaves/${leaveId}/submitted-at`,
    method: 'PUT',
    data
  });
}

//修改审批时间
export const leaveApproveTimeEditApi = (leaveId, data) => {
  return request({
    url: `/leaves/${leaveId}/signature-date`,
    method: 'PATCH',
    data
  });
}

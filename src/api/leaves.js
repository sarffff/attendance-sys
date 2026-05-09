import request from '@/utils/request'

//获取本月请假单列表
export const leacesMonthlyListApi = (params) => {
  return request({
    url: '/leaves',
    method: 'GET',
    params
  })
}

//获取近三个月请假单列表
export const leacesListThreeMonthApi = (params) => {
  return request({
    url: '/leaves/approval-list/recent-three-months',
    method: 'GET',
    params
  })
}

//获取请假单详情
export const leacesDetailApi = (leaveId) => {
  return request({
    url: `/leaves/${leaveId}`,
    method: 'GET'
  })
}

//获取请假类型
export const leacesTypeApi = () => {
  return request({
    url: '/leaves/types',
    method: 'GET'
  })
}

//获取请假状态
export const leacesStatusApi = () => {
  return request({
    url: '/leaves/statuses',
    method: 'GET'
  })
}

//提交请假申请
export const leacesApplyApi = (data) => {
  return request({
    url: '/leaves',
    method: 'POST',
    data
  })
}

//编辑请假申请
export const leacesEditApi = (leaveId, data) => {
  return request({
    url: `/leaves/${leaveId}`,
    method: 'PUT',
    data
  })
}

//删除请假申请
export const leacesDeleteApi = (leaveId) => {
  return request({
    url: `/leaves/${leaveId}`,
    method: 'DELETE'
  })
}

//审批请假申请
export const leacesApproveApi = (leaveId, formData) => {
  return request({
    url: `/leaves/${leaveId}/approve`,
    method: 'POST',
    data: formData
  })
}

//撤销请假申请
export const leacesRevokeApi = (leaveId, data) => {
  return request({
    url: `/leaves/${leaveId}/cancel`,
    method: 'POST',
    data
  })
}

//选择后续领导
export const leacesSelectLeaderApi = (leaveId, data) => {
  return request({
    url: `/leaves/${leaveId}/select-approvers`,
    method: 'POST',
    data
  })
}

//批量审批请假申请
export const leacesBatchApproveApi = (formatData) => {
  return request({
    url: '/leaves/batch-approve',
    method: 'POST',
    data: formatData
  })
}

//获取可选择的领导
export const leacesSelectLeaderListApi = (leaveId) => {
  return request({
    url: `/leaves/${leaveId}/selected-approvers`,
    method: 'GET'
  })
}

//打印单个请假单
export const leacesPrintApi = (leaveId) => {
  return request({
    url: `/leaves/${leaveId}/pdf`,
    method: 'GET'
  })
}

//打印多个请假单
export const leacesBatchPrintApi = (data) => {
  return request({
    url: '/leaves/pdf/batch',
    method: 'POST',
    data
  })
}

//上传手写签名
export const leacesUploadSignatureApi = (leaveId, formData) => {
  return request({
    url: `/leaves/${leaveId}/handwritten-signature`,
    method: 'POST',
    data: formData
  })
}

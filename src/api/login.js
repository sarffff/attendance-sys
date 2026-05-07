import request from '@/utils/request'

// 登录
export const loginApi = (data) => {
  return request({
    url: '/auth/login',
    method: 'POST',
    data
  })
}

//请假类别统计
export const  countLeaveTypeApi = () => {
  return request({
    url: '/auth/dashboard/leave-type-request-counts',
    method: 'GET'
  })
}

//待审批已审批统计
export const  countLeaveStatusApi = () => {
    return request({
      url: '/auth/dashboard/approval-stats',
      method: 'GET'
    })
}

//信息提示
export const  countLeaveInfoApi = (params) => {
    return request({
      url: '/auth/dashboard/messages',
      method: 'GET',
      params
    })
}

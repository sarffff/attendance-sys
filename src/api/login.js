import request from '@/utils/request'

// 登录
export const loginApi = (data) => {
  return request({
    url: '/auth/login',
    method: 'POST',
    data
  })
}

//账号工作台
export const accountApi = () => {
  return request({
    url: '/auth/dashboard',
    method: 'GET'
  })
}

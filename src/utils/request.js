import axios from 'axios'
import { store } from '@/store'
import { logout } from '@/store/modules/user'
import { message } from 'antd'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截
service.interceptors.request.use(config => {
  const token = store.getState().user.token
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

// 响应拦截
service.interceptors.response.use(
  res => {
    if (res.config.responseType === 'blob') {
      return res.data
    }

    const { success, message: msg, data } = res.data
    if (!success) {
      message.error(msg || "操作失败")
      return Promise.reject(new Error(msg || "操作失败"))
    }

    return data
  },
  err => {
    const msg = err.response?.data?.message || err.message || "请求失败"
    switch (err.response?.status) {
      case 401:
        message.error("登录已过期，请重新登录")
        store.dispatch(logout())
        window.location.href = '/login'
        break
      case 403:
        message.error("暂无权限")
        break
      case 500:
        message.error(msg)
        break
      default:
        message.error(msg)
    }

    console.error(err)
    return Promise.reject(new Error(msg))
  }
)
export default service

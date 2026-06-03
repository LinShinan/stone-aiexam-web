import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例（不设 baseURL，走 Vite 代理避免 CORS）
const request = axios.create({
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ===== 请求拦截器 =====
request.interceptors.request.use(
  config => {
    // 管理端：/api/admin/ 请求自动带 token
    if (config.url.includes('/api/admin/')) {
      const token = localStorage.getItem('token')
      if (token) config.headers.token = token
    }
    // 学生端：/api/student/ 请求自动带 studentToken
    if (config.url.includes('/api/student/')) {
      const studentToken = localStorage.getItem('studentToken')
      if (studentToken) config.headers.token = studentToken
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// ===== 响应拦截器 =====
request.interceptors.response.use(
  response => {
    const res = response.data

    // 业务状态码非 200 视为失败
    if (res.code !== 200) {
      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res
  },
  error => {
    // 401 → token 过期或无效，清除并跳转登录
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      ElMessage.error('登录已过期，请重新登录')
      window.location.href = '/admin/login'
      return Promise.reject(error)
    }

    const data = error.response?.data
    const msg = (typeof data === 'string' ? data : data?.message || data?.msg) || error.message
    console.error('响应错误:', msg, data)
    ElMessage.error(msg || '网络错误')
    return Promise.reject(error)
  }
)

export default request

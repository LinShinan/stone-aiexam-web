import request from '../utils/request'

// 获取公告列表
export function getNoticeList() {
  return request.get('/api/notices/list')
}

// 添加公告
export function addNotice(data) {
  return request.post('/api/notices/add', data)
}

// 更新公告
export function updateNotice(data) {
  return request.put('/api/notices/update', data)
}

// 启用或禁用公告
export function toggleNoticeStatus(id, isActive) {
  return request.put(`/api/notices/switch/${id}?isActive=${isActive}`)
}

// 删除公告
export function deleteNotice(id) {
  return request.delete(`/api/notices/delete/${id}`)
}

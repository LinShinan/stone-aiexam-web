import request from '../utils/request'

// 获取轮播图列表
export function getBannerList() {
  return request.get('/api/banners/list')
}

// 添加轮播图
export function addBanner(data) {
  return request.post('/api/banners/add', data)
}

// 更新轮播图
export function updateBanner(data) {
  return request.put('/api/banners/update', data)
}

// 启用或禁用轮播图
export function toggleBannerStatus(id, isActive) {
  return request.put(`/api/banners/switch/${id}?isActive=${isActive}`)
}

// 删除轮播图
export function deleteBanner(id) {
  return request.delete(`/api/banners/delete/${id}`)
}

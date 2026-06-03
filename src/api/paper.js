import request from '../utils/request'

/**
 * 试卷相关的API
 */

// 手动创建试卷
export function createPaper(data) {
  return request({
    url: '/api/admin/papers',
    method: 'post',
    data
  })
}

// AI智能组卷
export function createPaperWithAI(data) {
  return request({
    url: '/api/admin/papers/smart',
    method: 'post',
    data
  })
}

// 获取试卷详情（管理端）
export function getPaperById(id) {
  return request({
    url: `/api/admin/papers/${id}`,
    method: 'get'
  })
}

// 获取试卷详情（公共端，无需登录）
export function getPublicPaperById(id) {
  return request({
    url: `/api/common/papers/${id}`,
    method: 'get'
  })
}

// 获取所有试卷列表（管理端）
export function getPapers(params) {
  return request({
    url: '/api/admin/papers/list',
    method: 'get',
    params
  })
}

// 获取已发布试卷列表（公共端，无需登录）
export function getPublicPapers(params) {
  return request({
    url: '/api/common/papers/list',
    method: 'get',
    params
  })
}

// 更新试卷状态
export function updatePaperStatus(id, status) {
  return request.patch(`/api/admin/papers/${id}/status?status=${status}`)
}
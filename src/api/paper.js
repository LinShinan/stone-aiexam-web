import request from '../utils/request'

/**
 * 试卷相关的API
 */

// 手动创建试卷
export function createPaper(data) {
  return request({
    url: '/api/papers',
    method: 'post',
    data
  })
}

// AI智能组卷
export function createPaperWithAI(data) {
  return request({
    url: '/api/papers/smart',
    method: 'post',
    data
  })
}

// 获取试卷详情
export function getPaperById(id) {
  return request({
    url: `/api/papers/${id}`,
    method: 'get'
  })
}

// 获取所有试卷列表
export function getPapers(params) {
  return request({
    url: '/api/papers/list',
    method: 'get',
    params
  })
}

// 更新试卷状态
export function updatePaperStatus(id, status) {
  return request.patch(`/api/papers/${id}/status?status=${status}`)
}
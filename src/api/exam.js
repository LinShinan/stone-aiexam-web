import request from '../utils/request'

/**
 * 考试相关的API — 按新接口规范：学生端 /api/student/exams/、管理端 /api/admin/exams/、公共 /api/common/exams/
 */

// ===== 学生端 =====

// 开始考试（学生信息由后端从 token 解析）
export function startExam(paperId) {
  return request({
    url: '/api/student/exams/start',
    method: 'post',
    data: { paperId }
  })
}

// 提交答案
export function submitAnswers(examRecordId, data) {
  return request({
    url: `/api/student/exams/${examRecordId}/submit`,
    method: 'post',
    data
  })
}

// 获取考试记录详情
export function getExamRecordById(id) {
  return request({
    url: `/api/student/exams/${id}`,
    method: 'get'
  })
}

// 获取我的考试记录
export function getMyExamRecords() {
  return request({
    url: '/api/student/exams/my-list',
    method: 'get'
  })
}

// 获取个人信息
export function getStudentProfile() {
  return request({
    url: '/api/student/users/profile',
    method: 'get'
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/api/student/users/password',
    method: 'put',
    data
  })
}

// ===== 管理端 =====

// 获取考试记录详情
export function getAdminExamRecordById(id) {
  return request.get(`/api/admin/exams/${id}`)
}

// 分页查询考试记录
export function getExamRecords(params) {
  return request.get('/api/admin/exams/list', { params })
}

// AI 自动批阅
export function gradeExam(examRecordId) {
  return request({
    url: `/api/admin/exams/${examRecordId}/grade`,
    method: 'post'
  })
}

// 删除考试记录
export function deleteExamRecord(id) {
  return request.delete(`/api/admin/exams/${id}`)
}

// ===== 公共 =====

// 获取考试排行榜
export function getExamRanking(params) {
  return request.get('/api/common/exams/ranking', { params })
}

import request from '../utils/request'

// ===== 题目 CRUD =====

export function getQuestionList(params) {
  return request.get('/api/admin/questions/list', { params })
}

export function createQuestion(data) {
  return request.post('/api/questions', data)
}

export function updateQuestion(id, data) {
  return request.put(`/api/questions/${id}`, data)
}

export function deleteQuestion(id) {
  return request.delete(`/api/questions/${id}`)
}

// ===== 分类 =====

export function getCategoryTree() {
  return request.get('/api/common/categories/tree')
}

// ===== 批量导入 =====

export function getQuestionTemplate() {
  return fetch('/api/admin/questions/batch/template').then(res => res.blob())
}

export function previewExcelData(formData) {
  return request.post('/api/admin/questions/batch/preview-excel', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function batchImportQuestions(data) {
  return request.post('/api/admin/questions/batch/import', data)
}

// ===== AI 生成 =====

export function aiGenerateQuestions(data, options = {}) {
  return request.post('/api/admin/questions/batch/ai-generate', data, options)
}

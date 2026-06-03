<template>
  <div class="exam-start-container">
    <!-- 背景装饰 -->
    <div class="bg-orb bg-orb--1"></div>
    <div class="bg-orb bg-orb--2"></div>
    <div class="bg-orb bg-orb--3"></div>

    <div class="exam-start-card">
      <!-- 头部 -->
      <div class="card-header">
        <div class="header-icon">
          <el-icon :size="36"><EditPen /></el-icon>
        </div>
        <h2 class="title">开始考试</h2>
        <p class="subtitle">请确认试卷信息并填写姓名后开始</p>
      </div>

      <!-- 试卷信息 -->
      <div class="paper-info" v-if="paperInfo">
        <h3 class="paper-name">{{ paperInfo.name }}</h3>
        <p class="paper-description">{{ paperInfo.description || '暂无描述' }}</p>
        <div class="paper-stats">
          <div class="stat-item">
            <div class="stat-icon stat-icon--count">
              <el-icon><Collection /></el-icon>
            </div>
            <div class="stat-text">
              <span class="stat-value">{{ paperInfo.questionCount }}</span>
              <span class="stat-label">道题目</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon stat-icon--score">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="stat-text">
              <span class="stat-value">{{ paperInfo.totalScore }}</span>
              <span class="stat-label">总分</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon stat-icon--time">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-text">
              <span class="stat-value">{{ paperInfo.duration }}</span>
              <span class="stat-label">分钟</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="exam-form"
        @submit.prevent="handleStartExam"
      >
        <el-form-item prop="studentName">
          <el-input
            v-model="form.studentName"
            placeholder="请输入您的姓名"
            size="large"
            maxlength="20"
            show-word-limit
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            @click="handleStartExam"
            :loading="loading"
            class="start-btn"
          >
            <span v-if="!loading">开始考试</span>
            <el-icon class="btn-arrow"><ArrowRight /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 考试规则 -->
      <div class="exam-rules">
        <div class="rules-header">
          <el-icon><WarningFilled /></el-icon>
          <h4>考试规则</h4>
        </div>
        <div class="rules-list">
          <div class="rule-item">
            <span class="rule-dot"></span>
            <span>请确保网络连接稳定</span>
          </div>
          <div class="rule-item">
            <span class="rule-dot"></span>
            <span>考试过程中请勿切换窗口或刷新页面</span>
          </div>
          <div class="rule-item">
            <span class="rule-dot"></span>
            <span>考试时间到后将自动交卷</span>
          </div>
          <div class="rule-item">
            <span class="rule-dot"></span>
            <span>提交后将无法修改答案</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPaperById } from '../api/paper.js'
import { startExam } from '../api/exam.js'
import {
  EditPen, Collection, Trophy, Clock, User, ArrowRight, WarningFilled
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const loading = ref(false)
const paperInfo = ref(null)

const form = ref({ studentName: '' })

const rules = {
  studentName: [
    { required: true, message: '请输入考生姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

const getPaperInfo = async () => {
  try {
    const paperId = route.params.paperId
    const res = await getPaperById(paperId)
    paperInfo.value = res.data
  } catch (error) {
    ElMessage.error('获取试卷信息失败')
    router.push('/exam/list')
  }
}

const handleStartExam = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    const paperId = route.params.paperId
    const res = await startExam(paperId, form.value.studentName)
    ElMessage.success('考试创建成功，正在跳转...')
    router.push(`/exam/${res.data.id}`)
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('开始考试失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => { getPaperInfo() })
</script>

<style scoped>
/* ===== 页面容器 ===== */
.exam-start-container {
  min-height: 100vh;
  background-color: #faf7f2;
  background-image:
    /* 网格线 — 淡暖灰，模拟活页纸横线 */
    linear-gradient(to right, #e8e0d5 1px, transparent 1px),
    linear-gradient(to bottom, #e8e0d5 1px, transparent 1px),
    /* 微噪点 — 纸质颗粒感 */
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
  background-size: 24px 24px, 24px 24px, 200px 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* ===== 主卡片 ===== */
.exam-start-card {
  background: #fff;
  border-radius: 24px;
  box-shadow:
    0 1px 3px rgba(0,0,0,0.04),
    0 4px 12px rgba(0,0,0,0.04),
    0 16px 40px rgba(0,0,0,0.06);
  padding: 48px 44px 40px;
  max-width: 540px;
  width: 100%;
  position: relative;
  z-index: 1;
  animation: cardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== 头部 ===== */
.card-header {
  text-align: center;
  margin-bottom: 36px;
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #6366f1;
}

.title {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
  letter-spacing: -0.3px;
}

.subtitle {
  color: #94a3b8;
  margin: 0;
  font-size: 14px;
}

/* ===== 试卷信息 ===== */
.paper-info {
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid #f1f5f9;
}

.paper-name {
  font-size: 18px;
  color: #0f172a;
  margin: 0 0 6px;
  font-weight: 700;
}

.paper-description {
  color: #94a3b8;
  margin: 0 0 20px;
  line-height: 1.5;
  font-size: 14px;
}

.paper-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: #fff;
  padding: 16px 12px;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
}
.stat-item:hover {
  border-color: #e2e8f0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.stat-icon--count { background: #eef2ff; color: #6366f1; }
.stat-icon--score { background: #fef3c7; color: #d97706; }
.stat-icon--time  { background: #ecfeff; color: #0891b2; }

.stat-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  font-family: 'JetBrains Mono', 'Cascadia Code', 'Consolas', monospace;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

/* ===== 表单 ===== */
.exam-form {
  margin-bottom: 28px;
}
.exam-form :deep(.el-form-item) {
  margin-bottom: 20px;
}
.exam-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}
.exam-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  box-shadow: none;
  padding: 6px 14px;
  transition: all 0.2s;
}
.exam-form :deep(.el-input__wrapper):hover {
  border-color: #cbd5e1;
}
.exam-form :deep(.el-input__wrapper.is-focus) {
  border-color: #6366f1;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}

/* ===== 开始按钮 ===== */
.start-btn {
  width: 100%;
  height: 50px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  background: #0f172a !important;
  border: none !important;
  color: #fff !important;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.start-btn:hover {
  background: #6366f1 !important;
  box-shadow: 0 8px 24px rgba(99,102,241,0.3);
  transform: translateY(-1px);
}
.start-btn :deep(span) {
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-arrow {
  transition: transform 0.25s ease;
}
.start-btn:hover .btn-arrow {
  transform: translateX(3px);
}

/* ===== 考试规则 ===== */
.exam-rules {
  background: #f8fafc;
  border-radius: 14px;
  padding: 20px 24px;
  border: 1px solid #f1f5f9;
  position: relative;
}
.exam-rules::before {
  content: '';
  position: absolute;
  left: 0; top: 16px; bottom: 16px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: #fbbf24;
}

.rules-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  color: #92400e;
}
.rules-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #78716c;
  font-size: 13px;
  line-height: 1.6;
}

.rule-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #d4d4d8;
  flex-shrink: 0;
  margin-top: 7px;
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .exam-start-card {
    padding: 36px 24px 32px;
    border-radius: 20px;
  }
  .title { font-size: 22px; }
  .paper-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .stat-item { padding: 12px 8px; }
  .stat-value { font-size: 20px; }
}
</style>

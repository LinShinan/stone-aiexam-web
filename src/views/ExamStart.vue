<template>
  <div class="exam-start-container">
    <div class="exam-start-card">
      <!-- 头部 -->
      <div class="card-header">
        <div class="header-icon">
          <el-icon :size="36"><EditPen /></el-icon>
        </div>
        <h2 class="title">开始考试</h2>
        <p class="subtitle">请确认试卷信息后开始考试</p>
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

      <!-- 考生信息（自动从登录态获取） -->
      <div class="student-info" v-if="studentName">
        <el-icon><User /></el-icon>
        <span>考生：<strong>{{ studentName }}</strong></span>
      </div>

      <!-- 开始按钮 -->
      <div class="exam-form">
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
      </div>

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
import { getPublicPaperById } from '../api/paper.js'
import { startExam } from '../api/exam.js'
import {
  EditPen, Collection, Trophy, Clock, User, ArrowRight, WarningFilled
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const paperInfo = ref(null)

// 从登录态获取考生姓名
const getStudentName = () => {
  try {
    const info = JSON.parse(localStorage.getItem('studentInfo') || '{}')
    return info.realName || info.username || ''
  } catch {
    return ''
  }
}
const studentName = getStudentName()

const getPaperInfo = async () => {
  try {
    const paperId = route.params.paperId
    const res = await getPublicPaperById(paperId)
    paperInfo.value = res.data
  } catch (error) {
    ElMessage.error('获取试卷信息失败')
    router.push('/exam/list')
  }
}

const handleStartExam = async () => {
  // 安全检查：未登录或姓名获取失败则跳转登录
  if (!studentName) {
    ElMessage.warning('请先登录后再参加考试')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  try {
    loading.value = true
    const paperId = route.params.paperId
    const res = await startExam(paperId)
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
/* ===== 页面容器 — 与首页 Home.vue 一致 ===== */
.exam-start-container {
  --bg-page: #f6f8fc;
  --bg-card: #ffffff;
  --border-card: #e8ecf4;
  --text-heading: #0f172a;
  --text-body: #475569;
  --text-muted: #8090a8;
  --accent-cyan: #06b6d4;
  --accent-green: #10b981;

  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Aura glow — 与首页一致 */
.exam-start-container::before {
  content: '';
  position: fixed; top: 0; left: 0; right: 0; height: 600px; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 80% 55% at 15% 0%, rgba(124,58,237,0.12) 0%, transparent 50%),
    radial-gradient(ellipse 60% 45% at 85% 5%, rgba(67,97,238,0.10) 0%, transparent 48%),
    radial-gradient(ellipse 50% 40% at 50% 40%, rgba(6,182,212,0.08) 0%, transparent 55%),
    linear-gradient(to bottom, #e8eef8 0%, #f2f4fb 30%, var(--bg-page) 100%);
}

/* ===== 主卡片 — 与首页卡片一致 ===== */
.exam-start-card {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06);
  padding: 48px 44px 40px;
  max-width: 540px;
  width: 100%;
  position: relative;
  z-index: 1;
  animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(20px); }
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
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(6,182,212,0.12), rgba(16,185,129,0.08));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #06b6d4;
}

.title {
  font-size: 1.55rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0 0 6px;
  letter-spacing: -0.3px;
}

.subtitle {
  color: var(--text-muted);
  margin: 0;
  font-size: 0.88rem;
}

/* ===== 试卷信息 ===== */
.paper-info {
  background: #f8fafc;
  border: 1px solid var(--border-card);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
}

.paper-name {
  font-size: 1.05rem;
  color: var(--text-heading);
  margin: 0 0 6px;
  font-weight: 700;
}

.paper-description {
  color: var(--text-muted);
  margin: 0 0 20px;
  line-height: 1.5;
  font-size: 0.88rem;
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
  border: 1px solid var(--border-card);
  transition: all 0.2s;
}
.stat-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(15,23,42,0.04);
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
.stat-icon--count { background: rgba(6,182,212,0.1); color: #0891b2; }
.stat-icon--score { background: rgba(245,158,11,0.1); color: #d97706; }
.stat-icon--time  { background: rgba(16,185,129,0.1); color: #059669; }

.stat-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-heading);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* ===== 考生信息 ===== */
.student-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  margin-bottom: 20px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  color: #0369a1;
  font-size: 0.9rem;
}
.student-info .el-icon {
  color: #0ea5e9;
}

/* ===== 开始按钮容器 ===== */
.exam-form {
  margin-bottom: 28px;
}

/* ===== 开始按钮 — 青绿渐变，与首页 CTA 一致 ===== */
.start-btn {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #06b6d4, #10b981) !important;
  border: none !important;
  color: #fff !important;
  letter-spacing: 0.5px;
  box-shadow: 0 0 16px rgba(6,182,212,0.3), 0 0 32px rgba(16,185,129,0.12);
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.start-btn:hover {
  box-shadow: 0 0 24px rgba(6,182,212,0.5), 0 0 48px rgba(16,185,129,0.25);
  transform: translateY(-1px);
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
  border: 1px solid var(--border-card);
  border-radius: 14px;
  padding: 20px 24px;
  position: relative;
}
.exam-rules::before {
  content: '';
  position: absolute;
  left: 0; top: 16px; bottom: 16px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: #06b6d4;
}

.rules-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  color: #0f172a;
}
.rules-header .el-icon {
  color: #06b6d4;
}
.rules-header h4 {
  margin: 0;
  font-size: 0.9rem;
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
  color: var(--text-body);
  font-size: 0.82rem;
  line-height: 1.6;
}

.rule-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #cbd5e1;
  flex-shrink: 0;
  margin-top: 7px;
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .exam-start-card {
    padding: 36px 24px 32px;
    border-radius: 16px;
  }
  .title { font-size: 1.3rem; }
  .paper-stats {
    gap: 8px;
  }
  .stat-item { padding: 12px 8px; }
  .stat-value { font-size: 1.2rem; }
}
</style>

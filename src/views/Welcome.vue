<template>
  <div class="welcome-page">
    <!-- 顶部欢迎区 — 与首页 hero-headline 呼应 -->
    <div class="welcome-hero">
      <span class="hero-badge">ADMIN · DASHBOARD</span>
      <h1 class="hero-greeting">{{ greetingText }}</h1>
      <p class="hero-date">{{ currentDate }} · 数据更新于 {{ lastUpdated }}</p>
    </div>

    <!-- 数据统计卡片 — 与首页 action-cards 一致 -->
    <div class="stats-row">
      <div
        v-for="(stat, index) in stats"
        :key="stat.label"
        class="stat-card"
        :style="{ animationDelay: (index * 0.08) + 's' }"
      >
        <template v-if="loading">
          <div class="stat-skeleton">
            <div class="skeleton-icon"></div>
            <div class="skeleton-lines">
              <div class="skeleton-line skeleton-line--short"></div>
              <div class="skeleton-line skeleton-line--long"></div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="stat-icon-wrap" :style="{ background: stat.gradient }">
            <el-icon :size="22"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-num" :style="{ fontFamily: numberFont }">{{ stat.display }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- 快捷操作 — 与首页 action-cards 一致 -->
    <div class="quick-section">
      <div class="quick-header">
        <span class="section-badge">快捷功能</span>
        <h2 class="section-title">管理核心模块</h2>
      </div>
      <div class="quick-grid">
        <div
          v-for="action in quickActions"
          :key="action.title"
          class="quick-card"
          :style="{ '--glow': action.glow }"
          @click="handleActionClick(action)"
        >
          <div class="quick-icon" :style="{ background: action.gradient }">
            <el-icon :size="22"><component :is="action.icon" /></el-icon>
          </div>
          <div class="quick-text">
            <span class="quick-title">{{ action.title }}</span>
            <span class="quick-desc">{{ action.desc }}</span>
          </div>
          <el-icon class="quick-arrow" :size="16"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Files, Bell, Folder, Promotion, List, ArrowRight } from '@element-plus/icons-vue'
import { getQuestionList } from '../api/question.js'
import { getPapers } from '../api/paper.js'
import { getExamRecords } from '../api/exam.js'
import { getNoticeList } from '../api/notice.js'

const router = useRouter()

const currentDate = ref('')
const greetingText = ref('')
const loading = ref(true)
const lastUpdated = ref('')
const numberFont = `'JetBrains Mono', 'Cascadia Code', 'Consolas', 'Monaco', monospace`

const getAdminName = () => {
  try {
    const info = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return info.username || info.realName || '管理员'
  } catch { return '管理员' }
}
const adminName = getAdminName()
const fullGreeting = `欢迎回来，${adminName}`

const stats = ref([
  { label: '题目总数', target: 0, current: 0, display: '—', icon: Document, gradient: 'linear-gradient(135deg, #6366f1, #7c3aed)' },
  { label: '试卷总数', target: 0, current: 0, display: '—', icon: Files, gradient: 'linear-gradient(135deg, #06b6d4, #10b981)' },
  { label: '考试记录', target: 0, current: 0, display: '—', icon: List, gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' },
  { label: '公告数量', target: 0, current: 0, display: '—', icon: Bell, gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)' },
])

const quickActions = ref([
  { title: '题目管理', desc: '增删改查题库', icon: Document, path: '/admin/question-manage', gradient: 'linear-gradient(135deg, #6366f1, #3b82f6)', glow: 'rgba(99,102,241,0.25)' },
  { title: '试卷管理', desc: '创建与管理试卷', icon: Files, path: '/admin/paper-manage', gradient: 'linear-gradient(135deg, #06b6d4, #10b981)', glow: 'rgba(6,182,212,0.25)' },
  { title: '发布公告', desc: '推送系统通知', icon: Promotion, path: '/admin/notice-manage', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', glow: 'rgba(245,158,11,0.25)' },
  { title: '分类管理', desc: '管理题目分类', icon: Folder, path: '/admin/category-manage', gradient: 'linear-gradient(135deg, #f43f5e, #ec4899)', glow: 'rgba(244,63,94,0.25)' },
])

async function fetchStats() {
  try {
    const [qRes, pRes, eRes, nRes] = await Promise.allSettled([
      getQuestionList({ page: 1, size: 1 }),
      getPapers({ page: 1, size: 1 }),
      getExamRecords({ page: 1, size: 1 }),
      getNoticeList(),
    ])
    if (qRes.status === 'fulfilled' && qRes.value?.data) {
      stats.value[0].target = qRes.value.data.total ?? qRes.value.data.length ?? 0
    }
    if (pRes.status === 'fulfilled' && pRes.value?.data) {
      const pData = pRes.value.data
      stats.value[1].target = pData.total ?? pData.length ?? (Array.isArray(pData) ? pData.length : 0)
    }
    if (eRes.status === 'fulfilled' && eRes.value?.data) {
      stats.value[2].target = eRes.value.data.total ?? eRes.value.data.length ?? 0
    }
    if (nRes.status === 'fulfilled' && nRes.value?.data) {
      const nData = nRes.value.data
      stats.value[3].target = Array.isArray(nData) ? nData.length : (nData.total ?? 0)
    }
  } catch { /* keep 0 */ }
}

function initDateTime() {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
  lastUpdated.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function startTypewriter() {
  let i = 0
  greetingText.value = ''
  function type() {
    if (i < fullGreeting.length) {
      greetingText.value += fullGreeting.charAt(i)
      i++
      setTimeout(type, 50 + Math.random() * 30)
    }
  }
  type()
}

function animateNumbers() {
  const duration = 1200
  stats.value.forEach((stat) => {
    const startTime = performance.now()
    function update(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      stat.current = Math.floor(stat.target * eased)
      stat.display = stat.current.toLocaleString()
      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        stat.current = stat.target
        stat.display = stat.target.toLocaleString()
      }
    }
    requestAnimationFrame(update)
  })
}

function handleActionClick(action) {
  router.push(action.path)
}

onMounted(async () => {
  initDateTime()
  startTypewriter()
  await fetchStats()
  loading.value = false
  await nextTick()
  animateNumbers()
})
</script>

<style scoped>
/* ============================================================
   DESIGN SYSTEM — 与首页 Home.vue 完全统一
   ============================================================ */
.welcome-page {
  --text-heading: #0f172a;
  --text-body: #475569;
  --text-muted: #8090a8;
  --border-card: #e8ecf4;
  --shadow-card: 0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06);
  --shadow-hover: 0 2px 8px rgba(15,23,42,0.06), 0 10px 28px rgba(15,23,42,0.08);
}

/* ============================================================
   欢迎 Hero 区 — 与首页 hero-headline 呼应
   ============================================================ */
.welcome-hero {
  text-align: center;
  padding: 40px 0 32px;
  animation: fadeInUp 0.5s ease both;
}

.hero-badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 600;
  color: #6366f1;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 14px;
  padding: 4px 14px;
  border-radius: 20px;
  background: rgba(99,102,241,0.06);
  border: 1px solid rgba(99,102,241,0.1);
}

.hero-greeting {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0 0 10px;
  letter-spacing: -0.5px;
}

.cursor-blink {
  display: inline-block;
  color: #06b6d4;
  font-weight: 300;
  animation: blink 1s step-end infinite;
}

.hero-date {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}

/* ============================================================
   统计卡片行
   ============================================================ */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  background: #fff;
  border: 1px solid var(--border-card);
  border-radius: 16px;
  padding: 22px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-card);
  transition: all 0.25s;
  animation: fadeInUp 0.5s ease both;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
  border-color: rgba(6,182,212,0.3);
}

/* 图标 */
.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon-wrap {
  transform: scale(1.1);
}

/* 数值+标签 */
.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-num {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-heading);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* 骨架屏 */
.stat-skeleton {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.skeleton-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(90deg, #e8ecf1 25%, #f0f3f7 50%, #e8ecf1 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
}

.skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(90deg, #e8ecf1 25%, #f0f3f7 50%, #e8ecf1 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line--short { width: 50px; }
.skeleton-line--long  { width: 80px; height: 20px; border-radius: 10px; }

/* ============================================================
   快捷操作 — 与首页 action-cards 一致
   ============================================================ */
.quick-section {
  background: #fff;
  border: 1px solid var(--border-card);
  border-radius: 18px;
  padding: 32px;
  box-shadow: var(--shadow-card);
  animation: fadeInUp 0.5s ease 0.15s both;
}

.quick-header {
  text-align: center;
  margin-bottom: 28px;
}

.section-badge {
  font-size: 0.68rem;
  font-weight: 600;
  color: #6366f1;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 8px 0 0;
  letter-spacing: -0.3px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

/* 快捷卡片 — 与首页 action-card 一致 */
.quick-card {
  background: #fff;
  border: 1px solid var(--border-card);
  border-radius: 16px;
  padding: 28px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: all 0.25s;
  position: relative;
}

.quick-card:hover {
  transform: translateY(-3px);
  border-color: rgba(6,182,212,0.35);
  box-shadow: var(--shadow-hover), 0 0 20px var(--glow, rgba(6,182,212,0.1));
}

.quick-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 14px;
  transition: transform 0.3s ease;
}

.quick-card:hover .quick-icon {
  transform: scale(1.1);
}

.quick-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quick-title {
  font-size: 0.9rem;
  font-weight: 650;
  color: var(--text-heading);
}

.quick-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.quick-arrow {
  color: #cbd5e1;
  margin-top: 12px;
  transition: all 0.25s;
}

.quick-card:hover .quick-arrow {
  color: #06b6d4;
  transform: translateX(3px);
}

/* ============================================================
   动画
   ============================================================ */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ============================================================
   响应式
   ============================================================ */
@media (max-width: 1200px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .quick-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .welcome-hero { padding: 24px 0 20px; }
  .hero-greeting { font-size: 1.4rem; }
  .stats-row { grid-template-columns: 1fr; }
  .quick-grid { grid-template-columns: 1fr; }
  .quick-section { padding: 20px 16px; }
  .quick-card { padding: 20px 16px; }
}
</style>

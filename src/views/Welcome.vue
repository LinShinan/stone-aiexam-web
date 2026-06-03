<template>
  <div class="welcome-page">
    <!-- 最近更新时间戳 -->
    <div class="last-updated" title="数据更新时间">
      <el-icon><Clock /></el-icon>
      <span>最近更新：{{ lastUpdated }}</span>
    </div>

    <!-- 顶部欢迎卡片 - 玻璃态 -->
    <el-card class="header-card" shadow="never">
      <div class="header-content">
        <div class="logo-wrapper">
          <img src="../assets/logo.png" alt="logo" class="welcome-logo" />
        </div>
        <div class="welcome-text">
          <h1 class="greeting-title">{{ greetingText }}<span class="cursor">|</span></h1>
          <p class="date-text">{{ currentDate }}</p>
        </div>
      </div>
    </el-card>

    <!-- 数据统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="24">
        <el-col :span="6" v-for="(stat, index) in stats" :key="stat.label">
          <el-card class="stat-card" shadow="never" :style="{ animationDelay: (index * 0.1) + 's' }">
            <!-- 骨架屏 -->
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
              <div class="stat-content">
                <div class="stat-icon-wrapper" :style="{ background: stat.gradient }">
                  <el-icon class="stat-icon"><component :is="stat.icon" /></el-icon>
                </div>
                <div class="stat-text">
                  <span class="stat-number" :style="{ fontFamily: numberFont }">{{ stat.display }}</span>
                  <span class="stat-label">{{ stat.label }}</span>
                </div>
              </div>
              <div class="stat-decoration" :style="{ background: stat.color }"></div>
            </template>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions-section">
      <h3 class="section-title">快捷操作</h3>
      <div class="actions-row">
        <div
          v-for="action in quickActions"
          :key="action.title"
          class="action-item"
          @click="handleActionClick(action)"
          @mousedown="createRipple($event, action.color)"
        >
          <div class="action-circle" :style="{ '--action-color': action.color, '--action-glow': action.glow, background: action.bg }">
            <el-icon class="action-icon"><component :is="action.icon" /></el-icon>
          </div>
          <span class="action-title">{{ action.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Files, User, Bell, Folder, Promotion, Clock } from '@element-plus/icons-vue'

const router = useRouter()

const currentDate = ref('')
const greetingText = ref('')
const loading = ref(true)
const lastUpdated = ref('')
const numberFont = "'JetBrains Mono', 'Cascadia Code', 'Consolas', 'Monaco', monospace"

const fullGreeting = '欢迎回来，管理员！'

const stats = ref([
  { label: '题目总数', target: 1280, current: 0, display: '0', icon: Document, color: '#409EFF', gradient: 'radial-gradient(circle at 30% 20%, #409EFF, #0050b3)' },
  { label: '试卷总数', target: 74, current: 0, display: '0', icon: Files, color: '#67C23A', gradient: 'radial-gradient(circle at 30% 20%, #67C23A, #3a7d1a)' },
  { label: '用户总数', target: 5621, current: 0, display: '0', icon: User, color: '#E6A23C', gradient: 'radial-gradient(circle at 30% 20%, #E6A23C, #b06a00)' },
  { label: '待办事项', target: 3, current: 0, display: '0', icon: Bell, color: '#F56C6C', gradient: 'radial-gradient(circle at 30% 20%, #F56C6C, #b72e3e)' },
])

const quickActions = ref([
  { title: '题目管理', icon: Document, path: '/admin/question-manage', color: '#409EFF', bg: 'rgba(64,158,255,0.1)', glow: 'rgba(64,158,255,0.3)' },
  { title: '试卷管理', icon: Files, path: '/admin/paper-manage', color: '#67C23A', bg: 'rgba(103,194,58,0.1)', glow: 'rgba(103,194,58,0.3)' },
  { title: '发布公告', icon: Promotion, path: '/admin/notice-manage', color: '#E6A23C', bg: 'rgba(230,162,60,0.1)', glow: 'rgba(230,162,60,0.3)' },
  { title: '分类管理', icon: Folder, path: '/admin/category-manage', color: '#F56C6C', bg: 'rgba(245,108,108,0.1)', glow: 'rgba(245,108,108,0.3)' },
])

function initDateTime() {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
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
  const duration = 1500
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

function createRipple(event, color) {
  const el = event.currentTarget
  const rect = el.getBoundingClientRect()
  const ripple = document.createElement('span')
  const size = Math.max(rect.width, rect.height)
  ripple.style.cssText = `
    position: absolute;
    top: ${event.clientY - rect.top - size / 2}px;
    left: ${event.clientX - rect.left - size / 2}px;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: ${color}22;
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
  `
  el.style.position = 'relative'
  el.style.overflow = 'hidden'
  el.appendChild(ripple)
  ripple.addEventListener('animationend', () => ripple.remove())
}

function handleActionClick(action) {
  router.push(action.path)
}

onMounted(() => {
  initDateTime()
  startTypewriter()
  setTimeout(() => {
    loading.value = false
    nextTick(() => animateNumbers())
  }, 500)
})
</script>

<style scoped>
/* ===== 页面整体 ===== */
.welcome-page {
  position: relative;
}

/* ===== 最近更新时间戳 ===== */
.last-updated {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 24px;
  opacity: 0.85;
  transition: opacity 0.3s;
}
.last-updated:hover {
  opacity: 1;
  color: #606266;
}

/* ===== 顶部欢迎卡片 - 玻璃态 ===== */
.header-card {
  margin-bottom: 24px;
  border: none;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.08), 0 0 0 0.5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  position: relative;
  animation: fadeInUp 0.6s ease both;
}

.header-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 4px;
  border-radius: 2px;
  background: linear-gradient(180deg, #409EFF 0%, #7e57c2 100%);
}

.header-card :deep(.el-card__body) {
  padding: 28px 32px 28px 36px;
}

.header-content {
  display: flex;
  align-items: center;
}

.logo-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 24px;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.logo-wrapper:hover {
  transform: rotate(5deg) scale(1.05);
}

.welcome-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.welcome-text {
  flex: 1;
}

.greeting-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1a1a2e;
  letter-spacing: 0.5px;
}

.cursor {
  display: inline-block;
  color: #409EFF;
  font-weight: 300;
  animation: blink 1s step-end infinite;
}

.date-text {
  margin: 0;
  font-size: 15px;
  color: #606266;
  font-weight: 400;
}

/* ===== 数据统计卡片 ===== */
.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  border: none;
  border-radius: 16px;
  padding: 4px 0 0 0;
  box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.08), 0 0 0 0.5px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  position: relative;
  animation: fadeInUp 0.6s ease both;
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 42px -12px rgba(0, 0, 0, 0.12), 0 0 0 0.5px rgba(0, 0, 0, 0.06);
}

.stat-card :deep(.el-card__body) {
  padding: 24px 24px 0 24px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon-wrapper {
  transform: scale(1.1);
}

.stat-icon {
  font-size: 26px;
  color: #fff;
}

.stat-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-number {
  transform: translateY(-2px);
}

.stat-label {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

.stat-decoration {
  height: 3px;
  border-radius: 0 0 20px 20px;
  margin-top: 18px;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.stat-card:hover .stat-decoration {
  opacity: 0.7;
}

/* ===== 骨架屏 ===== */
.stat-skeleton {
  display: flex;
  align-items: center;
  gap: 16px;
}

.skeleton-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(90deg, #e8ecf1 25%, #f0f3f7 50%, #e8ecf1 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
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

.skeleton-line--short {
  width: 60px;
}

.skeleton-line--long {
  width: 90px;
  height: 20px;
  border-radius: 10px;
}

/* ===== 快捷操作 ===== */
.quick-actions-section {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 28px 32px;
  box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.08), 0 0 0 0.5px rgba(0, 0, 0, 0.04);
  animation: fadeInUp 0.6s ease 0.2s both;
}

.section-title {
  margin: 0 0 24px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
}

.actions-row {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.action-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.action-item:hover .action-circle {
  transform: scale(1.15);
  box-shadow: 0 0 28px var(--action-glow);
}

.action-icon {
  font-size: 28px;
  color: var(--action-color);
  transition: color 0.3s ease;
}

.action-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  transition: color 0.3s ease;
}

.action-item:hover .action-title {
  color: var(--action-color);
  font-weight: 600;
}

/* ===== 关键帧动画 ===== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes ripple {
  from {
    transform: scale(0);
    opacity: 0.6;
  }
  to {
    transform: scale(2.5);
    opacity: 0;
  }
}

/* ===== 响应式适配 ===== */
@media (max-width: 1200px) {
  .actions-row {
    flex-wrap: wrap;
    gap: 24px;
  }
  .action-circle {
    width: 56px;
    height: 56px;
  }
  .action-icon {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .welcome-page {
    padding: 0;
  }
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  .logo-wrapper {
    margin-right: 0;
  }
  .greeting-title {
    font-size: 22px;
  }
}
</style>

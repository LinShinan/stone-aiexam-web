<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <div class="navbar">
      <div class="logo">
        <img src="../assets/logo.png" alt="logo" class="logo-img" />
        <span class="title">Stone AI Exam</span>
      </div>
      <div class="nav-actions">
        <el-button class="btn-nav" @click="goToRanking">
          <el-icon><Trophy /></el-icon>排行榜
        </el-button>
        <el-button class="btn-admin" @click="goToAdminLogin">
          <el-icon><User /></el-icon>管理后台
        </el-button>
        <el-button class="btn-cta" @click="goToExam">
          <el-icon><Document /></el-icon>进入考试
        </el-button>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-container">

      <!-- Hero 标题区 -->
      <div class="hero-headline">
        <p class="hero-label">AI · POWERED · LEARNING</p>
        <h1 class="hero-title">智能学习考试系统</h1>
        <p class="hero-desc">人工智能自动出题 · 智能批阅 · 精准分析 · 个性化学习路径</p>
      </div>

      <!-- 轮播图 + 公告 -->
      <div class="hero-section">
        <div class="carousel-section">
          <el-carousel
            v-model="activeBannerIndex"
            :interval="5000"
            height="320px"
            indicator-position="inside"
            arrow="hover"
          >
            <el-carousel-item v-for="(banner, index) in bannerList" :key="index">
              <div class="banner-item" @click="handleBannerClick(banner)">
                <img :src="banner.imageUrl" alt="" class="banner-img" />
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>

        <div class="notice-section">
          <div class="notice-header">
            <el-icon class="notice-icon"><Bell /></el-icon>
            <span>系统公告</span>
            <span class="notice-dot"></span>
          </div>
          <div class="notice-carousel">
            <el-carousel
              direction="vertical"
              :interval="3000"
              height="272px"
              :show-arrow="false"
              indicator-position="none"
            >
              <el-carousel-item v-for="(chunk, ci) in noticeChunks" :key="ci">
                <div class="notice-chunk">
                  <div
                    class="notice-item"
                    v-for="notice in chunk"
                    :key="notice.id"
                    @click="handleNoticeClick(notice)"
                  >
                    <div class="notice-date">
                      <span class="date-day">{{ formatNoticeDate(notice.createTime).day }}</span>
                      <span class="date-month">{{ formatNoticeDate(notice.createTime).month }}</span>
                    </div>
                    <div class="notice-content">
                      <div class="notice-item-title">{{ notice.title }}</div>
                      <div class="notice-item-desc">{{ notice.content }}</div>
                      <div class="notice-meta">
                        <el-tag size="small" :type="getNoticeTypeTag(notice.type)" effect="plain">
                          {{ getNoticeTypeText(notice.type) }}
                        </el-tag>
                        <span class="notice-time">{{ formatTime(notice.createTime) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>
        </div>
      </div>

      <!-- 快捷功能 -->
      <div class="quick-actions">
        <div class="section-badge">快捷功能</div>
        <h2 class="section-title">探索智能学习之旅</h2>
        <div class="action-cards">
          <div class="action-card" v-for="card in actionCards" :key="card.label" @click="card.action()" :style="{ '--card-gradient': card.gradient, '--card-shadow': card.shadow }">
            <div class="card-icon-wrap" :style="{ background: card.gradient }">
              <el-icon class="card-icon"><component :is="card.icon" /></el-icon>
            </div>
            <h3>{{ card.title }}</h3>
            <p>{{ card.desc }}</p>
          </div>
        </div>
      </div>

      <!-- 热门题目 -->
      <div class="popular-section">
        <div class="section-header">
          <div>
            <div class="section-badge" style="text-align:left;">热门题目</div>
            <h2 class="section-title" style="text-align:left;margin-bottom:0;">大家都在刷</h2>
          </div>
          <el-button class="btn-more" @click="goToPractice">
            查看更多 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="popular-grid">
          <div class="popular-card" v-for="question in popularQuestions" :key="question.id" @click="goToPractice">
            <div class="question-type">
              <el-tag :type="getQuestionTypeTag(question.type)" size="small" effect="plain">
                {{ getQuestionTypeText(question.type) }}
              </el-tag>
              <el-tag :type="getDifficultyType(question.difficulty)" size="small" effect="plain">
                {{ getDifficultyText(question.difficulty) }}
              </el-tag>
            </div>
            <h4 class="question-title">{{ question.title }}</h4>
            <p class="question-category">{{ question.categoryName }}</p>
            <div class="question-stats">
              <span><el-icon><View /></el-icon> {{ question.viewCount || 0 }}</span>
              <span><el-icon><Check /></el-icon> {{ question.correctRate || 0 }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计数据 -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card" v-for="stat in statCards" :key="stat.label" :style="{ '--stat-bg': stat.bg, '--stat-color': stat.gradient }">
            <div class="stat-icon-wrap">
              <el-icon class="stat-icon"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stat.value() }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 管理员登录对话框 -->
    <el-dialog v-model="adminLoginVisible" title="管理员登录" width="420px" :close-on-click-modal="false">
      <el-form :model="adminLoginForm" :rules="adminLoginRules" ref="adminLoginFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="adminLoginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="adminLoginForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adminLoginVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdminLogin" :loading="adminLoginLoading">登录</el-button>
      </template>
    </el-dialog>

    <!-- 公告详情对话框 -->
    <el-dialog v-model="noticeDetailVisible" :title="selectedNotice?.title" width="560px">
      <div class="notice-detail" v-if="selectedNotice">
        <div class="notice-detail-meta">
          <el-tag :type="getNoticeTypeTag(selectedNotice.type)" effect="plain">
            {{ getNoticeTypeText(selectedNotice.type) }}
          </el-tag>
          <span class="notice-detail-time">{{ formatTime(selectedNotice.createTime) }}</span>
        </div>
        <div class="notice-detail-content" v-html="selectedNotice.content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document, Edit, Trophy, Bell, DataAnalysis, View, Check, User, Files,
  TrendCharts, VideoPlay, ArrowRight
} from '@element-plus/icons-vue'
import request from '../utils/request'

const router = useRouter()

const bannerList = ref([])
const noticeList = ref([])
const noticeChunks = computed(() => {
  const chunks = []
  for (let i = 0; i < noticeList.value.length; i += 2) {
    chunks.push(noticeList.value.slice(i, i + 2))
  }
  return chunks
})
const popularQuestions = ref([])
const stats = ref({ questionCount: 0, userCount: 0, examCount: 0, todayExamCount: 0 })

const adminLoginVisible = ref(false)
const adminLoginLoading = ref(false)
const adminLoginFormRef = ref()
const adminLoginForm = reactive({ username: '', password: '' })
const adminLoginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const noticeDetailVisible = ref(false)
const selectedNotice = ref(null)
const activeBannerIndex = ref(0)

const actionCards = [
  { title: '智能考试', desc: 'AI 自动出题，实时批阅', icon: Document, gradient: 'linear-gradient(135deg, #6366f1, #3b82f6)', shadow: 'rgba(99,102,241,0.3)', action: () => router.push('/exam/list') },
  { title: '智能刷题', desc: 'AI 推荐题目，个性化练习', icon: Edit, gradient: 'linear-gradient(135deg, #06b6d4, #10b981)', shadow: 'rgba(6,182,212,0.3)', action: () => router.push('/practice') },
  { title: '学习排行', desc: '实时排名竞技，激发动力', icon: Trophy, gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', shadow: 'rgba(245,158,11,0.3)', action: () => router.push('/exam-ranking') },
  { title: 'AI 分析', desc: '智能学习报告，个性化建议', icon: DataAnalysis, gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)', shadow: 'rgba(236,72,153,0.3)', action: () => router.push('/analysis') },
  { title: '视频百科', desc: '技术点讲解视频，分类学习', icon: VideoPlay, gradient: 'linear-gradient(135deg, #38bdf8, #0284c7)', shadow: 'rgba(56,189,248,0.3)', action: () => router.push('/videos') },
]

const statCards = [
  { label: '题目总数', icon: Document, gradient: 'linear-gradient(135deg, #06b6d4, #10b981)', bg: 'rgba(6,182,212,0.08)', value: () => stats.value.questionCount || 0 },
  { label: '用户总数', icon: User, gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)', bg: 'rgba(124,58,237,0.08)', value: () => stats.value.userCount || 0 },
  { label: '考试场次', icon: Files, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', bg: 'rgba(59,130,246,0.08)', value: () => stats.value.examCount || 0 },
  { label: '今日考试', icon: TrendCharts, gradient: 'linear-gradient(135deg, #f97316, #ef4444)', bg: 'rgba(249,115,22,0.08)', value: () => stats.value.todayExamCount || 0 },
]

const getBannerList = async () => {
  try {
    const res = await request.get('/api/common/banners/active')
    bannerList.value = res.data || []
  } catch (error) {
    bannerList.value = [
      { id: 1, title: '智能AI生成题目', description: '利用先进AI技术，快速生成高质量考试题目', imageUrl: '/api/admin/banners/ai-generate.jpg', linkUrl: '/ai-generate', isActive: true },
      { id: 2, title: '海量题库资源', description: '覆盖多个学科领域，题目类型丰富多样', imageUrl: '/api/admin/banners/question-bank.jpg', linkUrl: '/practice', isActive: true },
      { id: 3, title: '智能学习分析', description: '详细的答题报告，帮助您精准提升', imageUrl: '/api/admin/banners/analysis.jpg', linkUrl: '/analysis', isActive: true }
    ]
  }
}

const getNoticeList = async () => {
  try {
    const res = await request.get('/api/common/notices/latest', { params: { limit: 5 } })
    noticeList.value = res.data || []
  } catch (error) {
    noticeList.value = [
      { id: 1, title: '系统升级公告', content: '为了提供更好的服务体验，系统将于本周末进行升级维护。', type: 'SYSTEM', createTime: '2024-06-24 10:00:00', isActive: true },
      { id: 2, title: '新增AI智能生成功能', content: '系统新增了AI智能生成题目功能，支持多种题型和难度级别。', type: 'FEATURE', createTime: '2024-06-23 15:30:00', isActive: true },
      { id: 3, title: '考试注意事项', content: '参加在线考试时，请确保网络连接稳定，祝大家取得好成绩！', type: 'NOTICE', createTime: '2024-06-22 09:00:00', isActive: true }
    ]
  }
}

const getPopularQuestions = async () => {
  try {
    const res = await request.get('/api/common/questions/popular', { params: { size: 6 } })
    popularQuestions.value = res.data || []
  } catch (error) { /* fallback empty */ }
}

const getStats = async () => {
  try {
    const res = await request.get('/api/stats/overview')
    if (res.code === 200) {
      stats.value = {
        questionCount: res.data.questionCount || 0,
        userCount: res.data.userCount || 0,
        examCount: res.data.examCount || 0,
        todayExamCount: res.data.todayExamCount || 0
      }
    }
  } catch (error) { /* keep defaults */ }
}

const handleBannerClick = (banner) => {
  if (banner.linkUrl) {
    if (banner.linkUrl.startsWith('http')) window.open(banner.linkUrl, '_blank')
    else router.push(banner.linkUrl)
  }
}

const handleNoticeClick = (notice) => { selectedNotice.value = notice; noticeDetailVisible.value = true }

const formatNoticeDate = (dateStr) => {
  const date = new Date(dateStr)
  return { day: date.getDate().toString().padStart(2, '0'), month: (date.getMonth() + 1).toString().padStart(2, '0') + '月' }
}

const formatTime = (dateStr) => new Date(dateStr).toLocaleString('zh-CN')
const getNoticeTypeTag = (type) => ({ SYSTEM: '', FEATURE: 'success', NOTICE: 'primary' }[type] || 'info')
const getNoticeTypeText = (type) => ({ SYSTEM: '系统公告', FEATURE: '新功能', NOTICE: '通知' }[type] || '其他')
const getQuestionTypeTag = (type) => ({ CHOICE: 'primary', JUDGE: 'success', TEXT: 'warning' }[type] || 'info')
const getQuestionTypeText = (type) => ({ CHOICE: '选择题', JUDGE: '判断题', TEXT: '简答题' }[type] || type)
const getDifficultyType = (d) => ({ EASY: 'success', MEDIUM: 'primary', HARD: 'danger' }[d] || 'info')
const getDifficultyText = (d) => ({ EASY: '简单', MEDIUM: '中等', HARD: '困难' }[d] || d)

const goToExam = () => router.push('/exam/list')
const goToPractice = () => router.push('/practice')
const goToRanking = () => router.push('/exam-ranking')
const goToAnalysis = () => router.push('/analysis')
const goToVideos = () => router.push('/videos')
const goToAdminLogin = () => router.push('/admin/login')
const showAdminLogin = () => { adminLoginVisible.value = true }

const handleAdminLogin = async () => {
  if (!adminLoginFormRef.value) return
  await adminLoginFormRef.value.validate(async (valid) => {
    if (valid) {
      adminLoginLoading.value = true
      try {
        const res = await request.post('/api/auth/login', adminLoginForm)
        localStorage.setItem('userInfo', JSON.stringify(res.data))
        if (res.data.token) localStorage.setItem('token', res.data.token)
        ElMessage.success('登录成功，正在跳转到管理员后台...')
        adminLoginVisible.value = false
        adminLoginForm.username = ''
        adminLoginForm.password = ''
        router.push('/admin')
      } catch (e) { /* axios interceptor handles */ }
      finally { adminLoginLoading.value = false }
    }
  })
}

onMounted(() => {
  getBannerList()
  getNoticeList()
  getPopularQuestions()
  getStats()
})
</script>

<style scoped>
/* ===== BOSS x Gemini Fusion ===== */
.home-page {
  --bg-page: #f6f8fc;
  --bg-card: #ffffff;
  --border-card: #e8ecf4;
  --text-heading: #0f172a;
  --text-body: #475569;
  --text-muted: #8090a8;
  --accent-blue: #4361ee;
  --accent-purple: #7c3aed;
  --accent-cyan: #06b6d4;
  --shadow-card: 0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06);
  --shadow-card-hover: 0 2px 8px rgba(15,23,42,0.06), 0 10px 28px rgba(15,23,42,0.08);

  min-height: 100vh;
  color: var(--text-body);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  position: relative; overflow-x: hidden;
  background: var(--bg-page);
}

/* Aura glow — 从深色 header 向下过渡 */
.home-page::before {
  content: '';
  position: fixed; top: 0; left: 0; right: 0; height: 600px; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 80% 55% at 15% 0%, rgba(124,58,237,0.12) 0%, transparent 50%),
    radial-gradient(ellipse 60% 45% at 85% 5%, rgba(67,97,238,0.10) 0%, transparent 48%),
    radial-gradient(ellipse 50% 40% at 50% 40%, rgba(6,182,212,0.08) 0%, transparent 55%),
    radial-gradient(ellipse 40% 35% at 20% 65%, rgba(16,185,129,0.07) 0%, transparent 48%),
    linear-gradient(to bottom, #e8eef8 0%, #f2f4fb 30%, var(--bg-page) 100%);
}

/* ===== Navbar ===== */
/* ===== BOSS Dark Header + Glow Bar ===== */
.navbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 40px; height: 58px;
  position: sticky; top: 0; z-index: 100;
  background: #0f172a;
  border-bottom: none;
}
.navbar::after {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, #06b6d4, #10b981, #06b6d4);
  box-shadow: 0 0 16px rgba(6,182,212,0.6), 0 2px 12px rgba(16,185,129,0.3);
}
.logo { display: flex; align-items: center; gap: 10px; }
.logo-img { width: 28px; height: 28px; border-radius: 7px; }
.title { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; letter-spacing: -0.2px; }
.nav-actions { display: flex; align-items: center; gap: 8px; }

.btn-nav {
  background: transparent !important; color: #94a3b8 !important;
  border: none !important; border-radius: 8px !important;
  font-weight: 500 !important; font-size: 0.85rem !important; height: 36px; padding: 0 14px;
  transition: all 0.2s;
}
.btn-nav:hover { color: #fff !important; background: rgba(255,255,255,0.08) !important; }

.btn-admin {
  background: rgba(6,182,212,0.12) !important;
  color: #06b6d4 !important;
  border: 1.5px solid rgba(6,182,212,0.35) !important;
  border-radius: 20px !important;
  font-weight: 600 !important; font-size: 0.85rem !important; height: 36px; padding: 0 18px;
  transition: all 0.25s;
}
.btn-admin:hover {
  background: rgba(6,182,212,0.22) !important;
  border-color: #06b6d4 !important;
  color: #22d3ee !important;
  box-shadow: 0 0 14px rgba(6,182,212,0.3);
}

.btn-cta {
  background: linear-gradient(135deg, #06b6d4, #10b981) !important;
  color: #fff !important; border: 2px solid rgba(16,185,129,0.4) !important; border-radius: 20px !important;
  font-weight: 700 !important; font-size: 0.85rem !important; height: 36px; padding: 0 22px;
  box-shadow: 0 0 16px rgba(6,182,212,0.5), 0 0 48px rgba(16,185,129,0.25), 0 0 80px rgba(6,182,212,0.10);
  animation: ctaGlow 2.5s ease-in-out infinite;
  transition: all 0.3s;
}
.btn-cta:hover {
  box-shadow: 0 0 24px rgba(6,182,212,0.7), 0 0 64px rgba(16,185,129,0.4), 0 0 100px rgba(6,182,212,0.18);
  transform: scale(1.05);
}
@keyframes ctaGlow {
  0%, 100% { box-shadow: 0 0 16px rgba(6,182,212,0.5), 0 0 48px rgba(16,185,129,0.25), 0 0 80px rgba(6,182,212,0.10); }
  50% { box-shadow: 0 0 24px rgba(6,182,212,0.7), 0 0 64px rgba(16,185,129,0.4), 0 0 110px rgba(6,182,212,0.16); }
}

/* ===== Main ===== */
.main-container { max-width: 1160px; margin: 0 auto; padding: 0 36px 72px; position: relative; z-index: 1; }

/* ===== Hero ===== */
.hero-headline { text-align: center; padding: 88px 0 56px; }
.hero-label {
  display: inline-block;
  font-size: 0.7rem; font-weight: 600; color: var(--accent-blue);
  letter-spacing: 4px; text-transform: uppercase; margin: 0 0 22px;
  padding: 4px 14px; border-radius: 20px;
  background: rgba(67,97,238,0.05); border: 1px solid rgba(67,97,238,0.08);
}
.hero-title {
  font-size: 3.2rem; font-weight: 800; line-height: 1.12; letter-spacing: -1.5px; margin: 0 0 22px;
  background: linear-gradient(135deg, #0f172a 0%, #4361ee 30%, #7c3aed 55%, #06b6d4 80%, #10b981 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-desc {
  font-size: 1rem; color: #64748b; margin: 0 auto;
  max-width: 520px; line-height: 1.75;
}

/* ===== Carousel + Notice ===== */
.hero-section { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-top: 12px; margin-bottom: 88px; }

.carousel-section {
  border-radius: 18px; overflow: hidden;
  background: #fff; border: 1px solid var(--border-card);
  box-shadow: var(--shadow-xs), 0 0 0 1px rgba(0,0,0,0.02);
}
.carousel-section :deep(.el-carousel__container) { border-radius: 18px; }
.carousel-section :deep(.el-carousel__indicator button) {
  background: rgba(0,0,0,0.12); width: 24px; height: 3px; border-radius: 2px; opacity: 1;
}
.carousel-section :deep(.el-carousel__indicator.is-active button) { background: var(--accent-blue); }
.banner-item { width: 100%; height: 100%; cursor: pointer; overflow: hidden; }
.banner-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.banner-item:hover .banner-img { transform: scale(1.03); }

/* Notice card */
.notice-section {
  background: var(--bg-card); border: 1px solid var(--border-card);
  border-radius: 18px; overflow: hidden;
  box-shadow: var(--shadow-xs);
  display: flex; flex-direction: column;
}
.notice-header {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 22px; border-bottom: 1px solid var(--border-card);
  font-size: 0.85rem; font-weight: 600; color: var(--text-heading);
}
.notice-icon { color: var(--accent-blue); font-size: 15px; }
.notice-dot {
  position: relative;
  width: 8px; height: 8px; border-radius: 50%;
  background: #10b981; margin-left: auto;
  box-shadow: 0 0 8px rgba(16,185,129,0.7), 0 0 20px rgba(16,185,129,0.3);
  animation: dotPulse 2s ease-in-out infinite;
}
.notice-dot::after {
  content: '';
  position: absolute; top: -4px; left: -4px;
  width: 16px; height: 16px; border-radius: 50%;
  background: rgba(16,185,129,0.25);
  animation: dotPing 2s ease-in-out infinite;
}
@keyframes dotPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
@keyframes dotPing {
  0%, 100% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(2.2); opacity: 0.5; }
}
.notice-carousel {
  flex: 1; position: relative; overflow: hidden;
  mask-image: linear-gradient(to bottom, transparent 0%, black 12px, black calc(100% - 12px), transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 12px, black calc(100% - 12px), transparent 100%);
}
.notice-carousel :deep(.el-carousel__container) { scrollbar-width: none; }
.notice-carousel :deep(.el-carousel__container::-webkit-scrollbar) { display: none; }
.notice-carousel :deep(.el-carousel__indicators) { display: none; }
.notice-chunk { height: 100%; display: flex; flex-direction: column; }
.notice-item {
  display: flex; padding: 14px 20px; gap: 14px;
  cursor: pointer; transition: background 0.15s;
  align-items: flex-start; flex: 1;
  border-bottom: 1px solid #f5f6f9;
}
.notice-item:last-child { border-bottom: none; }
.notice-item:hover { background: #f8fafd; }
.notice-date {
  display: flex; flex-direction: column;
  width: 44px; height: 48px;
  border-radius: 10px; overflow: hidden; flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid var(--border-card);
}
.date-day {
  display: flex; align-items: center; justify-content: center;
  flex: 1; font-size: 1.15rem; font-weight: 800; color: #0f172a;
  background: #fff; line-height: 1;
}
.date-month {
  display: flex; align-items: center; justify-content: center;
  height: 16px; font-size: 0.55rem; font-weight: 600; color: #fff;
  background: linear-gradient(135deg, #f97316, #ea580c);
  letter-spacing: 0.5px; line-height: 1;
}
.notice-content { flex: 1; min-width: 0; }
.notice-item-title {
  font-size: 0.88rem; font-weight: 600; color: var(--text-heading);
  margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.notice-item-desc {
  font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5;
}
.notice-meta { display: flex; align-items: center; justify-content: space-between; }
.notice-time { font-size: 0.65rem; color: #b0b8c1; }

/* ===== Quick Actions ===== */
.quick-actions { margin-bottom: 80px; }
.section-badge {
  text-align: center; font-size: 0.7rem; font-weight: 600;
  color: var(--accent-blue); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 10px;
}
.section-title {
  font-size: 1.55rem; font-weight: 700; color: var(--text-heading);
  text-align: center; margin: 0 0 40px; letter-spacing: -0.3px;
}
.action-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }

.action-card {
  background: var(--bg-card); border: 1px solid var(--border-card);
  border-radius: 16px; padding: 32px 16px 28px;
  text-align: center; cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: all 0.25s;
}
.action-card:hover {
  transform: translateY(-4px);
  border-color: rgba(6,182,212,0.35);
  box-shadow: var(--shadow-card-hover), 0 0 24px var(--card-shadow, rgba(6,182,212,0.12));
}

.card-icon-wrap {
  width: 54px; height: 54px; margin: 0 auto 16px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.25s;
}
.action-card:hover .card-icon-wrap { transform: scale(1.08); }
.card-icon { font-size: 1.4rem; color: #fff; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15)); }
.action-card h3 { font-size: 0.95rem; font-weight: 650; margin: 0 0 6px; color: var(--text-heading); }
.action-card p { font-size: 0.76rem; color: var(--text-muted); line-height: 1.5; margin: 0; }

/* ===== Popular Questions ===== */
.popular-section { margin-bottom: 80px; }
.section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
.btn-more { color: var(--accent-blue) !important; font-weight: 500 !important; }
.btn-more:hover { color: var(--accent-purple) !important; }
.popular-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }

.popular-card {
  background: var(--bg-card); border: 1px solid var(--border-card);
  border-radius: 16px; padding: 26px 26px;
  cursor: pointer; box-shadow: var(--shadow-card);
  transition: all 0.25s;
}
.popular-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
  border-color: rgba(6,182,212,0.35);
}
.question-type { display: flex; gap: 8px; margin-bottom: 12px; }
.question-title {
  font-size: 0.93rem; font-weight: 600; color: var(--text-heading); margin: 0 0 8px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5;
}
.question-category { font-size: 0.78rem; color: var(--text-muted); margin: 0 0 12px; }
.question-stats {
  display: flex; justify-content: space-between; font-size: 0.72rem; color: #b0b8c1;
  padding-top: 14px; border-top: 1px solid #f5f6f9;
  transition: color 0.25s;
}
.popular-card:hover .question-stats { color: #06b6d4; }
.question-stats span { display: flex; align-items: center; gap: 4px; }

/* ===== Stats ===== */
.stats-section { margin-bottom: 20px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }

.stat-card {
  background: var(--bg-card); border: 1px solid var(--border-card);
  border-radius: 16px; padding: 22px 20px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: var(--shadow-card);
  transition: all 0.25s; cursor: default;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); }
.stat-icon-wrap {
  width: 50px; height: 50px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  background: var(--stat-bg, rgba(6,182,212,0.08));
}
.stat-icon { font-size: 1.3rem; background: var(--stat-color); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.stat-content { flex: 1; }
.stat-number { font-size: 1.7rem; font-weight: 800; color: var(--text-heading); line-height: 1.1; margin-bottom: 2px; }
.stat-label { font-size: 0.76rem; color: var(--text-muted); font-weight: 500; }

/* ===== Dialog ===== */
.notice-detail-meta {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid var(--border-card);
}
.notice-detail-time { color: var(--text-muted); font-size: 0.85rem; }
.notice-detail-content { line-height: 1.9; color: var(--text-body); font-size: 0.92rem; }

:deep(.el-dialog) { border-radius: 16px; }
:deep(.el-dialog__title) { color: var(--text-heading); font-weight: 600; }
:deep(.el-form-item__label) { color: var(--text-body); font-weight: 500; }
:deep(.el-input__wrapper) {
  background: var(--bg-page); border: 1px solid var(--border-card); box-shadow: none; border-radius: 8px;
}
:deep(.el-input__wrapper:focus), :deep(.el-input__wrapper:hover) { border-color: var(--accent-blue); }
:deep(.el-input__inner) { color: var(--text-heading); }

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .action-cards { grid-template-columns: repeat(3, 1fr); }
  .popular-grid { grid-template-columns: repeat(2, 1fr); }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .navbar { padding: 0 16px; }
  .hero-title { font-size: 2.2rem; }
  .hero-headline { padding: 40px 0 32px; }
  .main-container { padding: 0 16px 40px; }
  .hero-section { grid-template-columns: 1fr; gap: 16px; }
  .action-cards { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .action-card { padding: 24px 12px 20px; }
  .popular-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}
@media (max-width: 480px) {
  .action-cards { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>

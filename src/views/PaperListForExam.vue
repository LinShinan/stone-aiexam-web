<template>
  <div class="exam-list-page">
    <!-- 顶部导航栏 — 与 Home 一致 -->
    <div class="navbar">
      <div class="logo" @click="$router.push('/home')" style="cursor:pointer;">
        <img src="../assets/logo.png" alt="logo" class="logo-img" />
        <span class="logo-title">Stone AI Exam</span>
      </div>
      <div class="nav-actions">
        <el-button class="btn-nav" @click="$router.push('/home')">
          <el-icon><HomeFilled /></el-icon>首页
        </el-button>
        <el-button class="btn-nav" @click="$router.push('/exam-ranking')">
          <el-icon><Trophy /></el-icon>排行榜
        </el-button>
        <el-button class="btn-cta" @click="$router.push('/practice')">
          <el-icon><Edit /></el-icon>刷题练习
        </el-button>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-container">
      <!-- 页面头部 — Hero 风格 -->
      <div class="page-header">
        <p class="hero-label">SELECT · EXAM · PAPER</p>
        <h1 class="hero-title">选择考试试卷</h1>
        <p class="hero-desc">挑选一份试卷，开始你的智能考试之旅</p>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索试卷名称..."
          size="large"
          clearable
          @clear="fetchPublishedPapers"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button
          v-if="searchKeyword"
          class="btn-search"
          @click="handleSearch"
        >
          <el-icon><Search /></el-icon>搜索
        </el-button>
      </div>

      <!-- 试卷列表 -->
      <div class="paper-list" v-loading="loading">
        <template v-if="paperList.length > 0">
          <div
            v-for="(paper, index) in paperList"
            :key="paper.id"
            class="paper-card"
            :style="{ animationDelay: (index * 0.08) + 's' }"
          >
            <div class="card-left">
              <div class="card-icon" :class="'card-icon--' + (index % 4)">
                <el-icon :size="22"><Document /></el-icon>
              </div>
            </div>

            <div class="card-body">
              <h3 class="paper-name">{{ paper.name }}</h3>
              <p class="paper-desc">{{ paper.description || '暂无描述' }}</p>
              <div class="paper-stats">
                <div class="stat">
                  <el-icon><Collection /></el-icon>
                  <span><strong>{{ paper.questionCount || 0 }}</strong> 题</span>
                </div>
                <div class="stat-sep"></div>
                <div class="stat">
                  <el-icon><Trophy /></el-icon>
                  <span><strong>{{ paper.totalScore || 0 }}</strong> 分</span>
                </div>
                <div class="stat-sep"></div>
                <div class="stat">
                  <el-icon><Clock /></el-icon>
                  <span><strong>{{ paper.duration || 0 }}</strong> 分钟</span>
                </div>
              </div>
            </div>

            <div class="card-right">
              <el-button
                type="primary"
                size="large"
                @click="handleStartExam(paper)"
                :loading="startingExamId === paper.id"
                class="start-btn"
              >
                开始考试
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
        </template>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div v-if="!searchKeyword" class="empty-content">
            <div class="empty-icon-wrap">
              <el-icon class="empty-icon"><Document /></el-icon>
            </div>
            <div class="empty-text">暂无已发布的试卷</div>
            <div class="empty-hint">请联系管理员发布试卷后再来考试</div>
            <el-button class="btn-empty-cta" @click="$router.push('/home')">
              返回首页
            </el-button>
          </div>
          <div v-else class="empty-content">
            <div class="empty-icon-wrap">
              <el-icon class="empty-icon"><Search /></el-icon>
            </div>
            <div class="empty-text">没有找到「{{ searchKeyword }}」</div>
            <div class="empty-hint">试试其他关键词吧</div>
            <el-button class="btn-empty-cta" @click="searchKeyword = ''; fetchPublishedPapers()">
              清除搜索
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPublicPapers } from '../api/paper.js'
import {
  Search, Collection, Trophy, Clock, Document, ArrowRight, HomeFilled, Edit
} from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const paperList = ref([])
const searchKeyword = ref('')
const startingExamId = ref(null)

const fetchPublishedPapers = async () => {
  loading.value = true
  try {
    const res = await getPublicPapers({ name: searchKeyword.value })
    paperList.value = res.data || []
  } catch (error) {
    ElMessage.error('获取试卷列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => fetchPublishedPapers()

const handleStartExam = async (paper) => {
  try {
    await ElMessageBox.confirm(
      `确定要开始「${paper.name}」吗？考试时长 ${paper.duration} 分钟，中途退出可能无法再次进入。`,
      '确认开始考试',
      {
        confirmButtonText: '确定开始',
        cancelButtonText: '再想想',
        type: 'info'
      }
    )
    router.push(`/exam/start/${paper.id}`)
  } catch {
    // 用户取消
  }
}

onMounted(() => fetchPublishedPapers())
</script>

<style scoped>
/* ===== Design Tokens — 与 Home 统一 ===== */
.exam-list-page {
  --bg-page: #f6f8fc;
  --bg-card: #ffffff;
  --border-card: #e8ecf4;
  --text-heading: #0f172a;
  --text-body: #475569;
  --text-muted: #8090a8;
  --accent-blue: #4361ee;
  --accent-purple: #7c3aed;
  --accent-cyan: #06b6d4;
  --accent-green: #10b981;
  --shadow-card: 0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06);
  --shadow-card-hover: 0 2px 8px rgba(15,23,42,0.06), 0 10px 28px rgba(15,23,42,0.08);

  min-height: 100vh;
  color: var(--text-body);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  position: relative; overflow-x: hidden;
  background: var(--bg-page);
}

/* ===== Aura glow — 与 Home 一致 ===== */
.exam-list-page::before {
  content: '';
  position: fixed; top: 0; left: 0; right: 0; height: 600px; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 80% 55% at 15% 0%, rgba(124,58,237,0.12) 0%, transparent 50%),
    radial-gradient(ellipse 60% 45% at 85% 5%, rgba(67,97,238,0.10) 0%, transparent 48%),
    radial-gradient(ellipse 50% 40% at 50% 40%, rgba(6,182,212,0.08) 0%, transparent 55%),
    radial-gradient(ellipse 40% 35% at 20% 65%, rgba(16,185,129,0.07) 0%, transparent 48%),
    linear-gradient(to bottom, #e8eef8 0%, #f2f4fb 30%, var(--bg-page) 100%);
}

/* ===== Navbar — 与 Home 完全一致 ===== */
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
.logo-title { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; letter-spacing: -0.2px; }
.nav-actions { display: flex; align-items: center; gap: 8px; }

.btn-nav {
  background: transparent !important; color: #94a3b8 !important;
  border: none !important; border-radius: 8px !important;
  font-weight: 500 !important; font-size: 0.85rem !important; height: 36px; padding: 0 14px;
  transition: all 0.2s;
}
.btn-nav:hover { color: #fff !important; background: rgba(255,255,255,0.08) !important; }

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

/* ===== Main Container ===== */
.main-container { max-width: 1160px; margin: 0 auto; padding: 0 36px 72px; position: relative; z-index: 1; }

/* ===== Page Header — Hero 风格 ===== */
.page-header { text-align: center; padding: 72px 0 40px; }
.hero-label {
  display: inline-block;
  font-size: 0.7rem; font-weight: 600; color: var(--accent-blue);
  letter-spacing: 4px; text-transform: uppercase; margin: 0 0 18px;
  padding: 4px 14px; border-radius: 20px;
  background: rgba(67,97,238,0.05); border: 1px solid rgba(67,97,238,0.08);
}
.hero-title {
  font-size: 3rem; font-weight: 800; line-height: 1.12; letter-spacing: -1.5px; margin: 0 0 16px;
  background: linear-gradient(135deg, #0f172a 0%, #4361ee 30%, #7c3aed 55%, #06b6d4 80%, #10b981 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-desc {
  font-size: 1rem; color: #64748b; margin: 0 auto;
  max-width: 440px; line-height: 1.75;
}

/* ===== Search Bar ===== */
.search-bar {
  display: flex; justify-content: center; align-items: center; gap: 10px;
  margin-bottom: 40px;
  padding: 10px 24px;
  background: var(--bg-card); border: 1px solid var(--border-card);
  border-radius: 16px;
  box-shadow: var(--shadow-card);
  max-width: 580px; margin-left: auto; margin-right: auto;
}
.search-bar :deep(.el-input) { flex: 1; }
.search-bar :deep(.el-input__wrapper) {
  background: #f8fafd; border: 1px solid transparent; border-radius: 10px;
  box-shadow: none !important; padding: 6px 14px; transition: all 0.2s;
}
.search-bar :deep(.el-input__wrapper:hover) { border-color: #dce3ec; background: #fff; }
.search-bar :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-blue); background: #fff;
  box-shadow: 0 0 0 2px rgba(67,97,238,0.08) !important;
}
.search-bar :deep(.el-input__inner) { color: var(--text-heading); }
.search-bar :deep(.el-input__prefix) { color: var(--text-muted); }
.btn-search {
  background: linear-gradient(135deg, #6366f1, #3b82f6) !important;
  color: #fff !important; border: none !important; border-radius: 10px !important;
  font-weight: 600 !important; font-size: 0.82rem !important; padding: 8px 18px !important;
  box-shadow: 0 2px 8px rgba(99,102,241,0.25); transition: all 0.25s;
}
.btn-search:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.4); transform: translateY(-1px); }

/* ===== Paper Cards ===== */
.paper-list {
  display: flex; flex-direction: column; gap: 14px;
}

.paper-card {
  display: flex; align-items: center;
  background: var(--bg-card); border: 1px solid var(--border-card);
  border-radius: 16px; padding: 24px 28px;
  box-shadow: var(--shadow-card);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  animation: fadeIn 0.5s ease both;
}
.paper-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
  border-color: rgba(6,182,212,0.35);
}

/* ===== Card Icon ===== */
.card-left { flex-shrink: 0; margin-right: 24px; }
.card-icon {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.25s;
}
.paper-card:hover .card-icon { transform: scale(1.06); }
.card-icon--0 { background: linear-gradient(135deg, #6366f1, #3b82f6); }
.card-icon--1 { background: linear-gradient(135deg, #06b6d4, #10b981); }
.card-icon--2 { background: linear-gradient(135deg, #f59e0b, #ef4444); }
.card-icon--3 { background: linear-gradient(135deg, #ec4899, #8b5cf6); }

/* ===== Card Body ===== */
.card-body { flex: 1; min-width: 0; }
.paper-name {
  font-size: 1.05rem; font-weight: 700; color: var(--text-heading);
  margin: 0 0 4px; letter-spacing: -0.2px;
}
.paper-desc {
  color: var(--text-muted); margin: 0 0 14px;
  font-size: 0.82rem; line-height: 1.5;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.paper-stats { display: flex; align-items: center; gap: 16px; }
.stat {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.82rem; color: var(--text-muted);
}
.stat strong { font-weight: 700; color: var(--text-heading); }
.stat .el-icon { font-size: 15px; }
.stat:first-child .el-icon { color: var(--accent-blue); }
.stat:nth-child(3) .el-icon { color: #f59e0b; }
.stat:nth-child(5) .el-icon { color: #ef4444; }
.stat-sep {
  width: 1px; height: 16px; background: var(--border-card); border-radius: 1px;
}

/* ===== Card Start Button ===== */
.card-right { flex-shrink: 0; margin-left: 28px; }
.start-btn {
  font-weight: 700 !important; font-size: 0.9rem !important;
  padding: 12px 28px !important; border-radius: 24px !important;
  color: #fff !important;
  background: linear-gradient(135deg, #06b6d4, #10b981) !important;
  border: 2px solid rgba(16,185,129,0.4) !important;
  box-shadow: 0 0 16px rgba(6,182,212,0.45), 0 0 40px rgba(16,185,129,0.2);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.start-btn:hover {
  box-shadow: 0 0 24px rgba(6,182,212,0.65), 0 0 56px rgba(16,185,129,0.35);
  transform: translateY(-2px);
}
.start-btn:active { transform: scale(0.97); }
.start-btn .el-icon { margin-left: 4px; transition: transform 0.3s; }
.start-btn:hover .el-icon { transform: translateX(3px); }

/* ===== Empty State ===== */
.empty-state { padding: 80px 0; }
.empty-content { text-align: center; }
.empty-icon-wrap {
  width: 72px; height: 72px; margin: 0 auto 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(67,97,238,0.06); border: 2px solid rgba(67,97,238,0.1);
}
.empty-icon { font-size: 2rem; color: var(--accent-blue); }
.empty-text { font-size: 1.1rem; font-weight: 600; color: var(--text-heading); margin-bottom: 6px; }
.empty-hint { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 24px; }
.btn-empty-cta {
  background: linear-gradient(135deg, #06b6d4, #10b981) !important;
  color: #fff !important; border: none !important; border-radius: 10px !important;
  font-weight: 600 !important; padding: 10px 28px !important;
  box-shadow: 0 2px 12px rgba(6,182,212,0.3); transition: all 0.25s;
}
.btn-empty-cta:hover { box-shadow: 0 4px 20px rgba(6,182,212,0.45); transform: translateY(-1px); }

/* ===== Element Plus Overrides ===== */
:deep(.el-loading-mask) { border-radius: 16px; }

/* ===== Animations ===== */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .navbar { padding: 0 16px; }
  .hero-title { font-size: 2.2rem; }
  .page-header { padding: 40px 0 28px; }
  .main-container { padding: 0 16px 40px; }
  .search-bar { flex-direction: column; padding: 16px; }
  .paper-card {
    flex-direction: column; text-align: center; gap: 16px; padding: 20px;
  }
  .card-left { margin-right: 0; }
  .card-body { display: flex; flex-direction: column; align-items: center; }
  .paper-stats { justify-content: center; flex-wrap: wrap; }
  .card-right { margin-left: 0; }
  .start-btn { width: 100%; }
}
@media (max-width: 480px) {
  .nav-actions .btn-nav { display: none; }
  .hero-title { font-size: 1.8rem; }
}
</style>

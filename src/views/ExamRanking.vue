<template>
  <div class="exam-ranking-page">
    <!-- 顶部导航栏 -->
    <div class="navbar">
      <div class="logo">
        <img src="../assets/logo.png" alt="logo" class="logo-img" />
        <span class="logo-title">Stone AI Exam</span>
      </div>
      <div class="nav-actions">
        <el-button class="btn-nav" @click="$router.push('/home')">
          <el-icon><HomeFilled /></el-icon>首页
        </el-button>
        <el-button class="btn-nav" @click="$router.push('/exam/list')">
          <el-icon><Document /></el-icon>进入考试
        </el-button>
        <el-button class="btn-cta" @click="$router.push('/practice')">
          <el-icon><Edit /></el-icon>刷题练习
        </el-button>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <p class="hero-label">EXAMINATION · LEADERBOARD</p>
        <h1 class="hero-title">考试排行榜</h1>
        <p class="hero-desc">实时排名竞技，激发学习动力，勇攀高峰</p>
      </div>

      <!-- 筛选条件 -->
      <div class="filter-bar">
        <div class="filter-inner">
          <span class="filter-label">
            <el-icon><Filter /></el-icon>筛选条件
          </span>
          <el-select
            v-model="selectedPaperId"
            placeholder="选择试卷"
            clearable
            style="width: 280px"
            @change="loadRanking"
          >
            <el-option
              v-for="paper in paperList"
              :key="paper.id"
              :label="paper.name"
              :value="paper.id"
            />
          </el-select>
          <el-select
            v-model="rankingLimit"
            placeholder="显示数量"
            style="width: 140px"
            @change="loadRanking"
          >
            <el-option label="前 10 名" :value="10" />
            <el-option label="前 20 名" :value="20" />
            <el-option label="前 50 名" :value="50" />
            <el-option label="前 100 名" :value="100" />
          </el-select>
          <el-button
            type="primary"
            @click="loadRanking"
            :loading="loading"
            class="btn-refresh"
          >
            <el-icon><Refresh /></el-icon>刷新排行
          </el-button>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 左侧排行榜列表 -->
        <div class="ranking-container">
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="10" animated />
          </div>

          <div v-else-if="rankingList.length > 0" class="ranking-list">
            <div
              v-for="(record, index) in rankingList"
              :key="record.id"
              class="ranking-item"
              :class="[getRankTierClass(index + 1), { 'is-first': index === 0 }]"
            >
              <div class="rank-badge" :class="getRankTierClass(index + 1)">
                <span v-if="index === 0"><el-icon><Trophy /></el-icon></span>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="student-info">
                <div class="student-name">{{ record.studentName }}</div>
                <div class="student-meta">
                  <span>{{ record.paper?.name || '-' }}</span>
                  <span class="meta-sep">·</span>
                  <span>{{ formatDateTime(record.endTime) }}</span>
                </div>
              </div>
              <div class="score-area">
                <div class="score-top">
                  <span class="score-value" :class="getScoreColorClass(record)">{{ record.score }}</span>
                  <span class="score-total">/ {{ record.paper?.totalScore || 100 }}</span>
                  <span class="score-pct" :class="getScoreColorClass(record)">
                    {{ calculatePercentage(record.score, record.paper?.totalScore) }}%
                  </span>
                </div>
                <div class="score-bar">
                  <div
                    class="score-bar-fill"
                    :class="getScoreColorClass(record)"
                    :style="{ width: calculatePercentage(record.score, record.paper?.totalScore) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon-wrap">
              <el-icon class="empty-icon"><Trophy /></el-icon>
            </div>
            <div class="empty-text">暂无排行榜数据</div>
            <div class="empty-hint">快去参加考试，成为第一个上榜的人吧！</div>
            <el-button class="btn-empty-cta" @click="$router.push('/exam/list')">
              立即参加考试
            </el-button>
          </div>
        </div>

        <!-- 右侧统计信息 -->
        <div v-if="allRecords.length > 0" class="statistics-sidebar">
          <div class="stats-header">
            <span class="stats-title">{{ statsTitle }}</span>
            <span class="stats-badge">{{ totalParticipants }} 人</span>
          </div>
          <div class="stats-grid-vert">
            <div class="stat-card-vert">
              <div class="stat-icon-wrap" style="--si-bg: rgba(6,182,212,0.08); --si-color: linear-gradient(135deg, #06b6d4, #10b981);">
                <el-icon class="stat-icon-el"><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalParticipants }}</div>
                <div class="stat-label">参与人数</div>
              </div>
            </div>
            <div class="stat-card-vert">
              <div class="stat-icon-wrap" style="--si-bg: rgba(99,102,241,0.08); --si-color: linear-gradient(135deg, #6366f1, #3b82f6);">
                <el-icon class="stat-icon-el"><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ averageScore }}</div>
                <div class="stat-label">平均分</div>
              </div>
            </div>
            <div class="stat-card-vert">
              <div class="stat-icon-wrap" style="--si-bg: rgba(245,158,11,0.08); --si-color: linear-gradient(135deg, #f59e0b, #ef4444);">
                <el-icon class="stat-icon-el"><Trophy /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ maxScore }}</div>
                <div class="stat-label">最高分</div>
              </div>
            </div>
            <div class="stat-card-vert">
              <div class="stat-icon-wrap" style="--si-bg: rgba(236,72,153,0.08); --si-color: linear-gradient(135deg, #ec4899, #8b5cf6);">
                <el-icon class="stat-icon-el"><Bottom /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ minScore }}</div>
                <div class="stat-label">最低分</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, User, TrendCharts, Trophy, Bottom, HomeFilled, Document, Edit, Filter } from '@element-plus/icons-vue'
import { getExamRanking } from '../api/exam'
import { getPublicPapers } from '../api/paper.js'

const loading = ref(false)
const rankingList = ref([])
const paperList = ref([])
const selectedPaperId = ref(null)
const rankingLimit = ref(10)
const allRecords = ref([])

const averageScore = computed(() => {
  if (allRecords.value.length === 0) return 0
  const total = allRecords.value.reduce((sum, record) => sum + Number(record.score), 0)
  return (total / allRecords.value.length).toFixed(1)
})

const maxScore = computed(() => {
  if (allRecords.value.length === 0) return 0
  return Math.max(...allRecords.value.map(record => Number(record.score)))
})

const minScore = computed(() => {
  if (allRecords.value.length === 0) return 0
  return Math.min(...allRecords.value.map(record => Number(record.score)))
})

const totalParticipants = computed(() => allRecords.value.length)

const statsTitle = computed(() => {
  if (selectedPaperId.value) {
    const selectedPaper = paperList.value.find(p => p.id === selectedPaperId.value)
    return selectedPaper?.name || '选中试卷'
  }
  return '全部试卷统计'
})

const getPaperList = async () => {
  try {
    const res = await getPublicPapers()
    paperList.value = res.data || []
  } catch (error) {
    ElMessage.error('获取试卷列表失败')
  }
}

const loadRanking = async () => {
  loading.value = true
  try {
    const params = { limit: rankingLimit.value || 1000 }
    if (selectedPaperId.value) params.paperId = selectedPaperId.value

    const displayRes = await getExamRanking({ ...params })
    rankingList.value = displayRes.data || []

    const statsRes = await getExamRanking({ limit: 1000, ...(selectedPaperId.value ? { paperId: selectedPaperId.value } : {}) })
    allRecords.value = statsRes.data || []
  } catch (error) {
    ElMessage.error('加载排行榜失败')
  } finally {
    loading.value = false
  }
}

const getRankTierClass = (rank) => {
  if (rank === 1) return 'tier-gold'
  if (rank === 2) return 'tier-silver'
  if (rank === 3) return 'tier-bronze'
  return 'tier-standard'
}

const getScoreColorClass = (record) => {
  const pct = calculatePercentage(record.score, record.paper?.totalScore)
  return pct >= 60 ? 'score-pass' : 'score-fail'
}

const calculatePercentage = (score, totalScore) => {
  if (!score || !totalScore) return 0
  return ((score / totalScore) * 100).toFixed(1)
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

onMounted(() => {
  getPaperList()
  loadRanking()
})
</script>

<style scoped>
/* ===== Design Tokens — 与 Home 统一 ===== */
.exam-ranking-page {
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
  --accent-amber: #f59e0b;
  --accent-rose: #ef4444;
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
.exam-ranking-page::before {
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

/* ===== Page Header — 与 Home hero 一致 ===== */
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

/* ===== Filter Bar ===== */
.filter-bar {
  display: flex; justify-content: center;
  margin-bottom: 32px;
}
.filter-inner {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 24px;
  background: var(--bg-card); border: 1px solid var(--border-card);
  border-radius: 16px;
  box-shadow: var(--shadow-card);
}
.filter-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.8rem; font-weight: 600; color: var(--text-muted);
  letter-spacing: 0.5px; padding-right: 8px;
  border-right: 1px solid var(--border-card);
}
.btn-refresh {
  background: linear-gradient(135deg, #6366f1, #3b82f6) !important;
  color: #fff !important; border: none !important; border-radius: 10px !important;
  font-weight: 600 !important; font-size: 0.82rem !important; padding: 8px 18px !important;
  transition: all 0.25s;
  box-shadow: 0 2px 8px rgba(99,102,241,0.25);
}
.btn-refresh:hover {
  box-shadow: 0 4px 16px rgba(99,102,241,0.4);
  transform: translateY(-1px);
}

/* ===== Main Content Layout ===== */
.main-content { display: flex; gap: 20px; align-items: flex-start; }
.ranking-container { flex: 1; }
.loading-container { padding: 32px; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-card); }

/* ===== Ranking List ===== */
.ranking-list { display: flex; flex-direction: column; gap: 10px; }

.ranking-item {
  display: flex; align-items: center; gap: 16px;
  padding: 18px 22px; border-radius: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  box-shadow: var(--shadow-card);
  transition: all 0.25s ease;
}
.ranking-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
  border-color: rgba(6,182,212,0.35);
}

/* Top 3 特殊光效 */
.ranking-item.tier-gold {
  border-color: rgba(245,158,11,0.3);
  box-shadow: 0 1px 3px rgba(15,23,42,0.04), 0 4px 20px rgba(245,158,11,0.10);
}
.ranking-item.tier-gold:hover {
  border-color: rgba(245,158,11,0.5);
  box-shadow: 0 2px 8px rgba(15,23,42,0.06), 0 10px 32px rgba(245,158,11,0.16);
}
.ranking-item.tier-silver {
  border-color: rgba(148,163,184,0.3);
  box-shadow: 0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(148,163,184,0.08);
}
.ranking-item.tier-silver:hover {
  border-color: rgba(148,163,184,0.5);
  box-shadow: 0 2px 8px rgba(15,23,42,0.06), 0 10px 28px rgba(148,163,184,0.14);
}
.ranking-item.tier-bronze {
  border-color: rgba(212,148,106,0.3);
  box-shadow: 0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(212,148,106,0.08);
}
.ranking-item.tier-bronze:hover {
  border-color: rgba(212,148,106,0.5);
  box-shadow: 0 2px 8px rgba(15,23,42,0.06), 0 10px 28px rgba(212,148,106,0.14);
}

/* ===== Rank Badge ===== */
.rank-badge {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; font-weight: 700; flex-shrink: 0;
  background: #f1f5f9; color: var(--text-muted);
  border: 2px solid #e2e8f0;
  transition: all 0.25s;
}
.tier-gold .rank-badge {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #b45309; border-color: rgba(245,158,11,0.4);
  box-shadow: 0 0 16px rgba(245,158,11,0.25);
  font-size: 18px;
}
.tier-silver .rank-badge {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #64748b; border-color: rgba(148,163,184,0.5);
  box-shadow: 0 0 12px rgba(148,163,184,0.15);
}
.tier-bronze .rank-badge {
  background: linear-gradient(135deg, #fef6ee, #fde0cc);
  color: #b45309; border-color: rgba(212,148,106,0.4);
  box-shadow: 0 0 12px rgba(212,148,106,0.15);
}

/* ===== Student Info ===== */
.student-info { flex: 1; min-width: 0; }
.student-name {
  font-size: 15px; font-weight: 600; color: var(--text-heading);
  margin-bottom: 4px; letter-spacing: -0.2px;
}
.tier-gold .student-name { color: #0f172a; font-weight: 700; }
.student-meta {
  font-size: 0.75rem; color: var(--text-muted);
  display: flex; align-items: center; gap: 6px;
}
.meta-sep { color: #cbd5e1; }

/* ===== Score Area ===== */
.score-area { text-align: right; flex-shrink: 0; min-width: 140px; }
.score-top { display: flex; align-items: baseline; justify-content: flex-end; gap: 4px; margin-bottom: 8px; }
.score-value {
  font-size: 26px; font-weight: 800;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -1px;
}
.score-total { font-size: 0.78rem; color: var(--text-muted); }
.score-pct { font-size: 0.78rem; font-weight: 600; margin-left: 6px; }
.score-pass { color: #06b6d4 !important; }
.score-fail { color: #f97316 !important; }

/* ===== Progress Bar ===== */
.score-bar {
  width: 100%; height: 5px; background: #eef2f7;
  border-radius: 3px; overflow: hidden;
}
.score-bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
.score-bar-fill.score-pass {
  background: linear-gradient(90deg, #06b6d4, #10b981);
  box-shadow: 0 0 10px rgba(6,182,212,0.35);
}
.score-bar-fill.score-fail {
  background: linear-gradient(90deg, #f97316, #ef4444);
  box-shadow: 0 0 10px rgba(249,115,22,0.3);
}

/* ===== Statistics Sidebar ===== */
.statistics-sidebar {
  flex: 0 0 270px;
  padding: 24px 22px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 16px;
  box-shadow: var(--shadow-card);
  height: fit-content; position: sticky; top: 80px;
}
.stats-header {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 14px; margin-bottom: 18px;
  border-bottom: 1px solid var(--border-card);
}
.stats-title {
  font-size: 0.85rem; font-weight: 700; color: var(--text-heading);
  letter-spacing: -0.2px;
}
.stats-badge {
  font-size: 0.7rem; font-weight: 600; color: var(--accent-blue);
  padding: 3px 10px; border-radius: 12px;
  background: rgba(67,97,238,0.06); border: 1px solid rgba(67,97,238,0.1);
}
.stats-grid-vert { display: flex; flex-direction: column; gap: 10px; }

.stat-card-vert {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fafd;
  border: 1px solid #f0f2f7;
  transition: all 0.25s;
}
.stat-card-vert:hover {
  background: #fff;
  border-color: rgba(6,182,212,0.25);
  box-shadow: 0 2px 8px rgba(15,23,42,0.04);
  transform: translateY(-1px);
}
.stat-icon-wrap {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  background: var(--si-bg, rgba(6,182,212,0.08));
}
.stat-icon-el {
  font-size: 1.2rem;
  background: var(--si-color);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.stat-info { flex: 1; min-width: 0; }
.stat-value {
  font-size: 1.3rem; font-weight: 700; color: var(--text-heading);
  line-height: 1.1; margin-bottom: 2px;
  letter-spacing: -0.3px;
}
.stat-label { font-size: 0.73rem; color: var(--text-muted); font-weight: 500; }

/* ===== Empty State ===== */
.empty-state { text-align: center; padding: 80px 0; }
.empty-icon-wrap {
  width: 72px; height: 72px; margin: 0 auto 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.1));
  border: 2px solid rgba(245,158,11,0.15);
}
.empty-icon { font-size: 2rem; color: #f59e0b; }
.empty-text { font-size: 1.1rem; font-weight: 600; color: var(--text-heading); margin-bottom: 6px; }
.empty-hint { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 24px; }
.btn-empty-cta {
  background: linear-gradient(135deg, #06b6d4, #10b981) !important;
  color: #fff !important; border: none !important; border-radius: 10px !important;
  font-weight: 600 !important; padding: 10px 28px !important;
  box-shadow: 0 2px 12px rgba(6,182,212,0.3);
  transition: all 0.25s;
}
.btn-empty-cta:hover {
  box-shadow: 0 4px 20px rgba(6,182,212,0.45);
  transform: translateY(-1px);
}

/* ===== Element Plus Overrides ===== */
:deep(.el-select) { --el-select-border-color-hover: var(--accent-blue); }
:deep(.el-input__wrapper) {
  background: #f8fafd; border: 1px solid var(--border-card); border-radius: 10px;
  box-shadow: none !important; transition: all 0.2s;
}
:deep(.el-input__wrapper:hover) { border-color: #c4cdd9; }
:deep(.el-input__wrapper.is-focus) { border-color: var(--accent-blue); box-shadow: 0 0 0 2px rgba(67,97,238,0.08) !important; }
:deep(.el-input__inner) { color: var(--text-heading); }
:deep(.el-select .el-input .el-select__caret) { color: var(--text-muted); }
:deep(.el-select-dropdown) {
  background: #fff !important; border: 1px solid var(--border-card) !important;
  border-radius: 12px !important; box-shadow: var(--shadow-card-hover) !important;
}
:deep(.el-select-dropdown__item) { color: var(--text-body) !important; }
:deep(.el-select-dropdown__item:hover) { background: #f6f8fc !important; }
:deep(.el-select-dropdown__item.selected) { color: var(--accent-blue) !important; font-weight: 600; }
:deep(.el-skeleton__item) { background: #eef2f7 !important; }

/* ===== Responsive ===== */
@media (max-width: 960px) {
  .main-content { flex-direction: column; }
  .statistics-sidebar { flex: none; width: 100%; position: static; }
}
@media (max-width: 768px) {
  .navbar { padding: 0 16px; }
  .hero-title { font-size: 2.2rem; }
  .page-header { padding: 40px 0 28px; }
  .main-container { padding: 0 16px 40px; }
  .filter-inner { flex-wrap: wrap; justify-content: center; }
  .filter-label { border-right: none; padding-right: 0; }
  .ranking-item { flex-wrap: wrap; gap: 10px; }
  .score-area { width: 100%; text-align: left; }
  .score-top { justify-content: flex-start; }
}
@media (max-width: 480px) {
  .nav-actions .btn-nav { display: none; }
  .hero-title { font-size: 1.8rem; }
}
</style>

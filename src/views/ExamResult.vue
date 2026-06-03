<template>
  <div class="exam-result-page">
    <!-- 顶部导航栏 - 与首页风格一致 -->
    <div class="navbar">
      <div class="logo" @click="goHome" style="cursor:pointer;">
        <img src="../assets/logo.png" alt="logo" class="logo-img" />
        <span class="title">Stone AI Exam</span>
      </div>
      <div class="nav-actions">
        <el-button class="btn-nav" @click="goToRanking">
          <el-icon><Trophy /></el-icon>排行榜
        </el-button>
        <el-button class="btn-cta" @click="goToExamList">
          <el-icon><Document /></el-icon>考试列表
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <el-icon class="is-loading spin-icon"><Loading /></el-icon>
      </div>
      <p class="loading-text">正在加载考试结果，请稍候...</p>
    </div>

    <!-- 主要内容 -->
    <div v-else-if="examRecord" class="result-container">
      <!-- 头部：考试基本信息 -->
      <div class="result-hero">
        <div class="hero-badge">考试结果</div>
        <h1 class="hero-title-text">{{ examRecord.paper.name }}</h1>
        <div class="hero-meta">
          <span v-if="examRecord.studentName" class="meta-item">
            <el-icon><User /></el-icon>{{ examRecord.studentName }}
          </span>
          <span class="meta-item">
            <el-icon><Clock /></el-icon>{{ formatDateTime(examRecord.startTime) }}
          </span>
          <el-tag :type="getStatusTagType(examRecord.status)" size="small" effect="plain" round>
            {{ getStatusText(examRecord.status) }}
          </el-tag>
        </div>
      </div>

      <!-- 分数 + 排名 合并卡片 -->
      <div class="score-rank-section">
        <div class="score-rank-card">
          <!-- 分数区块 -->
          <div class="score-block">
            <div class="score-circle">
              <svg class="score-ring" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e8ecf4" stroke-width="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  :stroke="scoreRingColor"
                  stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="2 * Math.PI * 52"
                  :stroke-dashoffset="2 * Math.PI * 52 * (1 - scorePercentage / 100)"
                  transform="rotate(-90 60 60)"
                  class="score-ring-progress"
                />
              </svg>
              <div class="score-inner">
                <span class="score-big">{{ examRecord.score || 0 }}</span>
                <span class="score-sep">/</span>
                <span class="score-max">{{ examRecord.paper.totalScore }}</span>
              </div>
            </div>
            <div class="score-grade-tag" :class="scoreGradeClass">{{ getGradeText(scorePercentage) }}</div>
            <div class="score-pct">{{ scorePercentage }}%</div>
          </div>

          <!-- 分隔线 -->
          <div class="score-rank-divider"></div>

          <!-- 排名区块 -->
          <div class="rank-block" v-if="rankingInfo">
            <div class="rank-trophy">{{ getTrophyEmoji() }}</div>
            <div class="rank-number-wrap">
              <span class="rank-number-big">{{ rankingInfo.currentRank }}</span>
              <span class="rank-suffix-text">/ {{ rankingInfo.totalParticipants }}</span>
            </div>
            <div class="rank-label-text">当前排名</div>
            <div class="rank-bar-wrap">
              <div class="rank-bar">
                <div
                  class="rank-bar-fill"
                  :style="{ width: `${Math.max(2, 100 - (rankingInfo.currentRank / rankingInfo.totalParticipants) * 100)}%` }"
                ></div>
              </div>
            </div>
            <div class="rank-sub-text">{{ getRankingSubtitle() }}</div>
          </div>
          <div class="rank-block rank-empty" v-else>
            <div class="rank-trophy">📊</div>
            <div class="rank-label-text">暂无排名数据</div>
          </div>
        </div>

        <!-- 详细信息网格 -->
        <div class="detail-grid">
          <div class="detail-card">
            <div class="detail-icon-wrap" style="--d-bg: rgba(6,182,212,0.08); --d-color: #06b6d4;">
              <el-icon><Check /></el-icon>
            </div>
            <div class="detail-num">{{ correctCount }}</div>
            <div class="detail-name">答对</div>
          </div>
          <div class="detail-card">
            <div class="detail-icon-wrap" style="--d-bg: rgba(239,68,68,0.08); --d-color: #ef4444;">
              <el-icon><Close /></el-icon>
            </div>
            <div class="detail-num">{{ wrongCount }}</div>
            <div class="detail-name">答错</div>
          </div>
          <div class="detail-card">
            <div class="detail-icon-wrap" style="--d-bg: rgba(245,158,11,0.08); --d-color: #f59e0b;">
              <el-icon><SemiSelect /></el-icon>
            </div>
            <div class="detail-num">{{ partialCount }}</div>
            <div class="detail-name">部分正确</div>
          </div>
          <div class="detail-card">
            <div class="detail-icon-wrap" style="--d-bg: rgba(139,92,246,0.08); --d-color: #8b5cf6;">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="detail-num">{{ examDuration }}</div>
            <div class="detail-name">用时</div>
          </div>
        </div>
      </div>

      <!-- 操作 + 激励区域 -->
      <div class="action-motivation-row">
        <div v-if="rankingInfo" class="motivation-bar" :class="getMotivationClass()">
          <span class="motivation-emoji">{{ getMotivationIcon() }}</span>
          <span>{{ getMotivationMessage() }}</span>
        </div>
        <div class="action-group">
          <el-button class="btn-action btn-again" @click="retakeChallenge">
            <el-icon><RefreshRight /></el-icon>再次挑战
          </el-button>
          <el-button class="btn-action btn-ranking" @click="viewRanking" v-if="rankingInfo">
            <el-icon><Trophy /></el-icon>查看排行榜
          </el-button>
          <el-button class="btn-action btn-home" @click="goHome">
            <el-icon><HomeFilled /></el-icon>返回首页
          </el-button>
          <el-button
            v-if="examRecord.status === '已批阅'"
            class="btn-action btn-download"
            @click="downloadResult"
          >
            <el-icon><Download /></el-icon>下载成绩单
          </el-button>
        </div>
      </div>

      <!-- AI考试总评 -->
      <div v-if="examRecord.status === '已批阅' && examRecord.summary" class="ai-summary-card">
        <div class="ai-summary-header">
          <span class="ai-icon">🤖</span>
          <h3>AI 考试总评</h3>
        </div>
        <p class="ai-summary-text">{{ examRecord.summary }}</p>
      </div>

      <!-- 答题详情 -->
      <div v-if="examRecord.status === '已批阅'" class="answers-section">
        <div class="section-label">答题详情</div>
        <h2 class="section-heading">逐题回顾与分析</h2>
        <div class="answer-cards">
          <div v-for="(answerRecord, index) in examRecord.answerRecords" :key="answerRecord.id" class="answer-card">
            <div class="answer-card-header">
              <div class="answer-num">第 {{ index + 1 }} 题</div>
              <div class="answer-type-tag">{{ getQuestionTypeByRecord(answerRecord) }}</div>
              <div class="answer-score-badge" :class="getScoreClassByRecord(answerRecord)">
                {{ answerRecord.score || 0 }} / {{ getQuestionMaxScore(answerRecord.questionId) }} 分
              </div>
            </div>
            <div class="answer-body">
              <div class="answer-question-title">{{ getQuestionTitleByRecord(answerRecord) }}</div>

              <!-- 选择题选项 -->
              <div v-if="getQuestionByRecord(answerRecord)?.type === 'CHOICE' && getQuestionByRecord(answerRecord)?.choices" class="answer-choices">
                <div
                  v-for="(choice, idx) in getQuestionByRecord(answerRecord).choices"
                  :key="idx"
                  class="answer-choice-item"
                  :class="{
                    'choice-selected': getFormattedUserAnswer(answerRecord) === choice.content,
                    'choice-correct': getFormattedCorrectAnswer(answerRecord) === choice.content
                  }"
                >
                  <span class="choice-letter">{{ String.fromCharCode(65 + idx) }}</span>
                  <span class="choice-text">{{ choice.content }}</span>
                </div>
              </div>

              <!-- 答案区域 -->
              <div class="answer-compare">
                <div class="answer-row user-row">
                  <span class="answer-row-label">你的答案</span>
                  <span class="answer-row-value" :class="{ 'is-wrong': getFormattedUserAnswer(answerRecord) !== getFormattedCorrectAnswer(answerRecord) }">
                    {{ getFormattedUserAnswer(answerRecord) || '未作答' }}
                  </span>
                </div>
                <div class="answer-row correct-row">
                  <span class="answer-row-label">标准答案</span>
                  <span class="answer-row-value is-correct">{{ getFormattedCorrectAnswer(answerRecord) }}</span>
                </div>
              </div>

              <!-- AI评语 -->
              <div v-if="answerRecord.aiCorrection && getQuestionByRecord(answerRecord)?.type === 'TEXT'" class="answer-ai-feedback">
                <div class="ai-feedback-header">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>AI 评语</span>
                </div>
                <p>{{ answerRecord.aiCorrection }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成绩单下载区域（隐藏） -->
    <div ref="downloadArea" class="download-area" style="position: absolute; left: -9999px; top: -9999px;">
      <div class="result-certificate">
        <div class="certificate-header">
          <h1>🎓 考试成绩单</h1>
          <div class="certificate-decoration"></div>
        </div>
        <div class="certificate-body">
          <div class="student-info">
            <h2>{{ examRecord?.studentName || '考生' }}</h2>
            <p>于 {{ formatDateTime(examRecord?.endTime) }} 完成</p>
          </div>
          <div class="exam-details">
            <h3>{{ examRecord?.paper?.name }}</h3>
            <div class="score-display-cert" :class="scoreClass">
              <div class="score-main">{{ examRecord?.score || 0 }} / {{ examRecord?.paper?.totalScore }}</div>
              <div class="score-percentage-cert">{{ scorePercentage }}%</div>
            </div>
          </div>
          <div class="performance-stats">
            <div class="stat-item"><span>题目总数</span><span>{{ actualQuestionCount }} 道</span></div>
            <div class="stat-item"><span>答对题数</span><span>{{ correctCount }} 道</span></div>
            <div class="stat-item"><span>用时</span><span>{{ examDuration }}</span></div>
          </div>
          <div v-if="examRecord?.summary" class="ai-summary-cert">
            <h4>🤖 AI学习建议</h4>
            <p>{{ examRecord.summary }}</p>
          </div>
        </div>
        <div class="certificate-footer">
          <p>智能学习平台 · AI驱动</p>
          <p>{{ new Date().toLocaleDateString() }} 生成</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Loading, ChatDotRound, HomeFilled, Trophy, Document, User,
  Clock, Check, Close, SemiSelect, Timer, RefreshRight, Download
} from '@element-plus/icons-vue'
import { getExamRecordById, getExamRanking } from '../api/exam.js'
import html2canvas from 'html2canvas'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const examRecord = ref(null)
const downloadArea = ref(null)
const rankingInfo = ref(null)

// ---- 计算属性 ----
const scorePercentage = computed(() => {
  if (!examRecord.value || !examRecord.value.paper) return 0
  return Math.round((examRecord.value.score / examRecord.value.paper.totalScore) * 100)
})

const scoreRingColor = computed(() => {
  const pct = scorePercentage.value
  if (pct >= 90) return '#10b981'
  if (pct >= 80) return '#06b6d4'
  if (pct >= 60) return '#f59e0b'
  return '#ef4444'
})

const scoreGradeClass = computed(() => {
  const pct = scorePercentage.value
  if (pct >= 90) return 'grade-excellent'
  if (pct >= 80) return 'grade-good'
  if (pct >= 60) return 'grade-pass'
  return 'grade-fail'
})

// 用于下载证书区域的 class
const scoreClass = computed(() => {
  const pct = scorePercentage.value
  if (pct >= 90) return 'excellent'
  if (pct >= 80) return 'good'
  if (pct >= 60) return 'pass'
  return 'fail'
})

const correctCount = computed(() => {
  if (!examRecord.value?.answerRecords) return 0
  return examRecord.value.answerRecords.filter(r => r.isCorrect === 1).length
})

const actualQuestionCount = computed(() => {
  if (!examRecord.value?.answerRecords) return 0
  return examRecord.value.answerRecords.length
})

const wrongCount = computed(() => {
  if (!examRecord.value?.answerRecords) return 0
  return examRecord.value.answerRecords.filter(r => r.isCorrect === 0).length
})

const partialCount = computed(() => {
  if (!examRecord.value?.answerRecords) return 0
  return examRecord.value.answerRecords.filter(r => r.isCorrect === 2).length
})

const examDuration = computed(() => {
  if (!examRecord.value?.startTime || !examRecord.value?.endTime) return '--'
  const start = new Date(examRecord.value.startTime)
  const end = new Date(examRecord.value.endTime)
  const diffMins = Math.floor((end - start) / 60000)
  return `${diffMins} 分钟`
})

// ---- 工具方法 ----
const getStatusText = (s) => ({ '进行中': '考试中', '已完成': '待批阅', '已批阅': '已完成' }[s] || s)
const getStatusTagType = (s) => ({ '进行中': 'warning', '已完成': 'info', '已批阅': 'success' }[s] || 'info')
const getQuestionTypeText = (t) => ({ CHOICE: '选择题', JUDGE: '判断题', TEXT: '简答题' }[t] || '未知题型')

const formatDateTime = (dt) => dt ? new Date(dt).toLocaleString('zh-CN') : '未知时间'

const getGradeText = (pct) => {
  if (pct >= 90) return '优秀'
  if (pct >= 80) return '良好'
  if (pct >= 60) return '及格'
  return '不及格'
}

const getQuestionByRecord = (ar) => examRecord.value?.paper?.questions?.find(q => q.id === ar.questionId)
const getQuestionTitleByRecord = (ar) => getQuestionByRecord(ar)?.title || '题目信息缺失'
const getQuestionTypeByRecord = (ar) => getQuestionTypeText(getQuestionByRecord(ar)?.type || 'UNKNOWN')
const getQuestionMaxScore = (qid) => examRecord.value?.paper?.questions?.find(q => q.id === qid)?.paperScore || 10

const formatJudgeAnswer = (a) => {
  if (!a) return '未作答'
  const s = a.toString().toUpperCase()
  if (['T', 'TRUE', '正确', '对'].includes(s)) return '正确'
  if (['F', 'FALSE', '错误', '错'].includes(s)) return '错误'
  return a
}

const getFormattedUserAnswer = (ar) => {
  if (!ar.userAnswer) return '未作答'
  const q = getQuestionByRecord(ar)
  return q?.type === 'JUDGE' ? formatJudgeAnswer(ar.userAnswer) : ar.userAnswer
}

const getFormattedCorrectAnswer = (ar) => {
  const q = getQuestionByRecord(ar)
  if (!q?.answer?.answer) return '答案信息缺失'
  return q.type === 'JUDGE' ? formatJudgeAnswer(q.answer.answer) : q.answer.answer
}

const getScoreClassByRecord = (ar) => {
  const score = ar.score || 0
  const max = getQuestionMaxScore(ar.questionId)
  if (score === 0) return 'score-zero'
  if (score === max) return 'score-full'
  return 'score-partial'
}

// ---- 排名 ----
const getTrophyEmoji = () => {
  if (!rankingInfo.value) return '🏆'
  const r = rankingInfo.value.currentRank
  if (r === 1) return '🥇'
  if (r === 2) return '🥈'
  if (r === 3) return '🥉'
  if (r <= 10) return '🏆'
  return '📊'
}

const getRankingSubtitle = () => {
  if (!rankingInfo.value) return ''
  const r = rankingInfo.value.currentRank
  if (r === 1) return '恭喜夺冠！🏆'
  if (r === 2) return '仅差一步之遥！'
  if (r === 3) return '站上领奖台！'
  if (r <= 10) return '实力进入前十！'
  if (r <= 20) return '表现优秀！'
  return '继续努力！'
}

const getMotivationClass = () => {
  if (!rankingInfo.value) return ''
  const r = rankingInfo.value.currentRank
  if (r <= 3) return 'motivation-top'
  if (r <= 10) return 'motivation-good'
  return 'motivation-normal'
}

const getMotivationIcon = () => {
  if (!rankingInfo.value) return '💪'
  const r = rankingInfo.value.currentRank
  if (r === 1) return '🎉'
  if (r <= 3) return '🔥'
  if (r <= 10) return '⚡'
  return '💪'
}

const getMotivationMessage = () => {
  if (!rankingInfo.value) return '继续加油！'
  const r = rankingInfo.value.currentRank
  const pct = scorePercentage.value
  if (r === 1 && pct >= 90) return '完美表现！你就是学霸！'
  if (r === 1) return '恭喜夺冠！保持领先！'
  if (r === 2) return '距离第一只有一步之遥！'
  if (r === 3) return '勇夺季军，向更高冲刺！'
  if (r <= 10 && pct >= 80) return '前十实力，还有上升空间！'
  if (r <= 10) return '前十强，继续加油！'
  if (pct >= 80) return '分数不错，排名还能提升！'
  return '每一次努力都会有收获！'
}

const fetchRankingInfo = async (recordId, paperId) => {
  try {
    const result = await getExamRanking({ paperId, limit: 1000 })
    if (result.code === 200) {
      const rankings = result.data
      const sorted = rankings.sort((a, b) => b.score - a.score)
      const idx = sorted.findIndex(r => r.id === recordId)
      if (idx !== -1) {
        rankingInfo.value = {
          currentRank: idx + 1,
          totalParticipants: rankings.length,
          beatPercentage: rankings.length > 1 ? Math.round(((rankings.length - idx - 1) / (rankings.length - 1)) * 100) : 0
        }
      }
    }
  } catch (e) { /* 排名获取失败不影响页面 */ }
}

const fetchExamResult = async () => {
  loading.value = true
  try {
    const examRecordId = route.params.id || route.query.id
    if (!examRecordId) throw new Error('缺少考试记录ID')
    const res = await getExamRecordById(examRecordId)
    examRecord.value = res.data
    if (examRecord.value.status === '已批阅') {
      await fetchRankingInfo(examRecord.value.id, examRecord.value.examId)
    }
  } catch (error) {
    console.error('加载考试结果失败:', error)
    ElMessage.error('加载考试结果失败')
  } finally {
    loading.value = false
  }
}

const downloadResult = async () => {
  try {
    ElMessage.info('正在生成成绩单...')
    const canvas = await html2canvas(downloadArea.value, {
      backgroundColor: '#ffffff', scale: 2, useCORS: true, allowTaint: true
    })
    const link = document.createElement('a')
    link.download = `考试成绩单_${examRecord.value?.studentName || '考生'}_${new Date().toLocaleDateString()}.png`
    link.href = canvas.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('成绩单下载成功！')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请稍后重试')
  }
}

const retakeChallenge = () => {
  if (examRecord.value?.paper?.id) {
    router.push(`/exam/start/${examRecord.value.paper.id}`)
  } else {
    ElMessage.warning('未获取到试卷信息')
    router.push('/exam/list')
  }
}

const viewRanking = () => {
  if (examRecord.value?.paper?.id) {
    router.push({ path: '/exam-ranking', query: { paperId: examRecord.value.paper.id } })
  } else {
    ElMessage.warning('未获取到试卷信息')
  }
}

const goHome = () => router.push('/')
const goToExamList = () => router.push('/exam/list')

const goToRanking = () => {
  if (examRecord.value?.paper?.id) {
    router.push({ path: '/exam-ranking', query: { paperId: examRecord.value.paper.id } })
  } else {
    router.push('/exam-ranking')
  }
}

// 防返回
const setupBackGuard = () => {
  const url = window.location.href
  window.history.pushState({ page: 'exam-result', preventBack: true }, '', url)
  const handler = (e) => {
    if (e.state?.preventBack) {
      window.history.pushState({ page: 'exam-result', preventBack: true }, '', url)
      ElMessage.warning('考试已完成，请使用页面按钮导航')
      return
    }
  }
  window.addEventListener('popstate', handler)
  return () => window.removeEventListener('popstate', handler)
}

let cleanupBackGuard = null

onMounted(() => {
  fetchExamResult()
  const currentPath = route.path
  if (currentPath.includes('/exam-result/')) {
    router.replace({ path: currentPath, query: { ...route.query, fromExam: 'true' } })
  }
  cleanupBackGuard = setupBackGuard()
})

onUnmounted(() => {
  if (cleanupBackGuard) cleanupBackGuard()
})
</script>

<style scoped>
/* ===== 全局变量（与首页对齐） ===== */
.exam-result-page {
  --bg-page: #f6f8fc;
  --bg-card: #ffffff;
  --border-card: #e8ecf4;
  --text-heading: #0f172a;
  --text-body: #475569;
  --text-muted: #8090a8;
  --accent-blue: #4361ee;
  --accent-purple: #7c3aed;
  --accent-cyan: #06b6d4;
  --shadow-xs: 0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06);
  --shadow-card: 0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06);
  --shadow-card-hover: 0 2px 8px rgba(15,23,42,0.06), 0 10px 28px rgba(15,23,42,0.08);

  min-height: 100vh;
  color: var(--text-body);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  position: relative;
  overflow-x: hidden;
  background: var(--bg-page);
}

/* Aura glow — 与首页一致 */
.exam-result-page::before {
  content: '';
  position: fixed; top: 0; left: 0; right: 0; height: 600px; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 80% 55% at 15% 0%, rgba(124,58,237,0.10) 0%, transparent 50%),
    radial-gradient(ellipse 60% 45% at 85% 5%, rgba(67,97,238,0.08) 0%, transparent 48%),
    radial-gradient(ellipse 50% 40% at 50% 40%, rgba(6,182,212,0.06) 0%, transparent 55%),
    radial-gradient(ellipse 40% 35% at 20% 65%, rgba(16,185,129,0.05) 0%, transparent 48%),
    linear-gradient(to bottom, #e8eef8 0%, #f2f4fb 30%, var(--bg-page) 100%);
}

/* ===== Navbar — 与首页完全一致 ===== */
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

.btn-cta {
  background: linear-gradient(135deg, #06b6d4, #10b981) !important;
  color: #fff !important; border: 2px solid rgba(16,185,129,0.4) !important; border-radius: 20px !important;
  font-weight: 700 !important; font-size: 0.85rem !important; height: 36px; padding: 0 22px;
  box-shadow: 0 0 16px rgba(6,182,212,0.5), 0 0 48px rgba(16,185,129,0.25);
  animation: ctaGlow 2.5s ease-in-out infinite;
  transition: all 0.3s;
}
.btn-cta:hover {
  box-shadow: 0 0 24px rgba(6,182,212,0.7), 0 0 64px rgba(16,185,129,0.4);
  transform: scale(1.05);
}
@keyframes ctaGlow {
  0%, 100% { box-shadow: 0 0 16px rgba(6,182,212,0.5), 0 0 48px rgba(16,185,129,0.25); }
  50% { box-shadow: 0 0 24px rgba(6,182,212,0.7), 0 0 64px rgba(16,185,129,0.4); }
}

/* ===== 加载状态 ===== */
.loading-container {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 400px; position: relative; z-index: 1;
}
.spin-icon { font-size: 40px; color: var(--accent-blue); margin-bottom: 16px; }
.loading-text { font-size: 0.92rem; color: var(--text-muted); }

/* ===== 主容器 ===== */
.result-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 36px 80px;
  position: relative;
  z-index: 1;
}

/* ===== 头部 Hero ===== */
.result-hero {
  text-align: center;
  padding: 72px 0 48px;
}
.hero-badge {
  display: inline-block;
  font-size: 0.7rem; font-weight: 600; color: var(--accent-blue);
  letter-spacing: 4px; text-transform: uppercase; margin-bottom: 16px;
  padding: 4px 14px; border-radius: 20px;
  background: rgba(67,97,238,0.05); border: 1px solid rgba(67,97,238,0.08);
}
.hero-title-text {
  font-size: 2.2rem; font-weight: 800; letter-spacing: -0.8px; margin: 0 0 20px;
  color: var(--text-heading);
}
.hero-meta {
  display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap;
  color: var(--text-muted); font-size: 0.85rem;
}
.meta-item { display: flex; align-items: center; gap: 5px; }

/* ===== 分数 + 排名合并卡片 ===== */
.score-rank-section {
  margin-bottom: 32px;
}
.score-rank-card {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
  margin-bottom: 20px;
}

/* 分数区块 */
.score-block {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px 32px;
  min-width: 0;
}
.score-circle {
  position: relative;
  width: 120px; height: 120px;
  margin-bottom: 14px;
}
.score-ring {
  width: 120px; height: 120px;
}
.score-ring-progress {
  transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.score-inner {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  display: flex; align-items: baseline; gap: 2px;
}
.score-big { font-size: 2rem; font-weight: 800; color: var(--text-heading); line-height: 1; }
.score-sep { font-size: 1rem; color: var(--text-muted); margin: 0 2px; }
.score-max { font-size: 1.1rem; color: var(--text-muted); }

.score-grade-tag {
  font-size: 0.8rem; font-weight: 700; padding: 4px 16px; border-radius: 14px;
  margin-bottom: 6px; letter-spacing: 0.5px;
}
.grade-excellent { background: rgba(16,185,129,0.08); color: #10b981; }
.grade-good { background: rgba(6,182,212,0.08); color: #06b6d4; }
.grade-pass { background: rgba(245,158,11,0.08); color: #f59e0b; }
.grade-fail { background: rgba(239,68,68,0.08); color: #ef4444; }

.score-pct {
  font-size: 0.82rem; font-weight: 600; color: var(--text-muted);
}

/* 分隔线 */
.score-rank-divider {
  width: 1px;
  align-self: stretch;
  background: var(--border-card);
  flex-shrink: 0;
}

/* 排名区块 */
.rank-block {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px 32px;
  min-width: 0;
  background: linear-gradient(180deg, #fafbfd 0%, #f6f8fc 100%);
}
.rank-block.rank-empty {
  opacity: 0.5;
}
.rank-trophy {
  font-size: 48px; margin-bottom: 10px;
  animation: trophyFloat 2.5s ease-in-out infinite;
}
@keyframes trophyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.rank-number-wrap {
  display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px;
}
.rank-number-big {
  font-size: 2.5rem; font-weight: 800; color: var(--text-heading); line-height: 1;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.rank-suffix-text {
  font-size: 0.9rem; color: var(--text-muted);
}
.rank-label-text {
  font-size: 0.82rem; font-weight: 600; color: var(--text-muted);
  margin-bottom: 14px;
}
.rank-bar-wrap {
  width: 80%; margin-bottom: 8px;
}
.rank-bar {
  height: 6px; background: #e8ecf4; border-radius: 3px; overflow: hidden;
}
.rank-bar-fill {
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.rank-sub-text {
  font-size: 0.78rem; color: var(--text-muted); font-weight: 500;
}

/* ===== 详细信息网格 ===== */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.detail-card {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 16px;
  padding: 22px 16px;
  text-align: center;
  box-shadow: var(--shadow-card);
  transition: all 0.25s;
}
.detail-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}
.detail-icon-wrap {
  width: 42px; height: 42px; margin: 0 auto 12px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: var(--d-bg);
  color: var(--d-color);
  font-size: 1.1rem;
}
.detail-num {
  font-size: 1.5rem; font-weight: 800; color: var(--text-heading); line-height: 1.1; margin-bottom: 2px;
}
.detail-name {
  font-size: 0.76rem; color: var(--text-muted); font-weight: 500;
}

/* ===== 操作 + 激励 ===== */
.action-motivation-row {
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  margin-bottom: 40px; flex-wrap: wrap;
}
.motivation-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 20px; border-radius: 14px;
  font-size: 0.88rem; font-weight: 600;
}
.motivation-emoji { font-size: 1.2rem; }
.motivation-top { background: linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,237,78,0.08)); color: #b45309; }
.motivation-good { background: linear-gradient(135deg, rgba(6,182,212,0.08), rgba(16,185,129,0.06)); color: #0e7490; }
.motivation-normal { background: rgba(67,97,238,0.06); color: var(--accent-blue); }

.action-group {
  display: flex; gap: 10px; flex-wrap: wrap; margin-left: auto;
}
.btn-action {
  border-radius: 20px !important; font-weight: 600 !important; font-size: 0.84rem !important;
  height: 38px; padding: 0 20px; transition: all 0.25s;
}
.btn-again {
  background: linear-gradient(135deg, #6366f1, #3b82f6) !important;
  color: #fff !important; border: none !important;
  box-shadow: 0 2px 10px rgba(99,102,241,0.3);
}
.btn-again:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(99,102,241,0.4); }

.btn-ranking {
  background: linear-gradient(135deg, #f59e0b, #fbbf24) !important;
  color: #fff !important; border: none !important;
  box-shadow: 0 2px 10px rgba(245,158,11,0.3);
}
.btn-ranking:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(245,158,11,0.4); }

.btn-home {
  background: var(--bg-card) !important; color: var(--text-body) !important;
  border: 1px solid var(--border-card) !important;
}
.btn-home:hover { color: var(--accent-blue) !important; border-color: var(--accent-blue) !important; }

.btn-download {
  background: linear-gradient(135deg, #10b981, #34d399) !important;
  color: #fff !important; border: none !important;
  box-shadow: 0 2px 10px rgba(16,185,129,0.3);
}
.btn-download:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(16,185,129,0.4); }

/* ===== AI 总评卡片 ===== */
.ai-summary-card {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 18px;
  padding: 28px 32px;
  margin-bottom: 48px;
  box-shadow: var(--shadow-card);
  border-left: 4px solid var(--accent-blue);
}
.ai-summary-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
}
.ai-icon { font-size: 1.3rem; }
.ai-summary-header h3 {
  margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--text-heading);
}
.ai-summary-text {
  margin: 0; font-size: 0.92rem; line-height: 1.8; color: var(--text-body);
}

/* ===== 答题详情 ===== */
.answers-section {
  margin-bottom: 24px;
}
.section-label {
  font-size: 0.7rem; font-weight: 600; color: var(--accent-blue);
  letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px;
}
.section-heading {
  font-size: 1.4rem; font-weight: 700; color: var(--text-heading);
  margin: 0 0 24px; letter-spacing: -0.3px;
}

.answer-cards {
  display: flex; flex-direction: column; gap: 14px;
}
.answer-card {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all 0.25s;
}
.answer-card:hover {
  box-shadow: var(--shadow-card-hover);
  border-color: rgba(6,182,212,0.3);
}

/* 答题卡片头部 */
.answer-card-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 22px;
  background: linear-gradient(180deg, #fafbfd 0%, #f5f7fb 100%);
  border-bottom: 1px solid var(--border-card);
}
.answer-num {
  font-weight: 700; font-size: 0.9rem; color: var(--text-heading);
}
.answer-type-tag {
  font-size: 0.72rem; font-weight: 600; color: var(--accent-blue);
  background: rgba(67,97,238,0.06); padding: 3px 10px; border-radius: 10px;
}
.answer-score-badge {
  margin-left: auto; font-size: 0.82rem; font-weight: 700;
  padding: 4px 12px; border-radius: 12px;
}
.score-full { background: rgba(16,185,129,0.08); color: #10b981; }
.score-partial { background: rgba(245,158,11,0.08); color: #f59e0b; }
.score-zero { background: rgba(239,68,68,0.08); color: #ef4444; }

/* 答题卡片内容 */
.answer-body {
  padding: 22px;
}
.answer-question-title {
  font-size: 0.93rem; font-weight: 600; color: var(--text-heading);
  line-height: 1.6; margin-bottom: 18px;
}

/* 选择题选项 */
.answer-choices {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;
  margin-bottom: 18px;
}
.answer-choice-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: #f8fafd; border: 1px solid var(--border-card); border-radius: 10px;
  transition: all 0.2s;
}
.answer-choice-item.choice-selected {
  border-color: #ef4444; background: rgba(239,68,68,0.04);
}
.answer-choice-item.choice-correct {
  border-color: #10b981; background: rgba(16,185,129,0.06);
}
.answer-choice-item.choice-selected.choice-correct {
  border-color: #10b981; background: rgba(16,185,129,0.08);
}
.choice-letter {
  display: flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #3b82f6);
  color: #fff; font-weight: 700; font-size: 0.75rem; flex-shrink: 0;
}
.choice-text { font-size: 0.84rem; color: var(--text-body); line-height: 1.4; }

/* 用户答案 vs 标准答案 */
.answer-compare {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;
}
.answer-row {
  display: flex; flex-direction: column; gap: 6px;
  padding: 14px 16px; border-radius: 12px;
}
.user-row {
  background: linear-gradient(180deg, #e8eeff 0%, #f0f3fa 100%);
}
.correct-row {
  background: linear-gradient(180deg, #ecfdf5 0%, #f0fdf4 100%);
}
.answer-row-label {
  font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;
}
.answer-row-value {
  font-size: 0.9rem; font-weight: 600; color: var(--text-heading);
}
.answer-row-value.is-wrong { color: #ef4444; }
.answer-row-value.is-correct { color: #10b981; }

/* AI评语 */
.answer-ai-feedback {
  margin-top: 4px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #fffbeb 0%, #fffdf5 100%);
  border: 1px solid #fde68a; border-radius: 12px;
}
.ai-feedback-header {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.82rem; font-weight: 700; color: #b45309; margin-bottom: 8px;
}
.answer-ai-feedback p {
  margin: 0; font-size: 0.84rem; color: #78350f; line-height: 1.6;
}

/* ===== 下载成绩单（隐藏） ===== */
.download-area { width: 800px; background: white; }
.result-certificate {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; padding: 60px; font-family: 'Microsoft YaHei', sans-serif;
}
.certificate-header { text-align: center; margin-bottom: 50px; }
.certificate-header h1 { font-size: 36px; margin: 0 0 20px 0; font-weight: 700; }
.certificate-decoration {
  width: 100px; height: 4px;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  margin: 0 auto; border-radius: 2px;
}
.certificate-body { text-align: center; }
.student-info h2 { font-size: 28px; margin: 0 0 10px 0; font-weight: 600; }
.student-info p { font-size: 16px; opacity: 0.9; margin-bottom: 40px; }
.exam-details h3 { font-size: 24px; margin: 0 0 30px 0; font-weight: 500; }
.score-display-cert {
  background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px);
  border-radius: 20px; padding: 30px; margin: 30px auto; max-width: 300px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.score-percentage-cert { font-size: 24px; font-weight: 600; }
.performance-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 40px 0;
}
.stat-item {
  background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(5px);
  padding: 20px; border-radius: 15px; border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex; flex-direction: column; gap: 8px;
}
.stat-item span:first-child { font-size: 14px; opacity: 0.8; }
.stat-item span:last-child { font-size: 18px; font-weight: 600; }
.ai-summary-cert {
  background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(5px);
  padding: 25px; border-radius: 15px; border: 1px solid rgba(255, 255, 255, 0.2);
  margin: 30px 0; text-align: left;
}
.ai-summary-cert h4 { margin: 0 0 15px 0; font-size: 18px; font-weight: 600; }
.ai-summary-cert p { margin: 0; line-height: 1.6; font-size: 14px; }
.certificate-footer { margin-top: 50px; text-align: center; opacity: 0.8; font-size: 14px; }
.certificate-footer p { margin: 5px 0; }

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .navbar { padding: 0 16px; }
  .result-container { padding: 0 16px 48px; }
  .result-hero { padding: 40px 0 32px; }
  .hero-title-text { font-size: 1.4rem; }
  .score-rank-card { flex-direction: column; }
  .score-rank-divider { width: 100%; height: 1px; }
  .score-block, .rank-block { padding: 28px 20px; }
  .detail-grid { grid-template-columns: repeat(2, 1fr); }
  .action-motivation-row { flex-direction: column; align-items: stretch; }
  .action-group { margin-left: 0; justify-content: center; }
  .answer-compare { grid-template-columns: 1fr; }
  .answer-choices { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .detail-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .action-group { flex-direction: column; }
}
</style>

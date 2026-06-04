<template>
  <div class="exam-page">
    <!-- AI智能判卷进度遮罩 -->
    <div v-if="isGrading" class="grading-overlay">
      <div class="grading-content">
        <div class="grading-icon">
          <div class="ai-brain">
            <span class="brain-dot"></span>
            <span class="brain-dot"></span>
            <span class="brain-dot"></span>
          </div>
        </div>
        <h3>AI 正在批改你的试卷</h3>
        <p class="grading-desc">题目数量不同，批改进度可能有所差异，请耐心等待</p>
        <div class="grading-status">
          <span class="status-dot"></span>
          <span class="status-text">{{ gradingStatusText }}</span>
        </div>
        <div class="grading-pulse">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
    </div>

    <!-- ===== 顶部深色状态栏 ===== -->
    <div class="exam-topbar">
      <div class="topbar-inner">
        <!-- 左侧：考试名称 -->
        <div class="topbar-left">
          <div class="paper-badge">
            <el-icon :size="16"><EditPen /></el-icon>
          </div>
          <h1 class="paper-name">{{ examRecord.paper?.name || '在线考试' }}</h1>
        </div>

        <!-- 中间：考生姓名（放大突出） -->
        <div class="topbar-center" v-if="examRecord.studentName">
          <el-icon :size="18"><User /></el-icon>
          <span class="student-name-big">{{ examRecord.studentName }}</span>
        </div>

        <!-- 右侧：倒计时 + 进度条 -->
        <div class="topbar-right">
          <div class="timer-block">
            <div class="timer-icon-wrap">
              <el-icon :size="18"><Timer /></el-icon>
            </div>
            <div class="timer-info">
              <span class="timer-label">剩余时间</span>
              <span class="timer-value" :class="{ 'timer-urgent': remainingTime <= 300 }">{{ formattedTime }}</span>
            </div>
          </div>
          <div class="progress-wrap">
            <el-progress
              :percentage="progressPercentage"
              :stroke-width="6"
              :show-text="false"
              class="exam-progress"
            />
            <span class="progress-text">{{ progressPercentage }}%</span>
          </div>
        </div>
      </div>
      <!-- 底部发光条 -->
      <div class="topbar-glow"></div>
    </div>

    <!-- ===== 试题区域 ===== -->
    <div class="question-area" v-if="examRecord.paper">
      <div v-for="(group, type) in groupedQuestions" :key="type" class="question-group">
        <!-- 题型标题 -->
        <div class="group-header">
          <span class="group-badge">{{ getQuestionTypeName(type).charAt(0) }}</span>
          <h3 class="group-title">{{ getQuestionTypeName(type) }}</h3>
          <span class="group-count">{{ group.length }} 题</span>
        </div>

        <!-- 题目卡片 -->
        <div v-for="(question, index) in group" :key="question.id" class="question-card">
          <!-- 题号标签 -->
          <div class="question-head">
            <span class="q-index-tag">第 {{ question.globalIndex }} 题</span>
            <span class="q-score-tag">{{ question.paperScore }} 分</span>
            <span v-if="question.type === 'CHOICE' && question.multi" class="q-type-tag q-type--multi">多选</span>
            <span v-else-if="question.type === 'CHOICE' && !question.multi" class="q-type-tag q-type--single">单选</span>
            <span v-else-if="question.type === 'JUDGE'" class="q-type-tag q-type--judge">判断</span>
            <span v-else-if="question.type === 'TEXT'" class="q-type-tag q-type--text">简答</span>
          </div>

          <!-- 题目内容 -->
          <p class="question-content">{{ question.title }}</p>

          <!-- 选项区域 -->
          <div class="question-options">
            <!-- 单选题 -->
            <el-radio-group
              v-if="question.type === 'CHOICE' && !question.multi"
              v-model="answers[question.id]"
              class="option-group"
            >
              <el-radio
                v-for="(choice, optIndex) in question.choices"
                :key="choice.id"
                :label="getOptionLabel(optIndex)"
                class="option-card"
              >
                <span class="opt-letter">{{ getOptionLabel(optIndex) }}</span>
                <span class="opt-text">{{ choice.content }}</span>
              </el-radio>
            </el-radio-group>

            <!-- 多选题 -->
            <el-checkbox-group
              v-if="question.type === 'CHOICE' && question.multi"
              v-model="answers[question.id]"
              class="option-group"
            >
              <el-checkbox
                v-for="(choice, optIndex) in question.choices"
                :key="choice.id"
                :label="getOptionLabel(optIndex)"
                class="option-card option-card--multi"
              >
                <span class="opt-letter opt-letter--multi">{{ getOptionLabel(optIndex) }}</span>
                <span class="opt-text">{{ choice.content }}</span>
              </el-checkbox>
            </el-checkbox-group>

            <!-- 判断题 -->
            <el-radio-group
              v-else-if="question.type === 'JUDGE'"
              v-model="answers[question.id]"
              class="judge-group"
            >
              <el-radio label="T" class="judge-card judge-card--right">
                <span class="judge-icon">✓</span>
                <span>正确</span>
              </el-radio>
              <el-radio label="F" class="judge-card judge-card--wrong">
                <span class="judge-icon">✗</span>
                <span>错误</span>
              </el-radio>
            </el-radio-group>

            <!-- 简答题 -->
            <el-input
              v-else-if="question.type === 'TEXT'"
              type="textarea"
              :rows="4"
              placeholder="请输入你的答案（禁止粘贴，请手动输入）"
              v-model="answers[question.id]"
              class="text-answer"
              @paste.prevent="handlePasteAttempt"
              @contextmenu.prevent="handleRightClick"
              @keydown="handleKeyDown"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 底部交卷按钮 ===== -->
    <div class="submit-bar">
      <div class="submit-stats">
        <div class="stat-chip">
          <span class="chip-num">{{ answeredCount }}</span>
          <span class="chip-label">已答</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-chip">
          <span class="chip-num">{{ unansweredCount }}</span>
          <span class="chip-label">未答</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-chip">
          <span class="chip-num">{{ totalQuestionCount }}</span>
          <span class="chip-label">总题</span>
        </div>
      </div>
      <button class="submit-btn" @click="showSubmitConfirm = true" :disabled="isSubmitting">
        <el-icon :size="18"><Finished /></el-icon>
        <span>交卷</span>
      </button>
    </div>

    <!-- ===== 交卷确认弹窗 ===== -->
    <teleport to="body">
      <div class="confirm-overlay" v-if="showSubmitConfirm" @click.self="showSubmitConfirm = false">
        <div class="confirm-dialog">
          <button class="confirm-close" @click="showSubmitConfirm = false">
            <el-icon :size="20"><Close /></el-icon>
          </button>

          <div class="confirm-icon-wrap">
            <el-icon :size="28"><WarningFilled /></el-icon>
          </div>

          <h3 class="confirm-title">确认交卷</h3>
          <p class="confirm-desc">交卷后将无法修改答案，请确认是否提交？</p>

          <div class="confirm-stats">
            <div class="confirm-stat">
              <span class="confirm-stat-num">{{ answeredCount }}</span>
              <span class="confirm-stat-label">已答</span>
            </div>
            <div class="confirm-stat-divider"></div>
            <div class="confirm-stat">
              <span class="confirm-stat-num">{{ unansweredCount }}</span>
              <span class="confirm-stat-label">未答</span>
            </div>
            <div class="confirm-stat-divider"></div>
            <div class="confirm-stat">
              <span class="confirm-stat-num">{{ totalQuestionCount }}</span>
              <span class="confirm-stat-label">总题</span>
            </div>
          </div>

          <div class="confirm-actions">
            <el-button size="large" class="btn-cancel" @click="showSubmitConfirm = false">继续答题</el-button>
            <el-button size="large" class="btn-confirm" @click="confirmSubmit" :loading="isSubmitting">
              {{ isSubmitting ? '交卷中...' : '确定交卷' }}
            </el-button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getExamRecordById, submitAnswers } from '../api/exam.js';
import { Timer, User, Loading, WarningFilled, Close, EditPen, Finished } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

const examRecord = ref({});
const answers = ref({});
const timer = ref(null);
const remainingTime = ref(0);
const totalTime = ref(0);
const isSubmitting = ref(false);
const isGrading = ref(false);
const showSubmitConfirm = ref(false);
const gradingStatusText = ref('');

const getExamData = async () => {
  try {
    const res = await getExamRecordById(route.params.id);
    examRecord.value = res.data;
    // 检查考试状态，如果已完成则自动跳转到结果页面
    if (examRecord.value.status === 'COMPLETED' || examRecord.value.status === '已批阅') {
      ElMessage.warning({
        message: '该考试已完成，正在跳转到结果页面...',
        duration: 2000,
        showClose: false
      });

      // 延迟跳转，让用户看到提示信息
      setTimeout(() => {
        router.replace(`/exam-result/${route.params.id}`);
      }, 2000);
      return;
    }

    // 如果考试尚未开始或状态异常，也进行相应处理
    if (examRecord.value.status !== '进行中' && examRecord.value.status !== 'IN_PROGRESS') {
      ElMessage.error({
        message: '考试状态异常，正在跳转到考试列表...',
        duration: 2000,
        showClose: false
      });

      setTimeout(() => {
        router.replace('/exam/list');
      }, 2000);
      return;
    }

    // 正常的考试逻辑
    totalTime.value = (examRecord.value.paper?.duration || 0) * 60;
    remainingTime.value = totalTime.value;
    startTimer();
  } catch (error) {
    console.error('加载考试信息失败:', error);
    ElMessage.error('加载考试信息失败，正在跳转到考试列表...');
    setTimeout(() => {
      router.replace('/exam/list');
    }, 2000);
  }
};

const startTimer = () => {
  timer.value = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
    } else {
      clearInterval(timer.value);
      // 时间到时强制交卷，不给选择机会
      ElMessage.error({
        message: '⏰ 考试时间已到！系统将在3秒后自动交卷...',
        duration: 3000,
        showClose: false
      });

      // 禁用所有输入控件，防止继续答题
      disableAllInputs();

      // 3秒后强制提交
      setTimeout(() => {
        forceSubmit();
      }, 3000);
    }
  }, 1000);
};

// 禁用所有输入控件的函数
const disableAllInputs = () => {
  // 禁用所有单选框
  const radioInputs = document.querySelectorAll('.el-radio__input input');
  radioInputs.forEach(input => {
    input.disabled = true;
  });

  // 禁用所有多选框
  const checkboxInputs = document.querySelectorAll('.el-checkbox__input input');
  checkboxInputs.forEach(input => {
    input.disabled = true;
  });

  // 禁用所有文本框
  const textareas = document.querySelectorAll('.el-textarea__inner');
  textareas.forEach(textarea => {
    textarea.disabled = true;
    textarea.style.backgroundColor = '#f5f5f5';
    textarea.style.cursor = 'not-allowed';
  });

  // 在页面顶部显示时间到期提示
  showTimeUpOverlay();
};

// 显示时间到期遮罩
const showTimeUpOverlay = () => {
  const overlay = document.createElement('div');
  overlay.className = 'time-up-overlay';
  overlay.innerHTML = `
    <div class="time-up-content">
      <div class="time-up-icon">⏰</div>
      <h3>考试时间已到</h3>
      <p>系统正在自动交卷，请稍候...</p>
      <div class="countdown-progress"></div>
    </div>
  `;
  document.body.appendChild(overlay);
};

// 强制交卷函数（时间到期时调用）
const forceSubmit = async () => {
  // 防止重复提交
  if (isSubmitting.value) {
    console.log('正在提交中，跳过重复提交');
    return;
  }

  isSubmitting.value = true;

  try {
    const examRecordId = route.params.id;

    if (!examRecordId || examRecordId === 'undefined') {
      throw new Error('考试记录ID无效，请重新开始考试');
    }

    // 检查是否已经提交过
    if (examRecord.value.status === 'COMPLETED') {
      console.log('考试已完成，直接跳转结果页面');
      ElMessage.success('考试已完成，正在跳转到结果页面...');
      setTimeout(() => {
        router.push(`/exam-result/${examRecordId}`);
      }, 1500);
      return;
    }

    const formattedAnswers = Object.entries(answers.value).map(([questionId, answer]) => ({
      questionId: Number(questionId),
      userAnswer: Array.isArray(answer) ? answer.sort().join(',') : answer
    }));

    await submitAnswers(examRecordId, formattedAnswers);

    // 移除时间到期遮罩
    const overlay = document.querySelector('.time-up-overlay');
    if (overlay) {
      overlay.remove();
    }

    ElMessage.success('时间到期，系统已自动交卷！');

    // 显示AI判卷进度
    isGrading.value = true;
    const tips = [
      '正在分析试卷结构...',
      '正在批改客观题...',
      '正在AI评估主观题...',
      '正在复核答案准确性...',
      '正在生成考试报告...'
    ]
    let tipIndex = 0
    gradingStatusText.value = tips[0]
    const tipTimer = setInterval(() => {
      tipIndex = (tipIndex + 1) % tips.length
      gradingStatusText.value = tips[tipIndex]
    }, 2000)

    setTimeout(() => {
      clearInterval(tipTimer)
      gradingStatusText.value = '批改完成，正在跳转...'
      setTimeout(() => {
        isGrading.value = false
        router.push(`/exam-result/${examRecordId}`);
      }, 1000);
    }, 4000);

  } catch (error) {
    console.error('自动交卷失败:', error);

    // 移除时间到期遮罩
    const overlay = document.querySelector('.time-up-overlay');
    if (overlay) {
      overlay.remove();
    }

    // 如果是重复提交错误，直接跳转
    if (error.message && error.message.includes('已完成')) {
      ElMessage.success('考试已完成，正在跳转到结果页面...');
      setTimeout(() => {
        router.push(`/exam-result/${route.params.id}`);
      }, 1500);
    } else {
      ElMessage.error('自动交卷失败，正在跳转到结果页面...');
      setTimeout(() => {
        router.push(`/exam-result/${route.params.id}`);
      }, 2000);
    }
  } finally {
    isSubmitting.value = false;
  }
};

// 格式化时间显示
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60);
  const seconds = remainingTime.value % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

// 进度条百分比
const progressPercentage = computed(() => {
  if (totalTime.value === 0) return 0;
  const passedTime = totalTime.value - remainingTime.value;
  return Math.floor((passedTime / totalTime.value) * 100);
});

const totalQuestionCount = computed(() => {
  return examRecord.value.paper?.questions?.length || 0;
});

const answeredCount = computed(() => {
  return Object.values(answers.value).filter(a => {
    if (Array.isArray(a)) return a.length > 0;
    return a !== '' && a !== null && a !== undefined;
  }).length;
});

const unansweredCount = computed(() => {
  return totalQuestionCount.value - answeredCount.value;
});

const getOptionLabel = (index) => {
  return String.fromCharCode(65 + index); // A, B, C, D...
};

const groupedQuestions = computed(() => {
  if (!examRecord.value.paper?.questions) {
    return {};
  }
  let globalIndex = 0;
  const groups = examRecord.value.paper.questions.reduce((acc, q) => {
    q.globalIndex = ++globalIndex; // 添加全局索引

    // 初始化答案容器
    if (q.type === 'CHOICE' && q.multi) {
      answers.value[q.id] = []; // 多选题初始化为空数组
    } else {
      answers.value[q.id] = ''; // 其他题型初始化为空字符串
    }

    if (!acc[q.type]) {
      acc[q.type] = [];
    }
    acc[q.type].push(q);
    return acc;
  }, {});
  return groups;
});

const getQuestionTypeName = (type) => {
  const map = {
    'CHOICE': '选择题',
    'JUDGE': '判断题',
    'TEXT': '简答题'
  };
  return map[type] || '其他题目';
};

const confirmSubmit = async () => {
  showSubmitConfirm.value = false;

  // 防止重复提交
  if (isSubmitting.value) return;

  // 检查是否已经提交过
  if (examRecord.value.status === 'COMPLETED') {
    ElMessage.success('考试已完成，正在跳转到结果页面...');
    setTimeout(() => {
      router.push(`/exam-result/${route.params.id}`);
    }, 1500);
    return;
  }

  isSubmitting.value = true;
  const formattedAnswers = Object.entries(answers.value).map(([questionId, answer]) => ({
    questionId: Number(questionId),
    // 对多选题的答案(数组)进行处理
    userAnswer: Array.isArray(answer) ? answer.sort().join(',') : answer
  }));

  try {
    // 获取考试记录ID，添加调试信息
    const examRecordId = route.params.id;

    if (!examRecordId || examRecordId === 'undefined') {
      throw new Error('考试记录ID无效，请重新开始考试');
    }

    // 提交答案
    await submitAnswers(examRecordId, formattedAnswers);
    ElMessage.success('交卷成功！');

    // 显示AI判卷进度（不模拟百分比，只轮播提示）
    isGrading.value = true;
    const tips = [
      '正在分析试卷结构...',
      '正在批改客观题...',
      '正在AI评估主观题...',
      '正在复核答案准确性...',
      '正在生成考试报告...'
    ]
    let tipIndex = 0
    gradingStatusText.value = tips[0]
    const tipTimer = setInterval(() => {
      tipIndex = (tipIndex + 1) % tips.length
      gradingStatusText.value = tips[tipIndex]
    }, 2000)

    // 最短展示 5 秒后跳转（保证用户看到特效）
    setTimeout(() => {
      clearInterval(tipTimer)
      gradingStatusText.value = '批改完成，正在跳转...'
      setTimeout(() => {
        isGrading.value = false
        router.push(`/exam-result/${examRecordId}`)
      }, 800)
    }, 5000);

  } catch (error) {
    console.error('提交试卷失败:', error);

    // 如果是重复提交错误，直接跳转
    if (error.message && error.message.includes('已完成')) {
      ElMessage.success('考试已完成，正在跳转到结果页面...');
      isGrading.value = false;
      setTimeout(() => {
        router.push(`/exam-result/${route.params.id}`);
      }, 1500);
    } else {
      ElMessage.error(error.message || '交卷失败，请稍后重试');
      isGrading.value = false;
    }
  } finally {
    isSubmitting.value = false;
  }
};

// 禁止粘贴相关函数
const handlePasteAttempt = () => {
  ElMessage.warning('为保证考试公平性，简答题禁止粘贴内容，请手动输入答案！');
};

const handleRightClick = () => {
  ElMessage.warning('考试期间禁止右键操作！');
};

const handleKeyDown = (event) => {
  // 阻止Ctrl+V粘贴
  if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
    event.preventDefault();
    ElMessage.warning('为保证考试公平性，简答题禁止粘贴内容，请手动输入答案！');
    return;
  }

  // 阻止F12开发者工具（可选）
  if (event.key === 'F12') {
    event.preventDefault();
    ElMessage.warning('考试期间禁止打开开发者工具！');
    return;
  }
};

onMounted(() => {
  getExamData();
});

onUnmounted(() => {
  clearInterval(timer.value);
});
</script>

<style scoped>
/* ============================================================
   DESIGN SYSTEM — 与 Home.vue 统一
   ============================================================ */
.exam-page {
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

  min-height: 100vh;
  background: var(--bg-page);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  position: relative;
  padding-bottom: 100px;
}

/* Aura glow — 与首页一致 */
.exam-page::before {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; height: 600px;
  pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 80% 55% at 15% 0%, rgba(124,58,237,0.10) 0%, transparent 50%),
    radial-gradient(ellipse 60% 45% at 85% 5%, rgba(67,97,238,0.08) 0%, transparent 48%),
    radial-gradient(ellipse 50% 40% at 50% 40%, rgba(6,182,212,0.06) 0%, transparent 55%),
    linear-gradient(to bottom, #e8eef8 0%, #f2f4fb 30%, var(--bg-page) 100%);
}

/* ============================================================
   顶部深色状态栏 — 与首页 Navbar 一致
   ============================================================ */
.exam-topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #0f172a;
}

.topbar-glow {
  height: 3px;
  background: linear-gradient(90deg, #06b6d4, #10b981, #06b6d4);
  box-shadow: 0 0 16px rgba(6,182,212,0.6), 0 2px 12px rgba(16,185,129,0.3);
}

.topbar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 32px;
  max-width: 1024px;
  margin: 0 auto;
  gap: 24px;
  flex-wrap: wrap;
}

/* 左侧：考试名称 */
.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.paper-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(6,182,212,0.2), rgba(16,185,129,0.12));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22d3ee;
  flex-shrink: 0;
}

.paper-name {
  font-size: 0.9rem;
  font-weight: 650;
  color: #cbd5e1;
  margin: 0;
  letter-spacing: -0.2px;
  line-height: 1.3;
  white-space: nowrap;
}

/* 中间：考生姓名（放大） */
.topbar-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #22d3ee;
  flex: 1;
}

.student-name-big {
  font-size: 1.3rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 0.5px;
}

/* 右侧：计时器 */
.topbar-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 180px;
}

.timer-block {
  display: flex;
  align-items: center;
  gap: 10px;
}

.timer-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(6,182,212,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22d3ee;
}

.timer-info {
  display: flex;
  flex-direction: column;
}

.timer-label {
  font-size: 0.68rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
}

.timer-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace;
  color: #22d3ee;
  letter-spacing: 1px;
  line-height: 1.1;
  transition: color 0.3s;
}

/* 剩余 5 分钟警告 */
.timer-urgent {
  color: #f87171;
  animation: timerBlink 1s ease-in-out infinite;
}

@keyframes timerBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 进度条 */
.progress-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.exam-progress {
  flex: 1;
}

.exam-progress :deep(.el-progress-bar__outer) {
  background: rgba(255,255,255,0.08);
  border-radius: 3px;
}

.exam-progress :deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, #06b6d4, #10b981);
  border-radius: 3px;
  transition: width 1s linear;
}

.progress-text {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  min-width: 32px;
  text-align: right;
}

/* ============================================================
   试题区域
   ============================================================ */
.question-area {
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 24px 40px;
  position: relative;
  z-index: 1;
}

/* 题型分组 */
.question-group {
  margin-bottom: 32px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

/* 题型标题 */
.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(180deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid var(--border-card);
}

.group-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.group-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0;
  flex: 1;
}

.group-count {
  font-size: 0.72rem;
  color: var(--text-muted);
  background: #f1f5f9;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 500;
}

/* 题目卡片 */
.question-card {
  padding: 24px 28px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
}

.question-card:last-child {
  border-bottom: none;
}

/* 题号标签组 — 胶囊标签风格 */
.question-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.q-index-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  color: #6366f1;
  letter-spacing: 0.5px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(99,102,241,0.06);
  border: 1px solid rgba(99,102,241,0.12);
}

.q-score-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  color: #06b6d4;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(6,182,212,0.06);
  border: 1px solid rgba(6,182,212,0.12);
}

/* 题型标签 */
.q-type-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}

.q-type--single {
  color: #6366f1;
  background: rgba(99,102,241,0.08);
  border: 1px solid rgba(99,102,241,0.2);
}

.q-type--multi {
  color: #f59e0b;
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.25);
}

.q-type--judge {
  color: #10b981;
  background: rgba(16,185,129,0.08);
  border: 1px solid rgba(16,185,129,0.2);
}

.q-type--text {
  color: #ec4899;
  background: rgba(236,72,153,0.06);
  border: 1px solid rgba(236,72,153,0.15);
}

/* 题目内容 */
.question-content {
  margin: 0 0 20px;
  color: #1e293b;
  line-height: 1.75;
  font-size: 0.95rem;
}

/* ============================================================
   选项区域 — 核心重构
   ============================================================ */
.question-options {
  display: flex;
  flex-direction: column;
}

/* 选项列表 — 拉伸子项让所有卡片等宽 */
.option-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.option-group :deep(.el-radio),
.option-group :deep(.el-checkbox) {
  display: flex !important;
  width: 100% !important;
  margin-right: 0 !important;
}

/* ---- 选项卡片（单选 & 多选共用） ---- */
.option-card {
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  padding: 14px 18px !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 14px !important;
  background: #fafbfc !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  margin: 0 !important;
  height: auto !important;
  cursor: pointer;
  position: relative;
}

/* 隐藏原生 radio / checkbox 圆圈 */
.option-card :deep(.el-radio__input),
.option-card :deep(.el-checkbox__input) {
  display: none;
}

.option-card :deep(.el-radio__label),
.option-card :deep(.el-checkbox__label) {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  width: 100% !important;
  padding: 0 !important;
}

/* Hover — 青光微亮 */
.option-card:hover {
  border-color: #67d8f0 !important;
  background: #f0faff !important;
  box-shadow: 0 0 12px rgba(6,182,212,0.08);
  transform: translateX(2px);
}

/* Selected — 霓虹紫光晕 */
.option-card.is-checked {
  border-color: #818cf8 !important;
  background: #f5f3ff !important;
  box-shadow: 0 0 16px rgba(99,102,241,0.12), inset 0 0 0 1px rgba(99,102,241,0.06);
}

/* ---- 选项字母徽章 ---- */
.opt-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #e8ecf4;
  color: #64748b;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
  margin-right: 14px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.option-card:hover .opt-letter {
  background: #cffafe;
  color: #0891b2;
}

.option-card.is-checked .opt-letter {
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99,102,241,0.3);
}

/* 多选字母徽章变体 */
.opt-letter--multi {
  border-radius: 6px;
}

/* ---- 选项文字 ---- */
.opt-text {
  color: #334155;
  line-height: 1.6;
  font-size: 0.9rem;
  flex: 1;
  text-align: left;
}

/* ============================================================
   判断题 — 左右两个大卡片
   ============================================================ */
.judge-group {
  display: flex;
  gap: 14px;
}

.judge-card {
  flex: 1;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  padding: 18px 24px !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 14px !important;
  background: #fafbfc !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  margin: 0 !important;
  height: auto !important;
  cursor: pointer;
  font-weight: 600 !important;
  font-size: 0.92rem !important;
}

.judge-card :deep(.el-radio__input) {
  display: none;
}

.judge-card :deep(.el-radio__label) {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 0 !important;
}

.judge-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.85rem;
}

.judge-card--right .judge-icon {
  background: rgba(16,185,129,0.1);
  color: #059669;
}

.judge-card--wrong .judge-icon {
  background: rgba(239,68,68,0.1);
  color: #dc2626;
}

.judge-card:hover {
  transform: translateY(-1px);
}

.judge-card--right:hover {
  border-color: #34d399 !important;
  background: #f0fdf4 !important;
  box-shadow: 0 0 14px rgba(16,185,129,0.08);
}

.judge-card--wrong:hover {
  border-color: #f87171 !important;
  background: #fef2f2 !important;
  box-shadow: 0 0 14px rgba(239,68,68,0.08);
}

.judge-card--right.is-checked {
  border-color: #10b981 !important;
  background: #ecfdf5 !important;
  box-shadow: 0 0 18px rgba(16,185,129,0.15);
  color: #059669 !important;
}

.judge-card--wrong.is-checked {
  border-color: #ef4444 !important;
  background: #fef2f2 !important;
  box-shadow: 0 0 18px rgba(239,68,68,0.15);
  color: #dc2626 !important;
}

/* ============================================================
   简答题
   ============================================================ */
.text-answer :deep(.el-textarea__inner) {
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 18px;
  font-size: 0.92rem;
  line-height: 1.7;
  background: #fafbfc;
  resize: none;
  transition: all 0.25s;
  color: #1e293b;
}

.text-answer :deep(.el-textarea__inner):focus {
  border-color: #818cf8;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.06), 0 0 16px rgba(99,102,241,0.06);
  background: #fff;
}

.text-answer :deep(.el-textarea__inner)::placeholder {
  color: #b0b8c1;
}

/* ============================================================
   底部交卷栏 — 毛玻璃效果
   ============================================================ */
.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(232,236,244,0.8);
  box-shadow: 0 -4px 24px rgba(15,23,42,0.06);
  max-width: 860px;
  margin: 0 auto;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  border-radius: 18px 18px 0 0;
}

/* 答题统计 */
.submit-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-chip {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.chip-num {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.chip-label {
  font-size: 0.72rem;
  color: #8090a8;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 20px;
  background: #e2e8f0;
}

/* 交卷按钮 — 青绿渐变 Glow */
.submit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 36px;
  border-radius: 14px;
  border: none;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
  cursor: pointer;
  background: linear-gradient(135deg, #06b6d4, #10b981);
  box-shadow: 0 0 20px rgba(6,182,212,0.35), 0 0 40px rgba(16,185,129,0.15);
  transition: all 0.3s ease;
  animation: submitGlow 2.5s ease-in-out infinite;
}

.submit-btn:hover:not(:disabled) {
  box-shadow: 0 0 28px rgba(6,182,212,0.55), 0 0 56px rgba(16,185,129,0.3);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes submitGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(6,182,212,0.35), 0 0 40px rgba(16,185,129,0.15);
  }
  50% {
    box-shadow: 0 0 30px rgba(6,182,212,0.55), 0 0 56px rgba(16,185,129,0.3);
  }
}

/* ============================================================
   交卷确认弹窗
   ============================================================ */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: overlayIn 0.25s ease;
}

@keyframes overlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.confirm-dialog {
  background: #fff;
  border-radius: 20px;
  padding: 36px 32px 28px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 24px 64px rgba(15,23,42,0.2);
  position: relative;
  text-align: center;
  animation: dialogPop 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes dialogPop {
  from { opacity: 0; transform: scale(0.92) translateY(16px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.confirm-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.confirm-close:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.confirm-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.08));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #f59e0b;
}

.confirm-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}

.confirm-desc {
  font-size: 0.85rem;
  color: #8090a8;
  margin: 0 0 28px;
  line-height: 1.5;
}

.confirm-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 28px;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 14px;
  border: 1px solid #e8ecf4;
}

.confirm-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.confirm-stat-num {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
}

.confirm-stat-label {
  font-size: 0.7rem;
  color: #8090a8;
  font-weight: 500;
}

.confirm-stat-divider {
  width: 1px;
  height: 32px;
  background: #e2e8f0;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel {
  flex: 1;
  border-radius: 12px !important;
  font-weight: 600 !important;
  border: 1.5px solid #e2e8f0 !important;
  background: #fff !important;
  color: #475569 !important;
  height: 46px !important;
  transition: all 0.2s !important;
}

.btn-cancel:hover {
  border-color: #cbd5e1 !important;
  background: #f8fafc !important;
}

.btn-confirm {
  flex: 1;
  border-radius: 12px !important;
  font-weight: 700 !important;
  border: none !important;
  background: linear-gradient(135deg, #06b6d4, #10b981) !important;
  color: #fff !important;
  height: 46px !important;
  box-shadow: 0 0 16px rgba(6,182,212,0.3) !important;
  transition: all 0.25s !important;
}

.btn-confirm:hover {
  box-shadow: 0 0 24px rgba(6,182,212,0.5) !important;
  transform: translateY(-1px);
}

/* ============================================================
   AI 判卷遮罩
   ============================================================ */
.grading-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: overlayIn 0.3s ease;
}

.grading-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 40px 36px;
  border-radius: 24px;
  text-align: center;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 32px 64px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1);
  animation: contentPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes contentPop {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

.grading-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.grading-content h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.grading-desc {
  margin: 0 0 24px;
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

/* AI脑图标 */
.ai-brain {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brain-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: #6366f1;
  animation: brainPulse 1.4s ease-in-out infinite;
}

.brain-dot:nth-child(2) { animation-delay: 0.2s; background: #8b5cf6; }
.brain-dot:nth-child(3) { animation-delay: 0.4s; background: #a78bfa; }

@keyframes brainPulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.5); opacity: 1; }
}

/* 状态行 */
.grading-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.status-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: statusBlink 1s ease-in-out infinite;
}

@keyframes statusBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.status-text {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
}

/* 脉冲条 */
.grading-pulse {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.grading-pulse span {
  width: 6px; height: 24px;
  border-radius: 3px;
  background: linear-gradient(180deg, #6366f1, #8b5cf6);
  animation: pulse 1.2s ease-in-out infinite;
}

.grading-pulse span:nth-child(2) { animation-delay: 0.1s; }
.grading-pulse span:nth-child(3) { animation-delay: 0.2s; }
.grading-pulse span:nth-child(4) { animation-delay: 0.3s; }
.grading-pulse span:nth-child(5) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 100% { transform: scaleY(0.4); opacity: 0.4; }
  50% { transform: scaleY(1); opacity: 1; }
}

/* ============================================================
   时间到期遮罩（保留）
   ============================================================ */
.time-up-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: overlayIn 0.4s ease-out;
}

.time-up-content {
  background: #ffffff;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.3);
  text-align: center;
  max-width: 400px;
  width: 90%;
  animation: dialogPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.time-up-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.time-up-content h3 {
  margin: 0 0 12px;
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
}

.time-up-content p {
  margin: 0 0 24px;
  font-size: 0.9rem;
  color: #8090a8;
}

.countdown-progress {
  width: 100%;
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.countdown-progress::before {
  content: '';
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #06b6d4, #10b981);
  border-radius: 2px;
  animation: countdown 3s linear;
}

@keyframes countdown {
  from { width: 0%; }
  to { width: 100%; }
}

/* ============================================================
   响应式
   ============================================================ */
@media (max-width: 768px) {
  .topbar-inner {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 10px;
  }

  .topbar-left {
    order: 1;
  }

  .topbar-center {
    order: 3;
    flex: 1 1 100%;
    justify-content: center;
  }

  .topbar-right {
    order: 2;
    width: auto;
    align-items: flex-end;
  }

  .student-name-big {
    font-size: 1.1rem;
  }

  .question-area {
    padding: 20px 12px 40px;
  }

  .question-card {
    padding: 20px 16px;
  }

  .paper-name {
    font-size: 0.85rem;
  }

  .judge-group {
    flex-direction: column;
  }

  .submit-bar {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
    border-radius: 16px 16px 0 0;
  }

  .submit-stats {
    gap: 12px;
  }

  .submit-btn {
    width: 100%;
    justify-content: center;
  }

  .confirm-dialog {
    padding: 28px 20px 22px;
  }

  .confirm-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .topbar-inner {
    padding: 10px 12px;
  }

  .timer-value {
    font-size: 1.25rem;
  }
}
</style>

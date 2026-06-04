<template>
  <div class="profile-page">
    <div class="bg-aura"></div>

    <div class="profile-container">
      <!-- 个人信息卡片 -->
      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar-circle">
            <el-icon :size="38"><UserFilled /></el-icon>
          </div>
          <div class="avatar-info">
            <h2 class="profile-name">{{ profile.realName || profile.username || '未登录' }}</h2>
            <span class="profile-role">{{ roleText(profile.role) }}</span>
          </div>
          <div class="avatar-actions">
            <el-button class="btn-home" @click="$router.push('/home')" plain>
              <el-icon><HomeFilled /></el-icon>
              <span>返回首页</span>
            </el-button>
            <el-button class="btn-logout" @click="handleLogout" plain>
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-button>
          </div>
        </div>

        <el-divider />

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ profile.username || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">真实姓名</span>
            <span class="info-value">{{ profile.realName || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 修改密码（可折叠） -->
      <div class="profile-card">
        <div class="pwd-header" @click="showPwdForm = !showPwdForm">
          <div class="pwd-header-left">
            <el-icon :size="18"><Lock /></el-icon>
            <span class="pwd-header-title">修改密码</span>
          </div>
          <el-icon :size="18" class="pwd-arrow" :class="{ expanded: showPwdForm }"><ArrowRight /></el-icon>
        </div>

        <transition name="collapse">
          <div v-show="showPwdForm" class="pwd-body">
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-position="top">
              <el-form-item label="原密码" prop="oldPassword">
                <el-input v-model="passwordForm.oldPassword" type="password" placeholder="输入原密码" show-password />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" type="password" placeholder="6-20 位新密码" show-password />
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="再次输入新密码" show-password />
              </el-form-item>
              <el-button class="btn-save" @click="handleChangePassword" :loading="pwdLoading">
                保存修改
              </el-button>
            </el-form>
          </div>
        </transition>
      </div>

      <!-- 考试记录 -->
      <div class="profile-card">
        <h3 class="card-title">
          <el-icon><Document /></el-icon>我的考试记录
        </h3>

        <el-empty v-if="!loadingRecords && examRecords.length === 0" description="暂无考试记录" />

        <div v-else class="exam-list">
          <div
            v-for="record in examRecords"
            :key="record.id"
            class="exam-item"
            @click="viewResult(record)"
          >
            <div class="exam-left">
              <div class="exam-icon-wrap" :style="{ background: statusStyle(record.status).bg }">
                <el-icon :size="16" :color="statusStyle(record.status).color">
                  <component :is="statusStyle(record.status).icon" />
                </el-icon>
              </div>
              <div class="exam-info">
                <span class="exam-name">{{ record.paper?.name || record.paper_name || '试卷' }}</span>
                <span class="exam-time">{{ record.createTime }}</span>
              </div>
            </div>
            <div class="exam-right">
              <el-tag :type="statusStyle(record.status).tag" effect="plain" size="small">
                {{ statusStyle(record.status).text }}
              </el-tag>
              <span class="exam-score" v-if="record.score !== null && record.score !== undefined">
                {{ record.score }}<small> / {{ record.paper?.totalScore || 100 }}</small>
              </span>
              <el-icon class="exam-arrow" :size="16"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled, HomeFilled, Lock, Document, ArrowRight, SwitchButton, Check, Timer } from '@element-plus/icons-vue'
import { getMyExamRecords, getStudentProfile, changePassword } from '../api/exam.js'

const router = useRouter()

const profile = ref({})
const examRecords = ref([])
const loadingRecords = ref(false)
const pwdLoading = ref(false)
const showPwdForm = ref(false)
const passwordFormRef = ref()

const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const validateConfirm = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) callback(new Error('两次密码不一致'))
  else callback()
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '6-20 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' },
  ],
}

const roleText = (r) => ({ ADMIN: '管理员', TEACHER: '教师', STUDENT: '学生' }[r] || r || '-')
const roleTag = (r) => ({ ADMIN: 'danger', TEACHER: 'warning', STUDENT: '' }[r] || 'info')

const avgScore = computed(() => {
  const scored = examRecords.value.filter(r => r.score !== null && r.score !== undefined)
  if (scored.length === 0) return '-'
  return (scored.reduce((s, r) => s + r.score, 0) / scored.length).toFixed(1)
})

const statusStyle = (s) => {
  const done = s === 'COMPLETED' || s === '已批阅'
  return done
    ? { text: '已批阅', tag: 'success', bg: 'rgba(16,185,129,0.1)', color: '#059669', icon: Check }
    : { text: '进行中', tag: 'warning', bg: 'rgba(245,158,11,0.1)', color: '#d97706', icon: Timer }
}

const fetchProfile = async () => {
  try {
    const res = await getStudentProfile()
    console.log('个人信息 API 原始返回:', res)
    console.log('个人信息 data:', res.data)
    if (res.data) profile.value = res.data
  } catch (e) {
    console.error('获取个人信息失败:', e)
    ElMessage.error('获取个人信息失败，请确认已登录')
  }
}

const fetchExamRecords = async () => {
  loadingRecords.value = true
  try {
    const res = await getMyExamRecords()
    console.log('考试记录 API 原始返回:', res)
    console.log('第一条记录:', res.data?.[0])
    examRecords.value = res.data || []
  } catch { /* 静默 */ }
  finally { loadingRecords.value = false }
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  try {
    await passwordFormRef.value.validate()
    pwdLoading.value = true
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    })
    ElMessage.success('密码修改成功，即将跳转登录页...')
    setTimeout(() => handleLogout(), 1500)
  } catch (error) {
    if (error?.message) ElMessage.error(error.message)
  } finally {
    pwdLoading.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('studentToken')
  localStorage.removeItem('studentInfo')
  router.push('/login')
}

const viewResult = (record) => {
  const done = record.status === 'COMPLETED' || record.status === '已批阅'
  router.push(done ? `/exam-result/${record.id}` : `/exam/${record.id}`)
}

onMounted(() => {
  fetchProfile()
  fetchExamRecords()
})
</script>

<style scoped>
.profile-page {
  --bg-page: #f6f8fc;
  --bg-card: #ffffff;
  --border-card: #e8ecf4;
  --text-heading: #0f172a;
  --text-body: #475569;
  --text-muted: #8090a8;
  --shadow-card: 0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06);

  min-height: 100vh;
  background: var(--bg-page);
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.bg-aura {
  position: fixed; top: 0; left: 0; right: 0; height: 500px; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 0%, rgba(124,58,237,0.10) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 80% 5%, rgba(6,182,212,0.08) 0%, transparent 48%),
    radial-gradient(ellipse 50% 35% at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 55%),
    linear-gradient(to bottom, #e8eef8 0%, #f2f4fb 40%, var(--bg-page) 100%);
}

.profile-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 24px 80px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== 卡片通用 ===== */
.profile-card {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 18px;
  padding: 28px 30px;
  box-shadow: var(--shadow-card);
  animation: fadeIn 0.4s ease both;
}
.profile-card:nth-child(2) { animation-delay: 0.1s; }
.profile-card:nth-child(3) { animation-delay: 0.2s; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== 头像区 ===== */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-circle {
  width: 68px; height: 68px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(99,102,241,0.25);
}

.avatar-info { flex: 1; }

.profile-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0 0 3px;
  letter-spacing: -0.3px;
}

.profile-role {
  font-size: 0.78rem;
  color: var(--text-muted);
  background: #f1f5f9;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 500;
}

.avatar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-exam {
  background: linear-gradient(135deg, #06b6d4, #10b981) !important;
  border: none !important;
  color: #fff !important;
  font-weight: 650 !important;
  border-radius: 10px !important;
  padding: 8px 16px !important;
  font-size: 0.82rem !important;
  box-shadow: 0 0 12px rgba(6,182,212,0.25);
  transition: all 0.2s;
}
.btn-exam:hover {
  box-shadow: 0 0 20px rgba(6,182,212,0.45);
  transform: translateY(-1px);
}

.btn-home {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  color: #6366f1 !important;
  border: 1.5px solid #e0e7ff !important;
  border-radius: 10px !important;
  font-size: 0.85rem !important;
  font-weight: 550 !important;
  padding: 8px 16px !important;
  transition: all 0.2s;
}
.btn-home:hover {
  color: #fff !important;
  border-color: #6366f1 !important;
  background: #6366f1 !important;
}

.btn-logout {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  color: #64748b !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 10px !important;
  font-size: 0.85rem !important;
  font-weight: 550 !important;
  padding: 8px 16px !important;
  transition: all 0.2s;
}
.btn-logout:hover {
  color: #ef4444 !important;
  border-color: #fecaca !important;
  background: #fef2f2 !important;
}

/* ===== 信息网格 ===== */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.info-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.info-value {
  font-size: 0.93rem;
  font-weight: 600;
  color: var(--text-heading);
}

.info-value.highlight {
  color: #6366f1;
}

.status-value {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-on {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34,197,94,0.5);
}

.dot-off {
  background: #94a3b8;
}

/* ===== 修改密码（可折叠） ===== */
.pwd-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 4px 0;
}

.pwd-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-heading);
}

.pwd-header-title {
  font-size: 0.92rem;
  font-weight: 700;
}

.pwd-arrow {
  color: #94a3b8;
  transition: transform 0.3s ease;
}
.pwd-arrow.expanded {
  transform: rotate(90deg);
}

.pwd-body {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

/* 折叠动画 */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 400px;
}

.pwd-body :deep(.el-form-item) { margin-bottom: 14px; }
.pwd-body :deep(.el-form-item__label) { font-size: 0.78rem; color: var(--text-body); font-weight: 600; padding-bottom: 4px; }
.pwd-body :deep(.el-input__wrapper) {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: none;
  transition: all 0.2s;
}
.pwd-body :deep(.el-input__wrapper:hover) { border-color: #c7d2fe; }
.pwd-body :deep(.el-input__wrapper.is-focus) { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.06); }

.btn-save {
  width: 100%;
  background: linear-gradient(135deg, #6366f1, #7c3aed) !important;
  border: none !important;
  color: #fff !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  height: 44px;
  font-size: 0.9rem;
  transition: all 0.25s;
}
.btn-save:hover {
  box-shadow: 0 4px 20px rgba(99,102,241,0.35);
  transform: translateY(-1px);
}

/* ===== 考试记录 ===== */
.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-heading);
  margin: 0 0 18px;
}
.card-title .el-icon { color: #6366f1; }

.exam-list { display: flex; flex-direction: column; gap: 8px; }

.exam-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.exam-item:hover {
  border-color: #e0e7ff;
  background: #fafaff;
}

.exam-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.exam-icon-wrap {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.exam-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exam-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-heading);
}

.exam-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.exam-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.exam-score {
  font-size: 0.88rem;
  font-weight: 700;
  color: #6366f1;
}
.exam-score small {
  font-weight: 500;
  color: var(--text-muted);
  font-size: 0.7rem;
}

.exam-arrow {
  color: #cbd5e1;
  transition: all 0.2s;
}
.exam-item:hover .exam-arrow {
  color: #6366f1;
  transform: translateX(2px);
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .profile-container { padding: 20px 12px 60px; }
  .profile-card { padding: 20px 16px; }
  .info-grid { grid-template-columns: 1fr; }
  .avatar-section { flex-wrap: wrap; }
  .avatar-actions { width: 100%; justify-content: flex-end; margin-top: 4px; }
  .exam-item { flex-direction: column; align-items: flex-start; gap: 10px; }
  .exam-right { width: 100%; justify-content: space-between; }
}
</style>

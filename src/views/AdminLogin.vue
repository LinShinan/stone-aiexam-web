<template>
  <div class="login-page">
    <!-- 背景光晕 -->
    <div class="bg-aura"></div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="card-left">
        <div class="brand-area">
          <img src="../assets/logo.png" alt="logo" class="brand-logo" />
          <h1 class="brand-name">Stone AI Exam</h1>
          <p class="brand-desc">智能考试管理平台</p>
        </div>
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon"><el-icon><Document /></el-icon></div>
            <span>AI 智能出题 · 批量管理</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon"><el-icon><DataAnalysis /></el-icon></div>
            <span>数据统计 · 成绩分析</span>
          </div>
        </div>
      </div>

      <div class="card-right">
        <div v-if="needLogin" class="login-tip">
          <el-icon><WarningFilled /></el-icon>
          <span>请先登录管理员账户后再访问管理后台</span>
        </div>

        <div class="form-header">
          <h2>管理员登录</h2>
          <p>{{ needLogin ? '请登录后继续' : '欢迎回来，请登录您的账户' }}</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="form-footer">
          <el-button class="back-btn" @click="$router.push('/')">
            <el-icon><ArrowLeft /></el-icon>返回首页
          </el-button>
        </div>
      </div>
    </div>

    <!-- 底部版权 -->
    <p class="copyright">&copy; {{ new Date().getFullYear() }} Stone AI Exam. All rights reserved.</p>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, ArrowLeft, Document, DataAnalysis, WarningFilled } from '@element-plus/icons-vue'
import request from '../utils/request'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const loading = ref(false)

// 是否需要登录提示（从其他 admin 页面跳来）
const needLogin = computed(() => route.query.redirect)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await request.post('/api/auth/login', {
        username: form.username,
        password: form.password
      })
      localStorage.setItem('userInfo', JSON.stringify(res.data))
      if (res.data.token) {
        localStorage.setItem('token', res.data.token)
      }
      ElMessage.success('登录成功')
      // 如果有来源页面，跳回去；否则进管理后台首页
      const target = route.query.redirect || '/admin'
      router.push(target)
    } catch (e) {
      ElMessage.error(e.message || '登录失败，请稍后重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 背景光晕 */
.bg-aura {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 60% 50% at 20% 50%, rgba(6,182,212,0.15) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 80% 30%, rgba(16,185,129,0.1) 0%, transparent 55%),
    radial-gradient(ellipse 40% 35% at 50% 80%, rgba(99,102,241,0.08) 0%, transparent 50%);
}

/* ===== 登录卡片 ===== */
.login-card {
  position: relative;
  z-index: 1;
  display: flex;
  width: 880px;
  min-height: 520px;
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 4px 24px rgba(0,0,0,0.25),
    0 0 0 1px rgba(255,255,255,0.05),
    0 0 80px rgba(6,182,212,0.12);
}

/* 左侧品牌区 */
.card-left {
  width: 380px;
  background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.card-left::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%);
  border-radius: 50%;
}

.card-left::after {
  content: '';
  position: absolute;
  bottom: -40px; left: -40px;
  width: 160px; height: 160px;
  background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);
  border-radius: 50%;
}

.brand-area {
  position: relative;
  z-index: 1;
}

.brand-logo {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(6,182,212,0.3);
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 750;
  color: #f1f5f9;
  margin: 0 0 8px;
  letter-spacing: -0.3px;
}

.brand-desc {
  font-size: 0.88rem;
  color: #94a3b8;
  margin: 0;
}

.feature-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
  font-size: 0.82rem;
}

.feature-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(6,182,212,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #06b6d4;
  font-size: 1rem;
  flex-shrink: 0;
}

/* 右侧表单区 */
.card-right {
  flex: 1;
  padding: 48px 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  color: #b45309;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 24px;
}

.login-tip .el-icon {
  color: #f59e0b;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.form-header {
  margin-bottom: 32px;
}

.form-header h2 {
  font-size: 1.45rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
  letter-spacing: -0.4px;
}

.form-header p {
  font-size: 0.85rem;
  color: #8090a8;
  margin: 0;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding: 6px 14px;
  border: 1px solid #e2e8f0;
  box-shadow: none;
  transition: all 0.2s;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: #cbd5e1;
}

.login-form :deep(.el-input.is-focus .el-input__wrapper) {
  border-color: #06b6d4;
  box-shadow: 0 0 0 3px rgba(6,182,212,0.08);
}

.login-btn {
  width: 100%;
  height: 46px;
  font-size: 1rem;
  font-weight: 650;
  letter-spacing: 2px;
  border-radius: 10px;
  background: linear-gradient(135deg, #06b6d4, #10b981) !important;
  border: none !important;
  box-shadow: 0 4px 16px rgba(6,182,212,0.3);
  transition: all 0.3s;
}

.login-btn:hover {
  box-shadow: 0 6px 24px rgba(6,182,212,0.45);
  transform: translateY(-1px);
}

.form-footer {
  text-align: center;
  margin-top: 8px;
}

.back-btn {
  color: #94a3b8 !important;
  font-size: 0.85rem;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #475569 !important;
}

.copyright {
  position: relative;
  z-index: 1;
  margin-top: 24px;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.3);
}

/* ===== 响应式 ===== */
@media (max-width: 920px) {
  .login-card {
    width: 92vw;
    flex-direction: column;
    min-height: auto;
  }
  .card-left {
    width: 100%;
    padding: 32px 28px;
    gap: 24px;
  }
  .card-right {
    padding: 32px 28px 36px;
  }
}
</style>

<template>
  <div class="login-page">
    <div class="bg-aura"></div>

    <div class="login-card">
      <!-- 左侧品牌区 — 蓝紫深色 -->
      <div class="card-left">
        <div class="brand-area">
          <img src="../assets/logo.png" alt="logo" class="brand-logo" />
          <h1 class="brand-name">Stone AI Exam</h1>
          <p class="brand-desc">智能学习考试平台</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <div class="feature-dot"></div>
            <span>在线考试 · 限时答题</span>
          </div>
          <div class="feature-item">
            <div class="feature-dot"></div>
            <span>智能刷题 · 即时解析</span>
          </div>
          <div class="feature-item">
            <div class="feature-dot"></div>
            <span>AI 批阅 · 精准分析</span>
          </div>
          <div class="feature-item">
            <div class="feature-dot"></div>
            <span>排行榜 · 实时竞技</span>
          </div>
        </div>
      </div>

      <!-- 右侧表单区 -->
      <div class="card-right">
        <!-- 需要登录提示 -->
        <div v-if="needLogin" class="login-tip">
          <el-icon><WarningFilled /></el-icon>
          <span>请先登录或注册后再继续操作</span>
        </div>

        <!-- 标题 — 固定显示学生登录 -->
        <div class="form-header">
          <h2>学生登录</h2>
          <p v-if="isLogin">欢迎回来，开始学习之旅</p>
          <p v-else>创建账号，加入学习</p>
        </div>

        <!-- 登录表单 -->
        <el-form
          v-show="isLogin"
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="auth-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="用户名" size="large" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="密码" size="large" :prefix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" class="submit-btn" :loading="loginLoading" @click="handleLogin">
              {{ loginLoading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 注册表单 -->
        <el-form
          v-show="!isLogin"
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="auth-form"
          @keyup.enter="handleRegister"
        >
          <el-form-item prop="username">
            <el-input v-model="registerForm.username" placeholder="用户名" size="large" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="realName">
            <el-input v-model="registerForm.realName" placeholder="真实姓名" size="large" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="registerForm.password" type="password" placeholder="密码（至少6位）" size="large" :prefix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item prop="rePassword">
            <el-input v-model="registerForm.rePassword" type="password" placeholder="确认密码" size="large" :prefix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" class="submit-btn" :loading="registerLoading" @click="handleRegister">
              {{ registerLoading ? '注册中...' : '注 册' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 底部切换链接 -->
        <div class="switch-link">
          <template v-if="isLogin">
            还没有账号？<a href="javascript:void(0)" @click="isLogin = false">立即注册</a>
          </template>
          <template v-else>
            已有账号？<a href="javascript:void(0)" @click="isLogin = true">返回登录</a>
          </template>
        </div>

        <div class="form-footer">
          <el-button class="back-btn" @click="$router.push('/')">
            <el-icon><ArrowLeft /></el-icon>返回首页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, ArrowLeft, WarningFilled } from '@element-plus/icons-vue'
import request from '../utils/request'

const router = useRouter()
const route = useRoute()
const needLogin = computed(() => route.query.redirect)

const isLogin = ref(true)
const loginFormRef = ref()
const registerFormRef = ref()
const loginLoading = ref(false)
const registerLoading = ref(false)

const loginForm = reactive({ username: '', password: '' })
const registerForm = reactive({ username: '', realName: '', password: '', rePassword: '' })

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const validateRePassword = (_rule, value, callback) => {
  if (value !== registerForm.password) callback(new Error('两次输入的密码不一致'))
  else callback()
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度 2-20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码至少 6 位', trigger: 'blur' }
  ],
  rePassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateRePassword, trigger: 'blur' }
  ]
}

const saveStudentAuth = (data) => {
  localStorage.setItem('studentInfo', JSON.stringify(data))
  if (data.token) localStorage.setItem('studentToken', data.token)
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loginLoading.value = true
    try {
      const res = await request.post('/api/auth/student-login', {
        username: loginForm.username,
        password: loginForm.password
      })
      saveStudentAuth(res.data)
      ElMessage.success(`欢迎回来，${res.data.username || loginForm.username}`)
      router.push(route.query.redirect || '/')
    } catch (e) {
      ElMessage.error(e.message || '登录失败，请稍后重试')
    }
    finally { loginLoading.value = false }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    registerLoading.value = true
    try {
      const res = await request.post('/api/auth/student-register', {
        username: registerForm.username,
        realName: registerForm.realName,
        password: registerForm.password,
        rePassword: registerForm.rePassword
      })
      saveStudentAuth(res.data)
      ElMessage.success(`注册成功，欢迎 ${res.data.username || registerForm.username}`)
      router.push(route.query.redirect || '/')
    } catch (e) { /* interceptor handles */ 
      ElMessage.error(e.message || '注册失败，请稍后重试')
    }
    finally { registerLoading.value = false }
  })
}
</script>

<style scoped>
.login-page {
  --bg-page: #f0f2fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  position: relative; overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* 浅色调光晕 */
.bg-aura {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 70% 50% at 20% 30%, rgba(99,102,241,0.08) 0%, transparent 55%),
    radial-gradient(ellipse 55% 40% at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%),
    radial-gradient(ellipse 45% 35% at 50% 70%, rgba(59,130,246,0.05) 0%, transparent 50%);
}

.login-card {
  position: relative; z-index: 1;
  display: flex;
  width: 800px; min-height: 500px;
  background: #fff;
  border: 1px solid #e8ecf4;
  border-radius: 20px; overflow: hidden;
  box-shadow: 0 1px 3px rgba(15,23,42,0.04), 0 12px 40px rgba(15,23,42,0.08);
}

/* ===== 左侧品牌区 — 蓝紫深色 ===== */
.card-left {
  width: 340px;
  background: linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%);
  padding: 52px 36px;
  display: flex; flex-direction: column; justify-content: space-between;
  position: relative; overflow: hidden;
}
.card-left::before {
  content: '';
  position: absolute; top: -70px; right: -70px;
  width: 220px; height: 220px;
  background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%);
  border-radius: 50%;
}
.card-left::after {
  content: '';
  position: absolute; bottom: -50px; left: -50px;
  width: 180px; height: 180px;
  background: radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%);
  border-radius: 50%;
}

.brand-area { position: relative; z-index: 1; }
.brand-logo { width: 52px; height: 52px; border-radius: 13px; margin-bottom: 18px; box-shadow: 0 8px 24px rgba(99,102,241,0.3); }
.brand-name { font-size: 1.4rem; font-weight: 750; color: #f1f5f9; margin: 0 0 6px; letter-spacing: -0.3px; }
.brand-desc { font-size: 0.85rem; color: #a5b4fc; margin: 0; }

.features { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; }
.feature-item { display: flex; align-items: center; gap: 12px; }
.feature-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #818cf8; flex-shrink: 0;
  box-shadow: 0 0 8px rgba(129,140,248,0.5);
}
.feature-item span { color: rgba(255,255,255,0.5); font-size: 0.8rem; }

/* ===== 右侧表单区 ===== */
.card-right {
  flex: 1;
  padding: 48px 48px 40px;
  display: flex; flex-direction: column;
}

.login-tip {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px;
  background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px;
  color: #1d4ed8; font-size: 0.85rem; font-weight: 500;
  margin-bottom: 24px;
}
.login-tip .el-icon { color: #3b82f6; font-size: 1.1rem; }

.form-header { margin-bottom: 32px; }
.form-header h2 {
  font-size: 1.45rem; font-weight: 700;
  background: linear-gradient(135deg, #1e1b4b, #6366f1);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 6px; letter-spacing: -0.3px;
}
.form-header p { font-size: 0.85rem; color: #8090a8; margin: 0; }

/* 表单 */
.auth-form { flex: 1; }
.auth-form :deep(.el-form-item) { margin-bottom: 18px; }
.auth-form :deep(.el-input__wrapper) {
  border-radius: 10px; padding: 6px 14px;
  border: 1px solid #e2e8f0; background: #f8fafc;
  box-shadow: none; transition: all 0.2s;
}
.auth-form :deep(.el-input__wrapper:hover) { border-color: #cbd5e1; background: #fff; }
.auth-form :deep(.el-input.is-focus .el-input__wrapper) {
  border-color: #6366f1; background: #fff;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.06);
}

.submit-btn {
  width: 100%; height: 46px; font-size: 1rem; font-weight: 650;
  letter-spacing: 4px; border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  border: none !important;
  box-shadow: 0 4px 14px rgba(99,102,241,0.25);
  transition: all 0.3s; margin-top: 4px;
}
.submit-btn:hover { box-shadow: 0 6px 22px rgba(99,102,241,0.4); transform: translateY(-1px); }

/* 底部切换链接 */
.switch-link {
  text-align: center; font-size: 0.85rem; color: #94a3b8;
  margin-top: 4px; margin-bottom: 8px;
}
.switch-link a {
  color: #6366f1; font-weight: 600; text-decoration: none;
  transition: color 0.2s;
}
.switch-link a:hover { color: #4f46e5; }

.form-footer { text-align: center; }
.back-btn { color: #94a3b8 !important; font-size: 0.85rem; }
.back-btn:hover { color: #475569 !important; }

@media (max-width: 820px) {
  .login-card { width: 92vw; flex-direction: column; min-height: auto; }
  .card-left { width: 100%; padding: 32px 28px; gap: 20px; }
  .card-right { padding: 32px 28px 36px; }
}
</style>

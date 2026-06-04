<template>
  <div class="app-container">
    <!-- 左侧菜单 — 深色导航 (与首页 Navbar 配色一致) -->
    <aside class="sidebar">
      <!-- Logo 区域 -->
      <div class="sidebar-header">
        <div class="logo-area">
          <img src="../assets/logo.png" alt="logo" class="sidebar-logo" />
          <div class="logo-text">
            <span class="logo-title">Stone AI Exam</span>
            <span class="logo-subtitle">考试管理系统</span>
          </div>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-wrapper">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
          router
        >
          <!-- 工作台（首页仪表盘） -->
          <el-menu-item index="/admin/welcome" class="top-level-item">
            <el-icon class="menu-item-icon"><HomeFilled /></el-icon>
            <span>工作台</span>
          </el-menu-item>

          <!-- 试题管理 -->
          <el-submenu index="question">
            <template #title>
              <div class="menu-title-wrap">
                <el-icon class="menu-group-icon"><Document /></el-icon>
                <span>试题管理</span>
              </div>
            </template>
            <el-menu-item index="/admin/question-manage">
              <el-icon class="menu-item-icon"><List /></el-icon>
              <span>题目管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/category-manage">
              <el-icon class="menu-item-icon"><Folder /></el-icon>
              <span>类别管理</span>
            </el-menu-item>
          </el-submenu>

          <!-- 考试管理 -->
          <el-submenu index="exam">
            <template #title>
              <div class="menu-title-wrap">
                <el-icon class="menu-group-icon"><Files /></el-icon>
                <span>考试管理</span>
              </div>
            </template>
            <el-menu-item index="/admin/paper-manage">
              <el-icon class="menu-item-icon"><DocumentChecked /></el-icon>
              <span>试卷管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/score-manage">
              <el-icon class="menu-item-icon"><TrendCharts /></el-icon>
              <span>成绩管理</span>
            </el-menu-item>
          </el-submenu>

          <!-- 系统管理 -->
          <el-submenu index="system">
            <template #title>
              <div class="menu-title-wrap">
                <el-icon class="menu-group-icon"><Picture /></el-icon>
                <span>系统管理</span>
              </div>
            </template>
            <el-menu-item index="/admin/banner-manage">
              <el-icon class="menu-item-icon"><PictureFilled /></el-icon>
              <span>轮播图管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/notice-manage">
              <el-icon class="menu-item-icon"><Bell /></el-icon>
              <span>公告管理</span>
            </el-menu-item>
          </el-submenu>

        </el-menu>
      </nav>

      <!-- 底部信息 -->
      <div class="sidebar-footer">
        <div class="footer-user">
          <div class="user-avatar">
            <el-icon><UserFilled /></el-icon>
          </div>
          <span class="user-name">管理员</span>
        </div>
      </div>

      <!-- 底部发光条 (与首页 Navbar 的 glow bar 一致) -->
      <div class="sidebar-glow"></div>
    </aside>

    <!-- 右侧内容区 -->
    <main class="main-content">
      <!-- 页面头部（工作台页面隐藏） -->
      <header class="page-header" v-if="route.path !== '/admin/welcome'">
        <div class="header-left">
          <div class="header-badge">{{ route.meta.subtitle || 'ADMIN' }}</div>
          <h1 class="header-title">{{ route.meta.title || '管理后台' }}</h1>
        </div>
        <div class="header-right">
          <span class="header-time">{{ currentTime }}</span>
        </div>
      </header>

      <!-- 页面主体 -->
      <div class="page-body">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Document, Files, Picture, UserFilled, HomeFilled,
  List, Folder, DocumentChecked, TrendCharts, PictureFilled, Bell
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

const handleMenuSelect = (index) => {
  router.push(index)
}

// 实时时钟
const currentTime = ref('')
let timer = null
const updateTime = () => {
  const now = new Date()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  currentTime.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekDays[now.getDay()]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})
onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
/* ============================================================
   ADMIN LAYOUT — 与首页 Home.vue 完全一致的配色体系
   ============================================================ */

/* ===== 整体布局 ===== */
.app-container {
  display: flex;
  height: 100vh;
  background: #f6f8fc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ============================================================
   侧边栏 — 与首页 Navbar 深色主题一致 (#0f172a)
   ============================================================ */
.sidebar {
  width: 272px;
  min-width: 272px;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 20;
}

/* 底部发光条 — 与首页 Navbar::after 完全一致 */
.sidebar-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #06b6d4, #10b981, #06b6d4);
  box-shadow: 0 0 16px rgba(6,182,212,0.6), 0 -2px 12px rgba(16,185,129,0.3);
  z-index: 2;
}

/* ---- Logo 区域 ---- */
.sidebar-header {
  padding: 26px 22px 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-logo {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  object-fit: cover;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.3px;
}

.logo-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 450;
}

/* ---- 导航容器 ---- */
.nav-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.nav-wrapper::-webkit-scrollbar {
  width: 4px;
}
.nav-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
}

/* ---- Element Plus Menu 覆盖 ---- */
.sidebar-menu {
  border: none !important;
  background: transparent !important;
}

/* 菜单项 */
.sidebar-menu :deep(.el-menu-item) {
  height: 46px;
  line-height: 46px;
  margin: 3px 14px;
  border-radius: 10px;
  color: #94a3b8;
  font-size: 0.93rem;
  font-weight: 520;
  transition: all 0.2s ease;
  padding-left: 44px !important;
  position: relative;
}

/* 顶层菜单项（工作台）对齐 submenu 标题 */
.sidebar-menu :deep(.el-menu-item.top-level-item) {
  padding-left: 44px !important;
  margin-top: 4px;
  margin-bottom: 8px;
  font-weight: 600;
}

.sidebar-menu :deep(.el-menu-item):hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  color: #fff;
  background: rgba(6, 182, 212, 0.16);
  font-weight: 630;
}

/* 激活态左侧指示器 — 青色 */
.sidebar-menu :deep(.el-menu-item.is-active)::before {
  content: '';
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  border-radius: 3px;
  background: #06b6d4;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.6);
}

/* 子菜单标题 */
.sidebar-menu :deep(.el-submenu__title) {
  height: 48px;
  line-height: 48px;
  margin: 3px 14px;
  border-radius: 10px;
  color: #cbd5e1;
  font-size: 0.98rem;
  font-weight: 630;
  transition: all 0.2s ease;
  padding-left: 22px !important;
  letter-spacing: 0.3px;
}

.sidebar-menu :deep(.el-submenu__title):hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

.sidebar-menu :deep(.el-submenu__title) .el-submenu__icon-arrow {
  color: rgba(255, 255, 255, 0.40);
  font-size: 0.75rem;
  right: 18px;
}

/* 子菜单打开状态 — 青色高亮 */
.sidebar-menu :deep(.el-submenu.is-opened) > .el-submenu__title {
  color: #06b6d4;
}

.sidebar-menu :deep(.el-submenu.is-opened) > .el-submenu__title .el-submenu__icon-arrow {
  color: #06b6d4;
}

/* 菜单组图标 */
.menu-group-icon {
  margin-right: 12px;
  font-size: 19px;
  color: rgba(255, 255, 255, 0.45);
}

.sidebar-menu :deep(.el-submenu.is-opened) .menu-group-icon {
  color: #06b6d4;
}

/* 子菜单项图标 */
.menu-item-icon {
  margin-right: 10px;
  font-size: 17px;
  color: rgba(255, 255, 255, 0.35);
  transition: color 0.2s;
}

.sidebar-menu :deep(.el-menu-item.is-active) .menu-item-icon {
  color: #06b6d4;
}

.menu-title-wrap {
  display: flex;
  align-items: center;
}

/* 子菜单弹出层 */
.sidebar-menu :deep(.el-menu--popup) {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 4px 0;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
}

.sidebar-menu :deep(.el-menu--popup .el-menu-item) {
  color: #94a3b8;
}
.sidebar-menu :deep(.el-menu--popup .el-menu-item):hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

/* ---- 侧边栏底部 ---- */
.sidebar-footer {
  padding: 16px 22px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 3px;
}

.footer-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: rgba(6, 182, 212, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 550;
  color: #b0b8c8;
}

/* ============================================================
   右侧内容区 — 与首页完全一致的底色 + 光晕
   ============================================================ */
.main-content {
  flex: 1;
  overflow-y: auto;
  background: #f6f8fc;
  position: relative;

  /* ---- Design Tokens — 与首页 Home.vue 完全一致 ---- */
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

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
}

/* Aura glow — 与首页 Home.vue ::before 光晕完全一致 */
.main-content::before {
  content: '';
  position: fixed;
  top: 0;
  left: 272px;
  right: 0;
  height: 600px;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(ellipse 80% 55% at 15% 0%, rgba(124,58,237,0.12) 0%, transparent 50%),
    radial-gradient(ellipse 60% 45% at 85% 5%, rgba(67,97,238,0.10) 0%, transparent 48%),
    radial-gradient(ellipse 50% 40% at 50% 40%, rgba(6,182,212,0.08) 0%, transparent 55%),
    radial-gradient(ellipse 40% 35% at 20% 65%, rgba(16,185,129,0.07) 0%, transparent 48%),
    linear-gradient(to bottom, #e8eef8 0%, #f2f4fb 30%, #f6f8fc 100%);
}

/* ---- 自定义滚动条 ---- */
.main-content::-webkit-scrollbar {
  width: 6px;
}
.main-content::-webkit-scrollbar-track {
  background: transparent;
}
.main-content::-webkit-scrollbar-thumb {
  background: #d0d5e0;
  border-radius: 6px;
}
.main-content::-webkit-scrollbar-thumb:hover {
  background: #b0b8c8;
}

/* ===== Page Header ===== */
.page-header {
  padding: 32px 40px 0;
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--accent-blue);
  letter-spacing: 3.5px;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: 20px;
  background: rgba(67,97,238,0.05);
  border: 1px solid rgba(67,97,238,0.08);
  width: fit-content;
}

.header-title {
  font-size: 1.65rem;
  font-weight: 720;
  margin: 0;
  letter-spacing: -0.6px;
  color: var(--text-heading);
  line-height: 1.3;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-time {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-weight: 480;
  padding: 8px 16px;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-card);
  white-space: nowrap;
}

/* ===== Page Body ===== */
.page-body {
  padding: 28px 40px 48px;
  position: relative;
  z-index: 1;
}

/* ============================================================
   GLOBAL ELEMENT PLUS OVERRIDES (cascade to all admin pages)
   配色与首页完全一致
   ============================================================ */

/* ---- 表格全局 ---- */
.page-body :deep(.el-table) {
  border-radius: 0;
  background: transparent;
  --el-table-border-color: transparent;
  --el-table-row-hover-bg-color: #f8fafd;
}

/* 表头 — 灰白渐变 */
.page-body :deep(.el-table__header th) {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  color: #475569;
  font-weight: 650;
  font-size: 0.84rem;
  white-space: nowrap;
  letter-spacing: 0.3px;
  padding: 14px 18px;
  border-bottom: 1.5px solid #e2e8f0;
  border-right: none !important;
}

/* 表格单元格 */
.page-body :deep(.el-table td) {
  border-bottom: 1px solid #f1f5f9;
  border-right: none !important;
  font-size: 0.9rem;
  color: #334155;
  padding: 14px 18px;
}

/* 表格行 hover */
.page-body :deep(.el-table__row:hover > td) {
  background: #f8fafd !important;
}

/* ---- 标签 pill 风格 — 与首页一致 ---- */
.page-body :deep(.el-tag) {
  border: none;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 550;
  padding: 3px 12px;
}

.page-body :deep(.el-tag--primary)  { background: #eff6ff; color: #3b82f6; }
.page-body :deep(.el-tag--success)  { background: #ecfdf5; color: #059669; }
.page-body :deep(.el-tag--warning)  { background: #fffbeb; color: #d97706; }
.page-body :deep(.el-tag--danger)   { background: #fef2f2; color: #ef4444; }
.page-body :deep(.el-tag--info)     { background: #eff6ff; color: #3b82f6; }

/* ---- 主按钮 — 青色渐变 (与首页 btn-cta 一致) ---- */
.page-body :deep(.el-button--primary) {
  background: linear-gradient(135deg, #06b6d4, #10b981) !important;
  color: #fff !important;
  border: none !important;
  font-weight: 600;
  border-radius: var(--radius-sm);
  box-shadow: 0 0 12px rgba(6,182,212,0.25), 0 0 24px rgba(16,185,129,0.1);
  transition: all 0.25s ease;
}

.page-body :deep(.el-button--primary):hover {
  box-shadow: 0 0 20px rgba(6,182,212,0.4), 0 0 40px rgba(16,185,129,0.2);
  transform: translateY(-1px);
}

.page-body :deep(.el-button--primary):active {
  transform: translateY(0);
}

/* ---- 成功按钮 — 绿色 ---- */
.page-body :deep(.el-button--success) {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  color: #fff !important;
  border: none !important;
  font-weight: 600;
  border-radius: var(--radius-sm);
  box-shadow: 0 0 12px rgba(16,185,129,0.2);
  transition: all 0.25s ease;
}

.page-body :deep(.el-button--success):hover {
  box-shadow: 0 0 20px rgba(16,185,129,0.35);
  transform: translateY(-1px);
}

/* ---- 警告按钮 ---- */
.page-body :deep(.el-button--warning) {
  font-weight: 600;
  border-radius: var(--radius-sm);
  transition: all 0.25s ease;
}

.page-body :deep(.el-button--warning):hover {
  transform: translateY(-1px);
}

/* ---- 危险按钮 ---- */
.page-body :deep(.el-button--danger) {
  font-weight: 600;
  border-radius: var(--radius-sm);
  transition: all 0.25s ease;
}

.page-body :deep(.el-button--danger):hover {
  transform: translateY(-1px);
}

/* ---- 默认按钮 — 白色卡片风格 (与首页一致) ---- */
.page-body :deep(.el-button--default) {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: all 0.2s ease;
}

.page-body :deep(.el-button--default):hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #334155;
}

/* ---- 小按钮 (表格内操作) ---- */
.page-body :deep(.el-button--small) {
  border-radius: 7px;
  font-size: 0.82rem;
  padding: 5px 14px;
  font-weight: 520;
}

/* 表格内操作按钮 — 轻量链接风格 */
.page-body :deep(.el-table .el-button--small) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 4px 8px;
}

.page-body :deep(.el-table .el-button--small.el-button--primary) {
  color: #4361ee;
}
.page-body :deep(.el-table .el-button--small.el-button--primary):hover {
  background: #eff6ff;
  color: #2563eb;
}

.page-body :deep(.el-table .el-button--small.el-button--danger) {
  color: #ef4444;
}
.page-body :deep(.el-table .el-button--small.el-button--danger):hover {
  background: #fef2f2;
  color: #dc2626;
}

.page-body :deep(.el-table .el-button--small.el-button--success) {
  color: #10b981;
}
.page-body :deep(.el-table .el-button--small.el-button--success):hover {
  background: #ecfdf5;
  color: #059669;
}

.page-body :deep(.el-table .el-button--small.el-button--warning) {
  color: #d97706;
}
.page-body :deep(.el-table .el-button--small.el-button--warning):hover {
  background: #fffbeb;
  color: #b45309;
}

/* ---- 输入框 — 与首页一致 ---- */
.page-body :deep(.el-input__wrapper) {
  border-radius: var(--radius-sm);
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: none;
  transition: all 0.2s ease;
}

.page-body :deep(.el-input__wrapper):hover {
  border-color: #cbd5e1;
}

.page-body :deep(.el-input.is-focus .el-input__wrapper) {
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67,97,238,0.06);
}

/* ---- 下拉选择框 ---- */
.page-body :deep(.el-select .el-input__wrapper) {
  border-radius: var(--radius-sm);
}

.page-body :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67,97,238,0.06);
}

/* ---- 日期选择器 ---- */
.page-body :deep(.el-date-editor .el-input__wrapper) {
  border-radius: var(--radius-sm);
}

/* ---- 分页 ---- */
.page-body :deep(.el-pagination) {
  justify-content: center;
  padding: 24px 0 8px;
  --el-pagination-button-bg-color: #ffffff;
  --el-pagination-hover-color: #4361ee;
}

.page-body :deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #06b6d4, #10b981);
  border-radius: 6px;
  box-shadow: 0 0 8px rgba(6,182,212,0.25);
}

.page-body :deep(.el-pagination .btn-prev),
.page-body :deep(.el-pagination .btn-next) {
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

/* ---- 对话框 — 与首页一致 ---- */
.page-body :deep(.el-dialog) {
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 12px rgba(15,23,42,0.06), 0 24px 64px rgba(15,23,42,0.1);
  overflow: hidden;
}

.page-body :deep(.el-dialog__header) {
  padding: 22px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
  margin-right: 0;
}

.page-body :deep(.el-dialog__title) {
  font-size: 1.1rem;
  font-weight: 650;
  color: var(--text-heading);
}

.page-body :deep(.el-dialog__body) {
  padding: 24px;
}

.page-body :deep(.el-dialog__footer) {
  padding: 16px 24px 22px;
  border-top: 1px solid #f1f5f9;
}

/* ---- 表单标签 ---- */
.page-body :deep(.el-form-item__label) {
  font-size: 0.9rem;
  font-weight: 520;
  color: var(--text-heading);
}

/* ---- 提示框 Alert ---- */
.page-body :deep(.el-alert) {
  border-radius: var(--radius-md);
  border: 1px solid #e2e8f0;
}

/* ---- 卡片 ---- */
.page-body :deep(.el-card) {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-card);
  box-shadow: var(--shadow-card);
  background: #ffffff;
}

/* ---- 单选框 ---- */
.page-body :deep(.el-radio__input.is-checked .el-radio__inner) {
  background: #06b6d4;
  border-color: #06b6d4;
}

/* ---- 开关 ---- */
.page-body :deep(.el-switch.is-checked .el-switch__core) {
  background: #06b6d4;
  border-color: #06b6d4;
}

/* ---- 复选框 ---- */
.page-body :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: #06b6d4;
  border-color: #06b6d4;
}

/* ---- Loading ---- */
.page-body :deep(.el-loading-spinner .path) {
  stroke: #06b6d4;
}

/* ---- Tabs ---- */
.page-body :deep(.el-tabs__active-bar) {
  background: linear-gradient(135deg, #06b6d4, #10b981);
}

.page-body :deep(.el-tabs__item.is-active) {
  color: #06b6d4;
}
</style>

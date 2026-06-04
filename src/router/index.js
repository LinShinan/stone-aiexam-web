import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/profile',
    name: 'StudentProfile',
    component: () => import('../views/StudentProfile.vue'),
    meta: { title: '个人主页' }
  },
  {
    path: '/login',
    name: 'StudentLogin',
    component: () => import('../views/StudentLogin.vue'),
    meta: { title: '学生登录' }
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/AdminLogin.vue'),
    meta: { title: '管理员登录' }
  },
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('../views/AdminLayout.vue'),
    redirect: '/admin/welcome',
    children: [
      {
        path: 'welcome',
        name: 'Welcome',
        component: () => import('../views/Welcome.vue'),
        meta: { title: '欢迎', subtitle: '概览' }
      },
      {
        path: 'question-manage',
        name: 'QuestionManage',
        component: () => import('../views/QuestionManage.vue'),
        meta: { title: '题目管理', subtitle: '题库' }
      },
      {
        path: 'category-manage',
        name: 'CategoryManage',
        component: () => import('../views/CategoryManage.vue'),
        meta: { title: '分类管理', subtitle: '题库' }
      },
      {
        path: 'paper-manage',
        name: 'PaperManage',
        component: () => import('../views/PaperManage.vue'),
        meta: { title: '试卷管理', subtitle: '考试' }
      },
      {
        path: 'score-manage',
        name: 'ScoreManage',
        component: () => import('../views/ScoreManage.vue'),
        meta: { title: '成绩管理', subtitle: '考试' }
      },
      {
        path: 'banner-manage',
        name: 'BannerManage',
        component: () => import('../views/BannerManage.vue'),
        meta: { title: '轮播图管理', subtitle: '系统' }
      },
      {
        path: 'notice-manage',
        name: 'NoticeManage',
        component: () => import('../views/NoticeManage.vue'),
        meta: { title: '公告管理', subtitle: '系统' }
      },
      {
        path: 'paper-create',
        name: 'PaperCreate',
        component: () => import('../views/PaperCreate.vue'),
        meta: { title: '创建新试卷', subtitle: '考试' }
      }
    ]
  },
  {
    path: '/exam/list',
    name: 'PaperListForExam',
    component: () => import('../views/PaperListForExam.vue'),
    meta: { title: '选择考试' }
  },
  {
    path: '/exam/start/:paperId',
    name: 'ExamStart',
    component: () => import('../views/ExamStart.vue'),
    meta: { title: '开始考试' }
  },
  {
    path: '/exam/:id',
    name: 'Exam',
    component: () => import('../views/Exam.vue'),
    meta: { title: '在线考试' }
  },
  {
    path: '/exam-result',
    name: 'ExamResult',
    component: () => import('../views/ExamResult.vue'),
    meta: { title: '考试结果' }
  },
  {
    path: '/exam-result/:id',
    name: 'ExamResultById',
    component: () => import('../views/ExamResult.vue'),
    meta: { title: '考试结果' }
  },
  {
    path: '/exam-ranking',
    name: 'ExamRanking',
    component: () => import('../views/ExamRanking.vue'),
    meta: { title: '考试排行榜' }
  },
  {
    path: '/practice',
    name: 'Practice',
    component: () => import('../views/Practice.vue'),
    meta: { title: '刷题练习' }
  },
  {
    path: '/company-manage', // 企业管理页面路由
    name: 'CompanyManage', // 路由名称
    component: () => import('../views/CompanyManage.vue'), // 组件路径
    meta: { title: '企业管理' } // 页面标题
  },
  {
    path: '/pending-question-manage', // 用户上传审核页面路由
    name: 'PendingQuestionManage', // 路由名称
    component: () => import('../views/PendingQuestionManage.vue'), // 组件路径
    meta: { title: '用户上传审核' } // 页面标题
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title + ' - Stone AI Exam'
  }

  // 管理端鉴权
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    const token = localStorage.getItem('token')
    if (!token) {
      next({ path: '/admin/login', query: { redirect: to.fullPath } })
      return
    }
  }

  // 学生端鉴权：访问 /exam/start、/exam/、/profile 需要登录
  if ((to.path.startsWith('/exam/start') || to.path.startsWith('/exam/') || to.path === '/profile') && to.path !== '/exam/list' && to.path !== '/exam-ranking') {
    const studentToken = localStorage.getItem('studentToken')
    if (!studentToken) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }

  // 防止从考试结果页面返回到考试页面的逻辑
  if (from.path && from.path.includes('/exam-result/') && to.path && to.path.includes('/exam/')) {
    // 如果用户试图从结果页面返回到考试页面
    console.log('检测到从结果页面返回到考试页面的尝试')
    
    // 检查目标考试ID和来源结果页面ID是否相同
    const fromExamId = from.params.id
    const toExamId = to.params.id
    
    if (fromExamId === toExamId) {
      // 如果是同一个考试，阻止返回并重定向到考试列表
      console.log('阻止返回到已完成的考试，重定向到考试列表')
      next('/exam/list')
      return
    }
  }
  
  // 如果是访问考试页面，我们不能在这里检查考试状态（因为需要API调用）
  // 这个检查已经在Exam.vue的getExamData函数中处理了
  
  next()
})

// 路由后置守卫 - 设置页面标题  // 每次路由切换后设置页面标题
router.afterEach((to) => {
  document.title = to.meta.title + ' - Stone AI Exam'  // 更改标题后缀
})

export default router 
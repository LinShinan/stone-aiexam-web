<template>
  <div class="admin-page">
    <!-- 操作栏 — 悬浮卡片 -->
    <div class="admin-action-card">
      <div class="admin-action-card-inner">
        <div class="admin-page-title">
          <span class="admin-page-label">公告列表</span>
          <span class="admin-page-count">{{ noticeList.length }} 条</span>
        </div>
        <div class="admin-action-group">
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            <span>添加公告</span>
          </el-button>
          <el-button @click="getNoticeList">
            <el-icon><Refresh /></el-icon>
            <span>刷新</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 公告表格 -->
    <div class="admin-table-card">
      <el-table :data="noticeList" v-loading="loading" stripe>
        <!-- <el-table-column prop="id" label="ID" width="70" /> -->
        <el-table-column prop="title" label="标题" min-width="150">
          <template #default="{ row }">
            <span class="admin-item-title">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="内容预览" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.content?.substring(0, 60) }}{{ row.content?.length > 60 ? '...' : '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="getTypeTagColor(row.type)" effect="plain">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="120">
          <template #default="{ row }">
            <el-tag :type="getPriorityTagColor(row.priority)" effect="plain">{{ getPriorityText(row.priority) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'" effect="plain">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="350" fixed="right">
          <template #default="{ row }">
            <div class="admin-action-links">
              <el-button size="small" type="primary" @click="viewNoticeDetail(row)">
                <el-icon><View /></el-icon>
                <span>查看</span>
              </el-button>
              <el-button size="small" type="primary" @click="editNotice(row)">
                <el-icon><Edit /></el-icon>
                <span>编辑</span>
              </el-button>
              <el-button size="small" :type="row.isActive ? 'warning' : 'success'" @click="toggleStatus(row)">
                <el-icon><Switch /></el-icon>
                <span>{{ row.isActive ? '禁用' : '启用' }}</span>
              </el-button>
              <el-button size="small" type="danger" @click="deleteNotice(row)">
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="680px" :close-on-click-modal="false">
      <el-form :model="noticeForm" :rules="noticeRules" ref="noticeFormRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="noticeForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="noticeForm.content" type="textarea" :rows="6" placeholder="请输入公告内容" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="noticeForm.type" placeholder="请选择公告类型">
            <el-option label="系统公告" value="SYSTEM" />
            <el-option label="新功能" value="FEATURE" />
            <el-option label="通知" value="NOTICE" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="noticeForm.priority" placeholder="请选择优先级">
            <el-option label="普通" value="NORMAL" />
            <el-option label="重要" value="IMPORTANT" />
            <el-option label="紧急" value="URGENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="noticeForm.isActive" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitNotice" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="公告详情" width="600px">
      <div class="admin-detail-list" v-if="viewNotice">
        <div class="detail-header">
          <h3 class="detail-title">{{ viewNotice.title }}</h3>
          <div class="detail-meta">
            <el-tag :type="getTypeTagColor(viewNotice.type)" effect="plain">{{ getTypeText(viewNotice.type) }}</el-tag>
            <el-tag :type="getPriorityTagColor(viewNotice.priority)" effect="plain">{{ getPriorityText(viewNotice.priority) }}</el-tag>
            <span class="detail-time">{{ viewNotice.createTime }}</span>
          </div>
        </div>
        <div class="detail-body">{{ viewNotice.content }}</div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, View, Edit, Switch, Delete } from '@element-plus/icons-vue'
import { getNoticeList as fetchNotices, addNotice, updateNotice, toggleNoticeStatus, deleteNotice as delNotice } from '../api/notice'

const loading = ref(false)
const noticeList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const noticeFormRef = ref()
const viewDialogVisible = ref(false)
const viewNotice = ref(null)

const noticeForm = reactive({ id: null, title: '', content: '', type: 'SYSTEM', priority: 'NORMAL', isActive: true })

const noticeRules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
  type: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }]
}

const getTypeText = (type) => ({ 'SYSTEM': '系统', 'FEATURE': '功能', 'NOTICE': '通知' }[type] || type)
const getTypeTagColor = (type) => ({ 'SYSTEM': 'primary', 'FEATURE': 'success', 'NOTICE': 'info' }[type] || 'info')
const getPriorityText = (priority) => ({ 'NORMAL': '普通', 'IMPORTANT': '重要', 'URGENT': '紧急' }[priority] || priority)
const getPriorityTagColor = (priority) => ({ 'NORMAL': 'info', 'IMPORTANT': 'warning', 'URGENT': 'danger' }[priority] || 'info')

const getNoticeList = async () => {
  loading.value = true
  try {
    const res = await fetchNotices()
    noticeList.value = res.data || []
  } catch (error) {
    ElMessage.error('获取公告列表失败')
  } finally {
    loading.value = false
  }
}

const showAddDialog = () => { resetForm(); dialogTitle.value = '添加公告'; dialogVisible.value = true; }
const editNotice = (notice) => { Object.assign(noticeForm, notice); dialogTitle.value = '编辑公告'; dialogVisible.value = true; }

const resetForm = () => {
  Object.assign(noticeForm, { id: null, title: '', content: '', type: 'SYSTEM', priority: 'NORMAL', isActive: true })
  if (noticeFormRef.value) noticeFormRef.value.resetFields()
}

const submitNotice = async () => {
  if (!noticeFormRef.value) return
  try {
    await noticeFormRef.value.validate()
    submitLoading.value = true
    const isEdit = noticeForm.id !== null
    if (isEdit) {
      await updateNotice(noticeForm)
    } else {
      await addNotice(noticeForm)
    }
    ElMessage.success(isEdit ? '公告更新成功' : '公告添加成功')
    dialogVisible.value = false
    await getNoticeList()
  } catch (error) {
    ElMessage.error(error?.message || error || '操作失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

const toggleStatus = async (notice) => {
  try {
    const newStatus = !notice.isActive
    await toggleNoticeStatus(notice.id, newStatus)
    notice.isActive = newStatus
    ElMessage.success(`公告已${newStatus ? '启用' : '禁用'}`)
  } catch (error) {
    ElMessage.error(error?.message || '操作失败')
  }
}

const deleteNotice = async (notice) => {
  try {
    await ElMessageBox.confirm(`确定要删除公告"${notice.title}"吗？`, '确认删除', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    await delNotice(notice.id)
    ElMessage.success('删除成功')
    await getNoticeList()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error(error?.message || error || '删除失败')
  }
}

const viewNoticeDetail = (notice) => { viewNotice.value = notice; viewDialogVisible.value = true; }

onMounted(() => getNoticeList())
</script>

<style scoped>
/* ===== 操作栏卡片 ===== */








/* ===== 表格卡片 ===== */







/* ===== 详情对话框 ===== */

.detail-title {
  margin: 0 0 12px;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-heading, #0f172a);
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-time {
  font-size: 0.8rem;
  color: var(--text-muted, #8090b0);
}

.detail-body {
  line-height: 1.8;
  color: var(--text-body, #475569);
  white-space: pre-wrap;
  padding: 16px;
  background: #f8f9fd;
  border-radius: 10px;
}
</style>

<template>
  <div class="admin-page">
    <!-- 搜索/操作栏 — 悬浮卡片 -->
    <div class="admin-action-card">
      <div class="admin-action-card-inner">
        <div class="admin-search-group">
          <el-input
            v-model="searchKeyword"
            placeholder="按试卷名称搜索..."
            class="admin-search-input"
            clearable
            @clear="getPaperList"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            <span>搜索</span>
          </el-button>
        </div>
        <div class="admin-action-group">
          <el-button
            type="danger"
            @click="handleBatchDelete"
            :disabled="selectedPapers.length === 0"
          >
            <el-icon><Delete /></el-icon>
            <span>批量删除 ({{ selectedPapers.length }})</span>
          </el-button>
          <el-button type="primary" @click="goToCreatePage" class="create-btn">
            <el-icon><Plus /></el-icon>
            <span>创建新试卷</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 试卷列表 -->
    <div class="admin-table-card">
      <el-table :data="paperList" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="name" label="试卷名称" min-width="150">
          <template #default="{ row }">
            <span class="admin-item-title">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'info'" effect="plain">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="试卷描述" min-width="150" show-overflow-tooltip />
        <el-table-column prop="questionCount" label="题目数" width="120" align="center">
          <template #default="{ row }">
            <span class="admin-item-subtitle">{{ row.questionCount }} 道</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="总分" width="100" align="center">
          <template #default="{ row }">
            <span class="admin-item-subtitle">{{ row.totalScore }} 分</span>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="100" align="center">
          <template #default="{ row }">
            <span class="admin-item-subtitle">{{ row.duration }} 分钟</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="admin-action-links">
              <el-button
                v-if="row.status === 'DRAFT' || row.status === '待发布'"
                size="small" type="success"
                @click="updateStatus(row, 'PUBLISHED')"
              >
                <el-icon><CaretRight /></el-icon>
                <span>发布</span>
              </el-button>
              <el-button
                v-if="row.status === 'PUBLISHED'"
                size="small" type="warning"
                @click="updateStatus(row, 'DRAFT')"
              >
                <el-icon><VideoPause /></el-icon>
                <span>停止</span>
              </el-button>
              <el-button size="small" type="primary" @click="editPaper(row)">
                <el-icon><Edit /></el-icon>
                <span>编辑</span>
              </el-button>
              <el-button size="small" type="danger" @click="deletePaper(row)">
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, CaretRight, Edit, Delete, VideoPause, Search } from '@element-plus/icons-vue'
import { getPapers, updatePaperStatus } from '../api/paper.js'
import request from '../utils/request'

const router = useRouter()
const loading = ref(false)
const paperList = ref([])
const searchKeyword = ref('')
const selectedPapers = ref([])

const getStatusText = (status) => ({ 'PUBLISHED': '已发布', 'DRAFT': '草稿', '待发布': '待发布' }[status] || '未知状态')

const getPaperList = async () => {
  loading.value = true
  try {
    const res = await getPapers({ name: searchKeyword.value })
    paperList.value = res.data
  } catch (error) {
    ElMessage.error('获取试卷列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => getPaperList()
const goToCreatePage = () => router.push('/admin/paper-create')
const editPaper = (paper) => router.push(`/admin/paper-create?id=${paper.id}`)

const updateStatus = async (paper, status) => {
  try {
    await updatePaperStatus(paper.id, status)
    ElMessage.success(`试卷状态已更新为${getStatusText(status)}`)
    getPaperList()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

const deletePaper = async (paper) => {
  try {
    await ElMessageBox.confirm(`确定要删除试卷"${paper.name}"吗？`, '确认删除', { confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'danger' })
    await request.delete(`/api/papers/${paper.id}`)
    ElMessage.success('试卷删除成功')
    await getPaperList()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error(error.message)
  }
}

const handleBatchDelete = async () => {
  if (selectedPapers.value.length === 0) return ElMessage.warning('请先选择要删除的试卷')
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedPapers.value.length} 份试卷吗？`, '确认批量删除', { confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'danger' })
    const deletePromises = selectedPapers.value.map(p => request.delete(`/api/papers/${p.id}`))
    await Promise.all(deletePromises)
    ElMessage.success(`成功删除 ${selectedPapers.value.length} 份试卷`)
    selectedPapers.value = []
    await getPaperList()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('批量删除失败')
  }
}

const handleSelectionChange = (selected) => { selectedPapers.value = selected }

onMounted(() => getPaperList())
</script>

<style scoped>
/* ===== 搜索/操作栏 — 悬浮卡片 ===== */







.create-btn {
  margin-left: 4px;
}

/* ===== 表格卡片 ===== */
</style>

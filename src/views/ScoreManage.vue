<template>
  <div class="admin-page">
    <!-- 搜索栏 — 悬浮卡片 -->
    <div class="admin-action-card">
      <div class="admin-action-card-inner">
        <div class="admin-search-group2" >
          <el-input
            v-model="searchForm.studentName"
            placeholder="搜索考生姓名..."
            clearable
            @input="handleSearch"
          
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="searchForm.status" placeholder="考试状态" clearable @change="handleSearch">
            <el-option label="进行中" :value="0" />
            <el-option label="已完成" :value="1" />
            <el-option label="已批阅" :value="2" />
          </el-select>
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleSearch"
          />
        </div>
        <div class="admin-action-group">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            <span>搜索</span>
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            <span>重置</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 成绩表格 -->
    <div class="admin-table-card">
      <el-table :data="examRecords" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="studentName" label="考生姓名" width="130">
          <template #default="{ row }">
            <span class="admin-item-title">{{ row.studentName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paper.name" label="试卷名称" min-width="200" />
        <el-table-column prop="score" label="得分" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.status === '已批阅'" class="score-value">{{ row.score }}</span>
            <span v-else class="admin-text-muted">待批阅</span>
          </template>
        </el-table-column>
        <el-table-column prop="paper.totalScore" label="总分" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="plain">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="200">
          <template #default="{ row }">{{ formatDateTime(row.startTime) }}</template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="200">
          <template #default="{ row }">{{ row.endTime ? formatDateTime(row.endTime) : '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="admin-action-links">
              <el-button size="small" type="primary" @click="viewDetail(row)">
                <el-icon><View /></el-icon>
                <span>详情</span>
              </el-button>
              <el-button
                v-if="row.status === '已完成'"
                size="small" type="warning"
                @click="gradeExam(row)"
                :loading="row.grading"
              >
                <el-icon><Edit /></el-icon>
                <span>批阅</span>
              </el-button>
              <el-button size="small" type="danger" @click="deleteRecord(row)">
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="admin-pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { Search, Refresh, Edit, Delete, View } from '@element-plus/icons-vue'
import { getExamRecords as fetchExamRecords, deleteExamRecord, gradeExam as apiGradeExam } from '../api/exam'

const examRecords = ref([])
const loading = ref(false)
const pagination = reactive({ current: 1, size: 20, total: 0 })
const searchForm = reactive({ studentName: '', status: '', dateRange: [] })

const getExamRecords = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current, size: pagination.size, studentName: searchForm.studentName,
      status: searchForm.status,
      startDate: searchForm.dateRange?.[0], endDate: searchForm.dateRange?.[1]
    }
    const res = await fetchExamRecords(params)
    examRecords.value = res.data.records
    pagination.total = res.data.total
  } catch (error) {
    ElMessage.error('获取考试记录失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.current = 1; getExamRecords(); }
const resetSearch = () => { Object.assign(searchForm, { studentName: '', status: '', dateRange: [] }); handleSearch(); }
const handleSizeChange = (size) => { pagination.size = size; pagination.current = 1; getExamRecords(); }
const handleCurrentChange = (current) => { pagination.current = current; getExamRecords(); }

const getStatusText = (status) => ({ '进行中': '进行中', '已完成': '已完成', '已批阅': '已批阅' }[status] || status)
const getStatusType = (status) => ({ '进行中': 'warning', '已完成': 'info', '已批阅': 'success' }[status] || 'info')
const formatDateTime = (dateTime) => dateTime ? new Date(dateTime).toLocaleString('zh-CN') : '-'

const viewDetail = (record) => window.open(`/exam-result/${record.id}`, '_blank')

const gradeExam = async (record) => {
  const loading = ElLoading.service({
    lock: true,
    text: 'AI 正在批阅试卷，请稍候...',
    background: 'rgba(15, 23, 42, 0.5)',
    customClass: 'ai-grade-loading'
  })
  const tips = ['正在分析试卷内容...', '正在智能批改客观题...', '正在AI评估主观题...', '正在生成考试报告...']
  let tipIndex = 0
  const tipTimer = setInterval(() => {
    loading.setText(tips[tipIndex] || tips[tips.length - 1])
    tipIndex++
  }, 2000)

  try {
    await apiGradeExam(record.id)
    ElMessage.success('AI 批阅完成')
    getExamRecords()
  } catch (error) {
    ElMessage.error('批阅失败：' + (error.message || '请稍后重试'))
  } finally {
    clearInterval(tipTimer)
    loading.close()
  }
}

const deleteRecord = async (record) => {
  try {
    await ElMessageBox.confirm(`确定要删除考生 ${record.studentName} 的考试记录吗？`, '确认删除', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    await deleteExamRecord(record.id)
    ElMessage.success('删除成功')
    getExamRecords()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error(error?.message || error || '删除失败')
  }
}

onMounted(() => getExamRecords())
</script>

<style scoped>

.admin-search-group2 {
  display: flex;
  gap: 12px;
}
.admin-search-group2 > * {
  flex: 3;
}

.admin-search-group2 > * {
  width: 280px; /* 固定宽度 */
}

.score-value {
  font-weight: 650;
  color: #6366f1;
  font-size: 0.9rem;
}
</style>

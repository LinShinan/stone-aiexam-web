<template>
  <div class="admin-page">
    <!-- 操作栏 — 悬浮卡片 -->
    <div class="admin-action-card">
      <div class="admin-action-card-inner">
        <div class="admin-page-title">
          <span class="admin-page-label">轮播图列表</span>
          <span class="admin-page-count">{{ bannerList.length }} 张</span>
        </div>
        <div class="admin-action-group">
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            <span>添加轮播图</span>
          </el-button>
          <el-button @click="getBannerList">
            <el-icon><Refresh /></el-icon>
            <span>刷新</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 轮播图表格 -->
    <div class="admin-table-card">
      <el-table :data="bannerList" v-loading="loading" stripe>
        <!-- <el-table-column prop="id" label="ID" width="60" /> -->
        <el-table-column label="预览图" width="130">
          <template #default="{ row }">
            <el-image
              :src="row.imageUrl"
              :preview-src-list="[row.imageUrl]"
              fit="cover"
              class="admin-thumb-sm"
              :preview-teleported="true"
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="160">
          <template #default="{ row }">
            <span class="admin-item-title">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="linkUrl" label="跳转链接" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.linkUrl" class="link-text">{{ row.linkUrl }}</span>
            <span v-else class="admin-text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="90" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'" effect="plain">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="createTime" label="创建时间" width="170" /> -->
        <el-table-column label="操作" width="300" fixed="right" align="center">
          <template #default="{ row }">
            <div class="admin-action-links">
              <el-button size="small" type="primary" @click="editBanner(row)">
                <el-icon><Edit /></el-icon>
                <span>编辑</span>
              </el-button>
              <el-button
                size="small"
                :type="row.isActive ? 'warning' : 'success'"
                @click="toggleBannerStatus(row)"
              >
              <el-icon><Switch /></el-icon>
                <span>{{ row.isActive ? '禁用' : '启用' }}</span>
              </el-button>
              <el-button size="small" type="danger" @click="deleteBanner(row)">
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="620px" :close-on-click-modal="false">
      <el-form :model="bannerForm" :rules="bannerRules" ref="bannerFormRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="bannerForm.title" placeholder="请输入轮播图标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="bannerForm.description" type="textarea" :rows="3" placeholder="请输入轮播图描述" />
        </el-form-item>
        <el-form-item label="图片" prop="imageUrl">
          <el-radio-group v-model="imageInputType" @change="handleImageInputTypeChange" style="margin-bottom: 10px;">
            <el-radio label="upload">上传到服务器</el-radio>
            <el-radio label="url">外部图片URL</el-radio>
          </el-radio-group>
          <div v-if="imageInputType === 'upload'">
            <el-upload
              ref="uploadRef"
              :action="uploadAction"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeUpload"
              accept="image/*"
            >
              <el-button type="primary" :loading="uploadLoading">
                <el-icon><Upload /></el-icon>
                <span>{{ uploadLoading ? '上传中...' : '选择图片文件' }}</span>
              </el-button>
            </el-upload>
            <div class="admin-form-tip">支持 JPG、PNG、GIF 格式，文件大小不超过 5MB</div>
          </div>
          <div v-if="imageInputType === 'url'">
            <el-input v-model="bannerForm.imageUrl" placeholder="请输入图片URL地址" style="margin-bottom: 8px;" />
            <div class="admin-form-tip">可以输入其他网站的图片地址</div>
          </div>
          <div v-if="bannerForm.imageUrl" class="admin-upload-preview">
            <el-image :src="bannerForm.imageUrl" fit="cover" class="admin-thumb-sm" :preview-src-list="[bannerForm.imageUrl]" :preview-teleported="true" />
            <span class="admin-upload-preview-label">点击图片可预览</span>
          </div>
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="bannerForm.linkUrl" placeholder="请输入跳转链接（可选）" />
          <div class="admin-form-tip-box">
            <p><strong>支持的链接格式：</strong></p>
            <p>• 外部网站：https://www.baidu.com</p>
            <p>• 内部页面：/practice 或 /exam/list</p>
            <p>• 留空则点击无跳转效果</p>
          </div>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="bannerForm.sortOrder" :min="0" :max="999" placeholder="数字越小排序越靠前" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="bannerForm.isActive" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBanner" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Plus, Refresh, Edit, Switch, Delete } from '@element-plus/icons-vue'
import { getBannerList as fetchBanners, addBanner, updateBanner, toggleBannerStatus as toggleStatus, deleteBanner as delBanner } from '../api/banner'

const loading = ref(false)
const bannerList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const bannerFormRef = ref()
const imageInputType = ref('upload')
const uploadRef = ref()
const uploadLoading = ref(false)

const uploadAction = ref('/api/banners/upload-image')
const uploadHeaders = ref({})

const bannerForm = reactive({ id: null, title: '', description: '', imageUrl: '', linkUrl: '', sortOrder: 0, isActive: true })

const bannerRules = {
  title: [{ required: true, message: '请输入轮播图标题', trigger: 'blur' }],
  imageUrl: [{ required: true, message: '请选择图片或输入图片URL', trigger: 'blur' }]
}

const getBannerList = async () => {
  loading.value = true
  try {
    const res = await fetchBanners()
    bannerList.value = res.data || []
  } catch (error) {
    ElMessage.error('获取轮播图列表失败')
  } finally {
    loading.value = false
  }
}

const showAddDialog = () => { resetForm(); dialogTitle.value = '添加轮播图'; dialogVisible.value = true; }
const editBanner = (banner) => { Object.assign(bannerForm, banner); dialogTitle.value = '编辑轮播图'; dialogVisible.value = true; }

const resetForm = () => {
  Object.assign(bannerForm, { id: null, title: '', description: '', imageUrl: '', linkUrl: '', sortOrder: 0, isActive: true })
  imageInputType.value = 'upload'
  if (bannerFormRef.value) bannerFormRef.value.resetFields()
}

const submitBanner = async () => {
  if (!bannerFormRef.value) return
  try {
    await bannerFormRef.value.validate()
    submitLoading.value = true
    const isEdit = bannerForm.id !== null
    if (isEdit) {
      await updateBanner(bannerForm)
    } else {
      await addBanner(bannerForm)
    }
    ElMessage.success(isEdit ? '轮播图更新成功' : '轮播图添加成功')
    dialogVisible.value = false
    await getBannerList()
  } catch (error) {
    ElMessage.error(error?.message || error || '操作失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

const toggleBannerStatus = async (banner) => {
  try {
    const newStatus = !banner.isActive
    await toggleStatus(banner.id, newStatus)
    banner.isActive = newStatus
    ElMessage.success(`轮播图已${newStatus ? '启用' : '禁用'}`)
  } catch (error) {
    ElMessage.error(error?.message || '操作失败')
  }
}

const deleteBanner = async (banner) => {
  try {
    await ElMessageBox.confirm(`确定要删除轮播图"${banner.title}"吗？`, '确认删除', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    await delBanner(banner.id)
    ElMessage.success('删除成功')
    await getBannerList()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error(error?.message || error || '删除失败')
  }
}

const handleImageInputTypeChange = () => { bannerForm.imageUrl = '' }

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) { ElMessage.error('只能上传图片文件！'); return false }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) { ElMessage.error('图片大小不能超过5MB！'); return false }
  uploadLoading.value = true
  return true
}

const handleUploadSuccess = (response, file) => {
  uploadLoading.value = false
  if (response.code === 200) {
    bannerForm.imageUrl = response.data
    ElMessage.success('图片上传成功！')
  } else {
    ElMessage.error(response.message || '图片上传失败！')
  }
}

const handleUploadError = (error, file) => {
  uploadLoading.value = false
  ElMessage.error(error.message || '图片上传失败，请重试！')
}

onMounted(() => getBannerList())
</script>

<style scoped>
/* ===== 操作栏卡片 ===== */








/* ===== 表格卡片 ===== */






.link-text {
  color: #6366f1;
  font-size: 0.8rem;
}



/* ===== 表单辅助 ===== */
</style>

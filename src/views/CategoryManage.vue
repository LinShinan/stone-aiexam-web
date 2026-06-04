<template>
  <div class="admin-page">
    <!-- 操作提示 -->
    <div class="admin-tips-card">
      <el-alert
        title="操作提示"
        type="info"
        description="管理考试题目分类，支持两级分类。删除分类前请确保该分类下没有子分类和考试题目。"
        show-icon
        :closable="false"
      />
    </div>

    <!-- 分类表格 -->
    <div class="admin-table-card">
      <div class="admin-table-toolbar">
        <span class="admin-table-toolbar-title">分类列表</span>
        <el-button type="primary" size="small" @click="addRootCategory">
          <el-icon><Plus /></el-icon>
          <span>添加分类</span>
        </el-button>
      </div>
      <el-table
        :data="categoryTree"
        v-loading="loading"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" min-width="100">
          <template #default="{ row }">
            <span :class="row.parentId === 0 ? 'category-name-level1' : 'admin-item-title'">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="row.parentId === 0 ? 'warning' : 'success'" effect="plain">
              {{ row.parentId === 0 ? '一级' : '二级' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        <el-table-column prop="description" label="描述" min-width="120" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="400" fixed="right">
          <template #default="{ row }">
            <div class="admin-action-links">
              <el-button size="small" type="primary" @click="viewCategory(row)">
                <el-icon><View /></el-icon>
                <span>查看</span>
              </el-button>
              <el-button size="small" type="primary" @click="editCategory(row)">
                <el-icon><Edit /></el-icon>
                <span>编辑</span>
              </el-button>
              <el-button
                v-if="row.parentId === 0 && (row.name === '选择题' || row.name === '判断题' || row.name === '简答题')"
                size="small" type="success"
                @click="addSubCategory(row)"
              >
                <el-icon><Plus /></el-icon>
                <span>添加子分类</span>
              </el-button>
              <el-button size="small" type="danger" @click="deleteCategory(row)">
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="520px" @close="closeDialog">
      <el-form :model="categoryForm" :rules="formRules" ref="categoryFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item v-if="isAddSubCategory" label="父分类" prop="parentId">
          <el-select v-model="categoryForm.parentId" disabled style="width: 100%">
            <el-option :label="getParentCategoryName(categoryForm.parentId)" :value="categoryForm.parentId" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input v-model="categoryForm.description" type="textarea" :rows="2" placeholder="请输入分类描述（可选）" />
        </el-form-item>
        <el-form-item label="排序序号" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" :max="999" placeholder="排序序号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog title="分类详情" v-model="viewDialogVisible" width="520px">
      <div class="admin-detail-list" v-if="viewCategoryData">
        <div class="admin-detail-item">
          <span class="admin-detail-label">分类名称</span>
          <span class="admin-detail-value">{{ viewCategoryData.name }}</span>
        </div>
        <div class="admin-detail-item">
          <span class="admin-detail-label">分类级别</span>
          <span class="admin-detail-value">
            <el-tag :type="viewCategoryData.level === 1 ? 'primary' : 'success'" effect="plain">
              {{ viewCategoryData.level === 1 ? '一级分类' : '二级分类' }}
            </el-tag>
          </span>
        </div>
        <div class="admin-detail-item" v-if="viewCategoryData.level === 2">
          <span class="admin-detail-label">父分类</span>
          <span class="admin-detail-value">{{ getParentCategoryName(viewCategoryData.parentId) }}</span>
        </div>
        <div class="admin-detail-item">
          <span class="admin-detail-label">排序序号</span>
          <span class="admin-detail-value">{{ viewCategoryData.sort }}</span>
        </div>
        <div class="admin-detail-item">
          <span class="admin-detail-label">分类描述</span>
          <span class="detail-value detail-desc">{{ viewCategoryData.description || '—' }}</span>
        </div>
        <div class="admin-detail-item">
          <span class="admin-detail-label">创建时间</span>
          <span class="admin-detail-value">{{ viewCategoryData.createTime }}</span>
        </div>
        <div class="admin-detail-item">
          <span class="admin-detail-label">更新时间</span>
          <span class="admin-detail-value">{{ viewCategoryData.updateTime }}</span>
        </div>
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
import { Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import request from '../utils/request'

const loading = ref(false)
const categoryTree = ref([])
const allCategories = ref([])
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const categoryFormRef = ref(null)
const viewCategoryData = ref(null)
const isAddSubCategory = ref(false)

const categoryForm = reactive({ id: null, name: '', parentId: null, level: 1, sort: 0, description: '' })

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }, { min: 2, max: 50, message: '分类名称长度在 2 到 50 个字符', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序序号', trigger: 'blur' }, { type: 'number', min: 0, max: 999, message: '排序序号范围为 0-999', trigger: 'blur' }]
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const response = await request.get('/api/common/categories/tree')
    categoryTree.value = response.data
    allCategories.value = flattenTree(response.data || [])
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

const flattenTree = (nodes) => {
  const list = [];
  if (!nodes) return list;
  for (const node of nodes) {
    const { children, ...rest } = node;
    list.push(rest);
    if (children && children.length > 0) {
      list.push(...flattenTree(children));
    }
  }
  return list;
}

const getParentCategoryName = (parentId) => {
  if (!parentId) return '-'
  const parent = allCategories.value.find(cat => cat.id === parentId)
  return parent ? parent.name : '-'
}

const addRootCategory = () => {
  dialogTitle.value = '添加分类'
  isEdit.value = false
  isAddSubCategory.value = false
  resetForm()
  dialogVisible.value = true
}

const addSubCategory = (parentCategory) => {
  dialogTitle.value = `新增子分类（父分类：${parentCategory.name}）`
  isEdit.value = false
  isAddSubCategory.value = true
  resetForm()
  categoryForm.parentId = parentCategory.id
  categoryForm.level = 2
  dialogVisible.value = true
}

const editCategory = (category) => {
  dialogTitle.value = '编辑分类'
  isEdit.value = true
  isAddSubCategory.value = false
  Object.assign(categoryForm, category)
  dialogVisible.value = true
}

const viewCategory = (category) => {
  viewCategoryData.value = { ...category }
  viewDialogVisible.value = true
}

const deleteCategory = async (category) => {
  try {
    await ElMessageBox.confirm(`确定要删除分类 "${category.name}" 吗？`, '删除确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    await request.delete(`/api/admin/categories/${category.id}`)
    ElMessage.success('删除成功')
    fetchCategories()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error(error.message || '删除失败')
  }
}

const saveCategory = async () => {
  try {
    await categoryFormRef.value.validate()
    categoryForm.level = categoryForm.parentId ? 2 : 1
    const url = isEdit.value ? `/api/admin/categories` : '/api/admin/categories'
    const method = isEdit.value ? 'put' : 'post'
    await request[method](url, categoryForm)
    ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
    closeDialog()
    fetchCategories()
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  }
}

const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(categoryForm, { id: null, name: '', parentId: null, level: 1, sort: 0, description: '' })
  if (categoryFormRef.value) categoryFormRef.value.clearValidate()
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
/* ===== 一级分类名称高亮 ===== */
.category-name-level1 {
  font-weight: 650;
  color: #e67e22;
}
</style>

<template>
  <div class="data-select-dialog-wrapper">
    <!-- 触发按钮 -->
    <div class="data-select-trigger">
      <slot name="trigger" :openDialog="openDialog">
        <el-button 
          @click="openDialog" 
          :type="buttonType"
          :icon="buttonIcon"
          :size="buttonSize"
          :plain="buttonPlain"
          :round="buttonRound"
        >
          {{ triggerText }}
        </el-button>
      </slot>
    </div>

    <!-- 选择弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="60%"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      custom-class="custom-data-select-dialog"
      @close="handleClose"
    >
      <!-- 搜索区域 -->
      <div class="search-area">
        <div class="search-container">
          <el-input
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            clearable
            class="search-input"
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button icon="el-icon-search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-container">
        <el-table
          ref="dataTable"
          :data="tableData"
          v-loading="loading"
          :empty-text="emptyText"
          @selection-change="handleSelectionChange"
          @select-all="handleSelectAll"
          @row-click="handleRowClick"
          :row-key="rowKey"
          height="400"
          stripe
          border
        >
          <!-- 单选模式的选择列 -->
          <el-table-column 
            v-if="!multiple"
            width="55"
            align="center"
            header-align="center"
          >
            <template slot-scope="scope">
              <el-radio
                v-model="selectedRadio"
                :label="scope.row[rowKey]"
                @change="handleRadioChange(scope.row)"
                class="hidden-label-radio"
              >
                <!-- 空内容，不显示label -->
              </el-radio>
            </template>
          </el-table-column>

          <!-- 多选模式的选择列 -->
          <el-table-column 
            v-else
            type="selection"
            width="55"
            :reserve-selection="false"
            align="center"
            header-align="center"
          />

          <!-- 数据列 - 过滤掉隐藏的列 -->
          <el-table-column
            v-for="column in visibleColumns"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth || '120px'"
            show-overflow-tooltip
            align="center"
            header-align="center"
          >
            <template slot-scope="scope">
              <span>{{ formatCellValue(scope.row, column) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-area">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 底部操作和选中信息 -->
      <template #footer>
        <div class="dialog-footer-container">
          <div class="selected-info" v-if="selectedRows.length > 0">
            已选择 <span class="selected-count">{{ selectedRows.length }}</span> 项
            <el-tag
              v-for="(item, index) in selectedRows.slice(0, 3)"
              :key="item[rowKey]"
              size="small"
              class="selected-tag"
              closable
              @close="removeSelectedItem(item)"
            >
              {{ getItemDisplayName(item) }}
            </el-tag>
            <span v-if="selectedRows.length > 3" class="more-items">
              等 {{ selectedRows.length }} 项
            </span>
          </div>
          <div class="footer-actions">
            <el-button @click="dialogVisible = false" size="medium">取消</el-button>
            <el-button 
              type="primary" 
              @click="handleConfirm" 
              :loading="loading"
              :disabled="selectedRows.length === 0"
              size="medium"
            >
              确定 ({{ selectedRows.length }})
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getDataByType } from '@/api/common/select'

export default {
  name: 'DataSelectDialog',
  props: {
    triggerText: {
      type: String,
      default: '选择数据'
    },
    dialogTitle: {
      type: String,
      default: '选择数据'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    dataType: {
      type: String,
      default: 'user'
    },
    columns: {
      type: Array,
      required: true,
      default: () => []
    },
    rowKey: {
      type: String,
      default: 'id'
    },
    selectedValues: {
      type: Array,
      default: () => []
    },
    extraParams: {
      type: Object,
      default: () => ({})
    },
    buttonType: {
      type: String,
      default: 'primary'
    },
    buttonIcon: {
      type: String,
      default: ''
    },
    buttonSize: {
      type: String,
      default: 'medium'
    },
    buttonPlain: {
      type: Boolean,
      default: false
    },
    buttonRound: {
      type: Boolean,
      default: false
    },
    searchPlaceholder: {
      type: String,
      default: '请输入关键词搜索...'
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    displayField: {
      type: String,
      default: 'name'
    },
    // 是否隐藏ID列
    hideIdColumn: {
      type: Boolean,
      default: true
    },
    // 要隐藏的列（prop数组）
    hiddenColumns: {
      type: Array,
      default: () => []
    },
    // 新增：是否在加载失败时自动关闭弹窗
    autoCloseOnError: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      dialogVisible: false,
      tableData: [],
      loading: false,
      searchQuery: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      selectedRows: [],
      selectedRadio: '', // 单选模式下选中的值
      errorOccurred: false // 标记是否发生错误
    }
  },
  computed: {
    // 过滤掉隐藏的列
    visibleColumns() {
      let columns = [...this.columns]
      
      // 隐藏包含"id"的第一列
      if (this.hideIdColumn && columns.length > 0) {
        const firstColumn = columns[0]
        if (firstColumn.prop.toLowerCase().includes('id') || 
            firstColumn.label.toLowerCase().includes('id')) {
          columns = columns.slice(1)
        }
      }
      
      // 隐藏指定的列
      if (this.hiddenColumns.length > 0) {
        columns = columns.filter(column => 
          !this.hiddenColumns.includes(column.prop)
        )
      }
      
      return columns
    }
  },
  watch: {
    dialogVisible(newVal) {
      if (newVal) {
        this.errorOccurred = false
        this.$nextTick(() => {
          this.loadTableData()
        })
      } else {
        // 重置状态
        this.searchQuery = ''
        this.currentPage = 1
      }
    }
  },
  methods: {
    // 打开弹窗
    openDialog() {
      this.dialogVisible = true
    },
    
    // 加载表格数据
    async loadTableData() {
      this.loading = true
      this.errorOccurred = false
      
      try {
        const params = {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          ...this.extraParams
        }
        
        if (this.searchQuery) {
          params.searchKey = this.searchQuery
        }
        
        console.log(`请求参数:`, params)
        
        const response = await getDataByType(this.dataType, params)
        
        if (response.code === 200) {
          this.tableData = response.rows || response.data || []
          this.total = response.total || 0
          
          // 设置选中状态
          this.$nextTick(() => {
            this.setSelectedRows()
          })
        } else {
          throw new Error(response.msg || `获取${this.dataType}数据失败`)
        }
      } catch (error) {
        console.error(`加载${this.dataType}数据失败:`, error)
        this.errorOccurred = true
        
        // 显示错误信息
        let errorMessage = `加载${this.dataType}数据失败`
        if (error.response) {
          // 服务器返回错误状态码
          errorMessage += `: ${error.response.status} ${error.response.statusText}`
          if (error.response.status === 404) {
            errorMessage += ' (接口不存在)'
          }
        } else if (error.message) {
          errorMessage += `: ${error.message}`
        }
        
        this.$message.error(errorMessage)
        
        // 如果启用了自动关闭，则在错误时关闭弹窗
        if (this.autoCloseOnError) {
          console.log('发生错误，自动关闭弹窗')
          setTimeout(() => {
            this.dialogVisible = false
          }, 1500) // 延迟1.5秒关闭，让用户看到错误信息
        }
        
        // 设置空数据
        this.tableData = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    
    // 设置已选中的行
    setSelectedRows() {
      if (!this.$refs.dataTable) return
      
      // 清空当前选择
      this.$refs.dataTable.clearSelection()
      this.selectedRows = []
      
      if (this.selectedValues.length > 0) {
        const selectedItems = []
        
        this.tableData.forEach(row => {
          if (this.selectedValues.includes(row[this.rowKey])) {
            selectedItems.push(row)
            
            // 设置表格选中状态
            this.$nextTick(() => {
              this.$refs.dataTable.toggleRowSelection(row, true)
            })
          }
        })
        
        this.selectedRows = selectedItems
        
        // 设置单选模式下的radio值
        if (!this.multiple && this.selectedRows.length > 0) {
          this.selectedRadio = this.selectedRows[0][this.rowKey]
        }
      }
    },
    
    // 单选模式下的radio变化
    handleRadioChange(row) {
      this.selectedRows = [row]
      this.$refs.dataTable.clearSelection()
      this.$nextTick(() => {
        this.$refs.dataTable.toggleRowSelection(row, true)
      })
    },
    
    // 全选/全不选
    handleSelectAll(selection) {
      if (this.multiple) {
        if (selection.length > 0) {
          // 全选 - 将当前页所有行添加到选中列表
          this.tableData.forEach(row => {
            if (!this.selectedRows.some(item => item[this.rowKey] === row[this.rowKey])) {
              this.selectedRows.push(row)
            }
          })
        } else {
          // 全不选 - 只取消当前页的选中
          const currentPageKeys = this.tableData.map(row => row[this.rowKey])
          this.selectedRows = this.selectedRows.filter(item => 
            !currentPageKeys.includes(item[this.rowKey])
          )
        }
        
        // 更新表格选中状态
        this.$nextTick(() => {
          this.updateTableSelection()
        })
      }
    },
    
    // 选择变化
    handleSelectionChange(selection) {
      if (this.multiple) {
        this.selectedRows = selection
      }
    },
    
    // 行点击事件
    handleRowClick(row) {
      if (!this.multiple) {
        // 单选模式下点击行直接选中
        this.selectedRadio = row[this.rowKey]
        this.selectedRows = [row]
        this.$refs.dataTable.clearSelection()
        this.$nextTick(() => {
          this.$refs.dataTable.toggleRowSelection(row, true)
        })
      }
    },
    
    // 更新表格选中状态
    updateTableSelection() {
      if (!this.$refs.dataTable || !this.multiple) return
      
      // 清空当前选择
      this.$refs.dataTable.clearSelection()
      
      // 设置当前页中已选中的行
      this.tableData.forEach(row => {
        if (this.selectedRows.some(item => item[this.rowKey] === row[this.rowKey])) {
          this.$nextTick(() => {
            this.$refs.dataTable.toggleRowSelection(row, true)
          })
        }
      })
    },
    
    // 搜索
    handleSearch() {
      this.currentPage = 1
      this.loadTableData()
    },
    
    // 分页大小变化
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadTableData()
    },
    
    // 页码变化
    handleCurrentChange(page) {
      this.currentPage = page
      this.loadTableData()
    },
    
    // 确定选择
    handleConfirm() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请至少选择一条数据')
        return
      }
      
      const result = this.multiple ? this.selectedRows : this.selectedRows[0]
      this.$emit('confirm', result)
      this.dialogVisible = false
    },
    
    // 关闭弹窗
    handleClose() {
      this.selectedRows = []
      this.selectedRadio = ''
      this.errorOccurred = false
      if (this.$refs.dataTable) {
        this.$refs.dataTable.clearSelection()
      }
      this.$emit('close')
    },
    
    // 格式化单元格值
    formatCellValue(row, column) {
      const value = row[column.prop]
      if (value === null || value === undefined) {
        return '-'
      }
      return value
    },
    
    // 获取项目显示名称
    getItemDisplayName(item) {
      return item[this.displayField] || item.name || item[this.rowKey]
    },
    
    // 移除已选项目
    removeSelectedItem(item) {
      this.selectedRows = this.selectedRows.filter(selected => selected[this.rowKey] !== item[this.rowKey])
      
      // 更新表格选中状态
      this.$nextTick(() => {
        this.updateTableSelection()
      })
      
      // 更新单选radio
      if (!this.multiple && this.selectedRows.length === 0) {
        this.selectedRadio = ''
      }
    }
  }
}
</script>

<style scoped>
.data-select-dialog-wrapper {
  display: inline-block;
}

.search-area {
  margin-bottom: 20px;
  padding: 0 10px;
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-input {
  width: 100%;
  max-width: 600px;
}

.table-container {
  margin-bottom: 20px;
}

.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 14px;
}

.selected-count {
  color: #409EFF;
  font-weight: bold;
}

.selected-tag {
  margin: 2px;
}

.more-items {
  color: #909399;
  font-size: 12px;
}

.footer-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex: 1;
}

/* 单选模式下radio的样式调整 */
:deep(.el-radio) {
  margin-right: 0;
}

:deep(.el-table .el-radio) {
  margin-bottom: 0;
}

/* 确保checkbox和radio居中 */
:deep(.el-table .cell) {
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-checkbox) {
  margin: 0;
}

:deep(.el-radio) {
  margin: 0;
}
</style>

<style>
/* 全局样式，用于自定义对话框 */
.custom-data-select-dialog {
  width: 60% !important;
  max-width: 900px;
  min-width: 600px;
}

.custom-data-select-dialog .el-dialog__body {
  padding: 20px;
}

.custom-data-select-dialog .el-table {
  font-size: 14px;
}

.custom-data-select-dialog .el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.custom-data-select-dialog .el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafafa;
}

.custom-data-select-dialog .el-table .el-radio,
.custom-data-select-dialog .el-table .el-checkbox {
  margin: 0;
}

/* 确保选择列的表头也居中 */
.custom-data-select-dialog .el-table .el-table__header-wrapper .el-table-column--selection .cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 隐藏radio的label显示 */
.custom-data-select-dialog .el-table .hidden-label-radio .el-radio__label {
  display: none !important;
  width: 0;
  height: 0;
  padding: 0;
  margin: 0;
}

.custom-data-select-dialog .el-table .hidden-label-radio {
  line-height: 1;
}

/* 响应式调整 */
@media screen and (max-width: 1200px) {
  .custom-data-select-dialog {
    width: 70% !important;
  }
}

@media screen and (max-width: 768px) {
  .custom-data-select-dialog {
    width: 90% !important;
    min-width: unset;
  }
  
  .dialog-footer-container {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .selected-info {
    justify-content: center;
  }
  
  .footer-actions {
    justify-content: center;
  }
}
</style>
<template>
    <el-dialog
      title="选择活动"
      :visible.sync="dialogVisible"
      width="1200px"
      append-to-body
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <!-- 查询条件 -->
      <el-form
        :model="selectQueryParams"
        ref="selectQueryForm"
        size="small"
        :inline="true"
        label-width="80px"
      >
        <el-form-item label="活动代码" prop="activityCode">
          <el-input
            v-model="selectQueryParams.activityCode"
            placeholder="请输入活动代码"
            clearable
            style="width: 180px"
          />
        </el-form-item>
  
        <el-form-item label="活动主题" prop="activityName">
          <el-input
            v-model="selectQueryParams.activityName"
            placeholder="请输入活动主题"
            clearable
            style="width: 180px"
          />
        </el-form-item>
  
        <el-form-item label="组织者" prop="orgName">
          <el-input
            v-model="selectQueryParams.orgName"
            placeholder="请输入组织者"
            clearable
            style="width: 180px"
          />
        </el-form-item>
  
        <el-form-item label="活动状态" prop="status">
          <el-select
            v-model="selectQueryParams.status"
            placeholder="活动状态"
            clearable
            style="width: 180px"
          >
            <el-option label="启用" value="0" />
            <el-option label="停用" value="1" />
          </el-select>
        </el-form-item>
  
        <el-form-item label="仅主活动">
          <el-switch
            v-model="selectQueryParams.onlyMain"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>
  
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleSelectQuery">查询</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetSelectQuery">重置</el-button>
        </el-form-item>
      </el-form>
  
      <!-- 活动列表 -->
      <el-table
        v-loading="selectLoading"
        :data="selectActivityList"
        highlight-current-row
        row-key="activityId"
        stripe
        border
        height="400"
        ref="activityTable"
        @selection-change="handleSelectChange"
        @row-click="handleRowClick"
      >
        <!-- 多选 -->
        <el-table-column
          v-if="selectMode === 'multiple'"
          type="selection"
          width="55"
          align="center"
          :reserve-selection="true"
        />
        <!-- 单选 -->
        <el-table-column v-else width="55" align="center">
          <template slot-scope="scope">
            <el-radio
              v-model="singleSelectedId"
              :label="scope.row.activityId"
              @change="handleRadioChange(scope.row)"
            >{{''}}</el-radio>
          </template>
        </el-table-column>
  
        <el-table-column label="主活动标识" width="100" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.parentActivityId === 0" class="main-activity-tag">主活动</span>
            <span v-else class="sub-activity-tag">子活动</span>
          </template>
        </el-table-column>
  
        <el-table-column label="活动代码" prop="activityCode" width="150" align="center" />
        <el-table-column label="活动主题" prop="activityName" min-width="200" align="left">
          <template slot-scope="scope">
            <div :class="scope.row.parentActivityId === 0 ? 'main-activity-name' : 'sub-activity-name'">
              {{ scope.row.activityName }}
            </div>
          </template>
        </el-table-column>
  
        <el-table-column label="组织者" prop="orgName" width="150" align="center" />
        <el-table-column label="活动地点" prop="address" width="200" align="center" />
        <el-table-column label="活动状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === '0' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
  
        <el-table-column label="审批状态" width="100" align="center">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.sys_activities_status" :value="scope.row.appored"/>
          </template>
        </el-table-column>
  
        <el-table-column label="开始时间" width="160" align="center">
          <template slot-scope="scope">{{ formatDateTime(scope.row.startTime) }}</template>
        </el-table-column>
  
        <el-table-column label="结束时间" width="160" align="center">
          <template slot-scope="scope">{{ formatDateTime(scope.row.endTime) }}</template>
        </el-table-column>
      </el-table>
  
      <!-- 分页 -->
      <div class="pagination-container" style="margin-top: 15px;">
        <pagination
          v-show="selectTotal > 0"
          :total="selectTotal"
          :page.sync="selectQueryParams.pageNum"
          :limit.sync="selectQueryParams.pageSize"
          @pagination="getSelectList"
        />
      </div>
  
      <!-- 已选活动 -->
      <div class="selected-container" v-if="selectedActivities.length > 0" style="margin-top: 15px;">
        <div class="selected-title">已选择的活动：</div>
        <div class="selected-items">
          <el-tag
            v-for="activity in selectedActivities"
            :key="activity.activityId"
            closable
            @close="removeSelected(activity)"
            type="info"
            size="medium"
            style="margin-right: 8px; margin-bottom: 8px;"
          >
            {{ activity.activityName }}
            <span v-if="activity.parentActivityId === 0" class="main-tag">(主)</span>
          </el-tag>
        </div>
      </div>
  
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="confirm">确 定</el-button>
      </div>
    </el-dialog>
  </template>
  
  <script>
  import { selectActivityList } from '@/api/offline/activities'
  
  export default {
    name: 'ActivitySelect',
    dicts: ['sys_activities_status'],
    props: {
      visible: Boolean,
      selectMode: {
        type: String,
        default: 'multiple',
        validator: v => ['single', 'multiple'].includes(v)
      }
    },
    data() {
      return {
        dialogVisible: this.visible,
        selectLoading: false,
        selectActivityList: [],
        selectedActivities: [],
        selectTotal: 0,
        singleSelectedId: null,
        selectQueryParams: {
          pageNum: 1,
          pageSize: 10,
          activityCode: null,
          activityName: null,
          orgName: null,
          status: null,
          appored: null,
          onlyMain: true
        }
      }
    },
    watch: {
      visible(val) {
        this.dialogVisible = val
        if (val) this.$nextTick(() => this.init())
      },
      dialogVisible(val) {
        this.$emit('update:visible', val)
      }
    },
    methods: {
      init() {
        this.resetSelectQuery()
        this.selectedActivities = []
        this.singleSelectedId = null
        this.getSelectList()
      },
      setSelectedActivities(ids) {
        if (!ids || !ids.length) return
        selectActivityList({ activityIds: ids }).then(res => {
          if (this.selectMode === 'single') {
            this.singleSelectedId = res.rows[0]?.activityId
            this.selectedActivities = [res.rows[0]]
          } else {
            this.selectedActivities = res.rows
          }
        })
      },
      getSelectList() {
        this.selectLoading = true
        selectActivityList(this.selectQueryParams).then(res => {
          this.selectActivityList = res.rows
          this.selectTotal = res.total
          this.selectLoading = false
          if (this.selectMode === 'multiple') {
            this.$nextTick(() => {
              this.selectedActivities.forEach(row => {
                const target = this.selectActivityList.find(i => i.activityId === row.activityId)
                if (target) this.$refs.activityTable.toggleRowSelection(target, true)
              })
            })
          }
        })
      },
      handleSelectQuery() {
        this.selectQueryParams.pageNum = 1
        this.getSelectList()
      },
      resetSelectQuery() {
        this.$refs.selectQueryForm?.resetFields()
        this.selectQueryParams = {
          pageNum: 1,
          pageSize: 10,
          activityCode: null,
          activityName: null,
          orgName: null,
          status: null,
          appored: null,
          onlyMain: true
        }
        this.handleSelectQuery()
      },
      handleSelectChange(val) {
        this.selectedActivities = val
      },
      handleRadioChange(row) {
        this.selectedActivities = [row]
      },
      handleRowClick(row) {
        if (this.selectMode === 'single') {
          this.singleSelectedId = row.activityId
          this.selectedActivities = [row]
        } else {
          const tb = this.$refs.activityTable
          const selected = tb.selection.some(s => s.activityId === row.activityId)
          tb.toggleRowSelection(row, !selected)
        }
      },
      removeSelected(activity) {
        const idx = this.selectedActivities.findIndex(i => i.activityId === activity.activityId)
        if (idx > -1) {
          this.selectedActivities.splice(idx, 1)
          if (this.selectMode === 'multiple') {
            const target = this.selectActivityList.find(i => i.activityId === activity.activityId)
            if (target) this.$refs.activityTable.toggleRowSelection(target, false)
          } else {
            this.singleSelectedId = null
          }
        }
      },
      confirm() {
        if (!this.selectedActivities.length) {
          this.$modal.msgWarning('请至少选择一项活动')
          return
        }
        this.$emit('confirm', this.selectedActivities)
        this.dialogVisible = false
      },
      cancel() {
        this.dialogVisible = false
        this.$emit('cancel')
      },
      handleDialogClose() {
        this.selectedActivities = []
        this.singleSelectedId = null
        this.$emit('close')
      },
      formatDateTime(dt) {
        if (!dt) return ''
        const d = new Date(dt)
        if (isNaN(d)) return dt
        const pad = n => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
      }
    }
  }
  </script>
  
  <style scoped>
  /* 已选区域 */
  .selected-container{border:1px solid #ebeef5;border-radius:4px;padding:10px;background:#f8f9fa}
  .selected-title{font-weight:bold;margin-bottom:8px;color:#409EFF}
  .selected-items{max-height:100px;overflow-y:auto}
  
  /* 主/子活动标签 */
  .main-activity-tag{display:inline-block;padding:2px 8px;background:linear-gradient(135deg,#409EFF 0%,#012e9d 100%);color:#fff;border-radius:10px;font-size:12px;font-weight:bold}
  .sub-activity-tag{display:inline-block;padding:2px 8px;background:linear-gradient(135deg,#67C23A 0%,#1d9d01 100%);color:#fff;border-radius:10px;font-size:12px;font-weight:bold}
  .main-tag{color:#409EFF;font-weight:bold;margin-left:2px}
  
  /* 主/子活动名称 */
  .main-activity-name{font-weight:bold;color:#012e9d;position:relative;padding-left:18px}
  .main-activity-name::before{content:"★";position:absolute;left:0;top:50%;transform:translateY(-50%);color:#ff9900;font-size:14px}
  .sub-activity-name{color:#1d9d01;padding-left:30px;position:relative}
  .sub-activity-name::before{content:"▷";position:absolute;left:15px;color:#67C23A}
  
  /* 鼠标手型 */
  ::v-deep .el-table__row{cursor:pointer}
  </style>
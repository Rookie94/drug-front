<template>
    <div class="app-container">
      <!-- 查询表单 -->
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
        <el-form-item label="日志标题" prop="logTitle">
          <el-input
            v-model="queryParams.logTitle"
            placeholder="请输入日志标题"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="操作人员" prop="operName">
          <el-input
            v-model="queryParams.operName"
            placeholder="请输入操作人员"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="dateRange"
            size="small"
            style="width: 360px"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
  
      <!-- 操作按钮区域 -->
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
          >删除</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
  
      <!-- 日志表格 -->
      <el-table v-loading="loading" :data="logList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="日志主键" width="80" align="center" prop="logId" />
        <el-table-column label="日志标题" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <el-link type="primary" @click="handleTitleClick(scope.row)" :underline="false">
              {{ scope.row.logTitle }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="操作人员" align="center" prop="operName" />
        <el-table-column label="操作IP" align="center" prop="operIp" />
        <el-table-column label="操作地点" align="center" prop="operLocation" :show-overflow-tooltip="true" />
        <el-table-column label="操作时间" align="center" prop="operTime" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.operTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作状态" align="center" prop="status">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
              {{ scope.row.status === 0 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- 分页组件 -->
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
  
      <!-- 日志详情对话框 -->
      <el-dialog
        title="日志详情"
        :visible.sync="detailDialogVisible"
        width="60%"
        append-to-body
      >
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日志ID">{{ currentLog.logId }}</el-descriptions-item>
          <el-descriptions-item label="日志标题">{{ currentLog.logTitle }}</el-descriptions-item>
          <el-descriptions-item label="操作人员">{{ currentLog.operName }}</el-descriptions-item>
          <el-descriptions-item label="操作IP">{{ currentLog.operIp }}</el-descriptions-item>
          <el-descriptions-item label="操作地点">{{ currentLog.operLocation }}</el-descriptions-item>
          <el-descriptions-item label="操作状态">
            <el-tag :type="currentLog.status === 0 ? 'success' : 'danger'">
              {{ currentLog.status === 0 ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作时间" :span="2">
            {{ parseTime(currentLog.operTime, '{y}-{m}-{d} {h}:{i}:{s}') }}
          </el-descriptions-item>
          <el-descriptions-item label="日志详情" :span="2">
            <div class="log-detail-content">
              <pre>{{ currentLog.logDetail }}</pre>
            </div>
          </el-descriptions-item>
        </el-descriptions>
        <div slot="footer" class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { listCustomLog, getCustomLog, delCustomLog } from "@/api/system/customLog";
  
  export default {
    name: "SysCustomLog",
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非多个禁用
        multiple: true,
        // 显示搜索条件
        showSearch: true,
        // 总条数
        total: 0,
        // 日志表格数据
        logList: [],
        // 日期范围
        dateRange: [],
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          logTitle: undefined,
          operName: undefined,
          status: undefined,
          beginOperTime: undefined,
          endOperTime: undefined
        },
        // 详情对话框显示状态
        detailDialogVisible: false,
        // 当前查看的日志详情
        currentLog: {}
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询日志列表 */
      getList() {
        this.loading = true;
        // 处理日期范围参数
        if (this.dateRange && this.dateRange.length === 2) {
          this.queryParams.beginOperTime = this.dateRange[0];
          this.queryParams.endOperTime = this.dateRange[1];
        } else {
          this.queryParams.beginOperTime = null;
          this.queryParams.endOperTime = null;
        }
        
        listCustomLog(this.queryParams).then(response => {
          this.logList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.pageNum = 1;
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.dateRange = [];
        this.resetForm("queryForm");
        this.handleQuery();
      },
      /** 多选框选中数据 */
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.logId);
        this.multiple = !selection.length;
      },
      /** 点击标题查看详情 */
      handleTitleClick(row) {
        this.currentLog = row;
        this.detailDialogVisible = true;
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const logIds = row.logId ? [row.logId] : this.ids;
        this.$modal.confirm('是否确认删除日志编号为"' + logIds + '"的数据项？').then(function() {
          return delCustomLog(logIds);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => {});
      }
    }
  };
  </script>
  
  <style scoped>
  .el-link {
    font-weight: normal;
  }
  .el-link:hover {
    text-decoration: underline !important;
  }
  .log-detail-content {
    max-height: 400px;
    overflow-y: auto;
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
  }
  .log-detail-content pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: inherit;
  }
  </style>
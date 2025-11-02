<template>
    <div class="app-container">
      <!-- 查询 -->
      <el-form :model="queryParams" inline>
        <el-form-item label="问卷名称">
          <el-input v-model="queryParams.surveyName" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.surveyStatus" clearable>
            <el-option label="未发布" :value="0" />
            <el-option label="收集中" :value="1" />
            <el-option label="已结束" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
  
      <!-- 列表 -->
      <el-table v-loading="loading" :data="surveyList">
        <el-table-column prop="surveyId" label="问卷ID" width="80" />
        <el-table-column prop="surveyName" label="问卷名称" />
        <el-table-column prop="surveyStatus" label="状态" width="100">
          <template slot-scope="{row}">
            <dict-tag :options="dict.type.survey_status" :value="row.surveyStatus" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="120">
          <template slot-scope="{row}">
            <el-button type="text" icon="el-icon-s-data" @click="openStatistics(row)">统计</el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
  
      <!-- 统计弹窗 -->
      <el-dialog :title="dialogTitle" :visible.sync="dialogOpen" width="800px" append-to-body>
        <div v-for="q in statisticsData" :key="q.questionId" style="margin-bottom:24px">
          <h4>{{ q.questionName }}</h4>
          <el-table :data="q.options" stripe size="mini">
            <el-table-column prop="optionText" label="选项" />
            <el-table-column prop="num" label="人数" width="80" />
            <el-table-column label="比例" width="120">
              <template slot-scope="{row}">{{ row.ratio }}%</template>
            </el-table-column>
          </el-table>
        </div>
        <div slot="footer">
          <el-button @click="dialogOpen=false">关 闭</el-button>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { listSurvey, getStatistics } from '@/api/survey/report'
  
  export default {
    name: 'SurveyStatistics',
    dicts: ['survey_status'],
    data() {
      return {
        loading: false,
        surveyList: [],
        total: 0,
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          surveyName: null,
          surveyStatus: null
        },
        dialogOpen: false,
        dialogTitle: '',
        statisticsData: []
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.loading = true
        listSurvey(this.queryParams).then(res => {
          this.surveyList = res.rows
          this.total = res.total
          this.loading = false
        })
      },
      handleQuery() {
        this.queryParams.pageNum = 1
        this.getList()
      },
      resetQuery() {
        this.queryParams = {
          pageNum: 1,
          pageSize: 10,
          surveyName: null,
          surveyStatus: null
        }
        this.handleQuery()
      },
      openStatistics(row) {
        this.dialogTitle = '《' + row.surveyName + '》统计结果'
        getStatistics(row.surveyId).then(res => {
          this.statisticsData = res.data
          this.dialogOpen = true
        })
      }
    }
  }
  </script>
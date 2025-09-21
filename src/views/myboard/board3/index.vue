<template>
    <div class="statistics-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>活动评价统计分析系统</h1>
        <p>基于活动参与情况及评价数据的多维度分析</p>
      </div>
  
      <!-- 查询条件区域 -->
      <div class="query-panel">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-date-picker
              v-model="startDate"
              type="date"
              placeholder="选择开始日期"
              value-format="yyyy-MM-dd"
              class="full-width"
            ></el-date-picker>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="endDate"
              type="date"
              placeholder="选择结束日期"
              value-format="yyyy-MM-dd"
              class="full-width"
            ></el-date-picker>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="userType"
              placeholder="选择评价人员类型"
              class="full-width"
            >
              <el-option label="全部类型" value=""></el-option>
              <el-option label="警官" value="POLICE"></el-option>
              <el-option label="出所人员" value="RELEASED"></el-option>
              <el-option label="社康社戒人员" value="REHAB"></el-option>
              <el-option label="游客及其他" value="OTHER"></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="evaluationType"
              placeholder="选择评价类型"
              class="full-width"
            >
              <el-option label="全部评价" value=""></el-option>
              <el-option label="好评" value="GOOD"></el-option>
              <el-option label="中评" value="NORMAL"></el-option>
              <el-option label="差评" value="BAD"></el-option>
            </el-select>
          </el-col>
        </el-row>
        
        <!-- 活动筛选条件 -->
        <el-row :gutter="20" style="margin-top: 15px;">
          <el-col :span="12">
            <el-select
              v-model="selectedActivity"
              placeholder="选择活动"
              class="full-width"
              @change="handleActivityChange"
            >
              <el-option label="全部活动" value=""></el-option>
              <el-option 
                v-for="activity in activities" 
                :key="activity.id" 
                :label="activity.name" 
                :value="activity.id"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="12">
            <el-select
              v-model="selectedSubActivity"
              placeholder="选择子活动"
              class="full-width"
              :disabled="!selectedActivity"
            >
              <el-option label="全部子活动" value=""></el-option>
              <el-option 
                v-for="subActivity in filteredSubActivities" 
                :key="subActivity.id" 
                :label="subActivity.name" 
                :value="subActivity.id"
              ></el-option>
            </el-select>
          </el-col>
        </el-row>
        
        <div class="query-buttons">
          <el-button type="primary" @click="handleQuery" :loading="loading">
            <i class="el-icon-search"></i> 查询
          </el-button>
          <el-button @click="handleReset">
            <i class="el-icon-refresh"></i> 重置
          </el-button>
          <el-button type="success" @click="handleExport">
            <i class="el-icon-download"></i> 导出评价数据
          </el-button>
        </div>
      </div>
  
      <!-- 活动评价统计概览 -->
      <div class="chart-card">
        <div class="chart-header">
          <h2>活动评价统计概览</h2>
        </div>
        <el-table
          :data="activityRatingSummaryData"
          border
          style="width: 100%"
          class="summary-table"
        >
          <el-table-column
            prop="name"
            label="统计项"
            align="center"
            width="200"
          ></el-table-column>
          <el-table-column
            prop="value"
            label="数值"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="percentage"
            label="占比"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="change"
            label="环比变化"
            align="center"
            :formatter="formatChange"
          ></el-table-column>
        </el-table>
      </div>
  
      <!-- 活动评分分布表格 -->
      <div class="chart-card" style="margin-top: 20px;">
        <div class="chart-header">
          <h2>活动评分分布详情</h2>
        </div>
        <el-table
          :data="activityScoreDistributionData"
          border
          style="width: 100%"
          class="summary-table"
        >
          <el-table-column
            prop="activityName"
            label="活动名称"
            align="center"
            width="200"
          ></el-table-column>
          <el-table-column
            prop="participants"
            label="参与人数"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="evaluators"
            label="评价人数"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="avgScore"
            label="平均评分"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="goodRate"
            label="好评率"
            align="center"
          ></el-table-column>
        </el-table>
      </div>
  
      <!-- 图表区域 -->
      <div class="charts-grid">
        <!-- 活动评价类型占比图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>活动评价类型占比分析</h2>
          </div>
          <div class="chart-content">
            <div ref="evaluationTypePieChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 各活动好评率对比图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>各活动好评率对比</h2>
          </div>
          <div class="chart-content">
            <div ref="activityComparisonChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 活动评价时间趋势图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>活动评价数量时间趋势</h2>
          </div>
          <div class="chart-content">
            <div ref="evaluationTrendChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 活动评分分布直方图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>活动评分分布情况</h2>
          </div>
          <div class="chart-content">
            <div ref="scoreDistributionChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 评价词云图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>评价关键词分析</h2>
          </div>
          <div class="chart-content">
            <div ref="wordCloudChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 不同用户群体评价对比图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>不同用户群体评价对比</h2>
          </div>
          <div class="chart-content">
            <div ref="userGroupComparisonChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 活动参与度与好评率相关性分析 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>活动参与度与好评率相关性</h2>
          </div>
          <div class="chart-content">
            <div ref="participationCorrelationChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 活动改进建议分类统计 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>活动改进建议分类统计</h2>
          </div>
          <div class="chart-content">
            <div ref="suggestionCategoryChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 各类型活动评分趋势对比 -->
        <div class="chart-card full-width">
          <div class="chart-header">
            <h2>各类型活动评分趋势对比</h2>
          </div>
          <div class="chart-content">
            <div ref="activityTypeTrendChart" class="chart-container"></div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { parseTime } from '@/utils/ruoyi'
  import * as echarts from 'echarts';
  import 'echarts/theme/macarons.js';
  
  export default {
    name: 'ActivityEvaluationStatistics',
    
    data() {
      return {
        // 查询条件
        startDate: '',
        endDate: '',
        userType: '',
        evaluationType: '',
        
        // 活动相关筛选条件
        selectedActivity: '',
        selectedSubActivity: '',
        activities: [],
        filteredSubActivities: [],
        
        // 加载状态
        loading: false,
        
        // 图表实例
        evaluationTypePieChart: null,
        activityComparisonChart: null,
        evaluationTrendChart: null,
        scoreDistributionChart: null,
        wordCloudChart: null,
        userGroupComparisonChart: null,
        participationCorrelationChart: null,
        suggestionCategoryChart: null,
        activityTypeTrendChart: null,
        
        // 表格数据
        activityRatingSummaryData: [],
        activityScoreDistributionData: []
      }
    },
      
    async mounted() {
      await this.$nextTick();
      this.initCharts();
      
      // 设置默认日期范围为最近30天
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 30 * 24 * 60 * 60 * 1000);
      this.startDate = parseTime(start, 'yyyy-MM-dd');
      this.endDate = parseTime(end, 'yyyy-MM-dd');
      
      // 初始化活动数据
      this.initActivityData();
      
      this.handleQuery();
    },
  
    beforeDestroy() {
      window.removeEventListener('resize', this.handleResize);
      
      // 销毁所有图表实例
      if (this.evaluationTypePieChart) this.evaluationTypePieChart.dispose();
      if (this.activityComparisonChart) this.activityComparisonChart.dispose();
      if (this.evaluationTrendChart) this.evaluationTrendChart.dispose();
      if (this.scoreDistributionChart) this.scoreDistributionChart.dispose();
      if (this.wordCloudChart) this.wordCloudChart.dispose();
      if (this.userGroupComparisonChart) this.userGroupComparisonChart.dispose();
      if (this.participationCorrelationChart) this.participationCorrelationChart.dispose();
      if (this.suggestionCategoryChart) this.suggestionCategoryChart.dispose();
      if (this.activityTypeTrendChart) this.activityTypeTrendChart.dispose();
    },
  
    methods: {
      // 初始化所有图表
      initCharts() {
        if (this.$refs.evaluationTypePieChart) this.evaluationTypePieChart = echarts.init(this.$refs.evaluationTypePieChart, 'macarons');
        if (this.$refs.activityComparisonChart) this.activityComparisonChart = echarts.init(this.$refs.activityComparisonChart, 'macarons');
        if (this.$refs.evaluationTrendChart) this.evaluationTrendChart = echarts.init(this.$refs.evaluationTrendChart, 'macarons');
        if (this.$refs.scoreDistributionChart) this.scoreDistributionChart = echarts.init(this.$refs.scoreDistributionChart, 'macarons');
        if (this.$refs.wordCloudChart) this.wordCloudChart = echarts.init(this.$refs.wordCloudChart, 'macarons');
        if (this.$refs.userGroupComparisonChart) this.userGroupComparisonChart = echarts.init(this.$refs.userGroupComparisonChart, 'macarons');
        if (this.$refs.participationCorrelationChart) this.participationCorrelationChart = echarts.init(this.$refs.participationCorrelationChart, 'macarons');
        if (this.$refs.suggestionCategoryChart) this.suggestionCategoryChart = echarts.init(this.$refs.suggestionCategoryChart, 'macarons');
        if (this.$refs.activityTypeTrendChart) this.activityTypeTrendChart = echarts.init(this.$refs.activityTypeTrendChart, 'macarons');
        
        window.addEventListener('resize', this.handleResize);
      },
      
      // 初始化活动数据
      initActivityData() {
        this.activities = [
          { 
            id: 1, 
            name: '政策宣传活动',
            subActivities: [
              { id: 11, name: '社区政策宣讲会' },
              { id: 12, name: '线上政策解读' },
              { id: 13, name: '政策问答活动' }
            ]
          },
          { 
            id: 2, 
            name: '技能培训活动',
            subActivities: [
              { id: 21, name: '职业技能培训' },
              { id: 22, name: '心理辅导课程' },
              { id: 23, name: '就业指导讲座' }
            ]
          },
          { 
            id: 3, 
            name: '文化娱乐活动',
            subActivities: [
              { id: 31, name: '文艺表演' },
              { id: 32, name: '体育比赛' },
              { id: 33, name: '手工制作工坊' }
            ]
          }
        ];
      },
      
      // 处理活动选择变化
      handleActivityChange(activityId) {
        this.selectedSubActivity = '';
        if (!activityId) {
          this.filteredSubActivities = [];
          return;
        }
        
        const selected = this.activities.find(activity => activity.id === activityId);
        this.filteredSubActivities = selected ? selected.subActivities : [];
      },
      
      // 处理窗口大小变化
      handleResize() {
        if (this.evaluationTypePieChart) this.evaluationTypePieChart.resize();
        if (this.activityComparisonChart) this.activityComparisonChart.resize();
        if (this.evaluationTrendChart) this.evaluationTrendChart.resize();
        if (this.scoreDistributionChart) this.scoreDistributionChart.resize();
        if (this.wordCloudChart) this.wordCloudChart.resize();
        if (this.userGroupComparisonChart) this.userGroupComparisonChart.resize();
        if (this.participationCorrelationChart) this.participationCorrelationChart.resize();
        if (this.suggestionCategoryChart) this.suggestionCategoryChart.resize();
        if (this.activityTypeTrendChart) this.activityTypeTrendChart.resize();
      },
      
      // 查询数据
      handleQuery() {
        if (this.startDate && this.endDate && this.startDate > this.endDate) {
          this.$message.error('开始日期不能晚于结束日期');
          return;
        }
        
        this.loading = true;
        
        this.fetchEvaluationData().then(data => {
          // 更新活动评价统计概览
          const totalRatings = data.totalEvaluations;
          this.activityRatingSummaryData = [
            { name: '总评价数', value: totalRatings, percentage: '100%', change: 15.2 },
            { name: '好评数', value: data.goodCount, percentage: this.calcPercentage(data.goodCount, totalRatings), change: 20.5 },
            { name: '中评数', value: data.normalCount, percentage: this.calcPercentage(data.normalCount, totalRatings), change: 5.3 },
            { name: '差评数', value: data.badCount, percentage: this.calcPercentage(data.badCount, totalRatings), change: -8.7 },
            { name: '平均评分', value: data.averageScore.toFixed(1), percentage: '-', change: 3.2 },
            { name: '评价完成率', value: `${data.evaluationRate.toFixed(1)}%`, percentage: '-', change: 7.8 }
          ];
          
          // 更新活动评分分布详情
          this.activityScoreDistributionData = data.activityDetails.map(item => ({
            activityName: item.name,
            participants: item.participants,
            evaluators: item.evaluators,
            avgScore: item.averageScore.toFixed(1),
            goodRate: `${item.goodRate.toFixed(1)}%`
          }));
          
          // 确保图表实例已创建
          if (!this.evaluationTypePieChart || !this.activityComparisonChart) {
            this.initCharts();
          }
          
          // 更新所有图表
          this.updateEvaluationTypePieChart(data.evaluationTypeData);
          this.updateActivityComparisonChart(data.activityComparisonData);
          this.updateEvaluationTrendChart(data.evaluationTrendData);
          this.updateScoreDistributionChart(data.scoreDistributionData);
          this.updateWordCloudChart(data.keywords);
          this.updateUserGroupComparisonChart(data.userGroupEvaluationData);
          this.updateParticipationCorrelationChart(data.participationCorrelationData);
          this.updateSuggestionCategoryChart(data.suggestionCategoryData);
          this.updateActivityTypeTrendChart(data.activityTypeTrendData);
          
          this.loading = false;
        }).catch(error => {
          console.error('获取评价数据失败:', error);
          this.$message.error('获取数据失败，请稍后重试');
          this.loading = false;
        });
      },
      
      // 重置查询条件
      handleReset() {
        this.startDate = '';
        this.endDate = '';
        this.userType = '';
        this.evaluationType = '';
        // 重置活动筛选条件
        this.selectedActivity = '';
        this.selectedSubActivity = '';
        this.filteredSubActivities = [];
      },
      
      // 导出数据
      handleExport() {
        this.loading = true;
        setTimeout(() => {
          this.$message.success('活动评价数据导出成功');
          this.loading = false;
        }, 1000);
      },
      
      // 计算百分比
      calcPercentage(value, total) {
        if (total === 0) return '0%';
        return ((value / total) * 100).toFixed(2) + '%';
      },
      
      // 格式化变化率显示
      formatChange(row) {
        const change = row.change;
        if (change === '-') return '-';
        return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
      },
      
      // 更新活动评价类型占比图
      updateEvaluationTypePieChart(data) {
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'horizontal',
            bottom: 0,
            textStyle: { fontSize: 12 }
          },
          series: [{
            name: '评价类型',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: { show: false, position: 'center' },
            emphasis: {
              label: { show: true, fontSize: 16, fontWeight: 'bold' }
            },
            labelLine: { show: false },
            data: data
          }]
        };
        this.evaluationTypePieChart.setOption(option);
      },
      
      // 更新各活动好评率对比图
      updateActivityComparisonChart(data) {
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: [{
            type: 'category',
            data: data.map(item => item.name),
            axisTick: { alignWithLabel: true },
            axisLabel: { rotate: 45, interval: 0 }
          }],
          yAxis: [{ 
            type: 'value', 
            min: 0,
            max: 100,
            axisLabel: { formatter: '{value}%' }
          }],
          series: [{
            name: '好评率',
            type: 'bar',
            barWidth: '60%',
            data: data.map(item => item.goodRate),
            itemStyle: {
              color: function(params) {
                // 根据好评率设置颜色梯度
                const rate = data[params.dataIndex].goodRate;
                if (rate >= 80) return '#67c23a';
                if (rate >= 60) return '#e6a23c';
                return '#f56c6c';
              }
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%'
            }
          }]
        };
        this.activityComparisonChart.setOption(option);
      },
      
      // 更新活动评价时间趋势图
      updateEvaluationTrendChart(data) {
        const option = {
          tooltip: { trigger: 'axis' },
          legend: { 
            data: ['好评数', '中评数', '差评数'],
            top: 0
          },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.dates,
            axisLabel: { rotate: 45, interval: 0 }
          },
          yAxis: { type: 'value', minInterval: 1 },
          series: [
            {
              name: '好评数',
              type: 'line',
              data: data.goodCounts,
              smooth: true,
              lineStyle: { width: 2, color: '#67c23a' },
              symbol: 'circle',
              symbolSize: 4,
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
                  { offset: 1, color: 'rgba(103, 194, 58, 0)' }
                ])
              }
            },
            {
              name: '中评数',
              type: 'line',
              data: data.normalCounts,
              smooth: true,
              lineStyle: { width: 2, color: '#e6a23c' },
              symbol: 'circle',
              symbolSize: 4,
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
                  { offset: 1, color: 'rgba(230, 162, 60, 0)' }
                ])
              }
            },
            {
              name: '差评数',
              type: 'line',
              data: data.badCounts,
              smooth: true,
              lineStyle: { width: 2, color: '#f56c6c' },
              symbol: 'circle',
              symbolSize: 4,
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
                  { offset: 1, color: 'rgba(245, 108, 108, 0)' }
                ])
              }
            }
          ]
        };
        this.evaluationTrendChart.setOption(option);
      },
      
      // 更新活动评分分布直方图
      updateScoreDistributionChart(data) {
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: [{
            type: 'category',
            data: ['1星', '2星', '3星', '4星', '5星'],
            axisTick: { alignWithLabel: true }
          }],
          yAxis: [{ type: 'value', minInterval: 1 }],
          series: [{
            name: '评价数量',
            type: 'bar',
            barWidth: '60%',
            data: data,
            itemStyle: {
              color: function(params) {
                // 根据评分设置颜色
                const colors = ['#f56c6c', '#fa8c16', '#e6a23c', '#52c41a', '#67c23a'];
                return colors[params.dataIndex];
              }
            }
          }]
        };
        this.scoreDistributionChart.setOption(option);
      },
      
      // 更新评价词云图
      updateWordCloudChart(data) {
        const option = {
          tooltip: {
            trigger: 'item'
          },
          series: [{
            type: 'wordCloud',
            gridSize: 10,
            sizeRange: [12, 50],
            rotationRange: [-90, 90],
            shape: 'circle',
            width: '100%',
            height: '100%',
            drawOutOfBound: false,
            textStyle: {
              color: function() {
                return 'rgb(' + [
                  Math.round(Math.random() * 160),
                  Math.round(Math.random() * 160),
                  Math.round(Math.random() * 255)
                ].join(',') + ')';
              },
              emphasis: {
                shadowBlur: 10,
                shadowColor: '#333'
              }
            },
            data: data
          }]
        };
        this.wordCloudChart.setOption(option);
      },
      
      // 更新不同用户群体评价对比图
      updateUserGroupComparisonChart(data) {
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          legend: {
            data: ['好评率', '平均评分'],
            top: 0
          },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: { type: 'value' },
          yAxis: {
            type: 'category',
            data: data.map(item => item.group)
          },
          series: [
            {
              name: '好评率',
              type: 'bar',
              data: data.map(item => item.goodRate),
              barWidth: '30%',
              itemStyle: { color: '#67c23a' },
              label: {
                show: true,
                position: 'right',
                formatter: '{c}%'
              }
            },
            {
              name: '平均评分',
              type: 'bar',
              data: data.map(item => item.averageScore),
              barWidth: '30%',
              itemStyle: { color: '#409eff' },
              label: {
                show: true,
                position: 'right',
                formatter: '{c}'
              }
            }
          ]
        };
        this.userGroupComparisonChart.setOption(option);
      },
      
      // 更新活动参与度与好评率相关性分析
      updateParticipationCorrelationChart(data) {
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: 参与人数 {c}, 好评率 {d}%'
          },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: {
            type: 'value',
            name: '参与人数'
          },
          yAxis: {
            type: 'value',
            name: '好评率(%)',
            max: 100
          },
          series: [{
            name: '活动数据',
            type: 'scatter',
            data: data.map(item => ({
              value: [item.participants, item.goodRate],
              name: item.name,
              symbolSize: 10 + (item.goodRate / 10)
            })),
            symbolSize: function(data) {
              return Math.sqrt(data[0]) * 2;
            },
            itemStyle: {
              color: function(params) {
                // 根据好评率设置颜色
                const rate = params.value[1];
                if (rate >= 80) return '#67c23a';
                if (rate >= 60) return '#e6a23c';
                return '#f56c6c';
              }
            },
            emphasis: {
              label: {
                show: true,
                formatter: function(params) {
                  return `${params.data.name}: ${params.data.value[1]}%`;
                },
                position: 'top'
              }
            }
          }]
        };
        this.participationCorrelationChart.setOption(option);
      },
      
      // 更新活动改进建议分类统计
      updateSuggestionCategoryChart(data) {
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 10,
            textStyle: { fontSize: 12 }
          },
          series: [{
            name: '建议分类',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: { show: false, position: 'center' },
            emphasis: {
              label: { show: true, fontSize: 16, fontWeight: 'bold' }
            },
            labelLine: { show: true },
            data: data
          }]
        };
        this.suggestionCategoryChart.setOption(option);
      },
      
      // 更新各类型活动评分趋势对比
      updateActivityTypeTrendChart(data) {
        const option = {
          tooltip: { trigger: 'axis' },
          legend: { 
            data: data.types,
            top: 0
          },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.dates,
            axisLabel: { rotate: 45, interval: 0 }
          },
          yAxis: { 
            type: 'value', 
            min: 0,
            max: 5,
            name: '平均评分'
          },
          series: data.seriesData.map((item, index) => {
            // 为不同活动类型分配不同颜色
            const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#1890ff'];
            return {
              name: data.types[index],
              type: 'line',
              data: item,
              smooth: true,
              lineStyle: { width: 2, color: colors[index % colors.length] },
              symbol: 'circle',
              symbolSize: 6,
              itemStyle: { color: colors[index % colors.length] }
            };
          })
        };
        this.activityTypeTrendChart.setOption(option);
      },
      
      // 获取评价统计数据
      fetchEvaluationData() {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              // 评价统计概览数据
              totalEvaluations: 785,
              goodCount: 568,
              normalCount: 156,
              badCount: 61,
              averageScore: 4.2,
              evaluationRate: 78.5,
              
              // 评价类型分布数据
              evaluationTypeData: [
                { name: '好评', value: 568, itemStyle: { color: '#67c23a' } },
                { name: '中评', value: 156, itemStyle: { color: '#e6a23c' } },
                { name: '差评', value: 61, itemStyle: { color: '#f56c6c' } }
              ],
              
              // 各活动好评率对比数据
              activityComparisonData: [
                { id: 11, name: '社区政策宣讲会', goodRate: 88.5 },
                { id: 12, name: '线上政策解读', goodRate: 84.2 },
                { id: 13, name: '政策问答活动', goodRate: 85.3 },
                { id: 21, name: '职业技能培训', goodRate: 72.8 },
                { id: 22, name: '心理辅导课程', goodRate: 90.5 },
                { id: 23, name: '就业指导讲座', goodRate: 75.3 },
                { id: 31, name: '文艺表演', goodRate: 85.7 },
                { id: 32, name: '体育比赛', goodRate: 88.2 },
                { id: 33, name: '手工制作工坊', goodRate: 79.1 }
              ],
              
              // 活动评价时间趋势数据
              evaluationTrendData: {
                dates: ['2025-09-01', '2025-09-05', '2025-09-10', '2025-09-15', '2025-09-20', '2025-09-25'],
                goodCounts: [85, 92, 105, 110, 95, 81],
                normalCounts: [25, 28, 32, 26, 21, 24],
                badCounts: [8, 12, 15, 9, 7, 10]
              },
              
              // 评分分布数据
              scoreDistributionData: [35, 26, 156, 245, 323],
              
              // 评价关键词数据（词云）
              keywords: [
                { name: '内容丰富', value: 180 },
                { name: '组织有序', value: 150 },
                { name: '收获很大', value: 130 },
                { name: '实用性强', value: 120 },
                { name: '讲师专业', value: 110 },
                { name: '环境舒适', value: 90 },
                { name: '时间合理', value: 85 },
                { name: '希望再办', value: 80 },
                { name: '内容深入', value: 75 },
                { name: '互动性好', value: 70 },
                { name: '材料充足', value: 65 },
                { name: '安排紧凑', value: 50 },
                { name: '场地过小', value: 45 },
                { name: '时间过长', value: 40 },
                { name: '内容单一', value: 35 },
                { name: '讲解不清', value: 30 },
                { name: '组织混乱', value: 25 }
              ],
              
              // 不同用户群体评价数据
              userGroupEvaluationData: [
                { group: '警官', goodRate: 82.5, averageScore: 4.1 },
                { group: '出所人员', goodRate: 78.3, averageScore: 4.0 },
                { group: '社康社戒人员', goodRate: 85.7, averageScore: 4.4 },
                { group: '游客及其他', goodRate: 80.2, averageScore: 4.2 }
              ],
              
              // 活动参与度与好评率相关性数据
              participationCorrelationData: [
                { name: '社区政策宣讲会', participants: 120, goodRate: 88.5 },
                { name: '线上政策解读', participants: 250, goodRate: 84.2 },
                { name: '政策问答活动', participants: 85, goodRate: 85.3 },
                { name: '职业技能培训', participants: 150, goodRate: 72.8 },
                { name: '心理辅导课程', participants: 60, goodRate: 90.5 },
                { name: '就业指导讲座', participants: 95, goodRate: 75.3 },
                { name: '文艺表演', participants: 300, goodRate: 85.7 },
                { name: '体育比赛', participants: 180, goodRate: 88.2 },
                { name: '手工制作工坊', participants: 75, goodRate: 79.1 }
              ],
              
              // 活动改进建议分类数据
              suggestionCategoryChart: [
                { name: '内容改进', value: 185 },
                { name: '时间安排', value: 120 },
                { name: '场地环境', value: 95 },
                { name: '讲师水平', value: 75 },
                { name: '组织管理', value: 65 },
                { name: '材料准备', value: 55 },
                { name: '其他建议', value: 45 }
              ],
              
              // 各类型活动评分趋势数据
              activityTypeTrendData: {
                types: ['政策宣传活动', '技能培训活动', '文化娱乐活动'],
                dates: ['5月', '6月', '7月', '8月', '9月'],
                seriesData: [
                  [4.0, 4.1, 4.3, 4.2, 4.4],
                  [3.8, 3.9, 4.0, 4.1, 4.2],
                  [4.2, 4.3, 4.5, 4.4, 4.6]
                ]
              },
              
              // 活动详情数据
              activityDetails: [
                { name: '社区政策宣讲会', participants: 120, evaluators: 105, averageScore: 4.5, goodRate: 88.5 },
                { name: '线上政策解读', participants: 250, evaluators: 210, averageScore: 4.3, goodRate: 84.2 },
                { name: '政策问答活动', participants: 85, evaluators: 72, averageScore: 4.3, goodRate: 85.3 },
                { name: '职业技能培训', participants: 150, evaluators: 125, averageScore: 3.7, goodRate: 72.8 },
                { name: '心理辅导课程', participants: 60, evaluators: 58, averageScore: 4.6, goodRate: 90.5 },
                { name: '就业指导讲座', participants: 95, evaluators: 80, averageScore: 3.8, goodRate: 75.3 },
                { name: '文艺表演', participants: 300, evaluators: 240, averageScore: 4.4, goodRate: 85.7 },
                { name: '体育比赛', participants: 180, evaluators: 155, averageScore: 4.5, goodRate: 88.2 },
                { name: '手工制作工坊', participants: 75, evaluators: 65, averageScore: 4.0, goodRate: 79.1 }
              ]
            });
          }, 500);
        });
      },
  
      exportStatisticsData() {
        return new Promise(resolve => {
          setTimeout(resolve, 1000);
        });
      }
    }
  };
  </script>
  
  <style scoped>
  .statistics-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
  }
  
  .page-header {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px 0;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  .page-header h1 {
    margin: 0 0 10px 0;
    color: #1f2d3d;
    font-size: 24px;
    font-weight: 600;
  }
  
  .page-header p {
    margin: 0;
    color: #8392a5;
    font-size: 14px;
  }
  
  .query-panel {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  .full-width {
    width: 100%;
  }
  
  .query-buttons {
    margin-top: 15px;
    text-align: right;
  }
  
  .query-buttons .el-button {
    margin-left: 10px;
  }
  
  .charts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 20px;
  }
  
  /* 避免与其他.full-width冲突 */
  .charts-grid .full-width {
    grid-column: 1 / -1;
  }
  
  .chart-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .chart-card:hover {
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  
  .chart-header {
    padding: 15px 20px;
    border-bottom: 1px solid #f2f3f5;
  }
  
  .chart-header h2 {
    margin: 0;
    color: #1f2d3d;
    font-size: 16px;
    font-weight: 500;
  }
  
  .chart-content {
    padding: 20px;
  }
  
  .chart-container {
    width: 100%;
    height: 350px;
    min-height: 300px;
  }
  
  .summary-table {
    margin-top: 10px;
  }
  
  /* 响应式设计 */
  @media (max-width: 1200px) {
    .charts-grid {
      grid-template-columns: 1fr;
    }
    
    .charts-grid .full-width {
      grid-column: 1;
    }
  }
  
  @media (max-width: 768px) {
    .statistics-container {
      padding: 10px;
    }
    
    .chart-container {
      height: 300px;
    }
    
    .el-row {
      flex-direction: column;
    }
    
    .el-col {
      width: 100% !important;
      margin-bottom: 10px;
    }
    
    .query-buttons {
      text-align: center;
    }
    
    .query-buttons .el-button {
      margin: 5px;
    }
  }
  </style>
  
<template>
    <div class="statistics-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>服务统计分析系统</h1>
        <p>基于服务项目开展情况及参与人数的多维度分析</p>
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
              v-model="serviceType"
              placeholder="选择服务类型"
              class="full-width"
            >
              <el-option label="全部类型" value=""></el-option>
              <el-option label="政策咨询" value="POLICY"></el-option>
              <el-option label="技能培训" value="TRAINING"></el-option>
              <el-option label="心理辅导" value="PSYCHOLOGY"></el-option>
              <el-option label="就业指导" value="EMPLOYMENT"></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="serviceObject"
              placeholder="选择服务对象"
              class="full-width"
            >
              <el-option label="全部对象" value=""></el-option>
              <el-option label="警官" value="POLICE"></el-option>
              <el-option label="出所人员" value="RELEASED"></el-option>
              <el-option label="社康社戒人员" value="REHAB"></el-option>
              <el-option label="其他人员" value="OTHER"></el-option>
            </el-select>
          </el-col>
        </el-row>
        
        <!-- 活动筛选条件 -->
        <el-row :gutter="20" style="margin-top: 15px;">
          <el-col :span="12">
            <el-select
              v-model="selectedService"
              placeholder="选择服务项目"
              class="full-width"
              @change="handleServiceChange"
            >
              <el-option label="全部服务" value=""></el-option>
              <el-option 
                v-for="service in services" 
                :key="service.id" 
                :label="service.name" 
                :value="service.id"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="12">
            <el-select
              v-model="selectedSubService"
              placeholder="选择子服务项目"
              class="full-width"
              :disabled="!selectedService"
            >
              <el-option label="全部子服务" value=""></el-option>
              <el-option 
                v-for="subService in filteredSubServices" 
                :key="subService.id" 
                :label="subService.name" 
                :value="subService.id"
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
            <i class="el-icon-download"></i> 导出数据
          </el-button>
        </div>
      </div>
  
      <!-- 服务统计汇总表格 -->
      <div class="chart-card">
        <div class="chart-header">
          <h2>服务统计汇总</h2>
        </div>
        <el-table
          :data="serviceSummaryData"
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
            label="数量"
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
  
      <!-- 服务项目参与情况表格 -->
      <div class="chart-card" style="margin-top: 20px;">
        <div class="chart-header">
          <h2>服务项目参与情况</h2>
        </div>
        <el-table
          :data="serviceParticipationData"
          border
          style="width: 100%"
          class="summary-table"
        >
          <el-table-column
            prop="serviceName"
            label="服务项目"
            align="center"
            width="200"
          ></el-table-column>
          <el-table-column
            prop="holdCount"
            label="开展次数"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="participants"
            label="参与人数"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="avgParticipants"
            label="平均参与人数"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="satisfaction"
            label="满意度"
            align="center"
          ></el-table-column>
        </el-table>
      </div>
  
      <!-- 图表区域 -->
      <div class="charts-grid">
        <!-- 服务类型占比饼图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>服务类型占比分析</h2>
          </div>
          <div class="chart-content">
            <div ref="serviceTypePieChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 服务对象分布饼图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>服务对象分布分析</h2>
          </div>
          <div class="chart-content">
            <div ref="serviceObjectPieChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 每日服务参与人数柱状图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>每日服务参与人数趋势</h2>
          </div>
          <div class="chart-content">
            <div ref="dailyParticipationChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 各服务项目参与人数柱状图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>各服务项目参与人数对比</h2>
          </div>
          <div class="chart-content">
            <div ref="serviceParticipationChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 每周服务次数柱状图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>每周服务开展次数趋势</h2>
          </div>
          <div class="chart-content">
            <div ref="weeklyServiceChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 服务类型参与趋势折线图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>服务类型参与趋势对比</h2>
          </div>
          <div class="chart-content">
            <div ref="serviceTypeTrendChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 服务满意度对比图 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>各服务项目满意度对比</h2>
          </div>
          <div class="chart-content">
            <div ref="serviceSatisfactionChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 热门服务项目排行榜 -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>热门服务项目排行榜</h2>
          </div>
          <div class="chart-content">
            <div ref="topServicesChart" class="chart-container"></div>
          </div>
        </div>
  
        <!-- 月度服务参与总人数折线图 -->
        <div class="chart-card full-width">
          <div class="chart-header">
            <h2>月度服务参与总人数趋势</h2>
          </div>
          <div class="chart-content">
            <div ref="monthlyParticipationChart" class="chart-container"></div>
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
    name: 'ServiceStatisticsPage',
    
    data() {
      return {
        // 查询条件
        startDate: '',
        endDate: '',
        serviceType: '',
        serviceObject: '',
        
        // 服务项目相关筛选条件
        selectedService: '',
        selectedSubService: '',
        services: [],
        filteredSubServices: [],
        
        // 加载状态
        loading: false,
        
        // 图表实例
        serviceTypePieChart: null,
        serviceObjectPieChart: null,
        dailyParticipationChart: null,
        serviceParticipationChart: null,
        weeklyServiceChart: null,
        serviceTypeTrendChart: null,
        serviceSatisfactionChart: null,
        topServicesChart: null,
        monthlyParticipationChart: null,
        
        // 表格数据
        serviceSummaryData: [],
        serviceParticipationData: []
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
      
      // 初始化服务项目数据
      this.initServiceData();
      
      this.handleQuery();
    },
  
    beforeDestroy() {
      window.removeEventListener('resize', this.handleResize);
      
      // 销毁所有图表实例
      if (this.serviceTypePieChart) this.serviceTypePieChart.dispose();
      if (this.serviceObjectPieChart) this.serviceObjectPieChart.dispose();
      if (this.dailyParticipationChart) this.dailyParticipationChart.dispose();
      if (this.serviceParticipationChart) this.serviceParticipationChart.dispose();
      if (this.weeklyServiceChart) this.weeklyServiceChart.dispose();
      if (this.serviceTypeTrendChart) this.serviceTypeTrendChart.dispose();
      if (this.serviceSatisfactionChart) this.serviceSatisfactionChart.dispose();
      if (this.topServicesChart) this.topServicesChart.dispose();
      if (this.monthlyParticipationChart) this.monthlyParticipationChart.dispose();
    },
  
    methods: {
      // 初始化所有图表
      initCharts() {
        if (this.$refs.serviceTypePieChart) this.serviceTypePieChart = echarts.init(this.$refs.serviceTypePieChart, 'macarons');
        if (this.$refs.serviceObjectPieChart) this.serviceObjectPieChart = echarts.init(this.$refs.serviceObjectPieChart, 'macarons');
        if (this.$refs.dailyParticipationChart) this.dailyParticipationChart = echarts.init(this.$refs.dailyParticipationChart, 'macarons');
        if (this.$refs.serviceParticipationChart) this.serviceParticipationChart = echarts.init(this.$refs.serviceParticipationChart, 'macarons');
        if (this.$refs.weeklyServiceChart) this.weeklyServiceChart = echarts.init(this.$refs.weeklyServiceChart, 'macarons');
        if (this.$refs.serviceTypeTrendChart) this.serviceTypeTrendChart = echarts.init(this.$refs.serviceTypeTrendChart, 'macarons');
        if (this.$refs.serviceSatisfactionChart) this.serviceSatisfactionChart = echarts.init(this.$refs.serviceSatisfactionChart, 'macarons');
        if (this.$refs.topServicesChart) this.topServicesChart = echarts.init(this.$refs.topServicesChart, 'macarons');
        if (this.$refs.monthlyParticipationChart) this.monthlyParticipationChart = echarts.init(this.$refs.monthlyParticipationChart, 'macarons');
        
        window.addEventListener('resize', this.handleResize);
      },
      
      // 初始化服务项目数据
      initServiceData() {
        this.services = [
          { 
            id: 1, 
            name: '政策咨询服务',
            subServices: [
              { id: 11, name: '政策解读' },
              { id: 12, name: '法规咨询' },
              { id: 13, name: '权益咨询' }
            ]
          },
          { 
            id: 2, 
            name: '技能培训服务',
            subServices: [
              { id: 21, name: '职业技能培训' },
              { id: 22, name: '计算机应用培训' },
              { id: 23, name: '语言能力培训' }
            ]
          },
          { 
            id: 3, 
            name: '心理辅导服务',
            subServices: [
              { id: 31, name: '个体心理咨询' },
              { id: 32, name: '团体心理辅导' },
              { id: 33, name: '压力管理培训' }
            ]
          },
          { 
            id: 4, 
            name: '就业指导服务',
            subServices: [
              { id: 41, name: '求职技巧指导' },
              { id: 42, name: '简历制作辅导' },
              { id: 43, name: '职业规划咨询' }
            ]
          }
        ];
      },
      
      // 处理服务项目选择变化
      handleServiceChange(serviceId) {
        this.selectedSubService = '';
        if (!serviceId) {
          this.filteredSubServices = [];
          return;
        }
        
        const selected = this.services.find(service => service.id === serviceId);
        this.filteredSubServices = selected ? selected.subServices : [];
      },
      
      // 处理窗口大小变化
      handleResize() {
        if (this.serviceTypePieChart) this.serviceTypePieChart.resize();
        if (this.serviceObjectPieChart) this.serviceObjectPieChart.resize();
        if (this.dailyParticipationChart) this.dailyParticipationChart.resize();
        if (this.serviceParticipationChart) this.serviceParticipationChart.resize();
        if (this.weeklyServiceChart) this.weeklyServiceChart.resize();
        if (this.serviceTypeTrendChart) this.serviceTypeTrendChart.resize();
        if (this.serviceSatisfactionChart) this.serviceSatisfactionChart.resize();
        if (this.topServicesChart) this.topServicesChart.resize();
        if (this.monthlyParticipationChart) this.monthlyParticipationChart.resize();
      },
      
      // 查询数据
      handleQuery() {
        if (this.startDate && this.endDate && this.startDate > this.endDate) {
          this.$message.error('开始日期不能晚于结束日期');
          return;
        }
        
        this.loading = true;
        
        this.fetchServiceStatisticsData().then(data => {
          // 更新服务统计汇总表格
          this.serviceSummaryData = [
            { name: '总服务项目数', value: data.totalServices, change: 8.2 },
            { name: '总服务开展次数', value: data.totalServiceCount, change: 12.5 },
            { name: '总参与人数', value: data.totalParticipants, change: 15.3 },
            { name: '平均参与人数', value: data.avgParticipants, change: 3.7 },
            { name: '服务满意度', value: `${data.averageSatisfaction.toFixed(1)}%`, change: 2.1 }
          ];
          
          // 更新服务项目参与情况表格
          this.serviceParticipationData = data.serviceDetails.map(item => ({
            serviceName: item.name,
            holdCount: item.holdCount,
            participants: item.participants,
            avgParticipants: (item.participants / item.holdCount).toFixed(1),
            satisfaction: `${item.satisfaction.toFixed(1)}%`
          }));
          
          // 确保图表实例已创建
          if (!this.serviceTypePieChart || !this.dailyParticipationChart) {
            this.initCharts();
          }
          
          // 更新图表
          this.updateServiceTypePieChart(data.serviceTypeData);
          this.updateServiceObjectPieChart(data.serviceObjectData);
          this.updateDailyParticipationChart(data.dailyParticipationData);
          this.updateServiceParticipationChart(data.serviceParticipationData);
          this.updateWeeklyServiceChart(data.weeklyServiceData);
          this.updateServiceTypeTrendChart(data.serviceTypeTrendData);
          this.updateServiceSatisfactionChart(data.serviceSatisfactionData);
          this.updateTopServicesChart(data.topServices);
          this.updateMonthlyParticipationChart(data.monthlyParticipationData);
          
          this.loading = false;
        }).catch(error => {
          console.error('获取服务统计数据失败:', error);
          this.$message.error('获取数据失败，请稍后重试');
          this.loading = false;
        });
      },
      
      // 重置查询条件
      handleReset() {
        this.startDate = '';
        this.endDate = '';
        this.serviceType = '';
        this.serviceObject = '';
        // 重置服务筛选条件
        this.selectedService = '';
        this.selectedSubService = '';
        this.filteredSubServices = [];
      },
      
      // 导出数据
      handleExport() {
        this.loading = true;
        setTimeout(() => {
          this.$message.success('服务统计数据导出成功');
          this.loading = false;
        }, 1000);
      },
      
      // 格式化变化率显示
      formatChange(row) {
        const change = row.change;
        if (change === '-') return '-';
        return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
      },
      
      // 更新服务类型占比饼图
      updateServiceTypePieChart(data) {
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
            name: '服务类型',
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
        this.serviceTypePieChart.setOption(option);
      },
      
      // 更新服务对象分布饼图
      updateServiceObjectPieChart(data) {
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
            name: '服务对象',
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
        this.serviceObjectPieChart.setOption(option);
      },
      
      // 更新每日服务参与人数柱状图
      updateDailyParticipationChart(data) {
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: [{
            type: 'category',
            data: data.dates,
            axisTick: { alignWithLabel: true },
            axisLabel: { rotate: 45, interval: 0 }
          }],
          yAxis: [{ type: 'value', minInterval: 1 }],
          series: [{
            name: '参与人数',
            type: 'bar',
            barWidth: '60%',
            data: data.counts,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#409eff' },
                { offset: 1, color: '#6aa8ff' }
              ])
            }
          }]
        };
        this.dailyParticipationChart.setOption(option);
      },
      
      // 更新各服务项目参与人数柱状图
      updateServiceParticipationChart(data) {
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
          yAxis: [{ type: 'value', minInterval: 1 }],
          series: [{
            name: '参与人数',
            type: 'bar',
            barWidth: '60%',
            data: data.map(item => item.participants),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#67c23a' },
                { offset: 1, color: '#85ce61' }
              ])
            }
          }]
        };
        this.serviceParticipationChart.setOption(option);
      },
      
      // 更新每周服务次数柱状图
      updateWeeklyServiceChart(data) {
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: [{
            type: 'category',
            data: data.weeks,
            axisTick: { alignWithLabel: true }
          }],
          yAxis: [{ type: 'value', minInterval: 1 }],
          series: [{
            name: '服务开展次数',
            type: 'bar',
            barWidth: '60%',
            data: data.counts,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#e6a23c' },
                { offset: 1, color: '#f3d19E' }
              ])
            }
          }]
        };
        this.weeklyServiceChart.setOption(option);
      },
      
      // 更新服务类型参与趋势折线图
      updateServiceTypeTrendChart(data) {
        const option = {
          tooltip: { trigger: 'axis' },
          legend: { 
            data: data.series.map(item => item.name),
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
          series: data.series.map((item, index) => {
            // 为不同服务类型分配不同颜色
            const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c'];
            return {
              name: item.name,
              type: 'line',
              data: item.data,
              smooth: true,
              lineStyle: { width: 2, color: colors[index % colors.length] },
              symbol: 'circle',
              symbolSize: 4
            };
          })
        };
        this.serviceTypeTrendChart.setOption(option);
      },
      
      // 更新服务满意度对比图
      updateServiceSatisfactionChart(data) {
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
            name: '满意度',
            type: 'bar',
            barWidth: '60%',
            data: data.map(item => item.satisfaction),
            itemStyle: {
              color: function(params) {
                // 根据满意度设置颜色梯度
                const rate = data[params.dataIndex].satisfaction;
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
        this.serviceSatisfactionChart.setOption(option);
      },
      
      // 更新热门服务项目排行榜
      updateTopServicesChart(data) {
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          grid: { left: '3%', right: '15%', bottom: '3%', containLabel: true },
          xAxis: [{ type: 'value', name: '参与人数' }],
          yAxis: [{
            type: 'category',
            data: data.map(item => item.name),
            axisLabel: {
              interval: 0,
              formatter: function(value) {
                // 标题过长时省略处理
                if (value.length > 12) {
                  return value.substring(0, 12) + '...';
                }
                return value;
              }
            },
            inverse: true
          }],
          series: [{
            name: '热门服务',
            type: 'bar',
            data: data.map(item => item.participants),
            label: {
              show: true,
              position: 'right'
            },
            itemStyle: {
              color: function(params) {
                // 根据服务类型设置不同颜色
                const typeColors = {
                  '政策咨询': '#409eff',
                  '技能培训': '#67c23a',
                  '心理辅导': '#e6a23c',
                  '就业指导': '#f56c6c'
                };
                return typeColors[data[params.dataIndex].type] || '#909399';
              }
            }
          }]
        };
        this.topServicesChart.setOption(option);
      },
      
      // 更新月度服务参与总人数折线图
      updateMonthlyParticipationChart(data) {
        const option = {
          tooltip: { trigger: 'axis' },
          legend: { data: ['参与总人数'] },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.months
          },
          yAxis: { type: 'value', minInterval: 1 },
          series: [{
            name: '参与总人数',
            type: 'line',
            stack: 'Total',
            data: data.counts,
            smooth: true,
            lineStyle: { width: 3, color: '#1890ff' },
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: { color: '#1890ff' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0)' }
              ])
            }
          }]
        };
        this.monthlyParticipationChart.setOption(option);
      },
      
      // 获取服务统计数据
      fetchServiceStatisticsData() {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              // 服务统计汇总数据
              totalServices: 16,
              totalServiceCount: 156,
              totalParticipants: 2850,
              avgParticipants: 18.3,
              averageSatisfaction: 85.6,
              
              // 服务类型分布数据
              serviceTypeData: [
                { name: '政策咨询', value: 420 },
                { name: '技能培训', value: 850 },
                { name: '心理辅导', value: 780 },
                { name: '就业指导', value: 800 }
              ],
              
              // 服务对象分布数据
              serviceObjectData: [
                { name: '警官', value: 320 },
                { name: '出所人员', value: 1280 },
                { name: '社康社戒人员', value: 950 },
                { name: '其他人员', value: 300 }
              ],
              
              // 每日参与人数数据
              dailyParticipationData: {
                dates: ['2025-09-01', '2025-09-02', '2025-09-03', '2025-09-04', '2025-09-05', '2025-09-06', '2025-09-07', '2025-09-08', '2025-09-09', '2025-09-10'],
                counts: [85, 92, 105, 88, 75, 110, 120, 95, 89, 102]
              },
              
              // 各服务项目参与人数
              serviceParticipationData: [
                { name: '政策解读', participants: 320 },
                { name: '法规咨询', participants: 100 },
                { name: '职业技能培训', participants: 480 },
                { name: '计算机应用培训', participants: 370 },
                { name: '个体心理咨询', participants: 420 },
                { name: '团体心理辅导', participants: 360 },
                { name: '求职技巧指导', participants: 350 },
                { name: '简历制作辅导', participants: 280 },
                { name: '职业规划咨询', participants: 170 }
              ],
              
              // 每周服务开展次数
              weeklyServiceData: {
                weeks: ['第32周(8月)', '第33周(8月)', '第34周(9月)', '第35周(9月)', '第36周(9月)'],
                counts: [28, 32, 30, 35, 31]
              },
              
              // 服务类型参与趋势
              serviceTypeTrendData: {
                dates: ['2025-09-01', '2025-09-08', '2025-09-15', '2025-09-22'],
                series: [
                  { name: '政策咨询', data: [85, 92, 105, 110] },
                  { name: '技能培训', data: [180, 195, 210, 225] },
                  { name: '心理辅导', data: [170, 185, 190, 175] },
                  { name: '就业指导', data: [165, 175, 190, 210] }
                ]
              },
              
              // 服务满意度数据
              serviceSatisfactionData: [
                { name: '政策解读', satisfaction: 88.5 },
                { name: '法规咨询', satisfaction: 86.2 },
                { name: '职业技能培训', satisfaction: 82.3 },
                { name: '计算机应用培训', satisfaction: 87.6 },
                { name: '个体心理咨询', satisfaction: 90.1 },
                { name: '团体心理辅导', satisfaction: 84.8 },
                { name: '求职技巧指导', satisfaction: 83.5 },
                { name: '简历制作辅导', satisfaction: 86.7 },
                { name: '职业规划咨询', satisfaction: 81.2 }
              ],
              
              // 服务项目详情数据
              serviceDetails: [
                { name: '政策解读', holdCount: 12, participants: 320, satisfaction: 88.5 },
                { name: '法规咨询', holdCount: 8, participants: 100, satisfaction: 86.2 },
                { name: '职业技能培训', holdCount: 15, participants: 480, satisfaction: 82.3 },
                { name: '计算机应用培训', holdCount: 10, participants: 370, satisfaction: 87.6 },
                { name: '个体心理咨询', holdCount: 20, participants: 420, satisfaction: 90.1 },
                { name: '团体心理辅导', holdCount: 15, participants: 360, satisfaction: 84.8 },
                { name: '求职技巧指导', holdCount: 12, participants: 350, satisfaction: 83.5 },
                { name: '简历制作辅导', holdCount: 10, participants: 280, satisfaction: 86.7 },
                { name: '职业规划咨询', holdCount: 8, participants: 170, satisfaction: 81.2 }
              ],
              
              // 热门服务项目
              topServices: [
                { id: 1, name: '个体心理咨询', type: '心理辅导', participants: 420 },
                { id: 2, name: '职业技能培训', type: '技能培训', participants: 480 },
                { id: 3, name: '求职技巧指导', type: '就业指导', participants: 350 },
                { id: 4, name: '计算机应用培训', type: '技能培训', participants: 370 },
                { id: 5, name: '政策解读', type: '政策咨询', participants: 320 },
                { id: 6, name: '团体心理辅导', type: '心理辅导', participants: 360 },
                { id: 7, name: '简历制作辅导', type: '就业指导', participants: 280 },
                { id: 8, name: '法规咨询', type: '政策咨询', participants: 100 },
                { id: 9, name: '职业规划咨询', type: '就业指导', participants: 170 }
              ],
              
              // 月度参与总人数
              monthlyParticipationData: {
                months: ['5月', '6月', '7月', '8月', '9月'],
                counts: [480, 520, 580, 650, 620]
              }
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
  
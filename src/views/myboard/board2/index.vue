<template>
  <div class="statistics-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>资源访问统计分析系统</h1>
      <p>基于资源访问情况及用户行为的多维度分析</p>
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
            placeholder="选择人员类型"
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
            v-model="moduleFilter"
            placeholder="选择模块"
            class="full-width"
          >
            <el-option label="全部模块" value=""></el-option>
            <el-option label="政策法规" value="policy"></el-option>
            <el-option label="案例分析" value="cases"></el-option>
            <el-option label="培训资料" value="training"></el-option>
            <el-option label="操作指南" value="guide"></el-option>
            <el-option label="常见问题" value="faq"></el-option>
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

    <!-- 资源访问统计概览 -->
    <div class="chart-card">
      <div class="chart-header">
        <h2>资源访问统计概览</h2>
      </div>
      <el-table
        :data="resourceSummaryData"
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

    <!-- 用户访问分布 -->
    <div class="chart-card" style="margin-top: 20px;">
      <div class="chart-header">
        <h2>用户访问分布</h2>
      </div>
      <el-table
        :data="userAccessSummaryData"
        border
        style="width: 100%"
        class="summary-table"
      >
        <el-table-column
          prop="name"
          label="用户类型"
          align="center"
          width="200"
        ></el-table-column>
        <el-table-column
          prop="accessCount"
          label="访问次数"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="percentage"
          label="占比"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="avgVisitDuration"
          label="平均访问时长(分钟)"
          align="center"
        ></el-table-column>
      </el-table>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 用户类型访问占比饼图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h2>用户类型访问占比分析</h2>
        </div>
        <div class="chart-content">
          <div ref="pieChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 模块访问占比饼图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h2>模块访问占比分析</h2>
        </div>
        <div class="chart-content">
          <div ref="modulePieChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 每日资源访问量柱状图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h2>每日资源访问量趋势</h2>
        </div>
        <div class="chart-content">
          <div ref="dailyAccessChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 模块访问趋势折线图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h2>模块访问趋势对比</h2>
        </div>
        <div class="chart-content">
          <div ref="moduleTrendChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 热门文章排行榜 -->
      <div class="chart-card">
        <div class="chart-header">
          <h2>热门文章排行榜</h2>
        </div>
        <div class="chart-content">
          <div ref="topArticlesChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 访问时段分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <h2>访问时段分布</h2>
        </div>
        <div class="chart-content">
          <div ref="timeDistributionChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 每日登录用户数折线图 -->
      <div class="chart-card full-width">
        <div class="chart-header">
          <h2>每日活跃用户数趋势</h2>
        </div>
        <div class="chart-content">
          <div ref="dailyLoginChart" class="chart-container"></div>
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
  name: 'ResourceStatisticsPage',
  
  data() {
    return {
      // 查询条件
      startDate: '',
      endDate: '',
      userType: '',
      moduleFilter: '',
      
      // 加载状态
      loading: false,
      
      // 图表实例
      pieChart: null,
      dailyLoginChart: null,
      modulePieChart: null,
      dailyAccessChart: null,
      moduleTrendChart: null,
      topArticlesChart: null,
      timeDistributionChart: null,
      
      // 表格数据
      resourceSummaryData: [],
      userAccessSummaryData: []
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
    
    this.handleQuery();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    
    // 销毁所有图表实例
    if (this.pieChart) this.pieChart.dispose();
    if (this.dailyLoginChart) this.dailyLoginChart.dispose();
    if (this.modulePieChart) this.modulePieChart.dispose();
    if (this.dailyAccessChart) this.dailyAccessChart.dispose();
    if (this.moduleTrendChart) this.moduleTrendChart.dispose();
    if (this.topArticlesChart) this.topArticlesChart.dispose();
    if (this.timeDistributionChart) this.timeDistributionChart.dispose();
  },

  methods: {
    // 初始化所有图表
    initCharts() {
      if (this.$refs.pieChart) this.pieChart = echarts.init(this.$refs.pieChart, 'macarons');
      if (this.$refs.dailyLoginChart) this.dailyLoginChart = echarts.init(this.$refs.dailyLoginChart, 'macarons');
      if (this.$refs.modulePieChart) this.modulePieChart = echarts.init(this.$refs.modulePieChart, 'macarons');
      if (this.$refs.dailyAccessChart) this.dailyAccessChart = echarts.init(this.$refs.dailyAccessChart, 'macarons');
      if (this.$refs.moduleTrendChart) this.moduleTrendChart = echarts.init(this.$refs.moduleTrendChart, 'macarons');
      if (this.$refs.topArticlesChart) this.topArticlesChart = echarts.init(this.$refs.topArticlesChart, 'macarons');
      if (this.$refs.timeDistributionChart) this.timeDistributionChart = echarts.init(this.$refs.timeDistributionChart, 'macarons');
      
      window.addEventListener('resize', this.handleResize);
    },
    
    // 处理窗口大小变化
    handleResize() {
      if (this.pieChart) this.pieChart.resize();
      if (this.dailyLoginChart) this.dailyLoginChart.resize();
      if (this.modulePieChart) this.modulePieChart.resize();
      if (this.dailyAccessChart) this.dailyAccessChart.resize();
      if (this.moduleTrendChart) this.moduleTrendChart.resize();
      if (this.topArticlesChart) this.topArticlesChart.resize();
      if (this.timeDistributionChart) this.timeDistributionChart.resize();
    },
    
    // 查询数据
    handleQuery() {
      if (this.startDate && this.endDate && this.startDate > this.endDate) {
        this.$message.error('开始日期不能晚于结束日期');
        return;
      }
      
      this.loading = true;
      
      this.fetchStatisticsData().then(data => {
        // 更新资源访问统计概览
        this.resourceSummaryData = [
          { name: '总访问量', value: data.totalAccess, percentage: '100%', change: 12.5 },
          { name: '独立访客数', value: data.uniqueVisitors, percentage: '-', change: 8.3 },
          { name: '平均访问时长(分钟)', value: data.avgVisitDuration, percentage: '-', change: -2.1 },
          { name: '平均访问深度(篇)', value: data.avgVisitDepth, percentage: '-', change: 3.7 },
          { name: '热门模块', value: data.topModule, percentage: '-', change: '-' }
        ];
        
        // 更新用户访问分布
        this.userAccessSummaryData = data.userAccessData.map(item => ({
          name: item.name,
          accessCount: item.value,
          percentage: this.calcPercentage(item.value, data.totalAccess),
          avgVisitDuration: item.avgDuration
        }));
        
        // 确保图表实例已创建
        if (!this.pieChart || !this.modulePieChart) {
          this.initCharts();
        }
        
        // 更新图表
        this.updatePieChart(data.userAccessData);
        this.updateDailyLoginChart(data.dailyLoginData);
        this.updateModulePieChart(data.moduleAccessData);
        this.updateDailyAccessChart(data.dailyAccessData);
        this.updateModuleTrendChart(data.moduleTrendData);
        this.updateTopArticlesChart(data.topArticles);
        this.updateTimeDistributionChart(data.timeDistributionData);
        
        this.loading = false;
      }).catch(error => {
        console.error('获取统计数据失败:', error);
        this.$message.error('获取数据失败，请稍后重试');
        this.loading = false;
      });
    },
    
    // 重置查询条件
    handleReset() {
      this.startDate = '';
      this.endDate = '';
      this.userType = '';
      this.moduleFilter = '';
    },
    
    // 导出数据
    handleExport() {
      this.loading = true;
      setTimeout(() => {
        this.$message.success('资源统计数据导出成功');
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
    
    // 更新用户类型访问占比饼图
    updatePieChart(data) {
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
          name: '用户类型访问量',
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
      this.pieChart.setOption(option);
    },
    
    // 更新每日活跃用户数折线图
    updateDailyLoginChart(data) {
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['活跃用户数'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.dates,
          axisLabel: { rotate: 45, interval: 0 }
        },
        yAxis: { type: 'value', minInterval: 1 },
        series: [{
          name: '活跃用户数',
          type: 'line',
          stack: 'Total',
          data: data.counts,
          smooth: true,
          lineStyle: { width: 3, color: '#f56c6c' },
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#f56c6c' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
              { offset: 1, color: 'rgba(245, 108, 108, 0)' }
            ])
          }
        }]
      };
      this.dailyLoginChart.setOption(option);
    },
    
    // 更新模块访问占比饼图
    updateModulePieChart(data) {
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
          name: '模块访问',
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
      this.modulePieChart.setOption(option);
    },
    
    // 更新每日资源访问量柱状图
    updateDailyAccessChart(data) {
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
          name: '访问量',
          type: 'bar',
          barWidth: '60%',
          data: data.counts,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#909399' },
              { offset: 1, color: '#c9cdcf' }
            ])
          }
        }]
      };
      this.dailyAccessChart.setOption(option);
    },
    
    // 更新模块访问趋势折线图
    updateModuleTrendChart(data) {
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
          // 为不同模块分配不同颜色
          const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#1890ff'];
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
      this.moduleTrendChart.setOption(option);
    },
    
    // 更新热门文章排行榜
    updateTopArticlesChart(data) {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        grid: { left: '3%', right: '15%', bottom: '3%', containLabel: true },
        xAxis: [{ type: 'value', name: '访问量' }],
        yAxis: [{
          type: 'category',
          data: data.map(item => item.title),
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
          name: '热门文章',
          type: 'bar',
          data: data.map(item => item.views),
          label: {
            show: true,
            position: 'right'
          },
          itemStyle: {
            color: function(params) {
              // 根据模块设置不同颜色
              const moduleColors = {
                '政策法规': '#409eff',
                '案例分析': '#67c23a',
                '培训资料': '#e6a23c',
                '操作指南': '#f56c6c',
                '常见问题': '#1890ff'
              };
              return moduleColors[data[params.dataIndex].module] || '#909399';
            }
          }
        }]
      };
      this.topArticlesChart.setOption(option);
    },
    
    // 更新访问时段分布图表
    updateTimeDistributionChart(data) {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: [{
          type: 'category',
          data: data.hours,
          axisTick: { alignWithLabel: true }
        }],
        yAxis: [{ type: 'value', minInterval: 1 }],
        series: [{
          name: '访问量',
          type: 'bar',
          barWidth: '60%',
          data: data.counts,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#722ed1' },
              { offset: 1, color: '#b37feb' }
            ])
          }
        }]
      };
      this.timeDistributionChart.setOption(option);
    },
    
    // 获取资源统计数据
    fetchStatisticsData() {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            // 资源访问统计数据
            totalAccess: 8750,           // 总访问量
            uniqueVisitors: 980,         // 独立访客数
            avgVisitDuration: 8.5,       // 平均访问时长(分钟)
            avgVisitDepth: 3.2,          // 平均访问深度(篇)
            topModule: '政策法规',       // 热门模块
            
            // 用户类型访问分布
            userAccessData: [
              { name: '警官', value: 2650, avgDuration: 10.2 },
              { name: '出所人员', value: 3200, avgDuration: 9.5 },
              { name: '社康社戒人员', value: 1850, avgDuration: 7.8 },
              { name: '游客及其他', value: 1050, avgDuration: 5.3 }
            ],
            
            // 模块访问分布
            moduleAccessData: [
              { name: '政策法规', value: 2850 },
              { name: '案例分析', value: 2100 },
              { name: '培训资料', value: 1650 },
              { name: '操作指南', value: 1250 },
              { name: '常见问题', value: 900 }
            ],
            
            // 每日资源访问量
            dailyAccessData: {
              dates: ['2025-09-01', '2025-09-02', '2025-09-03', '2025-09-04', '2025-09-05', '2025-09-06', '2025-09-07', '2025-09-08', '2025-09-09', '2025-09-10'],
              counts: [780, 850, 920, 890, 750, 620, 980, 870, 910, 880]
            },
            
            // 模块访问趋势
            moduleTrendData: {
              dates: ['2025-09-01', '2025-09-02', '2025-09-03', '2025-09-04', '2025-09-05', '2025-09-06', '2025-09-07'],
              series: [
                { name: '政策法规', data: [280, 320, 350, 310, 290, 240, 380] },
                { name: '案例分析', data: [210, 230, 250, 220, 200, 180, 260] },
                { name: '培训资料', data: [160, 170, 190, 180, 150, 140, 190] },
                { name: '操作指南', data: [120, 130, 140, 130, 110, 100, 140] },
                { name: '常见问题', data: [90, 80, 90, 80, 100, 60, 110] }
              ]
            },
            
            // 热门文章排行榜
            topArticles: [
              { id: 1, title: '最新政策解读与实施细则', module: '政策法规', views: 320, date: '2025-09-15' },
              { id: 2, title: '典型案例深度分析与启示', module: '案例分析', views: 280, date: '2025-09-10' },
              { id: 3, title: '2025年度培训计划与材料', module: '培训资料', views: 255, date: '2025-08-05' },
              { id: 4, title: '系统操作全流程指南', module: '操作指南', views: 230, date: '2025-07-28' },
              { id: 5, title: '高频问题解答手册', module: '常见问题', views: 210, date: '2025-09-12' },
              { id: 6, title: '政策变化要点解读', module: '政策法规', views: 195, date: '2025-08-08' },
              { id: 7, title: '新入职人员培训课程', module: '培训资料', views: 180, date: '2025-06-01' },
              { id: 8, title: '特殊情况处理案例分析', module: '案例分析', views: 165, date: '2025-05-25' },
              { id: 9, title: '快捷操作技巧分享', module: '操作指南', views: 150, date: '2025-09-03' },
              { id: 10, title: '新系统使用常见问题', module: '常见问题', views: 135, date: '2025-04-07' }
            ],
            
            // 每日活跃用户数据
            dailyLoginData: {
              dates: ['2025-09-01', '2025-09-02', '2025-09-03', '2025-09-04', '2025-09-05', '2025-09-06', '2025-09-07', '2025-09-08', '2025-09-09', '2025-09-10'],
              counts: [89, 105, 98, 120, 135, 110, 95, 125, 115, 140]
            },
            
            // 访问时段分布数据
            timeDistributionData: {
              hours: ['00-03', '03-06', '06-09', '09-12', '12-15', '15-18', '18-21', '21-24'],
              counts: [320, 180, 650, 1250, 1500, 1850, 1750, 1250]
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

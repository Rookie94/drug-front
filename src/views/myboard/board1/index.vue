<template>
  <div class="statistics-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>人员统计分析系统</h1>
      <p>基于注册与登录数据的多维度分析</p>
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
            v-model="department"
            placeholder="选择归属部门"
            class="full-width"
          >
            <el-option label="全部部门" value=""></el-option>
            <el-option label="部门一" value="DEPT1"></el-option>
            <el-option label="部门二" value="DEPT2"></el-option>
            <el-option label="部门三" value="DEPT3"></el-option>
            <el-option label="部门四" value="DEPT4"></el-option>
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

    <!-- 统计数据表格 -->
    <div class="chart-card">
      <div class="chart-header">
        <h2>人员统计汇总</h2>
      </div>
      <el-table
        :data="summaryTableData"
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
          prop="percentage"
          label="占比"
          align="center"
        ></el-table-column>
      </el-table>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 用户类型百分比饼图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h2>用户类型占比分析</h2>
        </div>
        <div class="chart-content">
          <div ref="pieChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 每日注册人数柱状图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h2>每日注册人数趋势</h2>
        </div>
        <div class="chart-content">
          <div ref="dailyRegisterChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 每周注册人员柱状图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h2>每周注册人数趋势</h2>
        </div>
        <div class="chart-content">
          <div ref="weeklyRegisterChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 每月注册人员柱状图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h2>每月注册人数趋势</h2>
        </div>
        <div class="chart-content">
          <div ref="monthlyRegisterChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 每日登陆用户数折线图 -->
      <div class="chart-card full-width">
        <div class="chart-header">
          <h2>每日登录用户数趋势</h2>
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
import 'echarts/theme/macarons.js'; // 修改主题引入方式

export default {
  name: 'StatisticsPage',
  
  data() {
    return {
      // 查询条件
      startDate: '',
      endDate: '',
      userType: '',
      department: '',
      
      // 加载状态
      loading: false,
      
      // 图表实例
      pieChart: null,
      dailyRegisterChart: null,
      weeklyRegisterChart: null,
      monthlyRegisterChart: null,
      dailyLoginChart: null,
      
      // 表格数据
      summaryTableData: []
    }
  },
    
  // 确保DOM渲染完成后再初始化图表
  async mounted() {
    // 等待DOM完全渲染
    await this.$nextTick();
    
    // 初始化图表
    this.initCharts();
    
    // 设置默认日期范围为最近30天
    const end = new Date();
    const start = new Date();
    start.setTime(start.getTime() - 30 * 24 * 60 * 60 * 1000);
    this.startDate = parseTime(start, 'yyyy-MM-dd');
    this.endDate = parseTime(end, 'yyyy-MM-dd');
    
    // 默认加载数据
    this.handleQuery();
  },

  beforeDestroy() {
    // 移除窗口大小变化监听
    window.removeEventListener('resize', this.handleResize);
    
    // 销毁图表实例
    if (this.pieChart) this.pieChart.dispose();
    if (this.dailyRegisterChart) this.dailyRegisterChart.dispose();
    if (this.weeklyRegisterChart) this.weeklyRegisterChart.dispose();
    if (this.monthlyRegisterChart) this.monthlyRegisterChart.dispose();
    if (this.dailyLoginChart) this.dailyLoginChart.dispose();
  },

  methods: {
    // 初始化所有图表
    initCharts() {
      // 检查DOM元素是否存在
      if (this.$refs.pieChart) {
        this.pieChart = echarts.init(this.$refs.pieChart, 'macarons');
      }
      if (this.$refs.dailyRegisterChart) {
        this.dailyRegisterChart = echarts.init(this.$refs.dailyRegisterChart, 'macarons');
      }
      if (this.$refs.weeklyRegisterChart) {
        this.weeklyRegisterChart = echarts.init(this.$refs.weeklyRegisterChart, 'macarons');
      }
      if (this.$refs.monthlyRegisterChart) {
        this.monthlyRegisterChart = echarts.init(this.$refs.monthlyRegisterChart, 'macarons');
      }
      if (this.$refs.dailyLoginChart) {
        this.dailyLoginChart = echarts.init(this.$refs.dailyLoginChart, 'macarons');
      }
      
      // 监听窗口大小变化，重绘图表
      window.addEventListener('resize', this.handleResize);
    },
    
    // 处理窗口大小变化
    handleResize() {
      if (this.pieChart) this.pieChart.resize();
      if (this.dailyRegisterChart) this.dailyRegisterChart.resize();
      if (this.weeklyRegisterChart) this.weeklyRegisterChart.resize();
      if (this.monthlyRegisterChart) this.monthlyRegisterChart.resize();
      if (this.dailyLoginChart) this.dailyLoginChart.resize();
    },
    
    // 查询数据
    handleQuery() {
      // 验证日期
      if (this.startDate && this.endDate && this.startDate > this.endDate) {
        this.$message.error('开始日期不能晚于结束日期');
        return;
      }
      
      this.loading = true;
      
      // 调用API获取数据
      this.fetchStatisticsData().then(data => {
        // 更新表格数据
        this.summaryTableData = [
          { name: '用户总数', value: data.totalUsers, percentage: '100%' },
          { name: '警官人数', value: data.policeCount, percentage: this.calcPercentage(data.policeCount, data.totalUsers) },
          { name: '出所人员人数', value: data.releasedCount, percentage: this.calcPercentage(data.releasedCount, data.totalUsers) },
          { name: '社康社戒人员总数', value: data.rehabCount, percentage: this.calcPercentage(data.rehabCount, data.totalUsers) },
          { name: '游客及其它人员总数', value: data.otherCount, percentage: this.calcPercentage(data.otherCount, data.totalUsers) }
        ];
        
        // 确保图表实例已创建
        if (!this.pieChart || !this.dailyRegisterChart || !this.weeklyRegisterChart || !this.monthlyRegisterChart || !this.dailyLoginChart) {
          this.initCharts();
        }
        
        // 更新图表
        this.updatePieChart(data.userTypeData);
        this.updateDailyRegisterChart(data.dailyRegisterData);
        this.updateWeeklyRegisterChart(data.weeklyRegisterData);
        this.updateMonthlyRegisterChart(data.monthlyRegisterData);
        this.updateDailyLoginChart(data.dailyLoginData);
        
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
      this.department = '';
    },
    
    // 导出数据
    handleExport() {
      this.loading = true;
      // 模拟导出数据
      setTimeout(() => {
        this.$message.success('数据导出成功');
        this.loading = false;
      }, 1000);
    },
    
    // 计算百分比
    calcPercentage(value, total) {
      if (total === 0) return '0%';
      return ((value / total) * 100).toFixed(2) + '%';
    },
    
    // 更新饼图
    updatePieChart(data) {
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          bottom: 0,
          textStyle: {
            fontSize: 12
          }
        },
        series: [
          {
            name: '用户类型',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data
          }
        ]
      };
      this.pieChart.setOption(option);
    },
    
    // 更新每日注册柱状图
    updateDailyRegisterChart(data) {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: data.dates,
            axisTick: {
              alignWithLabel: true
            },
            axisLabel: {
              rotate: 45,
              interval: 0
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            minInterval: 1
          }
        ],
        series: [
          {
            name: '注册人数',
            type: 'bar',
            barWidth: '60%',
            data: data.counts,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#409eff' },
                { offset: 1, color: '#6aa8ff' }
              ])
            }
          }
        ]
      };
      this.dailyRegisterChart.setOption(option);
    },
    
    // 更新每周注册柱状图
    updateWeeklyRegisterChart(data) {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: data.weeks,
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            minInterval: 1
          }
        ],
        series: [
          {
            name: '注册人数',
            type: 'bar',
            barWidth: '60%',
            data: data.counts,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#67c23a' },
                { offset: 1, color: '#85ce61' }
              ])
            }
          }
        ]
      };
      this.weeklyRegisterChart.setOption(option);
    },
    
    // 更新每月注册柱状图
    updateMonthlyRegisterChart(data) {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: data.months,
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            minInterval: 1
          }
        ],
        series: [
          {
            name: '注册人数',
            type: 'bar',
            barWidth: '60%',
            data: data.counts,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#e6a23c' },
                { offset: 1, color: '#f3d19E' }
              ])
            }
          }
        ]
      };
      this.monthlyRegisterChart.setOption(option);
    },
    
    // 更新每日登录折线图
    updateDailyLoginChart(data) {
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['登录用户数']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.dates,
          axisLabel: {
            rotate: 45,
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          minInterval: 1
        },
        series: [
          {
            name: '登录用户数',
            type: 'line',
            stack: 'Total',
            data: data.counts,
            smooth: true,
            lineStyle: {
              width: 3,
              color: '#f56c6c'
            },
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {
              color: '#f56c6c'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
                { offset: 1, color: 'rgba(245, 108, 108, 0)' }
              ])
            }
          }
        ]
      };
      this.dailyLoginChart.setOption(option);
    },
    
    // 修正后的API调用 - 直接返回JSON数据
    fetchStatisticsData() {
      // 使用Promise包装模拟异步请求
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            totalUsers: 1250,
            policeCount: 320,
            releasedCount: 480,
            rehabCount: 250,
            otherCount: 200,
            
            // 用户类型饼图数据
            userTypeData: [
              { value: 320, name: '警官' },
              { value: 480, name: '出所人员' },
              { value: 250, name: '社康社戒人员' },
              { value: 200, name: '游客及其他' }
            ],
            
            // 每日注册数据
            dailyRegisterData: {
              dates: ['2025-09-01', '2025-09-02', '2025-09-03', '2025-09-04', '2025-09-05', '2025-09-06', '2025-09-07', '2025-09-08', '2025-09-09', '2025-09-10'],
              counts: [15, 21, 18, 24, 30, 25, 19, 28, 22, 32]
            },
            
            // 每周注册数据
            weeklyRegisterData: {
              weeks: ['第41周', '第42周', '第43周', '第44周', '第45周', '第46周'],
              counts: [120, 156, 132, 180, 165, 140]
            },
            
            // 每月注册数据
            monthlyRegisterData: {
              months: ['4月','5月', '6月', '7月', '8月', '9月'],
              counts: [180, 165, 210, 240, 220, 235]
            },
            
            // 每日登录数据
            dailyLoginData: {
              dates: ['2025-09-01', '2025-09-02', '2025-09-03', '2025-09-04', '2025-09-05', '2025-09-06', '2025-09-07', '2025-09-08', '2025-09-09', '2025-09-10'],
              counts: [89, 105, 98, 120, 135, 110, 95, 125, 115, 140]
            }
          });
        }, 500);
      });
    },

    // 示例API调用 - 导出统计数据
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

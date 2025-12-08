<template>
  <div class="app-container">
    <!-- 查询条件区域 - 若依风格 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="queryParams.startDate"
          type="date"
          placeholder="选择开始日期"
          value-format="yyyy-MM-dd"
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker
          v-model="queryParams.endDate"
          type="date"
          placeholder="选择结束日期"
          value-format="yyyy-MM-dd"
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="人员类型" prop="userType">
        <el-select v-model="queryParams.userType" placeholder="请选择人员类型" clearable style="width: 200px">
          <el-option label="全部" value="" />
          <el-option label="警官" value="00" />
          <el-option label="出所人员" value="11" />
          <el-option label="社康社戒人员" value="22" />
          <el-option label="游客及其他" value="33" />
        </el-select>
      </el-form-item>
      <el-form-item label="所属部门" prop="deptId">
        <treeselect
          v-model="queryParams.deptId"
          :options="deptOptions"
          :show-count="true"
          placeholder="请选择部门"
          style="width: 300px"
          @input="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 - 若依风格 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleExport"
          v-hasPermi="['myboard:board1:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="handleQuery"></right-toolbar>
    </el-row>

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
        />
        <el-table-column
          prop="value"
          label="数量"
          align="center"
        />
        <el-table-column
          prop="percentage"
          label="占比"
          align="center"
        />
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

      <!-- 每日登录用户数折线图 -->
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
import { listStatistics, exportStatistics } from "@/api/myboard/board1";
import * as echarts from 'echarts';
import 'echarts/theme/macarons.js';
import { deptTreeSelect } from "@/api/system/user";          // 拉部门树
import Treeselect from "@riophae/vue-treeselect";            // 树选择组件
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: 'UserStatistics',
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      deptOptions: [],
      // 查询参数
      queryParams: {
        startDate: '',
        endDate: '',
        userType: '',
        deptId: undefined
      },
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
    
  created() {
    // 设置默认日期范围为最近30天
    const end = new Date();
    const start = new Date();
    start.setTime(start.getTime() - 30 * 24 * 60 * 60 * 1000);
    this.queryParams.startDate = this.parseTime(start, '{y}-{m}-{d}');
    this.queryParams.endDate = this.parseTime(end, '{y}-{m}-{d}');
  },
    
  mounted() {
    //加载部门树
    this.getDeptTree();
    // 初始化图表
    this.initCharts();
    // 加载数据
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
    /** 获取部门树 */
    getDeptTree() {
      deptTreeSelect().then(res => {
        this.deptOptions = res.data;
      });
    },
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
    
    /** 搜索按钮操作 */
    handleQuery() {
      // 验证日期
      if (this.queryParams.startDate && this.queryParams.endDate && 
          this.queryParams.startDate > this.queryParams.endDate) {
        this.$modal.msgError('开始日期不能晚于结束日期');
        return;
      }
      
      this.loading = true;
      
      // 调用API获取数据
      listStatistics(this.queryParams).then(response => {
        if (response.code === 200) {
          const data = response.data;
          
          // 更新表格数据
          this.summaryTableData = [
            { name: '用户总数', value: data.totalUsers, percentage: '100%' },
            { name: '警官人数', value: data.policeCount, percentage: this.calcPercentage(data.policeCount, data.totalUsers) },
            { name: '出所人员人数', value: data.releasedCount, percentage: this.calcPercentage(data.releasedCount, data.totalUsers) },
            { name: '社康社戒人员总数', value: data.rehabCount, percentage: this.calcPercentage(data.rehabCount, data.totalUsers) },
            { name: '游客及其它人员总数', value: data.otherCount, percentage: this.calcPercentage(data.otherCount, data.totalUsers) }
          ];
          
          // 确保图表实例已创建
          if (!this.pieChart || !this.dailyRegisterChart || !this.weeklyRegisterChart || 
              !this.monthlyRegisterChart || !this.dailyLoginChart) {
            this.initCharts();
          }
          
          // 更新图表
          this.updatePieChart(data.userTypeData);
          this.updateDailyRegisterChart(data.dailyRegisterData);
          this.updateWeeklyRegisterChart(data.weeklyRegisterData);
          this.updateMonthlyRegisterChart(data.monthlyRegisterData);
          this.updateDailyLoginChart(data.dailyLoginData);
          
          this.$modal.msgSuccess('查询成功');
        } else {
          this.$modal.msgError(response.msg || '查询失败');
        }
        this.loading = false;
      }).catch(error => {
        console.error('获取统计数据失败:', error);
        this.$modal.msgError('获取数据失败，请稍后重试');
        this.loading = false;
      });
    },
    
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$modal.confirm('是否确认导出所有人员统计的数据项？').then(() => {
        this.loading = true;
        return exportStatistics(queryParams);
      }).then(response => {
        this.$download.name(response.msg);
        this.loading = false;
      }).catch(error => {
        console.error('导出失败:', error);
        this.loading = false;
      });
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
    
    // 时间格式化方法（兼容若依框架）
    parseTime(time, pattern) {
      if (arguments.length === 0 || !time) {
        return null;
      }
      const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}';
      let date;
      if (typeof time === 'object') {
        date = time;
      } else {
        if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
          time = parseInt(time);
        } else if (typeof time === 'string') {
          time = time.replace(new RegExp(/-/gm), '/');
        }
        if ((typeof time === 'number') && (time.toString().length === 10)) {
          time = time * 1000;
        }
        date = new Date(time);
      }
      const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
      };
      const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key];
        if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value]; }
        if (result.length > 0 && value < 10) {
          value = '0' + value;
        }
        return value || 0;
      });
      return time_str;
    }
  }
};
</script>

<style scoped>
.app-container {
  padding: 20px;
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
  .app-container {
    padding: 10px;
  }
  
  .chart-container {
    height: 300px;
  }
}
</style>
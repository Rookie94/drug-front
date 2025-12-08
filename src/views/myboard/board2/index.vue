<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form 
      :model="queryParams" 
      ref="queryForm" 
      :inline="true" 
      label-width="100px" 
      class="el-form--inline"
      @submit.native.prevent
    >
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="queryParams.startDate"
          type="date"
          placeholder="选择开始日期"
          value-format="yyyy-MM-dd"
          style="width: 200px"
          :disabled="loading"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker
          v-model="queryParams.endDate"
          type="date"
          placeholder="选择结束日期"
          value-format="yyyy-MM-dd"
          style="width: 200px"
          :disabled="loading"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="人员类型" prop="userType">
        <el-select 
          v-model="queryParams.userType" 
          placeholder="请选择人员类型" 
          clearable 
          style="width: 200px"
          :disabled="loading"
        >
          <el-option label="全部" value="" />
          <el-option label="警官" value="00" />
          <el-option label="出所人员" value="11" />
          <el-option label="社康社戒人员" value="22" />
          <el-option label="游客及其他" value="33" />
        </el-select>
      </el-form-item>
      <el-form-item label="资源分类" prop="moduleFilter">
        <el-select 
          v-model="queryParams.moduleFilter" 
          placeholder="请选择资源分类" 
          clearable 
          style="width: 200px"
          :disabled="loading"
        >
          <el-option label="全部" value="" />
          <el-option label="首页轮播" value="首页轮播" />
          <el-option label="戒治案例" value="戒治案例" />
          <el-option label="戒治资源" value="戒治资源" />
          <el-option label="戒治处方" value="戒治处方" />
          <el-option label="公告通知" value="公告通知" />
          <el-option label="技能培训" value="技能培训" />
          <el-option label="戒治专家" value="戒治专家" />
          <el-option label="戒治机构" value="戒治机构" />
          <el-option label="戒治技术" value="戒治技术" />
          <el-option label="禁毒资讯" value="禁毒资讯" />
          <el-option label="招聘资讯" value="招聘资讯" />
          <el-option label="其它" value="其它" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button 
          type="primary" 
          icon="el-icon-search" 
          @click="handleQuery" 
          :loading="loading"
        >
          搜索
        </el-button>
        <el-button 
          icon="el-icon-refresh" 
          @click="resetQuery"
          :disabled="loading"
        >
          重置
        </el-button>
        <el-button 
          type="success" 
          icon="el-icon-download" 
          @click="handleExport"
          v-hasPermi="['myboard:board2:export']"
          :loading="exportLoading"
          :disabled="loading"
        >
          导出
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 资源访问统计概览 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="never">
          <div slot="header">
            <span>资源访问统计概览</span>
          </div>
          <el-table
            :data="resourceSummaryData"
            border
            style="width: 100%"
            class="summary-table"
            v-loading="loading"
            empty-text="暂无统计数据"
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
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户访问分布 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="never">
          <div slot="header">
            <span>用户访问分布</span>
          </div>
          <el-table
            :data="userAccessSummaryData"
            border
            style="width: 100%"
            class="summary-table"
            v-loading="loading"
            empty-text="暂无用户访问数据"
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
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 用户类型访问占比饼图 -->
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">
            <span>用户类型访问占比分析</span>
          </div>
          <div ref="pieChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 模块访问占比饼图 -->
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">
            <span>模块访问占比分析</span>
          </div>
          <div ref="modulePieChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 每日资源访问量柱状图 -->
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">
            <span>每日资源访问量趋势</span>
          </div>
          <div ref="dailyAccessChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 模块访问趋势折线图 -->
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">
            <span>模块访问趋势对比</span>
          </div>
          <div ref="moduleTrendChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 热门文章排行榜 -->
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">
            <span>热门文章排行榜</span>
          </div>
          <div ref="topArticlesChart" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 访问时段分布 -->
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">
            <span>访问时段分布</span>
          </div>
          <div ref="timeDistributionChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 每日活跃用户数折线图 -->
      <el-col :span="24">
        <el-card shadow="never">
          <div slot="header">
            <span>每日活跃用户数趋势</span>
          </div>
          <div ref="dailyLoginChart" class="chart-container full-width-chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { parseTime } from '@/utils/ruoyi'
import { getStatisticsData, exportData } from '@/api/myboard/board2'
import * as echarts from 'echarts'
import 'echarts/theme/macarons.js'

export default {
  name: 'BoardStatistics',
  data() {
    return {
      // 查询参数
      queryParams: {
        startDate: '',
        endDate: '',
        userType: '',
        moduleFilter: ''
      },
      // 加载状态
      loading: false,
      exportLoading: false,
      // 图表实例（初始化为空对象，避免undefined）
      chartInstances: {
        pieChart: null,
        dailyLoginChart: null,
        modulePieChart: null,
        dailyAccessChart: null,
        moduleTrendChart: null,
        topArticlesChart: null,
        timeDistributionChart: null
      },
      // 表格数据
      resourceSummaryData: [],
      userAccessSummaryData: [],
      // 图表数据缓存
      chartData: {}
    }
  },
  created() {
    // 初始化默认日期范围（最近30天）
    this.initDefaultDate()
  },
  mounted() {
    // 确保DOM渲染完成后初始化图表
    this.$nextTick(() => {
      this.initAllCharts()
      this.handleQuery()
    })
    // 监听窗口resize事件（使用箭头函数绑定this）
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    // 解绑resize事件
    window.removeEventListener('resize', this.handleResize)
    // 销毁所有图表实例（防内存泄漏）
    this.destroyAllCharts()
  },
  methods: {
    /**
     * 初始化默认日期范围（最近30天）
     */
    initDefaultDate() {
      try {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 30 * 24 * 60 * 60 * 1000)
        this.queryParams.startDate = parseTime(start, '{y}-{m}-{d}') // 适配ruoyi的parseTime格式
        this.queryParams.endDate = parseTime(end, '{y}-{m}-{d}')
      } catch (error) {
        console.error('初始化默认日期失败:', error)
        // 兜底默认值
        this.queryParams.startDate = ''
        this.queryParams.endDate = ''
      }
    },
    /**
     * 初始化所有图表实例
     */
    initAllCharts() {
      // 遍历所有图表容器，初始化实例
      Object.keys(this.chartInstances).forEach(key => {
        const el = this.$refs[key]
        if (el) {
          this.chartInstances[key] = echarts.init(el, 'macarons')
        }
      })
    },
    /**
     * 销毁所有图表实例
     */
    destroyAllCharts() {
      Object.values(this.chartInstances).forEach(instance => {
        if (instance && typeof instance.dispose === 'function') {
          instance.dispose()
        }
      })
      // 重置实例对象
      this.chartInstances = {
        pieChart: null,
        dailyLoginChart: null,
        modulePieChart: null,
        dailyAccessChart: null,
        moduleTrendChart: null,
        topArticlesChart: null,
        timeDistributionChart: null
      }
    },
    /**
     * 处理窗口resize，重绘所有图表
     */
    handleResize() {
      Object.values(this.chartInstances).forEach(instance => {
        if (instance && typeof instance.resize === 'function') {
          instance.resize()
        }
      })
    },
    /**
     * 查询统计数据
     */
    async handleQuery() {
      // 表单验证
      if (!this.validateQueryParams()) return

      this.loading = true
      try {
        const response = await getStatisticsData({ ...this.queryParams }) // 深拷贝避免参数篡改
        this.chartData = response.data || {}
        
        // 更新表格数据
        this.updateResourceSummary()
        this.updateUserAccessSummary()
        
        // 更新所有图表
        this.updatePieChart()
        this.updateDailyLoginChart()
        this.updateModulePieChart()
        this.updateDailyAccessChart()
        this.updateModuleTrendChart()
        this.updateTopArticlesChart()
        this.updateTimeDistributionChart()
      } catch (error) {
        console.error('获取统计数据失败:', error)
        this.$modal.msgError('获取统计数据失败，请稍后重试')
        // 清空数据，避免脏数据展示
        this.chartData = {}
        this.resourceSummaryData = []
        this.userAccessSummaryData = []
        this.setAllChartsEmpty()
      } finally {
        this.loading = false
      }
    },
    /**
     * 验证查询参数
     */
    validateQueryParams() {
      // 空值验证
      if (!this.queryParams.startDate || !this.queryParams.endDate) {
        this.$modal.msgWarning('请选择开始日期和结束日期')
        return false
      }
      // 日期范围验证
      if (this.queryParams.startDate > this.queryParams.endDate) {
        this.$modal.msgError('开始日期不能晚于结束日期')
        return false
      }
      return true
    },
    /**
     * 更新资源访问统计概览
     */
    updateResourceSummary() {
      const { totalAccess = 0, uniqueVisitors = 0, avgVisitDuration = 0, avgVisitDepth = 0, topModule = '无数据' } = this.chartData
      
      this.resourceSummaryData = [
        { 
          name: '总访问量', 
          value: totalAccess, 
          percentage: '100%', 
          change: 12.5 
        },
        { 
          name: '独立访客数', 
          value: uniqueVisitors, 
          percentage: '-', 
          change: 8.3 
        },
        { 
          name: '平均访问时长(分钟)', 
          value: Number(avgVisitDuration).toFixed(1), 
          percentage: '-', 
          change: -2.1 
        },
        { 
          name: '平均访问深度(篇)', 
          value: Number(avgVisitDepth).toFixed(1), 
          percentage: '-', 
          change: 3.7 
        },
        { 
          name: '热门模块', 
          value: topModule, 
          percentage: '-', 
          change: '-' 
        }
      ]
    },
    /**
     * 更新用户访问分布
     */
    updateUserAccessSummary() {
      const { totalAccess = 0, userAccessData = [] } = this.chartData
      
      this.userAccessSummaryData = userAccessData.map(item => ({
        name: item.name || '',
        accessCount: item.value || 0,
        percentage: this.calcPercentage(item.value, totalAccess),
        avgVisitDuration: Number(item.avgDuration || 0).toFixed(1)
      }))
    },
    /**
     * 重置查询条件
     */
    resetQuery() {
      // 重置表单（Element UI 规范写法）
      if (this.$refs.queryForm) {
        this.$refs.queryForm.resetFields()
      }
      // 重新初始化默认日期
      this.initDefaultDate()
      // 重新查询
      this.handleQuery()
    },
    /**
     * 导出统计数据
     */
    async handleExport() {
      // 导出前验证参数
      if (!this.validateQueryParams()) return
      
      this.exportLoading = true
      try {
        const response = await exportData({ ...this.queryParams })
        this.$download.response(response)
        this.$modal.msgSuccess('导出成功')
      } catch (error) {
        console.error('导出数据失败:', error)
        this.$modal.msgError('导出数据失败，请稍后重试')
      } finally {
        this.exportLoading = false
      }
    },
    /**
     * 计算百分比（带空值保护）
     */
    calcPercentage(value, total) {
      if (!value || !total || total === 0) return '0%'
      return ((Number(value) / Number(total)) * 100).toFixed(2) + '%'
    },
    /**
     * 格式化变化率显示
     */
    formatChange(row) {
      const change = row.change
      if (change === '-' || change === undefined) return '-'
      return `${Number(change) > 0 ? '+' : ''}${Number(change).toFixed(1)}%`
    },
    /**
     * 更新用户类型访问占比饼图
     */
    updatePieChart() {
      const data = this.chartData.userAccessData || []
      const chart = this.chartInstances.pieChart
      if (!chart) return
      
      if (data.length === 0) {
        this.setEmptyChart(chart, '暂无用户访问数据')
        return
      }
      
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
      }
      chart.setOption(option, true) // 第二个参数true表示不合并配置，重置图表
    },
    /**
     * 更新每日活跃用户数折线图
     */
    updateDailyLoginChart() {
      const data = this.chartData.dailyLoginData || {}
      const chart = this.chartInstances.dailyLoginChart
      if (!chart) return
      
      if (!data.dates || data.dates.length === 0) {
        this.setEmptyChart(chart, '暂无活跃用户数据')
        return
      }
      
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
          data: data.counts || [],
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
      }
      chart.setOption(option, true)
    },
    /**
     * 更新模块访问占比饼图
     */
    updateModulePieChart() {
      const data = this.chartData.moduleAccessData || []
      const chart = this.chartInstances.modulePieChart
      if (!chart) return
      
      if (data.length === 0) {
        this.setEmptyChart(chart, '暂无模块访问数据')
        return
      }
      
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
      }
      chart.setOption(option, true)
    },
    /**
     * 更新每日资源访问量柱状图
     */
    updateDailyAccessChart() {
      const data = this.chartData.dailyAccessData || {}
      const chart = this.chartInstances.dailyAccessChart
      if (!chart) return
      
      if (!data.dates || data.dates.length === 0) {
        this.setEmptyChart(chart, '暂无每日访问数据')
        return
      }
      
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
          data: data.counts || [],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#909399' },
              { offset: 1, color: '#c9cdcf' }
            ])
          }
        }]
      }
      chart.setOption(option, true)
    },
    /**
     * 更新模块访问趋势折线图
     */
    updateModuleTrendChart() {
      const data = this.chartData.moduleTrendData || {}
      const chart = this.chartInstances.moduleTrendChart
      if (!chart) return
      
      if (!data.series || data.series.length === 0) {
        this.setEmptyChart(chart, '暂无模块趋势数据')
        return
      }
      
      const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#1890ff']
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { 
          data: data.series.map(item => item.name || ''),
          top: 0
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.dates || [],
          axisLabel: { rotate: 45, interval: 0 }
        },
        yAxis: { type: 'value', minInterval: 1 },
        series: (data.series || []).map((item, index) => ({
          name: item.name || '',
          type: 'line',
          data: item.data || [],
          smooth: true,
          lineStyle: { width: 2, color: colors[index % colors.length] },
          symbol: 'circle',
          symbolSize: 4
        }))
      }
      chart.setOption(option, true)
    },
    /**
     * 更新热门文章排行榜
     */
    updateTopArticlesChart() {
      const data = this.chartData.topArticles || []
      const chart = this.chartInstances.topArticlesChart
      if (!chart) return
      
      if (data.length === 0) {
        this.setEmptyChart(chart, '暂无热门文章数据')
        return
      }
      
      const moduleColors = {
        '政策法规': '#409eff',
        '案例分析': '#67c23a',
        '培训资料': '#e6a23c',
        '操作指南': '#f56c6c',
        '常见问题': '#1890ff'
      }
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        },
        grid: { left: '3%', right: '15%', bottom: '3%', containLabel: true },
        xAxis: [{ type: 'value', name: '访问量' }],
        yAxis: [{
          type: 'category',
          data: data.map(item => {
            // 标题过长省略
            const title = item.title || ''
            return title.length > 12 ? title.substring(0, 12) + '...' : title
          }),
          axisLabel: { interval: 0 },
          inverse: true
        }],
        series: [{
          name: '热门文章',
          type: 'bar',
          data: data.map(item => item.views || 0),
          label: {
            show: true,
            position: 'right'
          },
          itemStyle: {
            color: (params) => {
              const module = data[params.dataIndex]?.module || ''
              return moduleColors[module] || '#909399'
            }
          }
        }]
      }
      chart.setOption(option, true)
    },
    /**
     * 更新访问时段分布图表
     */
    updateTimeDistributionChart() {
      const data = this.chartData.timeDistributionData || {}
      const chart = this.chartInstances.timeDistributionChart
      if (!chart) return
      
      if (!data.hours || data.hours.length === 0) {
        this.setEmptyChart(chart, '暂无时段访问数据')
        return
      }
      
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
          data: data.counts || [],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#722ed1' },
              { offset: 1, color: '#b37feb' }
            ])
          }
        }]
      }
      chart.setOption(option, true)
    },
    /**
     * 设置空图表提示
     */
    setEmptyChart(chartInstance, text = '暂无数据') {
      if (!chartInstance) return
      chartInstance.setOption({
        title: {
          text: text,
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 14,
            fontWeight: 'normal'
          }
        },
        xAxis: { show: false },
        yAxis: { show: false },
        series: []
      }, true)
    },
    /**
     * 所有图表设置为空状态
     */
    setAllChartsEmpty() {
      Object.values(this.chartInstances).forEach(instance => {
        this.setEmptyChart(instance)
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.summary-table {
  margin-top: 10px;
}

.el-card {
  margin-bottom: 20px;
  border-radius: 4px;
}

.el-card__header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
  padding: 12px 20px;
}

/* 图表容器统一样式 */
.chart-container {
  width: 100%;
  height: 350px;
}

/* 全屏宽度图表 */
.full-width-chart {
  height: 350px;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .chart-container,
  .full-width-chart {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }
  
  .chart-container,
  .full-width-chart {
    height: 250px;
  }
  
  /* 内联表单适配移动端 */
  .el-form--inline .el-form-item {
    display: block;
    margin-right: 0;
    margin-bottom: 10px;
    width: 100%;
  }
  
  .el-form--inline .el-form-item__content {
    width: 100%;
  }
  
  .el-date-picker,
  .el-select {
    width: 100% !important;
  }
}
</style>
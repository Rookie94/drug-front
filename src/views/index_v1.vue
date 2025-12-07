<template>
  <div class="app-container">
    <div class="header">
      <h1>一体两翼平台数据监控看板</h1>
      <div class="update-time">最后更新时间：{{ now }}</div>
    </div>

    <!-- 指标卡片 -->
    <div class="dashboard">
      <div v-for="(item,key) in metrics" :key="key" class="card" :class="'card-'+key">
        <div class="card-left">
          <div class="card-icon">{{ item.icon }}</div>
          <div class="card-title">{{ item.label }}</div>
        </div>
        <div class="card-right">
          <div class="card-value">
            {{ item.val | num }}<span class="card-unit">{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 折线图 -->
    <div class="chart-box">
      <div class="chart-title">30日登录用户走势图</div>
      <div v-show="chartReady" ref="loginTrend" style="width:100%;height:360px"></div>
      <div v-show="!chartReady" style="width:100%;height:360px;display:flex;align-items:center;justify-content:center;color:#909399;">
        图表加载中...
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getMetrics, getLoginTrend } from '@/api/etl/elreport1'

export default {
  name: 'Dashboard',
  filters: {
    num(v) { return v.toLocaleString() }
  },
  data() {
    return {
      now: '',
      chartReady: false,
      metrics: {
        org:      { icon: '🏢', label: '戒治机构数量',   val: 0, unit: '个' },
        expert:   { icon: '👨‍⚕️', label: '戒治专家数量',   val: 0, unit: '位' },
        police:   { icon: '👮', label: '警官数量',   val: 0, unit: '人' },
        users:     { icon: '🧑', label: '学员数量',   val: 0, unit: '人' },
        resource: { icon: '📚', label: '戒治资源数量',   val: 0, unit: '个' },
        cases:    { icon: '📋', label: '戒治案例数', val: 0, unit: '例' },
        scale:    { icon: '📊', label: '心理量表数',     val: 0, unit: '个' },
        survey:   { icon: '📋', label: '问卷数',     val: 0, unit: '份' },
        rxdata:   { icon: '💊', label: '戒治处方数量',   val: 0, unit: '张' },
        tech:   { icon: '🧪', label: '戒治技术数量',   val: 0, unit: '个' },
        activities:{icon:'🎯',label:'线下活动数量',     val: 0, unit: '场' },
        chat:     { icon: '💬', label: '留言数量',   val: 0, unit: '条' },
        jobinfo:  { icon: '💼', label: '招聘信息数量',   val: 0, unit: '个' },
        skill:    { icon: '🛠️', label: '技能培训数量',   val: 0, unit: '项' },
        notice:   { icon: '📢', label: '公告通知数', val: 0, unit: '条' }
      },
      chart: null,
      timer: null,
      isMounted: false,
      animationTimers: []
    }
  },
  mounted() {
    this.isMounted = true
    this.loadMetrics()
    this.timer = setInterval(() => this.updateTime(), 1000)
    
    // 使用 nextTick 确保 DOM 已渲染
    this.$nextTick(() => {
      this.initChartAfterMount()
    })
  },
  beforeDestroy() {
    this.isMounted = false
    
    // 清除所有动画定时器
    this.animationTimers.forEach(timer => clearInterval(timer))
    this.animationTimers = []
    
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    
    if (this.chart) {
      // 移除窗口调整大小的监听器
      window.removeEventListener('resize', this.handleResize)
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    /* 加载指标 */
    async loadMetrics() {
      try {
        const res = await getMetrics()
        if (!this.isMounted) return
        
        Object.keys(res.data).forEach(k => {
          if (this.metrics[k]) {
            this.animateNum(k, 0, res.data[k], 800)
          }
        })
        this.updateTime()
      } catch (error) {
        console.error('加载指标数据失败:', error)
      }
    },
    
    /* 挂载后初始化图表 */
    async initChartAfterMount() {
      // 等待一小段时间确保 DOM 完全渲染
      setTimeout(async () => {
        if (!this.isMounted || !this.$refs.loginTrend) {
          console.warn('DOM 元素未准备好或组件已销毁')
          return
        }
        
        this.chartReady = true
        await this.loadTrend()
      }, 100)
    },
    
    /* 加载趋势 */
    async loadTrend() {
      try {
        const res = await getLoginTrend()
        if (!this.isMounted || !this.$refs.loginTrend) return
        
        // 确保 DOM 元素有尺寸
        if (this.$refs.loginTrend.offsetWidth === 0 || this.$refs.loginTrend.offsetHeight === 0) {
          console.warn('图表容器尺寸为0')
          return
        }
        
        this.initChart(res.data.days, res.data.data)
      } catch (error) {
        console.error('加载趋势数据失败:', error)
      }
    },
    
    /* 数字动画 */
    animateNum(key, start, end, duration) {
      if (!this.metrics[key]) return
      
      const step = (end - start) / (duration / 16)
      let cur = start
      const timer = setInterval(() => {
        if (!this.isMounted) {
          clearInterval(timer)
          return
        }
        
        cur += step
        if (cur >= end) { 
          cur = end
          clearInterval(timer)
          // 从定时器列表中移除
          const index = this.animationTimers.indexOf(timer)
          if (index > -1) this.animationTimers.splice(index, 1)
        }
        this.metrics[key].val = Math.floor(cur)
      }, 16)
      
      this.animationTimers.push(timer)
    },
    
    /* 更新时间 */
    updateTime() {
      if (!this.isMounted) return
      
      const d = new Date()
      this.now = `${d.getFullYear()}年${String(d.getMonth()+1).padStart(2,'0')}月${String(d.getDate()).padStart(2,'0')}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
    },
    
    /* 窗口调整大小处理 */
    handleResize() {
      if (this.chart && this.isMounted) {
        this.chart.resize()
      }
    },
    
    /* 初始化图表 */
    initChart(days, data) {
      // 如果之前有图表实例，先销毁
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
      
      try {
        // 使用 try-catch 包装初始化过程
        this.chart = echarts.init(this.$refs.loginTrend)
        
        const opt = {
          tooltip: { 
            trigger: 'axis', 
            backgroundColor: 'rgba(255,255,255,.9)', 
            borderColor: '#dcdfe6', 
            textStyle: { color: '#606266' } 
          },
          grid: { left: 40, right: 20, top: 20, bottom: 40 },
          xAxis: { 
            type: 'category', 
            boundaryGap: false, 
            data: days, 
            axisLine: { lineStyle: { color: '#e4e7ed' } }, 
            axisLabel: { color: '#909399' } 
          },
          yAxis: { 
            type: 'value', 
            axisLine: { show: false }, 
            axisTick: { show: false }, 
            splitLine: { lineStyle: { color: '#ebeef5' } }, 
            axisLabel: { color: '#909399' } 
          },
          series: [{ 
            name: '登录用户数', 
            type: 'line', 
            smooth: true, 
            symbol: 'circle', 
            symbolSize: 6, 
            itemStyle: { color: '#409eff' }, 
            lineStyle: { width: 3, color: '#409eff' }, 
            areaStyle: { 
              color: new echarts.graphic.LinearGradient(
                0, 0, 0, 1,
                [
                  { offset: 0, color: 'rgba(64,158,255,.3)' },
                  { offset: 1, color: 'rgba(64,158,255,.05)' }
                ]
              )
            }, 
            data 
          }]
        }
        
        this.chart.setOption(opt)
        
        // 绑定窗口调整大小事件
        window.addEventListener('resize', this.handleResize)
        
      } catch (error) {
        console.error('初始化图表失败:', error)
        this.chartReady = false
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
  overflow-x: hidden;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 32px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #303133;
}

.header .update-time {
  font-size: 14px;
  color: #909399;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.06);
  transition: all .3s;
  border: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100px;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0,0,0,.08);
}

.card-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-right {
  text-align: right;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  flex-shrink: 0;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
  font-weight: 400;
  word-break: keep-all;
}

.card-value {
  font-size: 28px;
  font-weight: 500;
  color: #303133;
  letter-spacing: .5px;
}

.card-unit {
  font-size: 13px;
  color: #c0c4cc;
  margin-left: 4px;
}

/* 图标背景色 */
.card-org .card-icon { background: #409eff }
.card-resource .card-icon { background: #67c23a }
.card-expert .card-icon { background: #e6a23c }
.card-cases .card-icon { background: #f56c6c }
.card-scale .card-icon { background: #909399 }
.card-survey .card-icon { background: #00c0ef }
.card-rxdata .card-icon { background: #3c8dbc }
.card-tech .card-icon { background: #3c8dbc }
.card-activities .card-icon { background: #ff851b }
.card-chat .card-icon { background: #605ca8 }
.card-jobinfo .card-icon { background: #39cccc }
.card-skill .card-icon { background: #01ff70 }
.card-notice .card-icon { background: #dd4b39 }
.card-users .card-icon { background: #111 }
.card-police .card-icon { background: #001f3f }

.chart-box {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.06);
  border: 1px solid #e4e7ed;
  min-height: 420px;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: 15px;
  }
  
  .header h1 {
    font-size: 24px;
  }
  
  .dashboard {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .card {
    padding: 15px;
    min-height: 90px;
  }
  
  .card-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
  
  .card-value {
    font-size: 22px;
  }
  
  .chart-box {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  
  .header h1 {
    font-size: 20px;
  }
}
</style>
<template>
  <div class="container">
    <div class="header">
      <h1>数据监控看板</h1>
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
      <div class="chart-title">每日登录用户趋势</div>
      <div ref="loginTrend" style="width:100%;height:360px"></div>
    </div>

    <div class="footer">
      <p>数据每5分钟自动更新 | 技术支持：数据中心</p>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'

export default {
  name: 'Dashboard',
  filters: {
    num(v) { return v.toLocaleString() }
  },
  data() {
    return {
      now: '',
      metrics: {
        org:      { icon: '🏢', label: '机构数量',   val: 0, unit: '个' },
        resource: { icon: '📚', label: '资源数量',   val: 0, unit: '个' },
        expert:   { icon: '👨‍⚕️', label: '专家数量',   val: 0, unit: '位' },
        cases:    { icon: '📋', label: '戒治案例数', val: 0, unit: '例' },
        scale:    { icon: '📊', label: '量表数',     val: 0, unit: '个' },
        survey:   { icon: '📋', label: '问卷数',     val: 0, unit: '份' },
        rxdata:   { icon: '💊', label: '处方数量',   val: 0, unit: '张' },
        activities:{icon:'🎯',label:'活动数量',     val: 0, unit: '场' },
        chat:     { icon: '💬', label: '留言数量',   val: 0, unit: '条' },
        jobinfo:  { icon: '💼', label: '招聘数量',   val: 0, unit: '个' },
        skill:    { icon: '🛠️', label: '技能数量',   val: 0, unit: '项' },
        notice:   { icon: '📢', label: '公告通知数', val: 0, unit: '条' },
        user:     { icon: '👥', label: '学员数量',   val: 0, unit: '人' },
        police:   { icon: '👮', label: '警官数量',   val: 0, unit: '人' }
      },
      chart: null,
      timer: null
    }
  },
  mounted() {
    this.initMetrics()
    this.initChart()
    this.timer = setInterval(() => this.updateTime(), 1000)
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
    if (this.chart) this.chart.dispose()
  },
  methods: {
    /* 初始化指标 */
    initMetrics() {
      const mock = {
        org: 156, resource: 2340, expert: 89, cases: 1245,
        scale: 45, survey: 678, rxdata: 892, activities: 34,
        chat: 1567, jobinfo: 23, skill: 156, notice: 45,
        user: 3456, police: 234
      }
      Object.keys(mock).forEach(k => {
        this.animateNum(k, 0, mock[k], 800)
      })
      this.updateTime()
    },
    /* 数字动画 */
    animateNum(key, start, end, duration) {
      const step = (end - start) / (duration / 16)
      let cur = start
      const t = setInterval(() => {
        cur += step
        if (cur >= end) { cur = end; clearInterval(t) }
        this.metrics[key].val = Math.floor(cur)
      }, 16)
    },
    /* 更新时间 */
    updateTime() {
      const d = new Date()
      this.now = `${d.getFullYear()}年${String(d.getMonth()+1).padStart(2,'0')}月${String(d.getDate()).padStart(2,'0')}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
    },
    /* 初始化图表 */
    initChart() {
      this.chart = echarts.init(this.$refs.loginTrend)
      const days = []
      const data = []
      for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        days.push(`${d.getMonth()+1}/${d.getDate()}`)
        data.push(Math.floor(2800 + Math.random() * 800))
      }
      const opt = {
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,.9)', borderColor: '#dcdfe6', textStyle: { color: '#606266' } },
        grid: { left: 40, right: 20, top: 20, bottom: 40 },
        xAxis: { type: 'category', boundaryGap: false, data: days, axisLine: { lineStyle: { color: '#e4e7ed' } }, axisLabel: { color: '#909399' } },
        yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#ebeef5' } }, axisLabel: { color: '#909399' } },
        series: [{ name: '登录用户数', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, itemStyle: { color: '#409eff' }, lineStyle: { width: 3, color: '#409eff' }, areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(64,158,255,.3)'},{offset:1,color:'rgba(64,158,255,.05)' }])}, data }]
      }
      this.chart.setOption(opt)
      window.addEventListener('resize', () => this.chart.resize())
    }
  }
}
</script>

<style scoped>
/* 样式与原生版完全一致，直接复制即可 */
.container{max-width:1400px;margin:0 auto}
.header{text-align:center;margin-bottom:30px;padding:20px}
.header h1{font-size:32px;font-weight:500;margin-bottom:10px;color:#303133}
.header .update-time{font-size:14px;color:#909399}
.dashboard{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-bottom:30px}
.card{background:#fff;border-radius:8px;padding:20px 24px;box-shadow:0 2px 12px 0 rgba(0,0,0,.06);transition:all .3s;border:1px solid #e4e7ed;display:flex;align-items:center;justify-content:space-between}
.card:hover{transform:translateY(-2px);box-shadow:0 4px 16px 0 rgba(0,0,0,.08)}
.card-left{display:flex;align-items:center;gap:16px}
.card-right{text-align:right}
.card-icon{width:56px;height:56px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff}
.card-title{font-size:14px;color:#909399;margin-bottom:4px;font-weight:400}
.card-value{font-size:28px;font-weight:500;color:#303133;letter-spacing:.5px}
.card-unit{font-size:13px;color:#c0c4cc;margin-left:4px}
/* 图标背景色 */
.card-org .card-icon{background:#409eff}
.card-resource .card-icon{background:#67c23a}
.card-expert .card-icon{background:#e6a23c}
.card-cases .card-icon{background:#f56c6c}
.card-scale .card-icon{background:#909399}
.card-survey .card-icon{background:#00c0ef}
.card-rxdata .card-icon{background:#3c8dbc}
.card-activities .card-icon{background:#ff851b}
.card-chat .card-icon{background:#605ca8}
.card-jobinfo .card-icon{background:#39cccc}
.card-skill .card-icon{background:#01ff70}
.card-notice .card-icon{background:#dd4b39}
.card-user .card-icon{background:#111}
.card-police .card-icon{background:#001f3f}
.chart-box{background:#fff;border-radius:8px;padding:24px;box-shadow:0 2px 12px 0 rgba(0,0,0,.06);border:1px solid #e4e7ed}
.chart-title{font-size:16px;font-weight:500;margin-bottom:20px;color:#303133}
.footer{text-align:center;padding:20px;color:#909399;font-size:14px}
@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.card{animation:fadeIn .5s ease-out forwards}
.card:nth-child(1){animation-delay:.05s}
.card:nth-child(2){animation-delay:.1s}
.card:nth-child(3){animation-delay:.15s}
.card:nth-child(4){animation-delay:.2s}
.card:nth-child(5){animation-delay:.25s}
.card:nth-child(6){animation-delay:.3s}
.card:nth-child(7){animation-delay:.35s}
.card:nth-child(8){animation-delay:.4s}
.card:nth-child(9){animation-delay:.45s}
.card:nth-child(10){animation-delay:.5s}
.card:nth-child(11){animation-delay:.55s}
.card:nth-child(12){animation-delay:.6s}
.card:nth-child(13){animation-delay:.65s}
.card:nth-child(14){animation-delay:.7s}
</style>
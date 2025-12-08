<template>
    <div class="app-container">
      <!-- 搜索区域 -->
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
        <el-form-item label="活动主题" prop="activityId">
          <!-- button + edit 组合 -->
          <div class="select-btn-group">
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="small"
              @click="openActivityDialog"
            >
              选择活动
            </el-button>
  
            <!-- 已选标签 -->
            <el-tag
              v-if="selectedActivityLabel"
              closable
              type="info"
              size="medium"
              @close="clearSelected"
            >
              {{ selectedActivityLabel }}
            </el-tag>
          </div>
        </el-form-item>
  
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
  
      <!-- 活动总览卡片 -->
      <el-card v-loading="loading" v-if="overviewData.activityId" class="box-card">
        <!-- 标题区域 -->
        <div slot="header" class="clearfix">
          <span class="card-title">{{ overviewData.activityName }}</span>
          <el-tag :type="getApporedType(overviewData.appored)" style="float: right;">
            {{ overviewData.apporedName }}
          </el-tag>
        </div>
  
        <!-- 基本信息区域 -->
        <el-row :gutter="20" class="base-info-row">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">活动代码：</span>
              <span class="info-value">{{ overviewData.activityCode }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">开始时间：</span>
              <span class="info-value">{{ formatDate(overviewData.startTime) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">结束时间：</span>
              <span class="info-value">{{ formatDate(overviewData.endTime) }}</span>
            </div>
          </el-col>
        </el-row>
  
        <el-row :gutter="20" class="base-info-row">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">活动主题：</span>
              <span class="info-value">{{ overviewData.activityName }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">参与技术：</span>
              <el-tag v-for="(tech, index) in overviewData.participatedSubActivityNames"
                     :key="index" size="small" style="margin-right: 5px;">
                {{ tech }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">参与技术数：</span>
              <span class="info-value">{{ overviewData.participatedSubActivityCount }} 种</span>
            </div>
          </el-col>
        </el-row>
  
        <!-- 统计数据卡片 -->
        <el-row :gutter="20" class="stats-row">
          <!-- 报名统计 -->
          <el-col :span="6">
            <el-card shadow="hover" class="stats-card">
              <div class="stats-icon" style="background-color: #409EFF;">
                <i class="el-icon-user"></i>
              </div>
              <div class="stats-content">
                <div class="stats-title">报名人数</div>
                <div class="stats-value">{{ overviewData.signupCount }}</div>
                <div class="stats-desc">已报名参加活动</div>
              </div>
            </el-card>
          </el-col>
  
          <!-- 签到统计 -->
          <el-col :span="6">
            <el-card shadow="hover" class="stats-card">
              <div class="stats-icon" style="background-color: #67C23A;">
                <i class="el-icon-check"></i>
              </div>
              <div class="stats-content">
                <div class="stats-title">签到人数</div>
                <div class="stats-value">{{ overviewData.checkinCount }}</div>
                <div class="stats-desc">已到场签到</div>
              </div>
            </el-card>
          </el-col>
  
          <!-- 资讯统计 -->
          <el-col :span="6">
            <el-card shadow="hover" class="stats-card">
              <div class="stats-icon" style="background-color: #E6A23C;">
                <i class="el-icon-document"></i>
              </div>
              <div class="stats-content">
                <div class="stats-title">现场资讯</div>
                <div class="stats-value">{{ overviewData.liveCount }}</div>
                <div class="stats-desc">已发布资讯</div>
              </div>
            </el-card>
          </el-col>
  
          <!-- 好评率统计 -->
          <el-col :span="6">
            <el-card shadow="hover" class="stats-card">
              <div class="stats-icon" style="background-color: #F56C6C;">
                <i class="el-icon-star-on"></i>
              </div>
              <div class="stats-content">
                <div class="stats-title">好评率</div>
                <div class="stats-value">{{ overviewData.goodRate }}%</div>
                <div class="stats-desc">
                  好评 {{ overviewData.goodReviewCount || 0 }} /
                  中评 {{ overviewData.mediumReviewCount || 0 }} /
                  差评 {{ overviewData.badReviewCount || 0 }}
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
  
        <!-- 子活动列表 -->
        <div class="sub-activity-section">
          <div class="section-title">
            <i class="el-icon-s-operation"></i>
            <span>子活动列表</span>
            <el-tag size="small" type="info" style="margin-left: 10px;">
              共 {{ overviewData.subActivities ? overviewData.subActivities.length : 0 }} 个子活动
            </el-tag>
          </div>
          <el-table :data="overviewData.subActivities" style="width: 100%" border class="sub-activity-table">
            <el-table-column prop="subActivityCode" label="活动代码" width="120" align="center" />
            <el-table-column prop="subActivityName" label="活动名称" min-width="200" />
            <el-table-column prop="subActivityTypeName" label="技术类型" width="120" align="center">
              <template slot-scope="scope">
                <el-tag :type="getTechTypeTag(scope.row.subActivityType)" size="small">
                  {{ scope.row.subActivityTypeName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="200" align="center">
              <template slot-scope="scope">
                {{ formatDate(scope.row.startTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="endTime" label="结束时间" width="200" align="center">
              <template slot-scope="scope">
                {{ formatDate(scope.row.endTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="apporedName" label="审批状态" width="100" align="center">
              <template slot-scope="scope">
                <el-tag :type="getApporedType(scope.row.appored)" size="small">
                  {{ scope.row.apporedName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="ratingName" label="评价等级" width="100" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.rating === '1'" type="success" size="small">好评</el-tag>
                <el-tag v-else-if="scope.row.rating === '2'" type="warning" size="small">中评</el-tag>
                <el-tag v-else-if="scope.row.rating === '3'" type="danger" size="small">差评</el-tag>
                <span v-else>未评价</span>
              </template>
            </el-table-column>
            <el-table-column prop="participated" label="是否参与" width="100" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.participated" type="success" size="small">已参与</el-tag>
                <el-tag v-else type="info" size="small">未参与</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
  
        <!-- 评价分布图表 -->
        <div class="chart-section">
          <div class="section-title">
            <i class="el-icon-pie-chart"></i>
            <span>评价分布</span>
          </div>
          <div class="chart-container">
            <div ref="reviewChart" style="width: 100%; height: 400px;"></div>
            <!-- 图表说明文字 -->
            <div class="chart-summary" v-if="hasReviewData">
              <div class="summary-item">
                <span class="summary-label">总评价数：</span>
                <span class="summary-value">{{ totalReviews }} 条</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">好评率：</span>
                <span class="summary-value" style="color: #67c23a;">{{ overviewData.goodRate || 0 }}%</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">评价分布：</span>
                <span class="summary-distribution">
                  <span class="dist-item good">好评 {{ goodCount }}</span>
                  <span class="dist-item medium">中评 {{ mediumCount }}</span>
                  <span class="dist-item bad">差评 {{ badCount }}</span>
                </span>
              </div>
            </div>
            <div v-else class="no-data-tip">
              <i class="el-icon-warning-outline"></i>
              <span>暂无评价数据</span>
            </div>
          </div>
        </div>
  
        <!-- 进度条显示 -->
        <div class="progress-section">
          <div class="progress-title">活动进度</div>
          <el-progress
            :percentage="calculateProgress()"
            :color="customColors"
            :show-text="false"
            style="margin-bottom: 10px;"
          />
          <div class="progress-info">
            <span>签到率：{{ calculateCheckinRate() }}%</span>
            <span style="float: right;">参与率：{{ calculateParticipationRate() }}%</span>
          </div>
        </div>
  
      </el-card>
  
      <!-- 无数据提示 -->
      <el-empty v-if="!overviewData.activityId && !loading" description="请选择活动查询活动总览信息">
        <el-button type="primary" @click="resetQuery">重新查询</el-button>
      </el-empty>
  
      <!-- 单选活动选择弹窗 -->
      <ActivitySelect
        :visible.sync="dialogVisible"
        select-mode="single"
        @confirm="handleActivitySelected"
        @cancel="dialogVisible = false"
      />
    </div>
  </template>
  
  <script>
  import { getActivityOverview } from '@/api/offline/overview';
  import * as echarts from 'echarts';
  import ActivitySelect from '@/components/ActivitySelect/index.vue';
  
  export default {
    name: 'ActivityOverview',
    components: { ActivitySelect },
    data() {
      return {
        loading: false,
        queryParams: {
          activityId: undefined
        },
        overviewData: {},
        customColors: [
          { color: '#f56c6c', percentage: 20 },
          { color: '#e6a23c', percentage: 40 },
          { color: '#5cb87a', percentage: 60 },
          { color: '#1989fa', percentage: 80 },
          { color: '#6f7ad3', percentage: 100 }
        ],
        chartInstance: null,
        goodCount: 0,
        mediumCount: 0,
        badCount: 0,
        totalReviews: 0,
        dialogVisible: false,
        selectedActivityLabel: ''
      };
    },
    computed: {
      hasReviewData() {
        return this.totalReviews > 0;
      }
    },
    watch: {
      overviewData: {
        deep: true,
        handler(newVal) {
          this.goodCount = newVal.goodReviewCount || 0;
          this.mediumCount = newVal.mediumReviewCount || 0;
          this.badCount = newVal.badReviewCount || 0;
          this.totalReviews = this.goodCount + this.mediumCount + this.badCount;
          this.$nextTick(() => {
            this.initReviewChart();
          });
        }
      }
    },
    methods: {
      /** 打开活动选择弹窗 */
      openActivityDialog() {
        this.dialogVisible = true;
      },
  
      /** 活动选择确认回调（单选） */
      handleActivitySelected(selectedRows) {
        if (!selectedRows || !selectedRows.length) return;
        const activity = selectedRows[0];
        this.queryParams.activityId = activity.activityId;
        this.selectedActivityLabel = activity.activityName;
        this.dialogVisible = false;
        this.handleQuery();
      },
  
      /** 清除已选活动 */
      clearSelected() {
        this.queryParams.activityId = undefined;
        this.selectedActivityLabel = '';
        this.overviewData = {};
        if (this.chartInstance) {
          this.chartInstance.dispose();
          this.chartInstance = null;
        }
      },
  
      /** 查询按钮操作 */
      handleQuery() {
        if (!this.queryParams.activityId) {
          this.$message.warning('请选择活动');
          return;
        }
        this.loading = true;
        getActivityOverview(this.queryParams.activityId)
          .then(response => {
            this.overviewData = response.data;
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
          });
      },
  
      /** 重置按钮操作 */
      resetQuery() {
        this.clearSelected();
      },
  
      /** 根据状态获取标签类型 */
      getApporedType(appored) {
        const apporedMap = {
          '0': 'info',
          '1': '',
          '2': 'warning',
          '3': 'success',
          '4': 'danger',
          '5': ''
        };
        return apporedMap[appored] || '';
      },
  
      /** 根据技术类型获取标签类型 */
      getTechTypeTag(type) {
        const typeMap = {
          '0': 'success',
          '1': 'warning',
          '2': 'info',
          '3': 'primary',
          '9': ''
        };
        return typeMap[type] || '';
      },
  
      /** 格式化日期 */
      formatDate(date) {
        if (!date) return '-';
        const d = new Date(date);
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      },
  
      /** 计算活动进度 */
      calculateProgress() {
        if (!this.overviewData.startTime || !this.overviewData.endTime) {
          return 0;
        }
        const start = new Date(this.overviewData.startTime).getTime();
        const end = new Date(this.overviewData.endTime).getTime();
        const now = new Date().getTime();
  
        if (now < start) return 0;
        if (now > end) return 100;
  
        return Math.round(((now - start) / (end - start)) * 100);
      },
  
      /** 计算签到率 */
      calculateCheckinRate() {
        if (!this.overviewData.signupCount || this.overviewData.signupCount === 0) {
          return 0;
        }
        return Math.round((this.overviewData.checkinCount / this.overviewData.signupCount) * 100);
      },
  
      /** 计算参与率 */
      calculateParticipationRate() {
        if (!this.overviewData.subActivities || this.overviewData.subActivities.length === 0) {
          return 0;
        }
        const participatedCount = this.overviewData.subActivities.filter(item => item.participated).length;
        return Math.round((participatedCount / this.overviewData.subActivities.length) * 100);
      },
  
      /** 初始化评价图表 */
      initReviewChart() {
        if (!this.$refs.reviewChart) return;
  
        if (this.chartInstance) {
          this.chartInstance.dispose();
        }
  
        this.chartInstance = echarts.init(this.$refs.reviewChart);
  
        if (!this.hasReviewData) {
          this.chartInstance.setOption({
            title: {
              text: '暂无评价数据',
              left: 'center',
              top: 'center',
              textStyle: {
                color: '#999',
                fontSize: 14,
                fontWeight: 'normal'
              }
            }
          });
          return;
        }
  
        const option = {
          title: {
            text: '评价分布',
            left: 'center',
            textStyle: {
              color: '#333',
              fontSize: 16,
              fontWeight: 'bold'
            },
            subtext: `总评价数: ${this.totalReviews}条`,
            subtextStyle: {
              color: '#666',
              fontSize: 12
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: function(params) {
              return `${params.name}<br/>
                      数量: ${params.value}<br/>
                      占比: ${params.percent}%`;
            }
          },
          legend: {
            orient: 'horizontal',
            bottom: '10',
            data: ['好评', '中评', '差评']
          },
          series: [
            {
              name: '评价分布',
              type: 'pie',
              radius: ['40%', '60%'],
              center: ['50%', '45%'],
              avoidLabelOverlap: true,
              itemStyle: {
                borderRadius: 8,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: true,
                formatter: '{b}: {c} ({d}%)',
                fontSize: 12,
                color: '#333'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '14',
                  fontWeight: 'bold'
                },
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              },
              labelLine: {
                show: true,
                length: 10,
                length2: 20
              },
              data: [
                {
                  value: this.goodCount,
                  name: '好评',
                  itemStyle: {
                    color: '#67c23a'
                  }
                },
                {
                  value: this.mediumCount,
                  name: '中评',
                  itemStyle: {
                    color: '#e6a23c'
                  }
                },
                {
                  value: this.badCount,
                  name: '差评',
                  itemStyle: {
                    color: '#f56c6c'
                  }
                }
              ]
            }
          ]
        };
  
        this.chartInstance.setOption(option);
  
        window.addEventListener('resize', this.handleChartResize);
      },
  
      /** 处理图表大小调整 */
      handleChartResize() {
        if (this.chartInstance) {
          this.chartInstance.resize();
        }
      }
    },
  
    beforeDestroy() {
      if (this.chartInstance) {
        this.chartInstance.dispose();
        this.chartInstance = null;
      }
      window.removeEventListener('resize', this.handleChartResize);
    }
  };
  </script>
  
  <style scoped>
  .app-container {
    padding: 20px;
  }
  
  /* 选择按钮组 */
  .select-btn-group {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  
  .box-card {
    margin-top: 20px;
  }
  
  .card-title {
    font-size: 20px;
    font-weight: bold;
  }
  
  .base-info-row {
    margin-bottom: 15px;
  }
  
  .info-item {
    line-height: 40px;
  }
  
  .info-label {
    color: #666;
    font-weight: bold;
  }
  
  .info-value {
    color: #333;
    margin-left: 5px;
  }
  
  /* 统计数据卡片样式 */
  .stats-row {
    margin: 20px 0;
  }
  
  .stats-card {
    position: relative;
    overflow: hidden;
    height: 120px;
  }
  
  .stats-icon {
    position: absolute;
    top: -20px;
    right: -20px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    color: white;
    opacity: 0.8;
  }
  
  .stats-content {
    padding-top: 20px;
  }
  
  .stats-title {
    font-size: 14px;
    color: #999;
    margin-bottom: 5px;
  }
  
  .stats-value {
    font-size: 28px;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
  }
  
  .stats-desc {
    font-size: 12px;
    color: #999;
  }
  
  /* 子活动区域样式 */
  .sub-activity-section {
    margin-top: 30px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 4px;
    border-left: 4px solid #409EFF;
  }
  
  .section-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
    display: flex;
    align-items: center;
  }
  
  .section-title i {
    margin-right: 8px;
    color: #409EFF;
  }
  
  .sub-activity-table {
    margin-top: 10px;
  }
  
  /* 图表区域样式 */
  .chart-section {
    margin-top: 30px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 4px;
    border-left: 4px solid #67C23A;
  }
  
  .chart-container {
    position: relative;
    min-height: 450px;
  }
  
  /* 图表说明文字 */
  .chart-summary {
    margin-top: 20px;
    padding: 15px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
  }
  
  .summary-item {
    margin-bottom: 10px;
    font-size: 14px;
  }
  
  .summary-item:last-child {
    margin-bottom: 0;
  }
  
  .summary-label {
    color: #666;
    font-weight: bold;
    min-width: 80px;
    display: inline-block;
  }
  
  .summary-value {
    color: #333;
    font-weight: 500;
  }
  
  .summary-distribution {
    display: inline-flex;
    gap: 20px;
  }
  
  .dist-item {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
  
  .dist-item.good {
    background-color: rgba(103, 194, 58, 0.1);
    color: #67c23a;
  }
  
  .dist-item.medium {
    background-color: rgba(230, 162, 60, 0.1);
    color: #e6a23c;
  }
  
  .dist-item.bad {
    background-color: rgba(245, 108, 108, 0.1);
    color: #f56c6c;
  }
  
  /* 无数据提示 */
  .no-data-tip {
    text-align: center;
    padding: 50px 0;
    color: #999;
  }
  
  .no-data-tip i {
    font-size: 48px;
    margin-bottom: 10px;
    display: block;
  }
  
  /* 进度条区域样式 */
  .progress-section {
    margin-top: 30px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
    border-left: 4px solid #E6A23C;
  }
  
  .progress-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
  }
  
  .progress-info {
    font-size: 14px;
    color: #666;
  }
  
  /* 响应式调整 */
  @media screen and (max-width: 1200px) {
    .stats-card {
      height: 140px;
    }
  
    .stats-icon {
      width: 60px;
      height: 60px;
      font-size: 28px;
    }
  
    .summary-distribution {
      flex-direction: column;
      gap: 8px;
    }
  }
  
  @media screen and (max-width: 768px) {
    .base-info-row .el-col {
      margin-bottom: 10px;
    }
  
    .stats-row .el-col {
      margin-bottom: 15px;
    }
  
    .stats-card {
      height: 120px;
    }
  
    .chart-summary {
      padding: 10px;
    }
  
    .summary-item {
      font-size: 13px;
    }
  
    .section-title {
      font-size: 16px;
    }
  
    .sub-activity-section,
    .chart-section,
    .progress-section {
      padding: 15px;
    }
  }
  </style>
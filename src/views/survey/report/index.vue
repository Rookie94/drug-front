<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form :model="queryParams" inline>
      <el-form-item label="问卷名称">
        <el-input 
          v-model="queryParams.surveyName" 
          placeholder="请选择问卷"
          readonly
          clearable
          @clear="clearSelectedSurvey"
          style="width: 300px"
        >
          <template #append>
            <el-button 
              icon="el-icon-search" 
              @click="openSurveySelect"
              title="选择问卷"
            />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="提交时间">
        <el-date-picker
          v-model="queryParams.startSubmitTime"
          type="datetime"
          placeholder="选择开始时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 200px"
          :picker-options="startDatePickerOptions"
        />
      </el-form-item>
      <el-form-item label="到">
        <el-date-picker
          v-model="queryParams.endSubmitTime"
          type="datetime"
          placeholder="选择结束时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 200px"
          :picker-options="endDatePickerOptions"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">生成报告</el-button>
        <el-button icon="el-icon-download" @click="exportExcel">导出Excel</el-button>
        <el-button icon="el-icon-printer" @click="printReport">打印报告</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 统计报告区域 -->
    <div v-if="reportData.length > 0" class="report-container" id="reportContent">
      <div class="report-header">
        <h2>{{ queryParams.surveyName }} - 统计报告</h2>
        <div class="report-time-range">
          统计时间范围: {{ queryParams.startSubmitTime || '未设置' }} 至 {{ queryParams.endSubmitTime || '未设置' }}
        </div>
      </div>

      <!-- 报告内容 -->
      <div class="report-grid">
        <div v-for="(question, index) in reportData" :key="index" class="question-card">
          <div class="question-title">{{ index + 1 }}. {{ question.title }}</div>
          
          <div class="options-grid">
            <div class="grid-header">
              <div class="grid-cell">选项</div>
              <div class="grid-cell">人数</div>
              <div class="grid-cell">比例</div>
            </div>
            
            <div 
              v-for="(option, optIndex) in question.options" 
              :key="optIndex" 
              class="grid-row"
            >
              <div class="grid-cell option-text">{{ option.optionText }}</div>
              <div class="grid-cell option-num">{{ option.num }}</div>
              <div class="grid-cell option-ratio">
                <div class="ratio-container">
                  <div class="ratio-text">{{ option.ratio }}</div>
                  <div class="ratio-bar">
                    <div 
                      class="ratio-progress" 
                      :style="{ width: option.ratio }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-else-if="hasSearched" class="no-data">
      <el-empty description="暂无统计报告数据，请选择问卷并设置时间范围后生成报告" />
    </div>

    <!-- 问卷选择弹窗 -->
    <el-dialog
      title="选择问卷"
      :visible.sync="surveySelectVisible"
      width="60%"
      append-to-body
    >
      <el-table 
        :data="surveyList" 
        @current-change="handleSurveySelectionChange"
        highlight-current-row
        v-loading="surveyLoading"
      >
        <!-- 新增单选radio列 -->
        <el-table-column label="选择" width="60" align="center">
          <template slot-scope="scope">
            <el-radio 
              v-model="selectedSurveyId"
              :label="scope.row.surveyId"
            >
              {{ '' }} <!-- 空字符串覆盖label显示 -->
            </el-radio>
          </template>
        </el-table-column>
        
        <el-table-column prop="surveyId" label="问卷ID" width="100" v-if="false" />
        <el-table-column prop="surveyName" label="问卷名称" />
        <el-table-column prop="surveyDesc" label="问卷描述" />
        <el-table-column prop="endTime" label="截止时间" width="180"  />
        <el-table-column prop="createTime" label="创建时间" width="180" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="surveySelectVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSurveySelect">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { listSurvey} from "@/api/survey/report";

// 心理治疗满意度调查表模拟数据
const mockReportData = [
  {
    title: "您对本次心理治疗的整体满意度如何？",
    options: [
      { optionText: "A. 非常满意", num: 245, ratio: "61.25%" },
      { optionText: "B. 满意", num: 120, ratio: "30.00%" },
      { optionText: "C. 一般", num: 25, ratio: "6.25%" },
      { optionText: "D. 不满意", num: 8, ratio: "2.00%" },
      { optionText: "E. 非常不满意", num: 2, ratio: "0.50%" }
    ]
  },
  {
    title: "您认为治疗师的专业水平如何？",
    options: [
      { optionText: "A. 非常专业", num: 280, ratio: "70.00%" },
      { optionText: "B. 比较专业", num: 95, ratio: "23.75%" },
      { optionText: "C. 一般", num: 20, ratio: "5.00%" },
      { optionText: "D. 不太专业", num: 5, ratio: "1.25%" }
    ]
  },
  {
    title: "治疗师是否能够理解您的感受和需求？",
    options: [
      { optionText: "A. 完全能够理解", num: 210, ratio: "52.50%" },
      { optionText: "B. 大部分能够理解", num: 150, ratio: "37.50%" },
      { optionText: "C. 一般", num: 30, ratio: "7.50%" },
      { optionText: "D. 不太能够理解", num: 10, ratio: "2.50%" }
    ]
  },
  {
    title: "您认为治疗环境是否舒适？",
    options: [
      { optionText: "A. 非常舒适", num: 260, ratio: "65.00%" },
      { optionText: "B. 比较舒适", num: 110, ratio: "27.50%" },
      { optionText: "C. 一般", num: 25, ratio: "6.25%" },
      { optionText: "D. 不太舒适", num: 5, ratio: "1.25%" }
    ]
  },
  {
    title: "您觉得治疗过程是否有帮助？",
    options: [
      { optionText: "A. 非常有帮助", num: 230, ratio: "57.50%" },
      { optionText: "B. 有帮助", num: 135, ratio: "33.75%" },
      { optionText: "C. 一般", num: 30, ratio: "7.50%" },
      { optionText: "D. 没有帮助", num: 5, ratio: "1.25%" }
    ]
  },
  {
    title: "您是否愿意向他人推荐我们的心理治疗服务？",
    options: [
      { optionText: "A. 非常愿意", num: 250, ratio: "62.50%" },
      { optionText: "B. 愿意", num: 120, ratio: "30.00%" },
      { optionText: "C. 不确定", num: 25, ratio: "6.25%" },
      { optionText: "D. 不愿意", num: 5, ratio: "1.25%" }
    ]
  },
  {
    title: "您认为治疗费用是否合理？",
    options: [
      { optionText: "A. 非常合理", num: 180, ratio: "45.00%" },
      { optionText: "B. 合理", num: 160, ratio: "40.00%" },
      { optionText: "C. 一般", num: 45, ratio: "11.25%" },
      { optionText: "D. 不合理", num: 15, ratio: "3.75%" }
    ]
  },
  {
    title: "您对预约流程的满意度如何？",
    options: [
      { optionText: "A. 非常满意", num: 220, ratio: "55.00%" },
      { optionText: "B. 满意", num: 140, ratio: "35.00%" },
      { optionText: "C. 一般", num: 30, ratio: "7.50%" },
      { optionText: "D. 不满意", num: 10, ratio: "2.50%" }
    ]
  }
];

export default {
  name: 'SurveyReport',
  data() {
    return {
      // 查询参数
      queryParams: {
        surveyName: null,
        surveyId: null,
        startSubmitTime: null,
        endSubmitTime: null
      },
      // 日期选择器选项
      startDatePickerOptions: {
        disabledDate: (time) => {
          if (this.queryParams.endSubmitTime) {
            return time.getTime() > new Date(this.queryParams.endSubmitTime).getTime();
          }
          return false;
        }
      },
      endDatePickerOptions: {
        disabledDate: (time) => {
          if (this.queryParams.startSubmitTime) {
            return time.getTime() < new Date(this.queryParams.startSubmitTime).getTime();
          }
          return false;
        }
      },
      // 报告数据
      reportData: [],
      // 是否已执行过搜索
      hasSearched: false,
      // 问卷选择相关
      surveySelectVisible: false,
      //问卷列表
      surveyList: [],
      selectedSurvey: null,
      surveyLoading: false,
      // 新增：radio选中的问卷ID
      selectedSurveyId: null
    };
  },
  created() {
      this.getSurveyList();
    },
  methods: {
    getSurveyList() {
      this.loading = true;
      listSurvey().then(response => {
        this.surveyList = response.rows;
        this.loading = false;
      });
    },
    // 打开问卷选择弹窗
    openSurveySelect() {
      this.surveySelectVisible = true;
      this.selectedSurvey = null;
      this.selectedSurveyId = null; // 清空radio选择
    },
    
    // 问卷选择变化（单选）
    handleSurveySelectionChange(currentRow) {
      if (currentRow) {
        this.selectedSurvey = currentRow;
        this.selectedSurveyId = currentRow.surveyId; // 同步radio选中状态
      }
    },
    
    // 确认选择问卷
    confirmSurveySelect() {
      if (this.selectedSurveyId) {
        const survey = this.surveyList.find(item => item.surveyId === this.selectedSurveyId);
        if (survey) {
          this.queryParams.surveyId = survey.surveyId;
          this.queryParams.surveyName = survey.surveyName;
          this.surveySelectVisible = false;
          this.$message.success(`已选择问卷: ${survey.surveyName}`);
        }
      } else {
        this.$message.warning('请选择一个问卷');
      }
    },
    
    // 清空选中的问卷
    clearSelectedSurvey() {
      this.queryParams.surveyId = null;
      this.queryParams.surveyName = null;
      this.selectedSurvey = null;
      this.selectedSurveyId = null; // 清空radio选中状态
      this.reportData = [];
      this.hasSearched = false;
    },
    // 查询/生成报告
    handleQuery() {
      // 验证必填项
      if (!this.queryParams.surveyId) {
        this.$message.warning('请选择问卷');
        return;
      }
      
      // 验证时间范围
      if (this.queryParams.startSubmitTime && this.queryParams.endSubmitTime) {
        const startTime = new Date(this.queryParams.startSubmitTime).getTime();
        const endTime = new Date(this.queryParams.endSubmitTime).getTime();
        
        if (startTime > endTime) {
          this.$message.error('开始时间不能大于结束时间');
          return;
        }
      }
      
      // 显示加载状态
      const loadingInstance = this.$loading({
        lock: true,
        text: '正在生成统计报告...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      
      // 模拟API请求延迟
      setTimeout(() => {
        // 使用模拟数据
        this.reportData = mockReportData;
        this.hasSearched = true;
        
        // 关闭加载状态
        loadingInstance.close();
        
        this.$message.success('统计报告生成成功');
      }, 1000);
    },
    
    // 重置查询条件
    resetQuery() {
      this.queryParams = {
        surveyName: null,
        surveyId: null,
        startSubmitTime: null,
        endSubmitTime: null
      };
      this.reportData = [];
      this.hasSearched = false;
    },
    
    // 导出Excel
    exportExcel() {
      if (this.reportData.length === 0) {
        this.$message.warning('请先生成报告');
        return;
      }
      
      // 创建HTML表格内容
      let htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40 ">
        <head>
          <meta charset="UTF-8">
          <title>${this.queryParams.surveyName} - 统计报告</title>
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>${this.queryParams.surveyName}</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            table {
              border-collapse: collapse;
              width: 100%;
              font-family: Arial, sans-serif;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .question-title {
              font-weight: bold;
              background-color: #e6f7ff;
              padding: 10px;
              margin-top: 20px;
            }
            .center {
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>${this.queryParams.surveyName} - 统计报告</h1>
          <p>统计时间范围: ${this.queryParams.startSubmitTime || '未设置'} 至 ${this.queryParams.endSubmitTime || '未设置'}</p>
          <p>导出时间: ${new Date().toLocaleString()}</p>
      `;
      
      // 添加每个问题的表格
      this.reportData.forEach((question, index) => {
        htmlContent += `
          <div class="question-title">${index + 1}. ${question.title}</div>
          <table>
            <thead>
              <tr>
                <th>选项</th>
                <th>人数</th>
                <th>比例</th>
              </tr>
            </thead>
            <tbody>
        `;
        
        question.options.forEach(option => {
          htmlContent += `
            <tr>
              <td>${option.optionText}</td>
              <td class="center">${option.num}</td>
              <td>${option.ratio}</td>
            </tr>
          `;
        });
        
        htmlContent += `
            </tbody>
          </table>
        `;
      });
      
      htmlContent += `
          </body>
        </html>
      `;
      
      // 创建Blob对象并下载
      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.queryParams.surveyName}_${new Date().getTime()}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.$message.success('Excel导出成功');
    },
    
    // 打印报告
    printReport() {
      if (this.reportData.length === 0) {
        this.$message.warning('请先生成报告');
        return;
      }
      
      // 创建打印内容
      const printContent = document.createElement('div');
      printContent.innerHTML = this.generatePrintHTML();
      
      // 创建打印窗口
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${this.queryParams.surveyName} - 统计报告</title>
          <meta charset="utf-8">
          <style>
            @media print {
              @page {
                size: A4;
                margin: 1cm;
              }
              body {
                width: 100%;
                margin: 0;
                padding: 0;
                font-family: "Microsoft YaHei", Arial, sans-serif;
                font-size: 12pt;
                color: #000;
                line-height: 1.4;
              }
              .print-container {
                width: 100%;
                max-width: 100%;
                margin: 0;
                padding: 0;
              }
              .print-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #333;
              }
              .print-header h1 {
                margin: 0 0 10px 0;
                font-size: 18pt;
                color: #000;
              }
              .print-time {
                font-size: 11pt;
                color: #666;
                margin-bottom: 5px;
              }
              .print-section {
                margin-bottom: 25px;
                page-break-inside: avoid;
              }
              .print-question {
                font-weight: bold;
                margin-bottom: 10px;
                font-size: 13pt;
                color: #000;
              }
              .print-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
              }
              .print-table th,
              .print-table td {
                border: 1px solid #000;
                padding: 8px 10px;
                text-align: left;
                font-size: 11pt;
              }
              .print-table th {
                background-color: #f5f5f5;
                font-weight: bold;
                text-align: center;
              }
              .print-table td.center {
                text-align: center;
              }
              .ratio-container {
                display: flex;
                align-items: center;
                gap: 10px;
              }
              .ratio-text {
                min-width: 50px;
                text-align: right;
                font-weight: bold;
              }
              .ratio-bar {
                flex: 1;
                height: 12px;
                background-color: #f0f0f0;
                border: 1px solid #ccc;
                border-radius: 2px;
                overflow: hidden;
              }
              .ratio-progress {
                height: 100%;
                background-color: #4CAF50;
              }
              .page-break {
                page-break-before: always;
              }
            }
            
            /* 屏幕预览样式 */
            body {
              font-family: "Microsoft YaHei", Arial, sans-serif;
              margin: 20px;
              background: #fff;
            }
            .print-container {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              padding: 15mm;
              box-sizing: border-box;
              background: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #333;
            }
            .print-header h1 {
              margin: 0 0 10px 0;
              font-size: 22px;
              color: #000;
            }
            .print-time {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }
            .print-section {
              margin-bottom: 25px;
            }
            .print-question {
              font-weight: bold;
              margin-bottom: 10px;
              font-size: 16px;
              color: #000;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            .print-table th,
            .print-table td {
              border: 1px solid #000;
              padding: 8px 10px;
              text-align: left;
              font-size: 14px;
            }
            .print-table th {
              background-color: #f5f5f5;
              font-weight: bold;
              text-align: center;
            }
            .print-table td.center {
              text-align: center;
            }
            .ratio-container {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .ratio-text {
              min-width: 50px;
              text-align: right;
              font-weight: bold;
            }
            .ratio-bar {
              flex: 1;
              height: 12px;
              background-color: #f0f0f0;
              border: 1px solid #ccc;
              border-radius: 2px;
              overflow: hidden;
            }
            .ratio-progress {
              height: 100%;
              background-color: #4CAF50;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // 等待内容加载完成后打印
      setTimeout(() => {
        printWindow.print();
        // 打印后可选是否关闭窗口
        // printWindow.close();
      }, 500);
    },
    
    // 生成打印HTML内容
    generatePrintHTML() {
      let html = `
        <div class="print-container">
          <div class="print-header">
            <h1>${this.queryParams.surveyName} - 统计报告</h1>
            <div class="print-time">统计时间范围: ${this.queryParams.startSubmitTime || '未设置'} 至 ${this.queryParams.endSubmitTime || '未设置'}</div>
            <div class="print-time">生成时间: ${new Date().toLocaleString()}</div>
          </div>
      `;
      
      // 添加每个问题的内容
      this.reportData.forEach((question, index) => {
        // 每4个问题后添加分页符（根据需要调整）
        if (index > 0 && index % 4 === 0) {
          html += `<div class="page-break"></div>`;
        }
        
        html += `
          <div class="print-section">
            <div class="print-question">${index + 1}. ${question.title}</div>
            <table class="print-table">
              <thead>
                <tr>
                  <th style="width: 50%">选项</th>
                  <th style="width: 15%">人数</th>
                  <th style="width: 35%">比例</th>
                </tr>
              </thead>
              <tbody>
        `;
        
        question.options.forEach(option => {
          html += `
            <tr>
              <td>${option.optionText}</td>
              <td class="center">${option.num}</td>
              <td>
                <div class="ratio-container">
                  <div class="ratio-text">${option.ratio}</div>
                  <div class="ratio-bar">
                    <div class="ratio-progress" style="width: ${option.ratio}"></div>
                  </div>
                </div>
              </td>
            </tr>
          `;
        });
        
        html += `
              </tbody>
            </table>
          </div>
        `;
      });
      
      html += `</div>`;
      return html;
    }
  }
};
</script>

<style scoped>
.app-container {
  padding: 20px;
}

/* 报告容器样式 */
.report-container {
  margin-top: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 24px;
  border: 1px solid #e6e8eb;
}

.report-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e6e8eb;
}

.report-header h2 {
  margin: 0 0 12px 0;
  color: #1f2d3d;
  font-size: 22px;
  font-weight: 600;
}

.report-time-range {
  color: #5e6d82;
  font-size: 14px;
  background-color: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  display: inline-block;
}

/* 网格布局 */
.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
}

.question-card {
  border: 1px solid #e6e8eb;
  border-radius: 6px;
  padding: 16px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.question-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.question-title {
  font-weight: 600;
  margin-bottom: 16px;
  color: #2c3e50;
  font-size: 15px;
  line-height: 1.5;
}

/* 选项网格样式 */
.options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  border: 1px solid #e6e8eb;
  border-radius: 4px;
  overflow: hidden;
}

.grid-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  background-color: #f5f7fa;
  font-weight: 600;
  color: #606266;
}

.grid-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  border-top: 1px solid #e6e8eb;
}

.grid-cell {
  padding: 12px 16px;
  display: flex;
  align-items: center;
}

.grid-header .grid-cell {
  padding: 14px 16px;
}

.option-text {
  color: #1f2d3d;
  font-weight: 500;
}

.option-num {
  justify-content: center;
  color: #409EFF;
  font-weight: 600;
}

.option-ratio {
  justify-content: flex-end;
}

.ratio-container {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.ratio-text {
  min-width: 50px;
  text-align: right;
  font-weight: 600;
  color: #67C23A;
}

.ratio-bar {
  flex: 1;
  height: 8px;
  background-color: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.ratio-progress {
  height: 100%;
  background: linear-gradient(90deg, #67C23A, #85CE61);
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* 无数据样式 */
.no-data {
  margin-top: 50px;
  text-align: center;
}

/* 调整查询表单样式 */
.el-form-item {
  margin-bottom: 18px;
  margin-right: 20px;
}

/* 调整输入框组件的样式 */
:deep(.el-input-group__append) {
  background-color: #409EFF !important;
  border-color: #409EFF !important;
  color: white !important;
  cursor: pointer;
  padding: 0 12px;
}

:deep(.el-input-group__append:hover) {
  background-color: #66b1ff !important;
  border-color: #66b1ff !important;
}

:deep(.el-input-group__append .el-button) {
  padding: 0;
  border: none;
  background: transparent;
  color: white;
}

:deep(.el-input-group__append .el-button:hover) {
  background: transparent;
}

/* 响应式布局调整 */
@media (max-width: 1200px) {
  .report-grid {
    grid-template-columns: 1fr;
  }
  
  .el-form-item {
    margin-right: 10px;
  }
  
  :deep(.el-input-group__append) {
    padding: 0 10px;
  }
}

@media (max-width: 768px) {
  .grid-header,
  .grid-row {
    grid-template-columns: 1fr;
  }
  
  .grid-header {
    display: none;
  }
  
  .grid-row {
    border: 1px solid #e6e8eb;
    border-radius: 4px;
    margin-bottom: 8px;
    padding: 12px;
  }
  
  .grid-cell {
    padding: 4px 0;
    justify-content: flex-start;
  }
  
  .option-ratio {
    justify-content: flex-start;
  }
  
  .ratio-container {
    width: 100%;
  }
}
</style>
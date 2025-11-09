<template>
  <el-dialog
    title="问卷填报详情"
    :visible.sync="dialogVisible"
    width="50%"
    :before-close="handleClose"
    class="result-dialog"
  >
    <!-- 顶部操作区 - 调整位置避免遮挡关闭按钮 -->
    <div class="top-operations">
      <el-button 
        icon="el-icon-download" 
        size="mini" 
        class="btn-export"
        @click="exportHtml"
      >
        导出
      </el-button>
      <el-button 
        icon="el-icon-printer" 
        size="mini" 
        class="btn-print"
        @click="printA4"
      >
        打印
      </el-button>
    </div>

    <!-- 问卷基本信息 -->
    <div class="survey-header">
      <h2>{{ surveyData.surveyName }}</h2>
      <div class="survey-info">
        <el-descriptions :column="2" border size="small" class="custom-descriptions">
          <el-descriptions-item label="填报编号" class="highlight-item">
            <span class="result-no">{{ resultData.resultNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ parseTime(resultData.commitTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="提交人">
            {{ resultData.nickName }}
          </el-descriptions-item>
          <el-descriptions-item label="所属部门">
            {{ resultData.deptName }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <!-- 问题列表 -->
    <div class="questions-container" ref="surveyContent">
      <!-- 问题列表内容保持不变 -->
      <div 
        v-for="question in sortedQuestions" 
        :key="question.questionId"
        class="question-item"
      >
        <div class="question-header">
          <span class="question-no">{{ question.questionNo }}.</span>
          <span class="question-name">{{ question.questionName }}</span>
          <el-tag 
            v-if="question.validateRule === 'notEmpty'" 
            size="mini" 
            type="danger"
          >
            必填
          </el-tag>
        </div>

        <div class="answer-display">
          <!-- 答案显示区域内容保持不变 -->
          <div v-if="question.questionType === 'radio'" class="radio-answer">
            <el-radio-group :value="getAnswerValue(question.questionId)" disabled>
              <div 
                v-for="option in question.options" 
                :key="option.optionId"
                :class="['option-item', { 'selected': isOptionSelected(question.questionId, option.optionId) }]"
              >
                <el-radio :label="option.optionId">
                  {{ option.optionText }}
                </el-radio>
              </div>
            </el-radio-group>
          </div>

          <div v-if="question.questionType === 'checkbox'" class="checkbox-answer">
            <el-checkbox-group :value="getAnswerValue(question.questionId)" disabled>
              <div 
                v-for="option in question.options" 
                :key="option.optionId"
                :class="['option-item', { 'selected': isOptionSelected(question.questionId, option.optionId) }]"
              >
                <el-checkbox :label="option.optionId">
                  {{ option.optionText }}
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </div>

          <div v-if="question.questionType === 'select'" class="select-answer">
            <el-select 
              :value="getAnswerValue(question.questionId)" 
              disabled 
              style="width: 100%"
            >
              <el-option
                v-for="option in question.options"
                :key="option.optionId"
                :label="option.optionText"
                :value="option.optionId"
              />
            </el-select>
          </div>

          <div v-if="question.questionType === 'input'" class="input-answer">
            <el-input 
              :value="getAnswerValue(question.questionId)" 
              disabled
              placeholder="未填写"
            />
          </div>

          <div v-if="['radio', 'checkbox', 'select'].includes(question.questionType)" class="selected-text">
            <strong>已选择：</strong>
            <span class="selected-options">
              {{ getSelectedOptionText(question) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
    </div>
  </el-dialog>
</template>

<script>
// 脚本部分保持不变
import { parseTime } from '@/utils/ruoyi'

export default {
  name: 'ResultDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    surveyData: {
      type: Object,
      default: () => ({})
    },
    resultData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  computed: {
    sortedQuestions() {
      if (!this.surveyData.questions) return []
      return [...this.surveyData.questions].sort((a, b) => a.questionSort - b.questionSort)
    },
    parsedAnswers() {
      if (!this.resultData.thinJsonResult) return {}
      try {
        return typeof this.resultData.thinJsonResult === 'string' 
          ? JSON.parse(this.resultData.thinJsonResult)
          : this.resultData.thinJsonResult
      } catch (e) {
        console.error('解析答案数据失败:', e)
        return {}
      }
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(newVal) {
        this.dialogVisible = newVal
      }
    },
    dialogVisible(newVal) {
      this.$emit('update:visible', newVal)
    }
  },
  methods: {
    parseTime(time) {
      if (!time) return ''
      return parseTime(time)
    },
    
    handleClose() {
      this.dialogVisible = false
      this.$emit('close')
    },

    getAnswerValue(questionId) {
      return this.parsedAnswers[questionId]
    },

    isOptionSelected(questionId, optionId) {
      const answer = this.getAnswerValue(questionId)
      if (Array.isArray(answer)) {
        return answer.includes(optionId)
      }
      return answer === optionId
    },

    getSelectedOptionText(question) {
      const answer = this.getAnswerValue(question.questionId)
      
      if (!answer) return '未选择'

      if (question.questionType === 'checkbox' && Array.isArray(answer)) {
        const selectedOptions = question.options.filter(opt => 
          answer.includes(opt.optionId)
        )
        return selectedOptions.map(opt => opt.optionText).join('、')
      } else {
        const selectedOption = question.options.find(opt => 
          opt.optionId === answer
        )
        return selectedOption ? selectedOption.optionText : '未找到对应选项'
      }
    },

    exportHtml() {
      const headerHtml = document.querySelector('.survey-header').outerHTML
      const contentHtml = this.$refs.surveyContent.outerHTML
      
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${this.surveyData.surveyName} - 填报详情</title>
          <style>
            body { font-family: "Microsoft YaHei", sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .survey-header h2 { text-align: center; color: #303133; margin: 20px 0; }
            .custom-descriptions { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .custom-descriptions th, .custom-descriptions td { border: 1px solid #e6e6e6; padding: 10px; text-align: left; }
            .custom-descriptions th { font-weight: 600; color: #606266; }
            .highlight-item th { color: #409EFF; font-weight: 700; }
            .highlight-item td { color: #409EFF; font-weight: 700; }
            .question-item { margin-bottom: 24px; padding: 16px; border: 1px solid #e6e6e6; border-radius: 4px; background: #fafafa; }
            .question-header { display: flex; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
            .question-no { font-weight: bold; margin-right: 8px; color: #409EFF; }
            .question-name { flex: 1; font-weight: bold; }
            .answer-display { margin-top: 12px; }
            .option-item { margin-bottom: 8px; padding: 8px 12px; border-radius: 4px; }
            .option-item.selected { background-color: #ecf5ff; border: 1px solid #409EFF; }
            .selected-text { margin-top: 12px; padding: 8px 12px; background-color: #f0f9ff; border-radius: 4px; border-left: 4px solid #409EFF; }
            .selected-options { color: #409EFF; font-weight: 500; }
            .el-tag { display: inline-block; padding: 0 4px; background: #f56c6c; color: white; border-radius: 2px; font-size: 12px; margin-left: 8px; }
          </style>
        </head>
        <body>
          ${headerHtml}
          ${contentHtml}
        </body>
        </html>
      `
      
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${this.surveyData.surveyName}_${this.resultData.resultNo}_详情.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      this.$message.success('HTML导出成功')
    },

    printA4() {
      const printWindow = window.open('', '_blank')
      const headerHtml = document.querySelector('.survey-header').outerHTML
      const contentHtml = this.$refs.surveyContent.outerHTML
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <title>${this.surveyData.surveyName} - 打印预览</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 2cm;
              }
              body { 
                font-family: "Microsoft YaHei", sans-serif; 
                line-height: 1.8; 
                font-size: 14px;
              }
              .no-print { display: none !important; }
            }
            body { font-family: "Microsoft YaHei", sans-serif; line-height: 1.8; color: #333; }
            .survey-header { margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #eee; }
            .survey-header h2 { text-align: center; color: #303133; margin: 20px 0; }
            .custom-descriptions { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .custom-descriptions th, .custom-descriptions td { border: 1px solid #e6e6e6; padding: 10px; text-align: left; }
            .custom-descriptions th { font-weight: 600; color: #606266; }
            .highlight-item th { color: #409EFF; font-weight: 700; }
            .highlight-item td { color: #409EFF; font-weight: 700; }
            .question-item { margin-bottom: 24px; padding: 16px; border: 1px solid #e6e6e6; border-radius: 4px; background: #fafafa; }
            .question-header { display: flex; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
            .question-no { font-weight: bold; margin-right: 8px; color: #409EFF; }
            .question-name { flex: 1; font-weight: bold; }
            .answer-display { margin-top: 12px; }
            .option-item { margin-bottom: 8px; padding: 8px 12px; border-radius: 4px; }
            .option-item.selected { background-color: #ecf5ff; border: 1px solid #409EFF; }
            .selected-text { margin-top: 12px; padding: 8px 12px; background-color: #f0f9ff; border-radius: 4px; border-left: 4px solid #409EFF; }
            .selected-options { color: #409EFF; font-weight: 500; }
            .el-tag { display: inline-block; padding: 0 4px; background: #f56c6c; color: white; border-radius: 2px; font-size: 12px; margin-left: 8px; }
            .print-footer { text-align: center; margin-top: 50px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          ${headerHtml}
          ${contentHtml}
          <div class="print-footer no-print">
            <button onclick="window.print()" style="margin-right: 10px; padding: 8px 16px; background: #409EFF; color: white; border: none; border-radius: 4px; cursor: pointer;">打印</button>
            <button onclick="window.close()" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">关闭预览</button>
          </div>
        </body>
        </html>
      `)
      
      printWindow.document.close()
      printWindow.focus()
      
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }
}
</script>

<style scoped>
.result-dialog {
  --export-color: #409EFF;
  --print-color: #E6A23C;
}

.top-operations {
  position: absolute;
  top: 15px;
  right: 80px; 
  display: flex;
  gap: 6px; 
  z-index: 10;
}

.btn-export, .btn-print {
  border-width: 1px;
  background-color: transparent !important;
  padding: 3px 7px; /* 进一步缩小按钮尺寸 */
  font-size: 12px;
  transition: all 0.2s ease;
  height: 24px; /* 固定按钮高度，确保紧凑 */
  line-height: 1; /* 调整行高，使文字居中 */
}

/* 导出按钮 - 蓝色边框 */
.btn-export {
  border-color: var(--export-color);
  color: var(--export-color);
}

.btn-export:hover {
  background-color: rgba(64, 158, 255, 0.1) !important;
}

/* 打印按钮 - 黄色边框 */
.btn-print {
  border-color: var(--print-color);
  color: var(--print-color);
}

.btn-print:hover {
  background-color: rgba(230, 162, 60, 0.1) !important;
}

/* 图标样式调整 */
:deep(.btn-export .el-icon),
:deep(.btn-print .el-icon) {
  margin-right: 3px; /* 减小图标与文字间距 */
  font-size: 11px; /* 缩小图标 */
}

/* 其他样式保持不变 */
.survey-header {
  margin-bottom: 20px;
  padding-top: 10px;
}

.survey-header h2 {
  margin: 0 0 15px 0;
  color: #303133;
  text-align: center;
}

.custom-descriptions :deep(.el-descriptions__label) {
  font-size: 16px;
  font-weight: 600;
}

.custom-descriptions :deep(.el-descriptions__content) {
  font-size: 16px;
  font-weight: 500;
}

.highlight-item :deep(.el-descriptions__label) {
  font-size: 18px;
  font-weight: 700;
  color: #409EFF;
}

.highlight-item :deep(.el-descriptions__content) {
  font-size: 20px;
  font-weight: 700;
  color: #409EFF;
}

.result-no {
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.questions-container {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

.question-item {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  background: #fafafa;
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.question-no {
  font-weight: bold;
  margin-right: 8px;
  color: #409EFF;
}

.question-name {
  flex: 1;
  font-weight: bold;
  color: #333;
}

.answer-display {
  margin-top: 12px;
}

.option-item {
  margin-bottom: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.option-item.selected {
  background-color: #ecf5ff;
  border: 1px solid #409EFF;
}

.selected-text {
  margin-top: 12px;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.selected-options {
  color: #409EFF;
  font-weight: 500;
}

:deep(.el-radio.is-disabled .el-radio__label) {
  color: #333 !important;
}

:deep(.el-checkbox.is-disabled .el-checkbox__label) {
  color: #333 !important;
}

:deep(.el-input.is-disabled .el-input__inner) {
  background-color: #f5f7fa;
  color: #333;
  border-color: #e4e7ed;
}

.dialog-footer {
  display: none;
}
</style>
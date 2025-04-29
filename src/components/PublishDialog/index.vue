<template>
    <el-dialog
      :visible.sync="dialogVisible"
      title="选择发布方式"
      :close-on-click-modal="false" 
      width="500px">
      <el-radio-group v-model="selectedOption">
        <el-radio label="instant" selected>立即发布</el-radio>
        <el-radio label="scheduled">定时发布</el-radio>
      </el-radio-group>
      <el-date-picker
        v-if="selectedOption ==='scheduled'"
        v-model="selectedDate"
        type="datetime"
        value-format="yyyy-MM-dd HH:mm:ss"
        placeholder="选择定时发布时间"
        :picker-options="pickerOptions"
      />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmPublish">确认</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </template>
  
  <script>
  export default {
    name: 'PublishDialog',
    data() {
      Ids: ""
      return {
        dialogVisible: false,
        selectedOption: "instant",
        selectedDate: null,
        pickerOptions: {
	       disabledDate(time) {
	           return time.getTime() < Date.now() - 8.64e7;
	        }
	      },
      };
    },
    methods: {
      openDialog() {
        this.dialogVisible = true;
      },
      confirmPublish() {
        let result;
        if (this.selectedOption === "instant") {
          result = { type: "instant" };
        } else if (this.selectedOption === "scheduled") {
          if (this.selectedDate) {
            result = { type: "scheduled", date: this.selectedDate};
          } else {
            this.$message.warning("请选择定时发布时间");
            return;
          }
        }
        this.dialogVisible = false;
        this.$emit("confirm", result);
      },
    },
  };
  </script>

<style scoped>
    ::v-deep .el-dialog{
    display: flex;
    flex-direction: column;
    margin:0 !important;
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    max-height:calc(100% - 30px);
    max-width:calc(100% - 30px);
    }
    ::v-deep  .el-dialog .el-dialog__body{
    flex:1;
    overflow: auto;
    }
</style>
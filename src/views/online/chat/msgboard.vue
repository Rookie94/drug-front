<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="留言时间">
        <el-date-picker
          v-model="daterangeCreateTime"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="学员账号" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入学员账号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="学员名称" prop="nickName">
        <el-input
          v-model="queryParams.nickName"
          placeholder="请输入学员名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="留言主题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入留言主题"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="归属组织" prop="deptName">
        <el-input
          v-model="queryParams.deptName"
          placeholder="请输入归属组织名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in dict.type.sys_msg_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['online:chat:edit']"
        >标注留言</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-message"
          size="mini"
          :disabled="single"
          @click="handleMsgClick"
          v-hasPermi="['online:chat:edit']"
        >回复留言</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['online:chat:remove']"
        >删除留言</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['online:chat:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="msgList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="学员账号" align="center" prop="userName" />
      <el-table-column label="学员名称" align="center" prop="nickName" />
      <el-table-column label="留言时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="留言主题" align="center" prop="title" width="320">
        <template slot-scope="scope">
          <el-link 
            type="primary" 
            :underline="true" 
            @click="handleMsgClick(scope.row)"
          >
            {{ scope.row.title }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="群组名称" align="center" prop="groupName" />
      <el-table-column label="归属组织" align="center" prop="deptName"  width="220" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_msg_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width"  width="180">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['online:chat:edit']"
            v-show="false"
          >标注留言</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleMsgClick(scope.row)"
            v-hasPermi="['online:chat:edit']"
          >回复</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['online:chat:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改留言板对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="学员名称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="" readonly />
        </el-form-item>
        <el-form-item label="留言时间" prop="createTime">
          <el-input v-model="form.createTime" placeholder="" readonly />
        </el-form-item>
        <el-form-item label="留言主题" prop="title">
          <el-input v-model="form.title" placeholder="" readonly />
        </el-form-item>
        <el-form-item label="留言内容" prop="message">
          <el-input v-model="form.message" type="textarea" rows=6 placeholder="" readonly />
        </el-form-item>       
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" rows=6 placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option
              v-for="dict in dict.type.sys_msg_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-drawer
      title=""
      :visible.sync="drawer"
      direction="rtl"
       size="600px"
      >
      <Comment></Comment>
    </el-drawer>

    <el-dialog  :visible.sync="dialogVisible" width="1000px" append-to-body >
      <Comment :primaryMessage="form"></Comment>
    </el-dialog>

  </div>

</template>

<script>
import { listMsg, getMsg, delMsg, replyMsg, updateMsg, getMessageTree } from "@/api/online/msg";
import Comment from "./Comment.vue";

export default {
  name: "Msg",
  dicts: ['sys_msg_status'],
  components: {Comment},
  data() {
    return {
      drawer:false,
      dialogVisible :false,  
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 备注时间范围
      daterangeCreateTime: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: null,
        userName: null,
        nickName: null,
        deptName: null,
        status: null,
        createTime: null,
        groupId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        messageId: [
          { required: true, message: "留言id不能为空", trigger: "blur" }
        ],
      },
      // 留言列表
      msgList: [],
      total: 0
    };
  },
  created() {
    const groupId = this.$route.params.groupId;
    if (groupId) {
      this.queryParams.groupId = groupId;
    }
    this.getList();
  },
  methods: {
    /** 查询留言板列表 */
    getList() {
      this.loading = true;
      this.queryParams.params = {};
      if (null != this.daterangeCreateTime && '' != this.daterangeCreateTime) {
        this.queryParams.params["beginCreateTime"] = this.daterangeCreateTime[0];
        this.queryParams.params["endCreateTime"] = this.daterangeCreateTime[1];
      }
      listMsg(this.queryParams).then(response => {
        this.msgList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        messageId: null,
        parentMessageId: null,
        userId: null,
        groupId: null,
        title: null,
        message: null,
        remark: null,
        status: '0'
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.daterangeCreateTime = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.messageId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 回复按钮操作 */
    handleMsgClick(row) {
      const messageId = row.messageId || this.ids;  
      getMsg(messageId).then(response => {
        this.form = response.data;
        this.dialogVisible = true;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const messageId = row.messageId || this.ids;      
      getMsg(messageId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "标注留言";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.messageId != null) {
            updateMsg(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const messageIds = row.messageId || this.ids;
      this.$modal.confirm('是否确认删除留言板编号为"' + messageIds + '"的数据项？').then(function() {
        return delMsg(messageIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('online/msg/export', {
        ...this.queryParams
      }, `msg_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<style scoped>
::v-deep .el-dialog__headerbtn .el-dialog__close {
  color: #0059ff;
}

::v-deep .el-drawer__header {
  padding: 10px;
  margin: 10px;
  height: 10px; 
  line-height: 12px;
}
</style>
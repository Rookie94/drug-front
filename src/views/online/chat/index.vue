<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="群组名称" prop="groupName">
        <el-input
          v-model="queryParams.groupName"
          placeholder="请输入群组名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="groupList" @selection-change="handleSelectionChange">
      <el-table-column label="序号" width="80" align="center" prop="orderNum" />
      <el-table-column label="封面图片" width="100" align="center" prop="pic">
        <template slot-scope="scope">
          <image-preview :src="scope.row.pic" :width="100" :height="100"/>
        </template>
      </el-table-column>
      <el-table-column label="群组名称" width="320" align="center" prop="groupName" />
      <el-table-column label="状态"  width="80" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" width="180" prop="remark" />
      <el-table-column label="操作" align="left" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <dict-tag 
          v-show="scope.row.joinGroupState==1 || scope.row.joinGroupState==3 "
          :options="dict.type.sys_joingroup_state" 
          :value="scope.row.joinGroupState"/>
          <el-button
            v-show="scope.row.joinGroupState==0"
            type="success" plain
            style="width: 120px;"
            icon="el-icon-user"
            size="mini"
            @click="handleJoinGroup(scope.row)"
            v-hasPermi="['online:group:edit']"
          >申请入群</el-button>
          <el-button
            v-show="scope.row.joinGroupState==2"
            type="primary"
            style="width: 120px;"
            icon="el-icon-chat-round"
            size="mini"
            @click="handleChat(scope.row)"
            v-hasPermi="['online:group:remove']"
          >参与互动</el-button>
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

    <!-- 申请入群对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="群组名称" prop="groupName">
          <el-input v-model="form.groupName" placeholder="群组名称" readonly />
        </el-form-item>
        <el-form-item label="申请理由" prop="remark">
          <el-input v-model="form.remark" type="textarea" rows=5 placeholder="请输入申请理由" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitJoinGroup">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listGroup, getGroup,joinGroup } from "@/api/online/chat";

export default {
  name: "Group",
  dicts: ['sys_normal_disable','sys_joingroup_state'],
  data() {
    return {
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
      // 总条数
      total: 0,
      // 聊天群组表格数据
      groupList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        groupName: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        groupName: [
          { required: true, message: "群组不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询聊天群组列表 */
    getList() {
      this.loading = true;
      listGroup(this.queryParams).then(response => {
        this.groupList = response.rows;
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
        groupId: null,
        groupName: null
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
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.groupId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 申请进群按钮操作 */
    handleJoinGroup(row) {
      this.reset();
      this.form.groupId =  row.groupId;
      this.form.groupName = row.groupName;
      this.open = true;
      this.title = "申请加入群组";
    },
    /** 提交进群申请按钮 */
    submitJoinGroup() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          joinGroup(this.form).then(response => {
            this.$modal.msgSuccess("申请入群成功");
            this.open = false;
            this.getList();
          });
        }
      });
    },
    /** 进入群聊操作 */
    handleChat(row) {
      const groupId = row.groupId;
      this.$router.push("/online/msgboard/group/" + groupId)
    }
  }
};
</script>
<style> 
.el-dialog{
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
  .el-dialog .el-dialog__body{
      flex:1;
      overflow: auto;
   }
</style>
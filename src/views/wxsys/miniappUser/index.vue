<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="昵称" prop="nickName">
        <el-input
          v-model="queryParams.nickName"
          placeholder="请输入昵称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="phoneNumber">
        <el-input
          v-model="queryParams.phoneNumber"
          placeholder="请输入手机号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="OpenId" prop="openId">
        <el-input
          v-model="queryParams.openId"
          placeholder="请输入OpenId"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="归属程序" prop="miniAppId">
        <el-select
              v-model="queryParams.miniAppId"
              placeholder="归属程序"
              clearable
              style="width: 240px"
            >
              <el-option
                v-for="item in miniAppList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
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
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['wxsys:miniappUser:add']"
          disabled
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['wxsys:miniappUser:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['wxsys:miniappUser:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['wxsys:miniappUser:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="miniappUserList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" width="55" align="center" prop="id" />
      <el-table-column label="昵称" align="center" prop="nickName" />
      <el-table-column label="头像" align="center" prop="avatar" width="100px" >
        <template slot-scope="scope">
          <img :src="scope.row.avatar" width="40px" height="40px">
        </template>
      </el-table-column>
      <el-table-column label="OpenId" align="center" prop="openId" width="280" />
      <el-table-column label="手机号" align="center" prop="phoneNumber" />
      <el-table-column label="性别" align="center" prop="sex" >
        <template slot-scope="scope">
          {{scope.row.sex == null ? '未知' : (scope.row.sex == 0 ? '女' : '男')}}
        </template>
      </el-table-column>
      <el-table-column label="归属程序" align="center" prop="miniAppName" />
      <el-table-column label="注册时间" width="150" align="center" prop="createTime" />
      <el-table-column label="修改时间" width="150" align="center" prop="updateTime" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['wxsys:miniappUser:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['wxsys:miniappUser:remove']"
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

    <!-- 添加或修改小程序用户对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="昵称" prop="nickName">
          <el-input disabled v-model="form.nickName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input disabled v-model="form.phoneNumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="OpenId" prop="openId">
          <el-input disabled v-model="form.openId" placeholder="请输入openId" />
        </el-form-item>
        <el-form-item label="归属程序" prop="miniAppName">
          <el-input disabled v-model="form.miniAppId" placeholder="请输入归属程序" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMiniappUser, getMiniappUser, delMiniappUser, addMiniappUser, updateMiniappUser,innerJoinList } from "@/api/wxsys/miniappUser";
import { listSelect } from "@/api/wxsys/miniapp";

export default {
  name: "MiniappUser",
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
      // 小程序用户表格数据
      miniappUserList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        nickName: null,
        avatar: null,
        openId: null,
        sex: null,
        miniAppId: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      miniAppList:[]
    };
  },
  created() {
    this.handleListSelect();
    this.getList();
  },
  methods: {
    /** 查询小程序用户列表 */
    getList() {
      this.loading = true;
      innerJoinList(this.queryParams).then(response => {
        this.miniappUserList = response.rows;
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
        id: null,
        nickName: null,
        avatar: null,
        openId: null,
        sex: null,
        miniAppId: null,
        remark: null,
        createTime: null,
        updateTime: null
      };
      this.resetForm("form");
    },
    /**  查询下拉框 */
    handleListSelect(){
      listSelect().then(res=>{
        this.miniAppList = res.data;
      })
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加小程序用户";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getMiniappUser(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改小程序用户";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateMiniappUser(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMiniappUser(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除小程序用户编号为"' + ids + '"的数据项？').then(function() {
        return delMiniappUser(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('wxsys/miniappUser/export', {
        ...this.queryParams
      }, `miniappUser_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<template>
  <!-- 授权用户 -->
  <el-dialog title="选择用户" :visible.sync="visible" width="1000px" top="5vh" append-to-body>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true">
      <el-form-item label="所属部门" prop="deptId">
        <treeselect
          v-model="queryParams.deptId"
          :options="deptOptions"
          :show-count="true"
          placeholder="请选择部门"
          style="width: 220px"
          @input="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          style="width: 150px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="phoneNumber">
        <el-input
          v-model="queryParams.phoneNumber"
          placeholder="请输入手机号码"
          clearable
          style="width: 150px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row>
      <el-table
        @row-click="clickRow"
        ref="table"
        :data="userList"
        @selection-change="handleSelectionChange"
        height="360px"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="用户名称" width="120px" prop="userName" :show-overflow-tooltip="true" />
        <el-table-column label="用户昵称" width="120px" prop="nickName" :show-overflow-tooltip="true" />
        <el-table-column label="手机" width="120px" prop="phoneNumber" :show-overflow-tooltip="true" />
        <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
        <el-table-column label="状态" align="center" width="80px" prop="status">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="160">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="160">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
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
    </el-row>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleSelectUser">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { unallocatedUserList, authUserSelectAll } from "@/api/system/role";
import { deptTreeSelect } from "@/api/system/user";          // 拉部门树
import Treeselect from "@riophae/vue-treeselect";            // 树选择组件
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "AuthUser",
  dicts: ['sys_normal_disable'],
  components: { Treeselect },
  props: {
    roleId: {
      type: [Number, String]
    }
  },
  data() {
    return {
      visible: false,
      userIds: [],
      total: 0,
      userList: [],
      deptOptions: [],                 // 部门树数据
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        roleId: undefined,
        userName: undefined,
        phoneNumber: undefined,
        deptId: undefined            // 新增查询字段
      }
    };
  },
  methods: {
    /** 打开弹窗 */
    show() {
      this.queryParams.roleId = this.roleId;
      this.getDeptTree();   // 拉部门树
      this.getList();       // 拉用户列表
      this.visible = true;
    },

    /** 获取部门树 */
    getDeptTree() {
      deptTreeSelect().then(res => {
        this.deptOptions = res.data;
      });
    },

    /** 单击行选中 */
    clickRow(row) {
      this.$refs.table.toggleRowSelection(row);
    },

    /** 多选 */
    handleSelectionChange(selection) {
      this.userIds = selection.map(item => item.userId);
    },

    /** 查询用户列表 */
    getList() {
      unallocatedUserList(this.queryParams).then(res => {
        this.userList = res.rows;
        this.total = res.total;
      });
    },

    /** 搜索 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },

    /** 重置 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.deptId = undefined;
      this.handleQuery();
    },

    /** 确定授权 */
    handleSelectUser() {
      const roleId = this.queryParams.roleId;
      const userIds = this.userIds.join(",");
      if (userIds === "") {
        this.$modal.msgError("请选择要分配的用户");
        return;
      }
      authUserSelectAll({ roleId: roleId, userIds: userIds }).then(res => {
        this.$modal.msgSuccess(res.msg);
        this.visible = false;
        this.$emit("ok");
      });
    }
  }
};
</script>
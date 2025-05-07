<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="目录名称" prop="contextName">
        <el-input
          v-model="queryParams.contextName"
          placeholder="请输入目录名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="目录状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择目录状态" clearable>
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
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
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['scale:contexts:add']"
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
          v-hasPermi="['scale:contexts:edit']"
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
          v-hasPermi="['scale:contexts:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-upload"
          size="mini"
          :disabled="multiple"
          @click="handleAppor"
          v-hasPermi="['scale:contexts:appor']"
        >审批并锁定</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-refresh-left"
          size="mini"
          :disabled="multiple"
          @click="handleUnAppor"
          v-hasPermi="['scale:contexts:unappor']"
        >撤回审批</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="multiple"
          @click=""
          v-hasPermi="['scale:contexts:edit']"
        >自动更新JSON</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click=""
          v-hasPermi="['scale:contexts:edit']"
        >手动更新JSON</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-sort"
          size="mini"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="contextsList"
      row-key="contextId"
      @selection-change="handleSelectionChange"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="目录名称" align="left" prop="contextName" width="320" />
      <el-table-column label="排序" align="center" prop="orderNum" width="50" />
      <el-table-column label="封面图片" align="center" prop="pic" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.pic" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="目录状态" align="center" key="status">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['scale:contexts:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['scale:contexts:add']"
          >新增</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['scale:contexts:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改量表目录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="父目录" prop="parentContextId">
          <treeselect v-model="form.parentContextId" :options="contextsOptions" :normalizer="normalizer" placeholder="请选择父目录id" />
        </el-form-item>
        <el-form-item label="序号" prop="orderNum">
          <el-input v-model="form.orderNum" placeholder="请输入序号" />
        </el-form-item>
        <el-form-item label="目录名称" prop="contextName">
          <el-input v-model="form.contextName" placeholder="请输入目录名称" />
        </el-form-item>
        <el-form-item label="封面图片" prop="pic">
          <image-upload v-model="form.pic"/>
        </el-form-item>
        <el-form-item label="简介">
          <editor v-model="form.content" :min-height="192"/>
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
import { listContexts, getContexts, delContexts, addContexts, updateContexts,changeContextsStatus,apporContexts,unApporContexts } from "@/api/scale/contexts";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Contexts",
  dicts: ['sys_appor_status', 'sys_normal_disable'],
  components: {
    Treeselect
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      ids: [],
      // 显示搜索条件
      showSearch: true,
      // 量表目录表格数据
      contextsList: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
     // 量表目录树选项
      contextsOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        contextName: null,
        status: null,
        appored: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询量表目录列表 */
    getList() {
      this.loading = true;
      listContexts(this.queryParams).then(response => {
        this.contextsList = this.handleTree(response.data, "contextId", "parentContextId");
        this.loading = false;
      });
    },
    /** 转换量表目录数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.contextId,
        label: node.contextName,
        children: node.children
      };
    },
	/** 查询量表目录下拉树结构 */
    getTreeselect() {
      listContexts().then(response => {
        this.contextsOptions = [];
        const data = { contextId: 0, contextName: '顶级节点', children: [] };
        data.children = this.handleTree(response.data, "contextId", "parentContextId");
        this.contextsOptions.push(data);
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
        contextId: null,
        parentContextId: null,
        orderNum: null,
        contextName: null,
        pic: null,
        content: null,
        status: null,
        appored: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        apporBy: null,
        apporTime: null,
        remark: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },    
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
    this.ids = selection.map(item => item.contextId)
    this.single = selection.length!==1
    this.multiple = !selection.length
    },    
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      this.getTreeselect();
      if (row != null && row.contextId) {
        this.form.parentContextId = row.contextId;
      } else {
        this.form.parentContextId = 0;
      }
      this.open = true;
      this.title = "添加量表目录";
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      if (row != null) {
        this.form.parentContextId = row.parentContextId;
      }
      const contextId = row.contextId || this.ids
      getContexts(contextId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改量表目录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.contextId != null) {
            updateContexts(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addContexts(this.form).then(response => {
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
      const contextIds = row.contextId || this.ids
      this.$modal.confirm('是否确认删除量表目录编号为"' + contextIds + '"的数据项？').then(function() {
        return delContexts(contextIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },    
    // 状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.contextName + '"吗？').then(function() {
        const contextId = row.contextId || this.ids;
        return changeContextsStatus(contextId, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0";
      });
    },  
     /** 审批操作 */
     handleAppor(row) {
      const contextIds = row.contextId || this.ids;
      this.$modal.confirm('是否确认审批编号为"' + contextIds + '"的数据项？').then(function() {
          return apporContexts(2,contextIds);
      }).then(() => {
          this.getList();
          this.$modal.msgSuccess("审批成功");
      }).catch(() => {});
    },            
    /** 撤销审批操作 */
    handleUnAppor(row) {
      const contextIds = row.contextId || this.ids;
      this.$modal.confirm('是否取消审批编号为"' + contextIds + '"的数据项？').then(function() {
          return unApporContexts(contextIds);
      }).then(() => {
          this.getList();
          this.$modal.msgSuccess("取消审批成功");
      }).catch(() => {});
    } 
  }
};
</script>

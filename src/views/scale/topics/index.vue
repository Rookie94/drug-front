<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--量表数据-->
      <el-col :span="5" :xs="24">
        <div class="head-container">
          <el-input
            v-model="contextName"
            placeholder="请输入量表名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 5px"
          />
        </div>
        <div class="head-container">
          <el-tree
            :data="contextOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="tree"
            node-key="id"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <!--题目数据-->
      <el-col :span="19" :xs="24">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="量表名称" prop="contextName">
            <el-input
              v-model="queryParams.contextName"
              placeholder="请输入量表名称"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="题目" prop="title">
            <el-input
              v-model="queryParams.title"
              placeholder="请输入题目"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
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
              v-hasPermi="['scale:topics:add']"
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
              v-hasPermi="['scale:topics:edit']"
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
              v-hasPermi="['scale:topics:remove']"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
              v-hasPermi="['scale:topics:export']"
            >导出</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="topicsList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="序号" align="center" prop="orderNum" />
          <el-table-column label="题目"  width="320" align="left" prop="title" />
          <el-table-column label="题目类型" align="center" prop="topicType">
            <template slot-scope="scope">
              <dict-tag :options="dict.type.sys_scale_topictype" :value="scope.row.topicType"/>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="status">
            <template slot-scope="scope">
              <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
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
                v-hasPermi="['scale:topics:edit']"
              >修改</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['scale:topics:remove']"
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
      </el-col>
  </el-row>

    <!-- 添加或修改量表题目对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="归属量表" prop="contextId">
              <treeselect v-model="form.contextId" :options="contextOptions" :show-count="true" placeholder="请选择归属量表" />
        </el-form-item>
        <el-form-item label="序号" prop="orderNum">
          <el-input v-model="form.orderNum" placeholder="请输入序号" />
        </el-form-item>
        <el-form-item label="题目" prop="title">
          <el-input v-model="form.title"  type="textarea" placeholder="请输入题目" />
        </el-form-item>
        <el-form-item label="题目类型" prop="topicType">
          <el-select v-model="form.topicType" placeholder="请选择题目类型">
            <el-option
              v-for="dict in dict.type.sys_scale_topictype"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="题目说明" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入题目说明" />
        </el-form-item>
        <el-divider content-position="center" v-if="form.topicType!='2'">量表选项信息</el-divider>
        <el-row :gutter="10" class="mb8" v-show="form.topicType!='2'">
          <el-col :span="1.5">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddLbsOptions">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDeleteLbsOptions">删除</el-button>
          </el-col>
        </el-row>
        <el-table 
        v-show="form.topicType!='2'"
        :data="lbsOptionsList" 
        :row-class-name="rowLbsOptionsIndex" 
        @selection-change="handleLbsOptionsSelectionChange" 
        ref="lbsOptions">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="ID" align="center" prop="index" width="50" v-if="false" />
          <el-table-column label="序号" prop="orderNum" width="120">
            <template slot-scope="scope">
              <el-input v-model="scope.row.orderNum" placeholder="请输入序号" />
            </template>
          </el-table-column>
          <el-table-column label="选项名称" prop="title" width="400">
            <template slot-scope="scope">
              <el-input v-model="scope.row.title" placeholder="请输入选项名称" />
            </template>
          </el-table-column>
          <el-table-column label="选项说明" prop="remark" width="150">
            <template slot-scope="scope">
              <el-input v-model="scope.row.remark" placeholder="请输入选项说明" />
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listTopics, getTopics, delTopics, addTopics, updateTopics,contextTreeSelect } from "@/api/scale/topics";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Topics",
  dicts: ['sys_scale_topictype', 'sys_normal_disable'],
  components: { Treeselect},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedLbsOptions: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 量表名称
      contextName: undefined,
      // 量表树选项
      contextOptions: undefined,
      // 量表题目表格数据
      topicsList: [],
      // 量选项表格数据
      lbsOptionsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 50,
        contextName: null,
        title: null,
        topicType: null,
        status: null,
        contextId: null
      },
      // 表单参数
      form: {
        id: undefined,
        orderNum: null,
        title: null,
        contextId: null,
        topicType: null,
        remark: null,
        lbsOptions: []
      },
      // 表单校验
      rules: {  
        contextId: [
          { required: true, message: "归属量表不能为空", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "序号不能为空", trigger: "blur" }
        ],
        title: [
          { required: true, message: "题目不能为空", trigger: "blur" }
        ],
        topicType:[         
           { required: true, message: "题目类型不能为空", trigger: "blur" }
        ]     
      }
    };
  },
  watch: {
    //根据名称筛选量表树
    contextName(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.getContextTree();
    this.getList();
  },
  methods: {
    /** 查询下拉树结构 */
    getContextTree() {
      contextTreeSelect().then(response => {
        this.contextOptions = response.data;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.contextId = data.id;
      this.handleQuery();
    },    
    /** 查询量表题目列表 */
    getList() {
      this.loading = true;
      listTopics(this.queryParams).then(response => {
        this.topicsList = response.rows;
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
        topicId: null,
        orderNum: null,
        title: null,
        topicType: null,
        status: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
      };
      this.lbsOptionsList = [];
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
      this.ids = selection.map(item => item.topicId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.form.contextId = this.queryParams.contextId;
      this.form.topicType="0";
      this.open = true;
      this.title = "添加量表题目";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const topicId = row.topicId || this.ids
      getTopics(topicId).then(response => {
        this.form = response.data;
        this.lbsOptionsList = response.data.lbsOptionsList;
        this.open = true;
        this.title = "修改量表题目";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.lbsOptionsList = this.lbsOptionsList;
          if (this.form.topicId != null) {
            updateTopics(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTopics(this.form).then(response => {
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
      const topicIds = row.topicId || this.ids;
      this.$modal.confirm('是否确认删除量表题目编号为"' + topicIds + '"的数据项？').then(function() {
        return delTopics(topicIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
	/** 量选项序号 */
    rowLbsOptionsIndex({ row, rowIndex }) {
      row.index = rowIndex + 1;
    },
    /** 量选项添加按钮操作 */
    handleAddLbsOptions() {
      let obj = {};
      obj.orderNum = "";
      obj.title = "";
      obj.status = "";
      obj.remark = "";
      this.lbsOptionsList.push(obj);
    },
    /** 量选项删除按钮操作 */
    handleDeleteLbsOptions() {
      if (this.checkedLbsOptions.length == 0) {
        this.$modal.msgError("请先选择要删除的量选项数据");
      } else {
        const lbsOptionsList = this.lbsOptionsList;
        const checkedLbsOptions = this.checkedLbsOptions;
        this.lbsOptionsList = lbsOptionsList.filter(function(item) {
          return checkedLbsOptions.indexOf(item.index) == -1
        });
      }
    },
    /** 复选框选中数据 */
    handleLbsOptionsSelectionChange(selection) {
      this.checkedLbsOptions = selection.map(item => item.index)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('scale/topics/export', {
        ...this.queryParams
      }, `topics_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<style>
  .el-tree-node.is-current > .el-tree-node__content {
    color:#1890FF;
    font-weight: bold;
    background-color: #E1F0F7 !important;
  }
  .head-container {
    border: 1px dashed #dddbdb;
  }
</style>
<style>
  .el-tree-node.is-current > .el-tree-node__content {
    color:#1890FF;
    font-weight: bold;
    background-color: #E1F0F7 !important;
  }
  .head-container {
    border: 1px dashed #dddbdb;
  }
</style>
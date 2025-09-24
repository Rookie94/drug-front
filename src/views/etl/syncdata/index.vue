<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="源数据源" prop="sourceConfigName">
        <el-input
          v-model="queryParams.sourceConfigName"
          placeholder="请输入源数据源名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="目标数据源" prop="targetConfigName">
        <el-input
          v-model="queryParams.targetConfigName"
          placeholder="请输入目标数据源名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['etl:syncdata:add']"
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
          v-hasPermi="['etl:syncdata:edit']"
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
          v-hasPermi="['etl:syncdata:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['etl:syncdata:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="syncdataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="orderNum" />
      <el-table-column label="源数据源" align="center" prop="sourceConfigName" />
      <el-table-column label="目标数据源" align="center" prop="targetConfigName" />
      <el-table-column label="状态" align="center" prop="status" />
      <el-table-column label="备注信息" align="center" prop="remark" />

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['etl:syncdata:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['etl:syncdata:remove']"
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

    <!-- 添加或修改数据清洗对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="880px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="序号" prop="orderNum">
          <el-input v-model="form.orderNum" placeholder="请输入序号" />
        </el-form-item>
        <el-form-item label="请输入源数据源" prop="sourceConfigId">
          <el-input v-model="form.sourceConfigId" placeholder="请输入源数据源" />
        </el-form-item>
        <el-form-item label="请输入目标数据源" prop="targetConfigId">
          <el-input v-model="form.targetConfigId" placeholder="请输入目标数据源" />
        </el-form-item>
        <el-form-item label="脚本" prop="sqlScript">
          <el-input v-model="form.sqlScript" type="textarea" placeholder="请输入脚本" :autosize="{ minRows: 16,}" />
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
import { listSyncdata, getSyncdata, delSyncdata, addSyncdata, updateSyncdata } from "@/api/etl/syncdata";

export default {
  name: "Syncdata",
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
      // 数据清洗表格数据
      syncdataList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        sourceConfigId: null,
        targetConfigId: null,
        sqlScript: null,
        status: null,
        sourceConfigName: null,
        targetConfigName: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        orderNum: [
          { required: true, message: "序号不能为空", trigger: "blur" }
        ],
        sourceConfigId: [
          { required: true, message: "源数据源ID不能为空", trigger: "change" }
        ],
        targetConfigId: [
          { required: true, message: "目标数据源ID不能为空", trigger: "change" }
        ],
        sqlScript: [
          { required: true, message: "脚本不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询数据清洗列表 */
    getList() {
      this.loading = true;
      listSyncdata(this.queryParams).then(response => {
        this.syncdataList = response.rows;
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
        syncId: null,
        orderNum: null,
        sourceConfigId: null,
        targetConfigId: null,
        sqlScript: null,
        status: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null,
        sourceConfigName: null,
        targetConfigName: null
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
      this.ids = selection.map(item => item.syncId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加数据清洗";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const syncId = row.syncId || this.ids
      getSyncdata(syncId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改数据清洗";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.syncId != null) {
            updateSyncdata(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSyncdata(this.form).then(response => {
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
      const syncIds = row.syncId || this.ids;
      this.$modal.confirm('是否确认删除数据清洗编号为"' + syncIds + '"的数据项？').then(function() {
        return delSyncdata(syncIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('etl/syncdata/export', {
        ...this.queryParams
      }, `syncdata_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

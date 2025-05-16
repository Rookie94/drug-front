<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="规则ID" prop="id">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入规则ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="规则名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入规则名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="固定前缀" prop="prefix">
        <el-input
          v-model="queryParams.prefix"
          placeholder="请输入固定前缀"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="固定后缀" prop="suffix">
        <el-input
          v-model="queryParams.suffix"
          placeholder="请输入固定后缀"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="日期格式" prop="dateFormat">
        <el-select v-model="queryParams.dateFormat" placeholder="请选择日期格式" clearable>
          <el-option
            v-for="dict in dict.type.sys_serial_dataformat"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="序列长度" prop="seqLength">
        <el-input
          v-model="queryParams.seqLength"
          placeholder="请输入序列号长度"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="当前序列" prop="currentSeq">
        <el-input
          v-model="queryParams.currentSeq"
          placeholder="请输入当前序列号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="重置策略" prop="resetStrategy">
        <el-select v-model="queryParams.resetStrategy" placeholder="请选择重置策略" clearable>
          <el-option
            v-for="dict in dict.type.sys_serial_resetrule"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="最后重置" prop="lastResetDate">
        <el-input
          v-model="queryParams.lastResetDate"
          placeholder="请输入最后重置日期"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="启用状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择启用状态" clearable>
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
          v-hasPermi="['system:serialno:add']"
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
          v-hasPermi="['system:serialno:edit']"
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
          v-hasPermi="['system:serialno:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:serialno:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="serialnoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="规则ID" width="120" align="center" prop="id" />
      <el-table-column label="规则名称" width="280" align="center" prop="name" />
      <el-table-column label="固定前缀" align="center" prop="prefix" />
      <el-table-column label="固定后缀" align="center" prop="suffix" />
      <el-table-column label="日期格式" align="center" prop="dateFormat"  width="120">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_serial_dataformat" :value="scope.row.dateFormat"/>
        </template>
      </el-table-column>
      <el-table-column label="序列号长度" width="120"  align="center" prop="seqLength" />
      <el-table-column label="当前序列号" width="120"  align="center" prop="currentSeq" />
      <el-table-column label="重置策略" align="center" prop="resetStrategy" />
      <el-table-column label="最后重置日期"  width="120"  align="center" prop="lastResetDate" />
      <el-table-column label="乐观锁版本"  width="120"  align="center" prop="version" />
      <el-table-column label="工作状态" align="center" prop="status">
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width"  width="120">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:serialno:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:serialno:remove']"
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

    <!-- 添加或修改流水号管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="规则ID" prop="name">
          <el-input v-model="form.id" placeholder="请输入规则ID" />
        </el-form-item>
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="固定前缀" prop="prefix">
              <el-input v-model="form.prefix" placeholder="请输入固定前缀" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="固定后缀" prop="suffix">
              <el-input v-model="form.suffix" placeholder="请输入固定后缀" />
            </el-form-item>        
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="日期格式" prop="dateFormat">
              <el-select v-model="form.dateFormat" placeholder="请选择日期格式">
                <el-option
                  v-for="dict in dict.type.sys_serial_dataformat"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="序列长度" prop="seqLength">
              <el-input v-model="form.seqLength" placeholder="请输入序列号长度" />
            </el-form-item>            
          </el-col>
        </el-row>
        <el-form-item label="重置策略" prop="resetStrategy">
          <el-select v-model="form.resetStrategy" placeholder="请选择重置策略">
            <el-option
              v-for="dict in dict.type.sys_serial_resetrule"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
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
import { listSerialno, getSerialno, delSerialno, addSerialno, updateSerialno } from "@/api/system/serial";

export default {
  name: "Serialno",
  dicts: ['sys_serial_dataformat', 'sys_normal_disable','sys_serial_resetrule'],
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
      // 流水号管理表格数据
      serialnoList: [],
      // 弹出层标题
      title: "",
      //编辑模式
      mode:0,
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: null,
        name: null,
        prefix: null,
        suffix: null,
        dateFormat: null,
        seqLength: null,
        currentSeq: null,
        resetStrategy: null,
        lastResetDate: null,
        version: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "规则名称不能为空", trigger: "blur" }
        ],
        dateFormat: [
          { required: true, message: "日期格式不能为空", trigger: "change" }
        ],
        seqLength: [
          { required: true, message: "序列号长度不能为空", trigger: "blur" }
        ],
        currentSeq: [
          { required: true, message: "当前序列号不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询流水号管理列表 */
    getList() {
      this.loading = true;
      listSerialno(this.queryParams).then(response => {
        this.serialnoList = response.rows;
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
        name: null,
        prefix: null,
        suffix: null,
        dateFormat: null,
        seqLength: null,
        currentSeq: null,
        resetStrategy: null,
        lastResetDate: null,
        version: null,
        status: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.mode = 0;
      this.open = true;      
      this.title = "添加流水号规则";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getSerialno(id).then(response => {
        this.form = response.data;
        this.mode = 1;
        this.open = true;
        this.title = "修改流水号规则";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.mode== 1) {
            updateSerialno(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSerialno(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除流水号管理编号为"' + ids + '"的数据项？').then(function() {
        return delSerialno(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/serialno/export', {
        ...this.queryParams
      }, `serialno_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

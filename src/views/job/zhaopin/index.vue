<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="职位名称" prop="jobName">
        <el-input
          v-model="queryParams.jobName"
          placeholder="请输入职位名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="公司名称" prop="corpName">
        <el-input
          v-model="queryParams.corpName"
          placeholder="请输入公司名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工作地点" prop="workAddr">
        <el-input
          v-model="queryParams.workAddr"
          placeholder="请输入工作地点"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="招聘人数" prop="number">
        <el-input
          v-model="queryParams.number"
          placeholder="请输入招聘人数"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="薪资待遇" prop="xzLevel">
        <el-select v-model="queryParams.xzLevel" placeholder="请选择薪资待遇" clearable>
          <el-option
            v-for="dict in dict.type.sys_xz_level"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="公司规模" prop="corpLevel">
        <el-select v-model="queryParams.corpLevel" placeholder="请选择公司规模" clearable>
          <el-option
            v-for="dict in dict.type.sys_corp_level"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学历要求" prop="eduLevel">
        <el-select v-model="queryParams.eduLevel" placeholder="请选择学历要求" clearable>
          <el-option
            v-for="dict in dict.type.sys_edu_level"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="联系人" prop="contact">
        <el-input
          v-model="queryParams.contact"
          placeholder="请输入联系人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系电话" prop="tel">
        <el-input
          v-model="queryParams.tel"
          placeholder="请输入联系电话"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="邮箱地址" prop="email">
        <el-input
          v-model="queryParams.email"
          placeholder="请输入邮箱地址"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="截止日期" prop="voidDate">
        <el-input
          v-model="queryParams.voidDate"
          placeholder="请输入截止日期"
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
          v-hasPermi="['job:job:add']"
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
          v-hasPermi="['job:job:edit']"
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
          v-hasPermi="['job:job:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['job:job:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="职位名称" align="center" prop="jobName" />
      <el-table-column label="公司名称" align="center" prop="corpName" />
      <el-table-column label="工作地点" align="center" prop="workAddr" />
      <el-table-column label="招聘人数" align="center" prop="number" />
      <el-table-column label="薪资待遇" align="center" prop="xzLevel">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_xz_level" :value="scope.row.xzLevel"/>
        </template>
      </el-table-column>
      <el-table-column label="公司规模" align="center" prop="corpLevel">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_corp_level" :value="scope.row.corpLevel"/>
        </template>
      </el-table-column>
      <el-table-column label="学历要求" align="center" prop="eduLevel">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_edu_level" :value="scope.row.eduLevel"/>
        </template>
      </el-table-column>
      <el-table-column label="联系人" align="center" prop="contact" />
      <el-table-column label="联系电话" align="center" prop="tel" />
      <el-table-column label="邮箱地址" align="center" prop="email" />
      <el-table-column label="截止日期" align="center" prop="voidDate" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['job:job:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['job:job:remove']"
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

    <!-- 添加或修改job对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>   
  
            <el-form-item label="职位名称" prop="jobName">
              <el-input v-model="form.jobName" placeholder="请输入职位名称" />
            </el-form-item>


            <el-form-item label="公司名称" prop="corpName">
              <el-input v-model="form.corpName" placeholder="请输入公司名称" />
            </el-form-item>

        
            <el-form-item label="工作地点" prop="workAddr">
              <el-input v-model="form.workAddr" placeholder="请输入工作地点" />
            </el-form-item>
        
            <el-form-item label="招聘人数" prop="number">
              <el-input v-model="form.number" placeholder="请输入招聘人数" />
            </el-form-item>
            <el-form-item label="薪资待遇" prop="xzLevel">
              <el-select v-model="form.xzLevel" placeholder="请选择薪资待遇">
                <el-option
                  v-for="dict in dict.type.sys_xz_level"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="公司规模" prop="corpLevel">
              <el-select v-model="form.corpLevel" placeholder="请选择公司规模">
                <el-option
                  v-for="dict in dict.type.sys_corp_level"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="学历要求" prop="eduLevel">
              <el-select v-model="form.eduLevel" placeholder="请选择学历要求">
                <el-option
                  v-for="dict in dict.type.sys_edu_level"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
              <el-form-item label="联系人" prop="contact">
                <el-input v-model="form.contact" placeholder="请输入联系人" />
              </el-form-item>


              <el-form-item label="联系电话" prop="tel">
                <el-input v-model="form.tel" placeholder="请输入联系电话" />
              </el-form-item>

            <el-form-item label="邮箱地址" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱地址" />
            </el-form-item>
            <el-form-item label="截止日期" prop="voidDate">
              <el-input v-model="form.voidDate" placeholder="请输入截止日期" />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>

        </el-row>        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listJob, getJob, delJob, addJob, updateJob } from "@/api/job/zhaopin";

export default {
  name: "Job",
  dicts: ['sys_corp_level', 'sys_xz_level', 'sys_edu_level'],
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
      // job表格数据
      jobList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        jobName: null,
        corpName: null,
        workAddr: null,
        number: null,
        xzLevel: null,
        corpLevel: null,
        eduLevel: null,
        contact: null,
        tel: null,
        email: null,
        voidDate: null,
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
    /** 查询job列表 */
    getList() {
      this.loading = true;
      listJob(this.queryParams).then(response => {
        this.jobList = response.rows;
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
        jobId: null,
        jobName: null,
        corpName: null,
        workAddr: null,
        number: null,
        xzLevel: null,
        corpLevel: null,
        eduLevel: null,
        contact: null,
        tel: null,
        email: null,
        voidDate: null,
        delFlag: null,
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
      this.ids = selection.map(item => item.jobId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加招聘信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const jobId = row.jobId || this.ids
      getJob(jobId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改招聘信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.jobId != null) {
            updateJob(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addJob(this.form).then(response => {
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
      const jobIds = row.jobId || this.ids;
      this.$modal.confirm('是否确认删除编号为"' + jobIds + '"的招聘信息吗？').then(function() {
        return delJob(jobIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('job/job/export', {
        ...this.queryParams
      }, `job_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

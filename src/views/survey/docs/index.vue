<template>
    <div class="app-container">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="问卷名称" prop="surveyName">
          <el-input
            v-model="queryParams.surveyName"
            placeholder="请输入问卷名称"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="填报编号" prop="resultNo">
          <el-input
            v-model="queryParams.resultNo"
            placeholder="请输入填报编号"
            clearable
            @keyup.enter.native="handleQuery"
          />
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
        <el-form-item label="归属部门" prop="deptName">
          <el-input
            v-model="queryParams.deptName"
            placeholder="请输入归属部门"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="queryParams.sex" placeholder="请选择性别" clearable>
            <el-option
              v-for="dict in dict.type.sys_user_sex"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker clearable
            v-model="queryParams.birthday"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择生日">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input
            v-model="queryParams.phonenumber"
            placeholder="请输入手机号码"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="提交时间">
          <el-date-picker
            v-model="daterangeCommitTime"
            style="width: 240px"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
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
            icon="el-icon-s-order"
            size="mini"
            :disabled="single"
            @click="handleViewDocs"
            v-hasPermi="['survey:docs:add']"
          >查看</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['survey:docs:remove']"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
            v-hasPermi="['survey:docs:export']"
          >导出</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="resultList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="填报编号" align="center" prop="resultNo" width="150" />
        <el-table-column label="提交时间" align="center" prop="commitTime" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.commitTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="问卷名称" align="center" prop="surveyName"  width="280" />
        <el-table-column label="学员账号" align="center" prop="userName" />
        <el-table-column label="学员名称" align="center" prop="nickName"  width="100" />
        <el-table-column label="归属部门" align="center" prop="deptName"  width="280" />
        <el-table-column label="性别" align="center" prop="sex">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.sys_user_sex" :value="scope.row.sex"/>
          </template>
        </el-table-column>
        <el-table-column label="生日" align="center" prop="birthday" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.birthday) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="手机号码" align="center" prop="phonenumber" width="180"/>
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
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-s-order"
              @click="handleViewDocs(scope.row)"
              v-hasPermi="['scale:report:list']"
            >查看</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['scale:report:remove']"
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


      <!-- 添加或修改测评报告对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="填报编号" prop="resultNo">
            <el-input v-model="form.contextNo" placeholder="请输入填报编号" />
          </el-form-item>
          <el-form-item label="问卷名称" prop="surveyName">
            <el-input v-model="form.contextName" placeholder="请输入问卷名称" />
          </el-form-item>
          <el-form-item label="学员账号" prop="userName">
            <el-input v-model="form.userName" placeholder="请输入学员账号" />
          </el-form-item>
          <el-form-item label="学员名称" prop="nickName">
            <el-input v-model="form.nickName" placeholder="请输入学员名称" />
          </el-form-item>
          <el-form-item label="性别" prop="sex">
            <el-select v-model="form.sex" placeholder="请选择性别">
              <el-option
                v-for="dict in dict.type.sys_user_sex"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="归属部门" prop="deptName">
            <el-input v-model="form.deptName" placeholder="请输入归属部门" />
          </el-form-item>
          <el-form-item label="生日" prop="birthday">
            <el-date-picker clearable
              v-model="form.birthday"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="请选择生日">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input v-model="form.phonenumber" placeholder="请输入手机号码" />
          </el-form-item>
          <el-form-item label="提交时间" prop="commitTime">
            <el-date-picker clearable
              v-model="form.commitTime"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="请选择提交时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { listDocs,getDocs,delDocs} from "@/api/survey/docresults";
  
  export default {
    name: "docs",
    dicts: ['sys_user_sex'],
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
        // 量表名称
        contextName: undefined,      
        // 量表树选项
        contextOptions: undefined,
        // 填报表格数据
        resultList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 备注时间范围
        daterangeCommitTime: [],
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          resultNo: null,
          surveyId: null,
          surveyName: null,
          deptName: null,
          userName: null,
          nickName: null,
          sex: null,
          birthday: null,
          phonenumber: null,
          commitTime: null,
        },
        // 表单参数
        form: {},
        defaultProps: {
          children: "children",
          label: "label"
        },
        // 表单校验
        rules: {
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {   
      /** 查询列表 */
      getList() {
        this.loading = true;
        this.queryParams.params = {};
        if (null != this.daterangeCommitTime && '' != this.daterangeCommitTime) {
          this.queryParams.params["beginCommitTime"] = this.daterangeCommitTime[0];
          this.queryParams.params["endCommitTime"] = this.daterangeCommitTime[1];
        }
        listDocs(this.queryParams).then(response => {
          this.resultList = response.rows;
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
          resultId: null,
          resultNo: null,
          surveyId: null,
          surveyName: null,
          deptId: null,
          deptName: null,
          userId: null,
          userName: null,
          nickName: null,
          userType: null,
          sex: null,
          birthday: null,
          phonenumber: null,
          commitTime: null,
          jsonResult: null,
          thinJsonResult: null,
          jsonReport: null,
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
        this.daterangeCommitTime = [];
        this.queryParams.surveyId=null;
        this.resetForm("queryForm");
        this.handleQuery();
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.resultId)
        this.single = selection.length!==1
        this.multiple = !selection.length
      },
      /** 查看按钮操作 */
      handleViewDocs(row) {
        this.reset();
        const resultId = row.resultId || this.ids
        getDocs(resultId).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "查看填报结果";
        });
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const resultIds = row.resultId || this.ids;
        this.$modal.confirm('是否确认删除填报编号为"' + resultIds + '"的数据项？').then(function() {
          return delDocs(resultIds);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => {});
      },
      /** 导出按钮操作 */
      handleExport() {
        this.download('survey/docs/export', {
          ...this.queryParams
        }, `report_${new Date().getTime()}.xlsx`)
      }
    }
  };
  </script>

  
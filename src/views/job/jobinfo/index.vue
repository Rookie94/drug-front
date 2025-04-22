<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="工作标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入工作标题"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工作状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择工作状态" clearable>
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审批状态" prop="appored">
        <el-select v-model="queryParams.appored" placeholder="请选择审批状态" clearable>
          <el-option
            v-for="dict in dict.type.sys_resouces_status"
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
          v-hasPermi="['job:jobinfo:add']"
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
          v-hasPermi="['job:jobinfo:edit']"
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
          v-hasPermi="['job:jobinfo:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['job:jobinfo:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-upload"
          size="mini"
          :disabled="multiple"
          @click="handleAppor"
          v-hasPermi="['job:jobinfo:appor']"
        >审批并发布</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-refresh-left"
          size="mini"
          :disabled="multiple"
          @click="handleUnAppor"
          v-hasPermi="['job:jobinfo:unappor']"
        >撤回审批</el-button>
      </el-col>   
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="jobinfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="orderNum" />
      <el-table-column label="工作标题"  width="320" align="center" prop="title" />
      <el-table-column label="封面图片" align="center" prop="pic" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.pic" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="工作状态" align="center" key="status">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
      </el-table-column>
      <el-table-column label="审批状态" align="center" prop="appored">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_resouces_status" :value="scope.row.appored"/>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center" prop="publishTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.publishTime) }}</span>
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
      <el-table-column label="审批者" align="center" prop="apporBy" />
      <el-table-column label="审批时间" align="center" prop="apporTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.apporTime) }}</span>
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
            v-hasPermi="['job:jobinfo:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['job:jobinfo:remove']"
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

    <PublishDialog ref="publishDialog" @confirm="handlePublishConfirm" />

    <!-- 添加或修改招聘信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="880px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="序号" prop="orderNum">
          <el-input v-model="form.orderNum" placeholder="请输入序号" />
        </el-form-item>
        <el-form-item label="工作标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入工作标题" />
        </el-form-item>
        <el-form-item label="封面图片" prop="pic">
          <image-upload v-model="form.pic"/>
        </el-form-item>
        <el-form-item label="工作内容">
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
import { listJobinfo,listApporedJobInfoIds, getJobinfo, delJobInfo, addJobinfo, updateJobinfo,changJobInfoStatus,apporJobInfo,unApporJobInfo} from "@/api/job/jobinfo";
import PublishDialog from '@/components/PublishDialog'

export default {
  name: "Jobinfo",
  dicts: ['sys_normal_disable', 'sys_resouces_status'],
  components: {
    PublishDialog
  },
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
      // 招聘信息表格数据
      jobinfoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: null,
        status: null,
        appored: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        orderNum: [
          { required: true, message: "序号不能为空", trigger: "blur" }
        ],
        title: [
          { required: true, message: "工作标题不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "工作内容不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询招聘信息列表 */
    getList() {
      this.loading = true;
      listJobinfo(this.queryParams).then(response => {
        this.jobinfoList = response.rows;
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
        jobid: null,
        orderNum: null,
        title: null,
        pic: null,
        content: null,
        status: null,
        appored: null,
        userId: null,
        deptId: null,
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
      this.ids = selection.map(item => item.jobid)
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
      const jobid = row.jobid || this.ids
      getJobinfo(jobid).then(response => {
        if(response.data.appored!="0"){
          this.$modal.msgSuccess("编号为:" + jobid + "的单据已审核,请撤销审核再修改!");
          return;
        }
        this.form = response.data;
        this.open = true;
        this.title = "修改招聘信息";
      });
    },
     // 状态修改
     handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.title + '"吗？').then(function() {
        const jobid = row.jobid || this.ids;
        return changeJobInfoStatus(jobid, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0";
      });
    },      
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.jobid != null) {
            updateJobinfo(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addJobinfo(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    /*
    handleDelete(row) {
      const jobids = row.jobid || this.ids;
      this.$modal.confirm('是否确认删除招聘信息编号为"' + jobids + '"的数据项？').then(function() {
        return delJobinfo(jobids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    */
    /** 删除按钮操作 */
    async handleDelete(row) {
      try {
        const jobids = row.jobids || this.ids;
        const apporedList = await listApporedJobInfoIds(jobids)
        if(apporedList.length>0){
          this.$modal.msgSuccess("编号为:" + jobids + "的单据存在已审核单据,请撤销审核再删除!");
          return; 
        }
        else{
          this.$modal.confirm('是否确认删除编号为"' + jobids + '"的数据项？').then(function() {
            return delJobInfo(jobids);
            }).then(() => {
              this.getList();
              this.$modal.msgSuccess("删除成功");
          }).catch(() => {});  
        }
      } catch (error) {
        //
      }
    },   
    /** 导出按钮操作 */
    handleExport() {
      this.download('res/jobinfo/export', {
        ...this.queryParams
      }, `jobinfo_${new Date().getTime()}.xlsx`)
    },
    /** 审批发布操作 */
    handleAppor(row) {
      const jobids = row.jobids || this.ids;
      this.$modal.confirm('是否确认审批发布编号为"' + jobids + '"的数据项？').then(function() {
        //
      }).then(() => {
        this.$refs.publishDialog.Ids=jobids;
        this.$refs.publishDialog.openDialog();
      }).catch(() => {});
    },
    handlePublishConfirm(result) {
      if (result) {
        if (result.type === "instant") {
          apporJobInfo(2,this.$refs.publishDialog.Ids,"").then(response => {
            this.getList();
            this.$modal.msgSuccess("审批发布成功");
          }).catch(() => {});
        } 
        else if (result.type === "scheduled") {
          apporJobInfo(1,this.$refs.publishDialog.Ids,result.date).then(response =>{
            this.getList();
            this.$modal.msgSuccess("审批发布成功");
          }).catch(() => {});
        }
      }
    },          
    /** 撤销审批操作 */
    handleUnAppor(row) {
      const jobids = row.jobids || this.ids;
      this.$modal.confirm('是否取消审批发布编号为"' + jobids + '"的数据项？').then(function() {
          return unApporJobInfo(jobids);
      }).then(() => {
          this.getList();
          this.$modal.msgSuccess("取消审批发布成功");
      }).catch(() => {});
    }    
  }
};
</script>

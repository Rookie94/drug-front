<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="技能标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入技能标题"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="技能状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择技能状态" clearable>
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
          v-hasPermi="['job:skill:add']"
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
          v-hasPermi="['job:skill:edit']"
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
          v-hasPermi="['job:skill:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['job:skill:export']"
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
          v-hasPermi="['res:skill:appor']"
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
          v-hasPermi="['res:skill:unappor']"
        >撤回审批</el-button>
      </el-col>   
	  
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="skillList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="orderNum" />
      <el-table-column label="技能标题" width="280" align="center" prop="title" />
      <el-table-column label="封面图片" align="center" prop="pic" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.pic" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="技能类型" align="center" prop="skillType" />
 
      <el-table-column label="状态" align="center" key="status">
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
            v-hasPermi="['job:skill:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['job:skill:remove']"
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

    <!-- 添加或修改技能信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="880px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="序号" prop="orderNum">
          <el-input v-model="form.orderNum" placeholder="请输入序号" />
        </el-form-item>
        <el-form-item label="技能标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入技能标题" />
        </el-form-item>
        <el-form-item label="封面图片" prop="pic">
          <image-upload v-model="form.pic"/>
        </el-form-item>
        <el-form-item label="技能内容">
          <editor v-model="form.content" :min-height="192"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
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
import { listSkill,listApporedSkillIds, getSkill, delSkill, addSkill, updateSkill ,changSkillStatus,apporSkill,unApporSkill} from "@/api/job/skill";
import PublishDialog from '@/components/PublishDialog'

export default {
  name: "Skill",
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
      // 技能信息表格数据
      skillList: [],
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
        title: [
          { required: true, message: "技能标题不能为空", trigger: "blur" }
        ],
        skillType: [
          { required: true, message: "技能类型不能为空", trigger: "change" }
        ],
        content: [
          { required: true, message: "技能内容不能为空", trigger: "change" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询技能信息列表 */
    getList() {
      this.loading = true;
      listSkill(this.queryParams).then(response => {
        this.skillList = response.rows;
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
        skillid: null,
        orderNum: null,
        title: null,
        pic: null,
        skillType: null,
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
      this.ids = selection.map(item => item.skillid)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加技能信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const skillid = row.skillid || this.ids
      getSkill(skillid).then(response => {
        if(response.data.appored!="0"){
          this.$modal.msgSuccess("编号为:" + skillid + "的单据已审核,请撤销审核再修改!");
          return;
        }		  
        this.form = response.data;
        this.open = true;
        this.title = "修改技能信息";
      });
    },
    // 案例状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.title + '"吗？').then(function() {
        const skillid = row.skillid || this.ids;
        return changSkillStatus(skillid, row.status);
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
          if (this.form.skillid != null) {
            updateSkill(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSkill(this.form).then(response => {
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
      const skillids = row.skillid || this.ids;
      this.$modal.confirm('是否确认删除技能信息编号为"' + skillids + '"的数据项？').then(function() {
        return delSkill(skillids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
	*/
    /** 删除按钮操作 */
    async handleDelete(row) {
      try {
        const skillids = row.skillid || this.ids;
        const apporedList = await listApporedSkillIds(skillids)
        if(apporedList.length>0){
          this.$modal.msgSuccess("编号为:" + skillids + "的单据存在已审核单据,请撤销审核再删除!");
          return; 
        }
        else{
          this.$modal.confirm('是否确认删除编号为"' + skillids + '"的数据项？').then(function() {
            return delSkill(skillids);
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
      this.download('job/skill/export', {
        ...this.queryParams
      }, `skill_${new Date().getTime()}.xlsx`)
    },
    /** 审批发布操作 */
    handleAppor(row) {
      const skillids = row.skillid || this.ids;
      this.$modal.confirm('是否确认审批发布编号为"' + skillids + '"的数据项？').then(function() {
        //
      }).then(() => {
        this.$refs.publishDialog.Ids=skillids;
        this.$refs.publishDialog.openDialog();
      }).catch(() => {});
    },
    handlePublishConfirm(result) {
      if (result) {
        if (result.type === "instant") {
          apporSkill(2,this.$refs.publishDialog.Ids,"").then(response => {
            this.getList();
            this.$modal.msgSuccess("审批发布成功");
          }).catch(() => {});
        } 
        else if (result.type === "scheduled") {
          apporSkill(1,this.$refs.publishDialog.Ids,result.date).then(response =>{
            this.getList();
            this.$modal.msgSuccess("审批发布成功");
          }).catch(() => {});
        }
      }
    },        
    /** 撤销审批操作 */
    handleUnAppor(row) {
      const skillids = row.skillid || this.ids;
      this.$modal.confirm('是否取消审批发布编号为"' + skillids + '"的数据项？').then(function() {
          return unApporSkill(skillids);
      }).then(() => {
          this.getList();
          this.$modal.msgSuccess("取消审批发布成功");
      }).catch(() => {});
    }
  }
};
</script>

<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="文章标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入文章标题"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="栏目" prop="categoryId">
        <el-select v-model="queryParams.categoryId" placeholder="请选择栏目" clearable @change="handleCategorySelectChange" >
        <el-option
          v-for="dict in categoryOptions"
          :key="dict.id"
          :label="dict.categoryName"
          :value="dict.id"
        />
        </el-select>
      </el-form-item>

      <el-form-item label="分类" prop="typeId">
        <el-select v-model="queryParams.typeId" placeholder="请选择分类" clearable >
        <el-option
          v-for="dict in subCategoryOptions"
          :key="dict.id"
          :label="dict.categoryName"
          :value="dict.id"
        />
        </el-select>
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
          v-hasPermi="['res:articles:add']"
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
          v-hasPermi="['res:articles:edit']"
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
          v-hasPermi="['res:articles:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['res:articles:export']"
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
          v-hasPermi="['res:case:appor']"
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
          v-hasPermi="['res:case:unappor']"
        >撤回审批</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="articlesList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="orderNum" />
      <el-table-column label="首页图片" align="center" prop="pic" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.pic" :width="50" :height="50"/>
        </template>
      </el-table-column>     
      <el-table-column label="文章标题"  width="280" align="center" prop="title" />
      <el-table-column label="栏目" align="center" prop="categoryName" />
      <el-table-column label="分类" align="center" prop="typeName" />
      <el-table-column label="阅读量" align="center" prop="views" />
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
      <el-table-column label="审核者" align="center" prop="apporBy" />
      <el-table-column label="审核时间" align="center" prop="apporTime" width="180">
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
            v-hasPermi="['res:articles:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['res:articles:remove']"
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

    <!-- 添加或修改资讯发布对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="880px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="序号" prop="orderNum" >
          <el-input v-model="form.orderNum" placeholder="请输入序号" />
        </el-form-item>
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="首页图片" prop="pic">
          <image-upload v-model="form.pic"/>
        </el-form-item>        
        <el-form-item label="栏目" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择栏目" clearable @change="handleCategorySelectChange2" >
            <el-option
              v-for="dict in categoryOptions"
              :key="dict.id"
              :label="dict.categoryName"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="分类" prop="typeId">
          <el-select v-model="form.typeId" placeholder="请选择分类" clearable >
            <el-option
              v-for="dict in subCategoryOptions"
              :key="dict.id"
              :label="dict.categoryName"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="内容">
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
import { listArticles,listCategorys,listSubCategorys,listApporedArticlesIds, getArticles, delArticles, addArticles, updateArticles,changeArticlesStatus,apporArticles,unApporArticles } from "@/api/res/articles";

import PublishDialog from '@/components/PublishDialog'

export default {
  name: "Articles",
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
      //栏目
      categoryOptions: [],    
      //分类
      subCategoryOptions: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 资讯发布表格数据
      articlesList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: null,
        categoryId: null,
        typeId: null,
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
          { required: true, message: "文章标题不能为空", trigger: "blur" }
        ],
        categoryId: [
          { required: true, message: "栏目不能为空", trigger: "blur" }
        ],
        typeId: [
          { required: true, message: "分类不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "内容不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
    this.getCategoryList();
  },
  methods: {    
    //获取栏目
    getCategoryList() {
      listCategorys().then(response => {
        this.categoryOptions = response.rows;
      });
    },      
    //处理栏目选择改变
    handleCategorySelectChange() {
      if(this.queryParams.categoryId!=""){
        this.getSubCategorys(this.queryParams);
      }
      else{
        this.queryParams.typeId = null;
        this.subCategoryOptions=[];
      }
    },  
    //处理栏目选择改变
    handleCategorySelectChange2() {
      if(this.form.categoryId!=""){
        this.getSubCategorys(this.form);
      }
      else{
        this.form.typeId = null;
        this.subCategoryOptions=[];
      }
    },      
    //获取栏目分类
    getSubCategorys(params) {      
      listSubCategorys(params).then(response => {
        this.subCategoryOptions = response.rows;
      }); 
    },       
    /** 查询资讯发布列表 */
    getList() {
      this.loading = true;
      listArticles(this.queryParams).then(response => {
        this.articlesList = response.rows;
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
        articleId: null,
        orderNum: null,
        title: null,
        categoryId: null,
        typeId: null,
        content: null,
        views: null,
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
      this.ids = selection.map(item => item.articleId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加资讯发布";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const articleId = row.articleId || this.ids
      getArticles(articleId).then(response => {
        if(response.data.appored!="0"){
          this.$modal.msgSuccess("编号为:" + articleId + "的单据已审核,请撤销审核再修改!");
          return;
        }        
        this.form = response.data;
        this.open = true;
        this.title = "修改资讯发布";
      });
    },
    //文章状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.title + '"吗？').then(function() {
        const articleId = row.articleId || this.ids;
        return changeArticlesStatus(articleId, row.status);
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
          if (this.form.articleId != null) {
            updateArticles(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addArticles(this.form).then(response => {
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
      const articleIds = row.articleId || this.ids;
      this.$modal.confirm('是否确认删除资讯发布编号为"' + articleIds + '"的数据项？').then(function() {
        return delArticles(articleIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    */
    /** 删除按钮操作 */
    async handleDelete(row) {
      try {
        const articleIds = row.articleId || this.ids;
        const apporedList = await listApporedArticlesIds(articleIds)
        if(apporedList.length>0){
          this.$modal.msgSuccess("编号为:" + articleIds + "的单据存在已审核单据,请撤销审核再删除!");
          return; 
        }
        else{
          this.$modal.confirm('是否确认删除编号为"' + articleIds + '"的数据项？').then(function() {
            return delArticles(articleIds);
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
      this.download('res/articles/export', {
        ...this.queryParams
      }, `articles_${new Date().getTime()}.xlsx`)
    },
    /** 审批发布操作 */
    handleAppor(row) {
      const articleIds = row.articleId || this.ids;
      this.$modal.confirm('是否确认审批发布编号为"' + articleIds + '"的数据项？').then(function() {
        //
      }).then(() => {
        this.$refs.publishDialog.Ids=articleIds;
        this.$refs.publishDialog.openDialog();
      }).catch(() => {});
    },
    handlePublishConfirm(result) {
      if (result) {
        if (result.type === "instant") {
          apporArticles(2,this.$refs.publishDialog.Ids,"").then(response => {
            this.getList();
            this.$modal.msgSuccess("审批发布成功");
          }).catch(() => {});
        } 
        else if (result.type === "scheduled") {
          apporArticles(1,this.$refs.publishDialog.Ids,result.date).then(response =>{
            this.getList();
            this.$modal.msgSuccess("审批发布成功");
          }).catch(() => {});
        }
      }
    },        
    /** 撤销审批操作 */
    handleUnAppor(row) {
      const articleIds = row.articleId || this.ids;
      this.$modal.confirm('是否取消审批发布编号为"' + articleIds + '"的数据项？').then(function() {
          return unApporArticles(articleIds);
      }).then(() => {
          this.getList();
          this.$modal.msgSuccess("取消审批发布成功");
      }).catch(() => {});
    }    
  }
};
</script>

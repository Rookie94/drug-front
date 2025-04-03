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
          <el-input
            v-model="queryParams.categoryId"
            placeholder="请输入栏目"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="简介" prop="desc">
          <el-input
            v-model="queryParams.desc"
            placeholder="请输入简介"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="置顶" prop="top">
          <el-input
            v-model="queryParams.top"
            placeholder="请输入置顶"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="阅读" prop="views">
          <el-input
            v-model="queryParams.views"
            placeholder="请输入阅读"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="首页图片" prop="pic">
          <el-input
            v-model="queryParams.pic"
            placeholder="请输入首页图片"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="首页图片" prop="picLink">
          <el-input
            v-model="queryParams.picLink"
            placeholder="请输入首页图片"
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
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
  
      <el-table v-loading="loading" :data="articlesList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="文章ID" align="center" prop="articleId" />
        <el-table-column label="文章标题" align="center" prop="title" />
        <el-table-column label="栏目" align="center" prop="categoryId" />
        <el-table-column label="分类" align="center" prop="type" />
        <el-table-column label="简介" align="center" prop="desc" />
        <el-table-column label="文本编辑器类型" align="center" prop="contentType" />
        <el-table-column label="内容" align="center" prop="content" />
        <el-table-column label="Markdown格式内容" align="center" prop="contentMarkdown" />
        <el-table-column label="置顶" align="center" prop="top" />
        <el-table-column label="阅读" align="center" prop="views" />
        <el-table-column label="状态" align="center" prop="status" />
        <el-table-column label="首页图片类型" align="center" prop="picType" />
        <el-table-column label="首页图片" align="center" prop="pic" />
        <el-table-column label="首页图片" align="center" prop="picLink" />
        <el-table-column label="附件列表" align="center" prop="files" />
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
  
      <!-- 添加或修改资讯发布对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="文章标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入文章标题" />
          </el-form-item>
          <el-form-item label="栏目" prop="categoryId">
            <el-input v-model="form.categoryId" placeholder="请输入栏目" />
          </el-form-item>
          <el-form-item label="简介" prop="desc">
            <el-input v-model="form.desc" placeholder="请输入简介" />
          </el-form-item>
          <el-form-item label="内容">
            <editor v-model="form.content" :min-height="192"/>
          </el-form-item>
          <el-form-item label="Markdown格式内容" prop="contentMarkdown">
            <el-input v-model="form.contentMarkdown" type="textarea" placeholder="请输入内容" />
          </el-form-item>
          <el-form-item label="置顶" prop="top">
            <el-input v-model="form.top" placeholder="请输入置顶" />
          </el-form-item>
          <el-form-item label="阅读" prop="views">
            <el-input v-model="form.views" placeholder="请输入阅读" />
          </el-form-item>
          <el-form-item label="首页图片" prop="pic">
            <el-input v-model="form.pic" placeholder="请输入首页图片" />
          </el-form-item>
          <el-form-item label="首页图片" prop="picLink">
            <el-input v-model="form.picLink" placeholder="请输入首页图片" />
          </el-form-item>
          <el-form-item label="附件列表" prop="files">
            <el-input v-model="form.files" type="textarea" placeholder="请输入内容" />
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
  import { listArticles, getArticles, delArticles, addArticles, updateArticles } from "@/api/res/articles";
  
  export default {
    name: "Articles",
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
          type: null,
          desc: null,
          contentType: null,
          content: null,
          contentMarkdown: null,
          top: null,
          views: null,
          status: null,
          picType: null,
          pic: null,
          picLink: null,
          files: null,
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          title: [
            { required: true, message: "文章标题不能为空", trigger: "blur" }
          ],
          categoryId: [
            { required: true, message: "栏目不能为空", trigger: "blur" }
          ],
          contentType: [
            { required: true, message: "文本编辑器类型不能为空", trigger: "change" }
          ],
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
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
          title: null,
          categoryId: null,
          type: null,
          desc: null,
          contentType: null,
          content: null,
          contentMarkdown: null,
          top: null,
          views: null,
          status: null,
          picType: null,
          pic: null,
          picLink: null,
          files: null,
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
          this.form = response.data;
          this.open = true;
          this.title = "修改资讯发布";
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
      handleDelete(row) {
        const articleIds = row.articleId || this.ids;
        this.$modal.confirm('是否确认删除资讯发布编号为"' + articleIds + '"的数据项？').then(function() {
          return delArticles(articleIds);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => {});
      },
      /** 导出按钮操作 */
      handleExport() {
        this.download('res/articles/export', {
          ...this.queryParams
        }, `articles_${new Date().getTime()}.xlsx`)
      }
    }
  };
  </script>
  
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="活动代码" prop="activityCode">
        <el-input
          v-model="queryParams.activityCode"
          placeholder="请输入活动代码"
          clearable
          @keyup.enter.native="handleQuery"
          style="width: 220px"
        />
      </el-form-item>
      <el-form-item label="活动主题" prop="activityName">
        <el-input
          v-model="queryParams.activityName"
          placeholder="请输入活动主题"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker clearable
          v-model="queryParams.startTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择开始时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker clearable
          v-model="queryParams.endTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择结束时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="评分：" prop="rating">
        <el-select v-model="queryParams.rating" placeholder="请选择评分" clearable>
          <el-option
            v-for="dict in dict.type.sys_review_level"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="用户账号" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户账号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户昵称" prop="nickName">
        <el-input
          v-model="queryParams.nickName"
          placeholder="请输入用户昵称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="phoneNumber">
        <el-input
          v-model="queryParams.phoneNumber"
          placeholder="请输入手机号码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="归属部门" prop="deptId">
        <el-input
          v-model="queryParams.deptId"
          placeholder="请输入归属部门"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="部门名称" prop="deptName">
        <el-input
          v-model="queryParams.deptName"
          placeholder="请输入部门名称"
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
          v-show="false"
          @click="handleAdd"
          v-hasPermi="['offline:review:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          v-show="false"
          @click="handleUpdate"
          v-hasPermi="['offline:review:edit']"
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
          v-hasPermi="['offline:review:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['offline:review:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="reviewList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="活动代码" width="150" align="left" prop="activityCode" />
      <el-table-column label="活动主题" width="280" align="center" prop="activityName" />
      <el-table-column label="学员账号" align="center" prop="userName" />
      <el-table-column label="学员名称" width="100" align="center" prop="nickName" />
      <el-table-column label="手机号码" width="120"  align="center" prop="phoneNumber" />
      <el-table-column label="归属部门" width="220" align="center" prop="deptName" />
      <el-table-column label="评价时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="评价" align="center" prop="rating">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_review_level" :value="scope.row.rating"/>
        </template>
      </el-table-column>
      <el-table-column label="评价内容" width="280" align="center" prop="content" />
      <el-table-column label="评价照片" width="480" align="left" >
        <template slot-scope="scope" v-if="scope.row.pic">
          <!-- 新增外层容器 -->
          <div class="horizontal-container">
            <image-preview 
              v-for="(img,index) in scope.row.pic.split(',')"
              :key="index"
              :width="50"
              :height="50"
              :src="img"
              class="image-item"
            />
          </div>
        </template>
        <template v-else>
          <!-- 可添加占位提示 -->
          <span>暂无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="startTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.endTime) }}</span>
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
            v-hasPermi="['offline:review:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['offline:review:remove']"
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


    <!-- 添加或修改活动评价对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <!-- 活动主题单独一行 -->
        <el-form-item label="活动主题" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动主题" disabled />
        </el-form-item>
        <!-- 时间及评分同一行 -->
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                clearable
                v-model="form.startTime"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择开始时间"
                style="width: 100%;"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                clearable
                v-model="form.endTime"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择结束时间"
                style="width: 100%;"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="用户账号" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入用户账号" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户昵称" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="手机号码" prop="phoneNumber">
              <el-input v-model="form.phoneNumber" placeholder="请输入手机号码" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入部门名称" disabled />
            </el-form-item>
          </el-col>  
        </el-row>
        
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="评价" prop="rating">
              <el-select
                v-model="form.rating"
                placeholder="请选择评价"
                style="width: 100%;"
              >
                <el-option
                  v-for="dict in dict.type.sys_review_level"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="评价内容">
          <editor v-model="form.content" :min-height="192"/>
        </el-form-item>
        
        <el-form-item label="图片上传" prop="pic">
          <image-upload v-model="form.pic"/>
        </el-form-item>

        <el-form-item label="评价说明" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入评价说明" />
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
import { listReview, getReview, delReview, addReview, updateReview } from "@/api/offline/review";

export default {
  name: "Review",
  dicts: ['sys_review_level'],
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
      // 活动评价表格数据
      reviewList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        reviewId: null,
        activityId: null,
        activityCode: null,
        activityName: null,
        startTime: null,
        endTime: null,
        rating: null,
        content: null,
        pic: null,
        userId: null,
        userType: null,
        userName: null,
        nickName: null,
        phoneNumber: null,
        deptId: null,
        deptName: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        reviewId: [
          { required: true, message: "评价id不能为空", trigger: "blur" }
        ],
        activityId: [
          { required: true, message: "活动id不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询活动评价列表 */
    getList() {
      this.loading = true;
      listReview(this.queryParams).then(response => {
        this.reviewList = response.rows;
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
        reviewId: null,
        activityId: null,
        activityName: null,
        startTime: null,
        endTime: null,
        rating: null,
        content: null,
        pic: null,
        delFlag: null,
        userId: null,
        userType: null,
        userName: null,
        nickName: null,
        phoneNumber: null,
        deptId: null,
        deptName: null,
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
      this.ids = selection.map(item => item.reviewId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加活动评价";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const reviewId = row.reviewId || this.ids
      getReview(reviewId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改活动评价";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.reviewId != null) {
            updateReview(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addReview(this.form).then(response => {
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
      const reviewIds = row.reviewId || this.ids;
      this.$modal.confirm('是否确认删除活动评价编号为"' + reviewIds + '"的数据项？').then(function() {
        return delReview(reviewIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('offline/review/export', {
        ...this.queryParams
      }, `review_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<style scoped>

/* 添加容器样式 */
::v-deep .horizontal-container {
  display: flex;
  flex-wrap: wrap;        /* 允许换行 */
  gap: 8px;               /* 图片间距 */
  align-items: center;    /* 垂直居中 */
  max-width: 100%;        /* 限制容器宽度 */
}

/* 可选：处理最后一行对齐问题 */
::v-deep .horizontal-container {
  margin-bottom: -8px;    /* 补偿最后一行间距 */
}

::v-deep .image-item {
  flex-shrink: 0;         /* 防止图片缩小 */
}

</style>

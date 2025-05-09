<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">

      <el-form-item label="主活动名" prop="parentActivityName">
        <el-input
          v-model="queryParams.parentActivityName"
          placeholder="请输入主活动名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="子活动名" prop="activityName">
        <el-input
          v-model="queryParams.activityName"
          placeholder="请输入子活动名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="组织者" prop="orgName">
        <el-input
          v-model="queryParams.orgName"
          placeholder="请输入活动组织者"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="活动类型" prop="activityType">
        <el-select v-model="queryParams.activityType" placeholder="请选择活动类型" clearable>
          <el-option
            v-for="dict in dict.type.sys_activities_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="活动地点" prop="address">
        <el-input
          v-model="queryParams.address"
          placeholder="请输入活动地点"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="现场主题" prop="subject">
        <el-input
          v-model="queryParams.subject"
          placeholder="请输入现场主题"
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
      <el-form-item label="发布时间">
        <el-date-picker
          v-model="daterangePublishTime"
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
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['offline:live:add']"
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
          v-hasPermi="['offline:live:edit']"
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
          v-hasPermi="['offline:live:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['offline:live:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="liveList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="活动详情" width="480" align="left" prop="" >
        <template slot-scope="scope">
          <span><span class="label-style1">活动主题:</span>{{ (scope.row.parentActivityName==null ? '':scope.row.parentActivityName) +" (" + scope.row.activityName + ")" }}</span></br>
          <span><span class="label-style1">活动地点:</span>{{ scope.row.address }}</span></br>
          <span><span class="label-style1">组织者:</span>{{ scope.row.orgName }}</span></br>
          <span><span class="label-style1">开始时间:</span>{{ scope.row.startTime }}</span></br>
          <span><span class="label-style1">结束时间:</span>{{ scope.row.endTime }}</span></br>
          <span>
            <span class="label-style1">活动类型:</span>
            <dict-tag 
            :options="dict.type.sys_activities_type" 
            :value="scope.row.activityType"
            style="white-space: nowrap; display: inline-block;"
            />
          </span>
        </template>
      </el-table-column>
      <el-table-column label="现场主题" width="320" align="left" prop="subject" />
      <el-table-column label="现场照片墙" width="480" align="left" >
        <template slot-scope="scope">
          <!-- 新增外层容器 -->
          <div class="horizontal-container">
            <image-preview 
              v-for="(img,index) in scope.row.img.split(',')"
              :key="index"
              :width="50"
              :height="50"
              :src="img"
              class="image-item"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="审批状态" align="center" prop="appored">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_resouces_status" :value="scope.row.appored"/>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center" prop="publishTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.publishTime)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime)}}</span>
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
      <el-table-column label="现场说明" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['offline:live:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['offline:live:remove']"
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

    <!-- 添加或修改现场资讯对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="活动主题" prop="subject">
          <el-input v-model="form.subject" placeholder="请输入活动主题" />
        </el-form-item>
        <el-form-item label="现场照片" prop="img">
          <image-upload v-model="form.img"/>
        </el-form-item>
        <el-form-item label="现场详情">
          <editor v-model="form.content" :min-height="192"/>
        </el-form-item>
        <el-form-item label="现场说明" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入现场说明" />
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
import { listLive, getLive, delLive, addLive, updateLive } from "@/api/offline/live";

export default {
  name: "Live",
  dicts: ['sys_normal_disable', 'sys_resouces_status', 'sys_activities_type'],
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
      // VIEW表格数据
      liveList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 现场说明时间范围
      daterangePublishTime: [],
      // 现场说明时间范围
      daterangeCreateTime: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        activityName: null,
        parentActivityName: null,
        subject: null,
        status: null,
        address: null,
        orgName: null,
        startTime: null,
        endTime: null,
        activityType: null,
        appored: null,
        publishTime: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        liveId: [
          { required: true, message: "现场id不能为空", trigger: "blur" }
        ],
        activityId: [
          { required: true, message: "活动ID不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询VIEW列表 */
    getList() {
      this.loading = true;
      this.queryParams.params = {};
      if (null != this.daterangePublishTime && '' != this.daterangePublishTime) {
        this.queryParams.params["beginPublishTime"] = this.daterangePublishTime[0];
        this.queryParams.params["endPublishTime"] = this.daterangePublishTime[1];
      }
      if (null != this.daterangeCreateTime && '' != this.daterangeCreateTime) {
        this.queryParams.params["beginCreateTime"] = this.daterangeCreateTime[0];
        this.queryParams.params["endCreateTime"] = this.daterangeCreateTime[1];
      }
      listLive(this.queryParams).then(response => {
        this.liveList = response.rows;
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
        liveId: null,
        activityId: null,
        parentActivityId: null,
        activityName: null,
        parentActivityName: null,
        subject: null,
        img: null,
        content: null,
        status: null,
        address: null,
        orgName: null,
        startTime: null,
        endTime: null,
        activityType: null,
        appored: null,
        publishTime: null,
        delFlag: null,
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
      this.daterangePublishTime = [];
      this.daterangeCreateTime = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.liveId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加活动现场资讯";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const liveId = row.liveId || this.ids
      getLive(liveId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改活动现场资讯";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.liveId != null) {
            updateLive(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addLive(this.form).then(response => {
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
      const liveIds = row.liveId || this.ids;
      this.$modal.confirm('是否确认删除编号为"' + liveIds + '"的数据项？').then(function() {
        return delLive(liveIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('offline/live/export', {
        ...this.queryParams
      }, `live_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<style scoped>
::v-deep .label-style1 {
  color:#409EFF;
  font-weight:bold;
}
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

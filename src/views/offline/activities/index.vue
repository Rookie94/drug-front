<template>
  <div class="app-container">
    <div class="query-container">
      <el-row :gutter="20">  
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
          <el-row class="btnRow">
            <el-col :span="6" class="elrow">
              <el-form-item label="活动主题" prop="activityName">
                <el-input
                  v-model="queryParams.activityName"
                  placeholder="请输入活动主题"
                  clearable
                  @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6" class="elrow">
               <el-form-item label="组织者" prop="orgName">
                <el-input
                  v-model="queryParams.orgName"
                  placeholder="请输入活动组织者"
                  clearable
                  @keyup.enter.native="handleQuery"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6" :class="!foldAll ? 'btnRow' : 'unBtnRow'">
              <el-form-item label="开始时间" prop="startTime">
                <el-date-picker clearable
                  v-model="queryParams.startTime"
                  type="date"
                  value-format="yyyy-MM-dd"
                  placeholder="选择开始时间">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="6" :class="!foldAll ? 'btnRow' : 'unBtnRow'">
              <el-form-item label="结束时间" prop="endTime">
                <el-date-picker clearable
                  v-model="queryParams.endTime"
                  type="date"
                  value-format="yyyy-MM-dd"
                  placeholder="选择结束时间">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <search-button v-show="foldAll" :fold-all="foldAll" @closepop="closepop"  @handleQueryData="handleQuery" @handleResetData="resetQuery" />
          </el-row>
          <el-row :class="!foldAll ? 'btnRow' : 'unBtnRow'">
            <el-col :span="6" class="elrow">
              <el-form-item label="活动状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="请选择活动状态" clearable>
                  <el-option
                    v-for="dict in dict.type.sys_normal_disable"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>            
            <el-col :span="6" class="elrow">
              <el-form-item label="审批状态" prop="appored">
                <el-select v-model="queryParams.appored" placeholder="请选择审批状态" clearable>
                  <el-option
                    v-for="dict in dict.type.sys_activities_status"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <SearchButton v-show="!foldAll" :fold-all="foldAll" @closepop="closepop" @handleQueryData="handleQuery" @handleResetData="resetQuery" />
          </el-row>
        </el-form>
      </el-row>
    </div>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['offline:activities:add']"
        >发起活动</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['offline:activities:edit']"
        >修改活动</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['offline:activities:remove']"
        >删除活动</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-upload"
          size="mini"
          :disabled="multiple"
          @click="handleAppor"
          v-hasPermi="['offline:activities:appor']"
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
          v-hasPermi="['offline:activities:unappor']"
        >撤回审批</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-sort"
          size="mini"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="activitiesList"
      row-key="activityId"
      :default-expand-all="isExpandAll"
      :header-cell-style="{ 'text-align': 'center','background':'#5596F2','color':'#ffffff' }"
      @selection-change="handleSelectionChange"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}" 
      :height="tableHeight"
       max-height="600px"   
       size="medium"
      stripe
      fit
      highlight-current-row
      border
      style="width: 100%;height:50px"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="orderNum" >
        <template slot-scope="scope">
          <div v-if="scope.row.parentActivityId==0" class="fore-blue">
            主活动
          </div>
          <div v-else>
            {{scope.row.orderNum}}
          </div>
        </template>
      </el-table-column>
      
      <el-table-column label="活动主题"  width="280px" align="left" prop="activityName" >
        <template slot-scope="scope">          
          <div @click="handlePreview(scope.row)">
            <div :class="scope.row.parentActivityId==0 ? 'fore-darkblue' : 'fore-black'">
              <a style="color:#5596F2;">{{ scope.row.activityName }}</a>
            </div>            
          </div>
        </template>
      </el-table-column>

      <el-table-column label="子活动操作"  width="100" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            v-show="scope.row.parentActivityId==0"
            @click="handleAdd(scope.row)"
            v-hasPermi="['offline:activities:add']"
          >增加子活动</el-button>
        </template>
      </el-table-column>
      <el-table-column label="封面海报" align="center" prop="img" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.img" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="活动地点" width="300px;" align="center" prop="address" />
      <el-table-column label="活动类型" align="center" prop="activityType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_activities_type" :value="scope.row.activityType"/>
        </template>
      </el-table-column>
      <el-table-column label="活动状态" align="center" key="status">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center" prop="publishTime" width="180">
              <template slot-scope="scope">
                <span>{{ parseTime(scope.row.publishTime) }}</span>
              </template>
      </el-table-column>
      <el-table-column label="审批状态"  width="120px;" align="center" prop="appored">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_activities_status" :value="scope.row.appored"/>
        </template>
      </el-table-column>

      <el-table-column label="报名签到二维码" width="120px">
        <template #default="scope">
          <div style="display: flex; justify-content: center; align-items: center;">
            <qr-code :content="generateActivityQRContent(scope.row)" :size="100" style="width: 100px; height: 100px;" />
          </div>
        </template>
      </el-table-column>

      <el-table-column label="活动评价二维码" width="120px">
        <template #default="scope">
          <div style="display: flex; justify-content: center; align-items: center;">
            <qr-code :content="generateReviewQRContent(scope.row)" :size="100" style="width: 100px; height: 100px;" />
          </div>          
        </template>
      </el-table-column>

      <el-table-column label="组织者"  width="220px;" align="center" prop="orgName" />
      <el-table-column label="联系电话" width="220px;" align="center" prop="tel" />
      <el-table-column label="报名截止" align="center" prop="endTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.signDeadline) }}</span>
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
          <span>{{ parseTime(scope.row.apporTime)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动说明" align="center" prop="remark" />

    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <PublishDialog ref="publishDialog" @confirm="handlePublishConfirm" />

    <!-- 添加或修改活动发布对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="880px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px"  :disabled="!isEdit">
      <el-row>
        <el-col :span="6" v-show="form.parentActivityId!=0">     
          <el-form-item label="序号" prop="orderNum">
            <el-input v-model="form.orderNum" placeholder="请输入序号" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>  
        <el-form-item label="活动主题" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动主题" />
        </el-form-item>
      </el-row>
      <el-row>  
        <el-form-item label="封面海报" prop="img">
          <image-upload v-model="form.img"/>
        </el-form-item>
      </el-row>
      <el-row>  
        <el-form-item label="活动地点" prop="address" v-show="form.parentActivityId==0">
          <el-input v-model="form.address" placeholder="请输入活动地点" />
        </el-form-item>
      </el-row>
      <el-row>    
        <el-col :span="12">     
          <el-form-item label="组 织 者" prop="orgName" v-show="form.parentActivityId==0">
            <el-input v-model="form.orgName" placeholder="请输入活动组织者" />
          </el-form-item>
        </el-col>
        <el-col :span="12">    
          <el-form-item label="联系电话" prop="tel" v-show="form.parentActivityId==0">
            <el-input v-model="form.tel" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>    
        <el-form-item label="活动类型" prop="activityType"  v-show="form.parentActivityId!=0">
          <el-select v-model="form.activityType" placeholder="请选择活动类型">
            <el-option
              v-for="dict in dict.type.sys_activities_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>   
      </el-row>
      <el-row> 
        <el-col :span="12">
          <el-form-item label="报名截止" prop="signDeadline"  v-show="form.parentActivityId==0">
            <el-date-picker clearable
              v-model="form.signDeadline"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择报名截止时间">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row> 
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker clearable
              v-model="form.startTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择开始时间">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker clearable
              v-model="form.endTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择结束时间">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row> 
        <el-form-item label="活动详情">
          <editor v-model="form.content" :min-height="192" :readOnly="!isEdit"/>
        </el-form-item>
      </el-row>
      <el-row> 
        <el-form-item label="活动说明" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入活动说明" />
        </el-form-item>
      </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer"  v-show="isEdit">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listActivities, getActivities,listApporedActivitiesIds,addActivities,updateActivities, delActivities, changeActivitiesStatus,apporActivities,unApporActivities  } from "@/api/offline/activities";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import QrCode from '@/components/QrCode'

import SearchButton from '@/components/SearchButton/index.vue'
import PublishDialog from '@/components/PublishDialog'

export default {
  name: "Activities",
  dicts: ['sys_normal_disable', 'sys_activities_status','sys_activities_type'],
  components: {
    Treeselect,QrCode,SearchButton,PublishDialog
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      //折叠搜索条件
      foldAll: true,
      // 总条数
      total: 0,
       // 编辑状态
       isEdit: false,       
      // 活动发布表格数据
      activitiesList: [],
      //微信API接口地址
      wxApiUrl:"",
      // 活动发布树选项
      activitiesOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        activityName: null,
        orgName: null,
        startTime: null,
        endTime: null,
        status: null,
        appored: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        orderNum: [
          { 
            validator: (rule, value, callback)=>{
              if (this.form.parentActivityId==0){                
                callback();
              } else {
                if (value!=null) {
                  callback();
                }
                else{
                  callback(new Error("排序不能为空"));
                }
              }
            },   
            trigger: 'blur'
          }
        ],
        activityName: [
          { required: true, message: "活动主题不能为空", trigger: "blur" }
        ],
        address: [
          {             
            validator: (rule, value, callback)=>{
              if (this.form.parentActivityId==0){                
                if (value==null) {
                  callback(new Error("活动地点不能为空"));
                }
                else{
                  callback();
                }
              } else {
                callback();
              }
            },   
            trigger: 'blur' }
        ],
        signDeadline: [
          { required: true, message: "报名截止时间不能为空", trigger: "blur" },
          { 
            validator: (rule, value, callback) => {
              if (!value || !this.form.endTime) {
                return callback();
              }
              const deadline = new Date(value);
              const end      = new Date(this.form.endTime);
              if (deadline >= end) {
                return callback(new Error("报名截止时间必须早于活动结束时间"));
              }
              callback();
            },
            trigger: "blur"
          }
        ],
        startTime: [
          { required: true, message: "开始时间不能为空", trigger: "blur" }
        ],
        endTime: [
          { required: true, message: "结束时间不能为空", trigger: "blur" }
        ],
        activityType: [
          {             
            validator: (rule, value, callback)=>{
              if (this.form.parentActivityId!=0){                
                if (value==null) {
                  callback(new Error("子活动类型不能为空"));
                }
                else{
                  callback();
                }
              } else {
                callback();
              }
            },   
            trigger: 'blur'
          }
        ],
        orgName: [
          { 
            validator: (rule, value, callback)=>{
              if (this.form.parentActivityId==0){                
                if (value==null) {
                  callback(new Error("活动组织者不能为空"));
                }
                else{
                  callback();
                }
              } else {
                callback();
              }
            },   
            trigger: 'blur'
          }
        ],
        tel: [
          {             
            validator: (rule, value, callback)=>{
              if (this.form.parentActivityId==0){                
                if (value==null) {
                  callback(new Error("联系电话不能为空"));
                }
                else{
                  callback();
                }
              } else {
                callback();
              }
            },   
            trigger: 'blur'
          }
        ],
        content: [
          { required: true, message: "活动详情不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
    this.getWxApiUrl();
  },
  computed: {
    tableHeight() {
      if (this.foldAll) {
        return window.innerHeight - 140
      } else {
        return window.innerHeight - 200
      }
    }
  },
  methods: {
    /** 查询活动发布列表 */
    getList() {
      this.loading = true;
      listActivities(this.queryParams).then(response => {
        this.activitiesList = this.handleTree(response.rows, "activityId", "parentActivityId");
        this.total = response.total;
        this.loading = false;
      });
    },
    getWxApiUrl(){
      this.getConfigKey("sys.wxapi.url").then(response => {
          this.wxApiUrl =response.msg;
      });
    },
    closepop() {
      this.foldAll = !this.foldAll
      //console.log('父组件的状态：' + this.foldAll)
    },
    /** 转换活动发布数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.activityId,
        label: node.activityName,
        children: node.children
      };
    },
	/** 查询活动发布下拉树结构 */
  getTreeselect() {
      listActivities().then(response => {
        this.activitiesOptions = [];
        const data = { activityId: 0, activityName: '顶级节点', children: [] };
        data.children = this.handleTree(response.rows, "activityId", "parentActivityId");
        this.activitiesOptions.push(data);
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
        activityId: null,
        parentActivityId: null,
        orderNum: null,
        activityName: null,
        img: null,
        address: null,
        orgName: null,
        content: null,
        tel: null,
        signDeadline: null,
        startTime: null,
        endTime: null,
        activityType: null,
        status: null,
        appored: null,
        delFlag: null,
        userId: null,
        deptId: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null,
        apporBy: null,
        apporTime: null
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
      this.ids = selection.map(item => item.activityId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },  
    generateActivityQRContent(row) {
        return `${this.wxApiUrl}/activitycode?id=${row.activityId}`
    },
    generateReviewQRContent(row) {
        return `${this.wxApiUrl}/reviewcode?id=${row.activityId}`
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      this.getTreeselect();
      if (row != null && row.activityId) {
        this.form.parentActivityId = row.activityId;
        this.form.activityType="0";
        this.title = "发布子活动";
      } else {
        this.form.parentActivityId = 0;
        this.title = "发布活动";
      }
      this.isEdit = true;
      this.form.status = 0;
      this.open = true;
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      if (row != null) {
        this.form.parentActivityId = row.parentActivityId;
      }
      const activityId = row.activityId || this.ids
      getActivities(activityId).then(response => {
        if(response.data.appored!="0"){
          this.$modal.msgSuccess("编号为:" + activityId + "的单据已审核,请撤销审核再修改!");
          return;
        } 
        this.form = response.data;
        this.isEdit = true;
        this.open = true;
        this.title = "修改活动";
      });
    },
    /** 查看 */
    handlePreview(row) {
      this.reset();
      this.getTreeselect();
      if (row != null) {
        this.form.parentActivityId = row.parentActivityId;
      }
      const activityId = row.activityId || this.ids
      getActivities(activityId).then(response => {
        this.form = response.data;
        this.isEdit = false;
        this.open = true;
        this.title = "查看";
      });
    },    
    //活动状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.title + '"吗？').then(function() {
        const activityId = row.activityId || this.ids;
        return changeActivitiesStatus(activityId, row.status);
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
          if (this.form.activityId != null) {
            updateActivities(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addActivities(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    // handleDelete(row) {
    //   const activityIds = row.activityId || this.ids
    //   this.$modal.confirm('是否确认删除活动发布编号为"' + activityIds + '"的数据项？').then(function() {
    //     return delActivities(activityIds);
    //   }).then(() => {
    //     this.getList();
    //     this.$modal.msgSuccess("删除成功");
    //   }).catch(() => {});
    // },
    /** 删除按钮操作 */
    async handleDelete(row) {
      try {
        const activityIds = row.activityId || this.ids
        const apporedList = await listApporedActivitiesIds(activityIds)
        if(apporedList.length>0){
          this.$modal.msgSuccess("编号为:" + activityIds + "的单据存在已审核单据,请撤销审核再删除!");
          return; 
        }
        else{
          this.$modal.confirm('是否确认删除编号为"' + activityIds + '"的数据项？').then(function() {
              return delActivities(activityIds);
            }).then(() => {
              this.getList();
              this.$modal.msgSuccess("删除成功");
          }).catch(() => {});  
        }
      } catch (error) {
        //
      }
    }, 
    /** 审批发布操作 */
    handleAppor(row) {
      const activityIds = row.activityId || this.ids
      this.$modal.confirm('是否确认审批发布编号为"' + activityIds + '"的数据项？').then(function() {
        //
      }).then(() => {
        this.$refs.publishDialog.Ids=activityIds;
        this.$refs.publishDialog.openDialog();
      }).catch(() => {});
    },
    handlePublishConfirm(result) {
      if (result) {
        if (result.type === "instant") {
          apporActivities(2,this.$refs.publishDialog.Ids,"").then(response => {
            this.getList();
            this.$modal.msgSuccess("审批发布成功");
          }).catch(() => {});
        } 
        else if (result.type === "scheduled") {
          apporActivities(1,this.$refs.publishDialog.Ids,result.date).then(response =>{
            this.getList();
            this.$modal.msgSuccess("审批发布成功");
          }).catch(() => {});
        }
      }
    },        
    /** 撤销审批操作 */
    handleUnAppor(row) {
      const activityIds = row.activityId || this.ids
      this.$modal.confirm('是否取消审批发布编号为"' + activityIds + '"的数据项？').then(function() {
          return unApporActivities(activityIds);
      }).then(() => {
          this.getList();
          this.$modal.msgSuccess("取消审批发布成功");
      }).catch(() => {});
    }    



  }
};
</script>
<style>
  .el-table__expand-icon{
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  .el-table__expand-icon 
  .el-icon-arrow-right:before{
    content: "\e6d9";
    border: 1px solid #32CD32;
    padding: 2px;
  }
  .el-table__expand-icon--expanded
  .el-icon-arrow-right:before{
    content: "\e6d8";
    border: 1px solid #32CD32;
  }
  .fore-darkblue{
	  color:  #012e9d ;
    font-weight: bold;
    width: 100;
  }
  .fore-blue{
    color: #5596F2;
    width: 100;
  }
  .fore-black{
	  color: #1d9d01;
    font-weight: bold;
    width: 100%;
    text-align: center;
  }
  .btnRow {
		display: block;
	}
	.unBtnRow {
		display: none;
	}
  .query-container .el-form-item {
  .el-input,
  .el-select {
      @media (max-width: 600px) { width: 80px; }
      @media (min-width: 601px) { width: 160px; }
      @media (min-width: 1201px) { width: 220px; }
      @media (min-width: 1601px) { width: 320px; }
    }
  }
</style>
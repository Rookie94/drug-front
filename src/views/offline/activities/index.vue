<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="活动代码" prop="activityCode">
        <el-input
          v-model="queryParams.activityCode"
          placeholder="请输入活动代码"
          clearable
          @keyup.enter.native="handleQuery"
          style="width: 220px"
        />
      </el-form-item>

      <!-- 活动主题 -->
      <el-form-item label="活动主题" prop="activityName">
        <el-input
          v-model="queryParams.activityName"
          placeholder="请选择活动"
          clearable
          @clear="clearSelectedActivity"
          style="width: 220px; position: relative;"
        >
          <template #suffix>
            <!-- 绝对定位，垂直居中 -->
            <el-button
              type="text"
              size="mini"
              style="
                padding:0;border:none;
                margin-right:15px;  
                position:absolute;
                right:6px;top:50%;
                transform:translateY(-40%);
                line-height:1;
              "
              @click="openActivitySelect('single')"
              title="选择活动"
            >
              <svg viewBox="0 0 1024 1024" width="16" height="16">
                <path d="M950.857143 832.914286l-212.228572-212.228572c56.228571-69.714286 90.742857-158.628571 90.742857-255.085714 0-226.857143-183.885714-410.285715-410.285715-410.285715S8.8 138.742857 8.8 365.6c0 226.857143 183.885714 410.285715 410.285715 410.285715 96.457143 0 185.371429-34.514286 255.085714-90.742857l212.228572 212.228572c16.914286 16.914286 44.914286 16.914286 61.828571 0 16.914286-16.914286 16.914286-44.914286 0-61.828571zM419.085714 731.314286c-201.828571 0-365.714286-163.885714-365.714286-365.714286S217.257143 0 419.085714 0s365.714286 163.885714 365.714286 365.714286-163.885714 365.714286-365.714286 365.714286z" fill="currentColor"/>
              </svg>
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="组织者" prop="orgName">
        <el-input
          v-model="queryParams.orgName"
          placeholder="请输入组织者"
          clearable
          @keyup.enter.native="handleQuery"
          style="width: 220px"
        />
      </el-form-item>

      <el-form-item label="活动状态" prop="status">
        <el-select 
          v-model="queryParams.status" 
          placeholder="请选择活动状态" 
          clearable
          style="width: 220px"
        >
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="审批状态" prop="appored">
        <el-select 
          v-model="queryParams.appored" 
          placeholder="请选择审批状态" 
          clearable
          style="width: 220px"
        >
          <el-option
            v-for="dict in dict.type.sys_activities_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker 
          clearable
          v-model="queryParams.startTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="开始时间"
          style="width: 220px"
        />
      </el-form-item>

      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker 
          clearable
          v-model="queryParams.endTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="结束时间"
          style="width: 220px"
        />
      </el-form-item>

      <el-form-item style="margin-left: 20px;">
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
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

    <!-- 表格容器 -->
    <div class="table-container">
      <!-- 表格区域 -->
      <div class="table-content">
        <el-table
          v-if="refreshTable"
          v-loading="loading"
          :data="activitiesList"
          row-key="activityId"
          :default-expand-all="isExpandAll"
          :header-cell-style="{ 'text-align': 'center','background':'#5596F2','color':'#ffffff' }"
          @selection-change="handleSelectionChange"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}" 
          size="small"
          stripe
          fit
          highlight-current-row
          border
          style="width: 100%;" :row-class-name="({row}) => row.parentActivityId === 0 ? 'main-activity-row' : 'sub-activity-row'"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="orderNum" >
            <template slot-scope="scope">
              <div v-if="scope.row.parentActivityId==0" class="main-order-cell fore-blue">
                主活动
              </div>
              <div v-else class="sub-order-cell">
                {{scope.row.orderNum}}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="活动代码" width="150" align="left" prop="activityCode" />
          <el-table-column label="活动主题" width="260" align="left" prop="activityName" >
            <template slot-scope="scope">          
              <div @click="handlePreview(scope.row)">
                <!-- 主/子活动名称区分样式 -->
                <div :class="scope.row.parentActivityId==0 ? 'main-activity-name' : 'sub-activity-name'">
                  <a :class="scope.row.parentActivityId==0 ? 'main-name-link' : 'sub-name-link'">
                    {{ scope.row.activityName }}
                  </a>
                </div>            
              </div>
            </template>
          </el-table-column>

          <el-table-column label="子活动操作" width="90" align="center" class-name="small-padding fixed-width">
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
          <el-table-column label="封面海报" align="center" prop="img" width="80">
            <template slot-scope="scope">
              <image-preview :src="scope.row.img" :width="40" :height="40"/>
            </template>
          </el-table-column>
          <el-table-column label="活动地点" width="280" align="center" prop="address" />
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
          <el-table-column label="发布时间" align="center" prop="publishTime" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.publishTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="审批状态" width="100" align="center" prop="appored">
            <template slot-scope="scope">
              <dict-tag :options="dict.type.sys_activities_status" :value="scope.row.appored"/>
            </template>
          </el-table-column>

          <el-table-column label="报名签到" width="100">
            <template #default="scope">
              <div style="display: flex; justify-content: center; align-items: center;">
                <qr-code :content="generateActivityQRContent(scope.row)" :size="80" style="width: 80px; height: 80px;" />
              </div>
            </template>
          </el-table-column>

          <el-table-column label="活动评价" width="100">
            <template #default="scope">
              <div style="display: flex; justify-content: center; align-items: center;">
                <qr-code :content="generateReviewQRContent(scope.row)" :size="80" style="width: 80px; height: 80px;" />
              </div>          
            </template>
          </el-table-column>

          <el-table-column label="组织者" width="200" align="center" prop="orgName" />
          <el-table-column label="联系电话" width="150" align="center" prop="tel" />
          <el-table-column label="报名截止" align="center" prop="endTime" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.signDeadline) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="开始时间" align="center" prop="startTime" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.startTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="结束时间" align="center" prop="endTime" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.endTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建者" align="center" prop="createBy" />
          <el-table-column label="创建时间" align="center" prop="createTime" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="更新者" align="center" prop="updateBy" />
          <el-table-column label="更新时间" align="center" prop="updateTime" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.updateTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="审核者" align="center" prop="apporBy" />
          <el-table-column label="审核时间" align="center" prop="apporTime" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.apporTime)}}</span>
            </template>
          </el-table-column>
          <el-table-column label="活动说明" align="center" prop="remark" />
        </el-table>
      </div>

      <!-- 分页组件固定在底部 -->
      <div class="pagination-container">
        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
          style="text-align: right;"
        />
      </div>
    </div>
    
    <!-- 发布对话框组件 -->
    <PublishDialog ref="publishDialog" @confirm="handlePublishConfirm" />

    <!-- 添加或修改活动发布对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="880px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" :disabled="!isEdit" class="activity-form">
        <el-row class="form-row">  
          <el-form-item label="活动代码" prop="activityCode">
            <el-input v-model="form.activityCode" placeholder="默认为系统自动生成" />
          </el-form-item>
        </el-row>
        <el-row class="form-row" v-show="form.parentActivityId!=0">
          <el-col :span="6">     
            <el-form-item label="序号" prop="orderNum">
              <el-input v-model="form.orderNum" placeholder="请输入序号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row class="form-row">  
          <el-form-item label="活动主题" prop="activityName">
            <el-input v-model="form.activityName" placeholder="请输入活动主题" />
          </el-form-item>
        </el-row>
        <el-row class="form-row">  
          <el-form-item label="封面海报" prop="img">
            <image-upload v-model="form.img"/>
          </el-form-item>
        </el-row>
        <el-row class="form-row" v-show="form.parentActivityId==0">  
          <el-form-item label="活动地点" prop="address">
            <el-input v-model="form.address" placeholder="请输入活动地点" />
          </el-form-item>
        </el-row>
        <el-row class="form-row" v-show="form.parentActivityId==0">    
          <el-col :span="12">     
            <el-form-item label="组 织 者" prop="orgName">
              <el-input v-model="form.orgName" placeholder="请输入活动组织者" />
            </el-form-item>
          </el-col>
          <el-col :span="12">    
            <el-form-item label="联系电话" prop="tel">
              <el-input v-model="form.tel" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row class="form-row"  v-show="form.parentActivityId!=0">    
          <el-form-item label="活动类型" prop="activityType">
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
        <el-row class="form-row"  v-show="form.parentActivityId==0"> 
          <el-col :span="12">
            <el-form-item label="报名截止" prop="signDeadline">
              <el-date-picker clearable
                v-model="form.signDeadline"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="选择报名截止时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row class="form-row"> 
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
        <el-row class="form-row"> 
          <el-form-item label="活动详情">
            <editor ref="myEditor" v-model="form.content" :min-height="192"  />
          </el-form-item>
        </el-row>
        <el-row class="form-row"> 
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

    <!-- 活动选择对话框（可复用组件） -->
    <ActivitySelect
      ref="activitySelect"
      :visible.sync="activitySelectVisible"
      :select-mode="currentSelectMode"
      @confirm="handleActivitySelectConfirm"
    />
    
  </div>
</template>

<script>
import { listActivities, getActivities, listApporedActivitiesIds, addActivities, updateActivities, delActivities, changeActivitiesStatus, apporActivities, unApporActivities } from "@/api/offline/activities";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import QrCode from '@/components/QrCode'
import SearchButton from '@/components/SearchButton/index.vue'
import PublishDialog from '@/components/PublishDialog'
import ActivitySelect from '@/components/ActivitySelect'

export default {
  name: "Activities",
  dicts: ['sys_normal_disable', 'sys_activities_status','sys_activities_type'],
  components: {
    Treeselect, 
    QrCode, 
    SearchButton, 
    PublishDialog,
    ActivitySelect
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
      // 总条数
      total: 0,
      // 编辑状态
      isEdit: false,       
      // 活动发布表格数据
      activitiesList: [],
      // 微信API接口地址
      wxApiUrl: "",
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
      
      // 活动选择对话框相关
      activitySelectVisible: false,
      currentSelectMode: 'multiple', // 当前选择模式：single/multiple
      
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        activityId: null,
        activityCode: null,
        activityName: null,
        activityIds: [], // 新增：活动ID数组
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
        signDeadline: [{ 
            validator: (rule, value, callback) => {
              if (this.form.parentActivityId==0){                
                if (value==null) {
                  callback(new Error("报名截止时间不能为空"));
                }
                else{
                  if (!value || !this.form.endTime) {
                    return callback();
                  }
                  const deadline = new Date(value);
                  const end      = new Date(this.form.endTime);
                  if (deadline >= end) {
                    return callback(new Error("报名截止时间必须早于活动结束时间"));
                  }
                  callback();
                }  
              }
              else {
                callback();
              }
          },       
          trigger: "blur"
        }],
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
  watch: {
    // 监听 isEdit 变化，动态设置编辑器状态
    isEdit: {
      immediate: true,
      handler(newVal) {
        this.$nextTick(() => {
          if (this.$refs.myEditor && this.$refs.myEditor.Quill) {
            this.$refs.myEditor.Quill.enable(newVal);
          }
        });
      }
    },
    // 监听对话框打开状态
    open: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.$nextTick(() => {
            // 对话框打开后设置编辑器状态
            if (this.$refs.myEditor && this.$refs.myEditor.Quill) {
              this.$refs.myEditor.Quill.enable(this.isEdit);
            }
          });
        }
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
    
    getWxApiUrl() {
      this.getConfigKey("sys.wxapi.url").then(response => {
        this.wxApiUrl = response.msg
          .replace(/^http:\/\/172\.24\.160\.42/, 'https://www.haomge.com');
      });
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
        activityCode: null,
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
    
    /** 打开活动选择对话框 */
    openActivitySelect(mode = 'multiple') {
      this.currentSelectMode = mode;
      this.activitySelectVisible = true;
      
      // 如果有已选的活动，需要回显
      if (this.queryParams.activityIds && this.queryParams.activityIds.length > 0) {
        this.$nextTick(() => {
          this.$refs.activitySelect.setSelectedActivities(this.queryParams.activityIds);
        });
      }
    },
    
    /** 确认选择活动 */
    handleActivitySelectConfirm(selectedActivities) {
      if (selectedActivities.length === 0) {
        this.$modal.msgWarning("请至少选择一项活动");
        return;
      }
      
      // 更新查询参数
      this.queryParams.activityIds = selectedActivities.map(item => item.activityId);
      
      // 更新显示的活动主题名称
      if (this.currentSelectMode === 'single') {
        this.queryParams.activityName = selectedActivities[0].activityName;
      } else {
        // 多选时显示选择的个数
        const names = selectedActivities.map(item => {
          return item.parentActivityId === 0 ? `${item.activityName}(主)` : item.activityName;
        }).join('; ');
        this.queryParams.activityName = names;
      }
      
      this.activitySelectVisible = false;
    },
    
    /** 清空已选活动 */
    clearSelectedActivity() {
      this.queryParams.activityName = null;
      this.queryParams.activityIds = [];
    },
    
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.activityIds = [];
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
      this.$modal.confirm('确认要"' + text + '""' + row.title + '"吗？').then(() => {
        const activityId = row.activityId || this.ids;
        return changeActivitiesStatus(activityId, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(() => {
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
    async handleDelete(row) {
      try {
        const activityIds = row.activityId || this.ids
        const apporedList = await listApporedActivitiesIds(activityIds)
        if(apporedList.length>0){
          this.$modal.msgSuccess("编号为:" + activityIds + "的单据存在已审核单据,请撤销审核再删除!");
          return; 
        }
        else{          
          this.$modal.confirm('是否确认删除编号为"' + activityIds + '"的数据项？').then(() => {
              return delActivities(activityIds);
            }).then(() => {
              this.getList();
              this.$modal.msgSuccess("删除成功");
          }).catch(() => {});  
        }
      } catch (error) {
        // 捕获异常
      }
    }, 
    
    /** 审批发布操作 */
    handleAppor(row) {
      const activityIds = row.activityId || this.ids
      this.$modal.confirm('是否确认审批发布编号为"' + activityIds + '"的数据项？').then(() => {
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
      this.$modal.confirm('是否取消审批发布编号为"' + activityIds + '"的数据项？').then(() => {
          return unApporActivities(activityIds);
      }).then(() => {
          this.getList();
          this.$modal.msgSuccess("取消审批发布成功");
      }).catch(() => {});
    }    
  }
};
</script>

<style scoped>

/* 调整输入框组件的样式 */
:deep(.el-input-group__append) {
  background-color: #409EFF !important;
  border-color: #409EFF !important;
  color: white !important;
  cursor: pointer;
  padding: 0 12px;
}

:deep(.el-input-group__append:hover) {
  background-color: #66b1ff !important;
  border-color: #66b1ff !important;
}

:deep(.el-input-group__append .el-button) {
  padding: 0;
  border: none;
  background: transparent;
  color: white;
}

:deep(.el-input-group__append .el-button:hover) {
  background: transparent;
}

/* 调整按钮样式 */
:deep(.el-input-group__append .el-button) {
  padding: 0 15px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 调整输入框整体宽度 */
.el-form-item {
  margin-bottom: 18px;
  margin-right: 20px;
}

/* 响应式布局调整 */
@media (max-width: 1200px) {
  :deep(.el-input-group__append) {
    padding: 0 10px;
  }
  
  .el-form-item {
    margin-right: 10px;
  }
}

/* 让 suffix 按钮垂直居中 */
::v-deep .el-input__suffix {
  display: flex;
  align-items: center;
  right: 6px;
}

/* 1. 主活动折叠图标替换为±，样式醒目 */
::v-deep .main-activity-row .el-table__expand-icon {
  width: 20px !important;
  height: 20px !important;
  line-height: 20px !important;
  border-radius: 4px !important;
  background: #409EFF !important;
  color: #fff !important;
  text-align: center !important;
  border: none !important;
  margin-right: 5px !important;
}

/* 折叠状态显示 + */
::v-deep .main-activity-row .el-table__expand-icon .el-icon-arrow-right:before {
  content: "+" !important;
  border: none !important;
  font-size: 16px !important;
  font-weight: bold !important;
  color: #fff !important;
  padding: 0 !important;
}

/* 展开状态显示 - */
::v-deep .main-activity-row .el-table__expand-icon--expanded .el-icon-arrow-right:before {
  content: "-" !important;
  border: none !important;
  font-size: 16px !important;
  font-weight: bold !important;
  color: #fff !important;
}

/* 子活动折叠图标保持原有样式 */
::v-deep .sub-activity-row .el-table__expand-icon {
  -webkit-transform: rotate(0deg);
  transform: rotate(0deg);
}

::v-deep .sub-activity-row .el-table__expand-icon .el-icon-arrow-right:before {
  content: "\e6d9";
  border: 1px solid #32CD32;
  padding: 1px;
}

::v-deep .sub-activity-row .el-table__expand-icon--expanded .el-icon-arrow-right:before {
  content: "\e6d8";
  border: 1px solid #32CD32;
}

/* 2. 序号列主活动背景突出显示 */
.main-order-cell {
  background-color: #409EFF !important;
  color: #ffffff !important;
  padding: 4px 8px !important;
  border-radius: 4px !important;
  font-weight: bold !important;
  display: inline-block !important;
  min-width: 60px !important;
  text-align: center !important;
}

.sub-order-cell {
  color: #666 !important;
  font-size: 13px !important;
}

/* 3. 主/子活动名称差异化显示 */
.main-activity-name {
  font-size: 15px !important;
  font-weight: bold !important;
}

.sub-activity-name {
  font-size: 13px !important;
  padding-left: 20px !important; /* 子活动缩进 */
  color: #666 !important;
}

.main-name-link {
  color: #012e9d !important;
  font-weight: bold !important;
  text-decoration: none !important;
}

.main-name-link:hover {
  color: #409EFF !important;
  text-decoration: underline !important;
}

.sub-name-link {
  color: #1d9d01 !important;
  font-weight: 500 !important;
  text-decoration: none !important;
}

.sub-name-link:hover {
  color: #32CD32 !important;
  text-decoration: underline !important;
}

/* 文字颜色基础样式 */
.fore-darkblue {
  color: #012e9d;
  font-weight: bold;
}

.fore-blue {
  color: #5596F2;
}

.fore-black {
  color: #1d9d01;
  font-weight: bold;
  text-align: center;
}

/* 查询区域样式 */
.el-form-item {
  margin-bottom: 8px;
}

.el-form--inline .el-form-item {
  margin-right: 8px;
}

/* 调整内嵌按钮的样式 */
::v-deep .el-input-group__append {
  padding: 0;
}

::v-deep .el-input-group__append .el-button {
  border-radius: 0 4px 4px 0;
  border-left: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 表格紧凑样式 */
.el-table--small .el-table__row {
  height: 40px !important;
}

/* 主活动行高加大 */
::v-deep .main-activity-row.el-table__row {
  height: 48px !important;
  background-color: #f0f7ff !important;
}

/* 子活动行背景 */
::v-deep .sub-activity-row.el-table__row {
  background-color: #f8f9fa !important;
}

.el-table--small .el-table__cell {
  padding: 4px 0 !important;
}

/* 按钮区域边距调整 */
.mb8 {
  margin-bottom: 8px !important;
}

/* 分页组件边距调整 */
.el-pagination {
  padding: 8px 0 !important;
  margin-top: 8px !important;
}

/* 表格容器样式 - 核心修复滚动条 */
.table-container {
  width: 100%;
  margin-top: 10px;
}

/* 表格内容区域 - 固定高度，启用滚动 */
.table-content {
  max-height: 600px;
  overflow: auto;
}

/* 分页容器 */
.pagination-container {
  margin-top: 10px;
  padding: 8px 0;
  border-top: 1px solid #ebeef5;
}

/* 强制显示滚动条 - Vue2 推荐写法 */
::v-deep .el-table__body-wrapper {
  overflow-x: auto !important;
  overflow-y: auto !important;
}

/* 滚动条样式优化 */
::v-deep .el-table__body-wrapper::-webkit-scrollbar {
  width: 8px;   /* 纵向滚动条宽度 */
  height: 8px;  /* 横向滚动条高度 */
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式调整 */
@media (max-width: 1366px) {
  .el-dialog {
    width: 90% !important;
  }
}

@media (max-width: 768px) {
  .el-form--inline .el-form-item {
    margin-right: 5px;
  }
  
  .el-form-item__label {
    width: 70px !important;
    font-size: 12px;
  }

  .table-content {
    max-height: 400px;
  }
}

@media (max-width: 576px) {
  .el-form--inline .el-form-item {
    margin-right: 2px;
  }
  
  .el-form-item__label {
    width: 60px !important;
    font-size: 11px;
  }

  .table-content {
    max-height: 300px;
  }
}

/* 对话框表单整体样式 */
::v-deep .activity-form {
  padding: 10px 0;
}

/* 表单行间距调整（核心） */
::v-deep .form-row {
  margin-bottom: 20px !important; /* 行底部间距，可根据需求调整15-25px */
}

/* 最后一行去掉底部间距，避免多余空白 */
::v-deep .form-row:last-child {
  margin-bottom: 0 !important;
}

/* 表单元素内部间距优化 */
::v-deep .activity-form .el-form-item {
  margin-bottom: 0 !important; /* 取消form-item默认间距，统一由row控制 */
  line-height: 1.5;
}

/* 日期选择器/输入框等组件高度适配 */
::v-deep .activity-form .el-input__inner,
::v-deep .activity-form .el-select__inner,
::v-deep .activity-form .el-date-editor {
  height: 40px !important;
  line-height: 40px !important;
}

/* 编辑器区域间距优化 */
::v-deep .activity-form .editor {
  margin-top: 5px;
}

/* 对话框底部按钮间距 */
.dialog-footer {
  margin-top: 10px;
  text-align: right;
}
</style>
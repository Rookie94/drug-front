<template>
    <div class="app-container">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="群组名称" prop="groupName">
          <el-input
            v-model="queryParams.groupName"
            placeholder="请输入群组名称"
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
            v-hasPermi="['online:group:add']"
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
            v-hasPermi="['online:group:edit']"
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
            v-hasPermi="['online:group:remove']"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
            v-hasPermi="['online:group:export']"
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
          v-hasPermi="['online:group:appor']"
        >审批群组</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-refresh-left"
          size="mini"
          :disabled="multiple"
          @click="handleUnAppor"
          v-hasPermi="['online:group:unappor']"
        >撤回审批</el-button>
      </el-col>  
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row> 

      <div class="card-container">
        <el-card 
          v-for="row in groupList" 
          :key="row.groupId" 
          class="card-row"
          shadow="hover"           
        >
          <!-- 卡片头部 -->
          <div slot="header" class="card-header" >
            <div class="header-left">
              <el-checkbox v-model="row.checked" @change="handleCheckboxChange(row.groupId, row.checked)"></el-checkbox>
              <el-tag><span class="title">{{ row.groupName }}</span></el-tag>
            </div>
            
            <!-- 右侧开关 -->
            <div class="header-right">
              <el-tag>启用</el-tag>
              <el-switch
                v-model="row.status"
                active-color="#1890ff"
                inactive-color="#DCDFE6"
                active-value="0"
                inactive-value="1"
                v-hasPermi="['online:group:edit']"
                @change="handleStatusChange(row)"
              />
            </div>
          </div>

          <!-- 卡片内容 (左图右文) -->
          <div class="card-body">
            <!-- 左侧图片 -->
            <div class="card-media">
              <el-image 
                :src="row.pic" 
                fit="cover" 
                class="card-pic"
                :preview-src-list="[row.pic]"
              >
                <div slot="error" class="image-error-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
            </div>

            <!-- 右侧信息 -->
            <div class="card-info">
              <div class="info-row">
                <div>群组说明</div>  
                </br>
                <div class="multiline-text">{{ row.remark }}</div>
              </div>
            </div>
          </div>

          <!-- 卡片底部操作 -->
          <div class="card-actions" style="display: flex; justify-content: space-between; align-items: center;">
            <div class="item-label">
              <!-- 这里放你的标签内容，例如： -->
              <span><el-tag>{{ row.appored === '0' ? '待审核' : row.appored === '2' ? '已审核' : "" }}</el-tag></span>
            </div>
            <div class="action-buttons">
            <el-button 
              type="text" 
              icon="el-icon-edit" 
              @click="handleUpdate(row)"
              v-hasPermi="['online:group:edit']"
            >编辑</el-button>
            <el-button 
              type="text" 
              icon="el-icon-delete" 
              @click="handleDelete(row)"
              v-hasPermi="['online:group:remove']"
              class="btn-delete"
            >删除</el-button>
            <el-button 
              type="text" 
              icon="el-icon-user" 
              v-hasPermi="['online:group:User']"
            >分配工作人员</el-button>
          </div>
        </div>


        </el-card>
      </div>
      
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
  
      <!-- 添加或修改聊天群组对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="880px" append-to-body :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="序号" prop="orderNum">
            <el-input v-model="form.orderNum" placeholder="请输入序号" />
          </el-form-item>
          <el-form-item label="群组名称" prop="groupName">
            <el-input v-model="form.groupName" placeholder="请输入群组名称" />
          </el-form-item>
          <el-form-item label="封面图片" prop="pic">
            <image-upload v-model="form.pic"/>
          </el-form-item>
          <el-form-item label="群组说明" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"  :autosize="{minRows: 8}" />
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

  import { listGroup,listApporedGroupIds, getGroup, delGroup, addGroup, updateGroup,changeGroupStatus,apporGroup,unApporGroup } from "@/api/online/group";
  
  export default {
    name: "Group",
    dicts: ['sys_normal_disable'],
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
        // 聊天群组表格数据
        groupList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          groupName: null,
          status: null,
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          orderNum: [
            { required: true, message: "序号不能为空", trigger: "blur" }
          ],
          groupName: [
            { required: true, message: "群组标题不能为空", trigger: "blur" }
          ]       
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询聊天群组列表 */
      getList() {
        this.loading = true;
        listGroup(this.queryParams).then(response => {
          this.groupList = response.rows;
          this.total = response.total;
          this.loading = false;
          this.groupList.forEach(item => {
            item.checked = false;
          });
          this.ids = [];
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
          groupId: null,
          orderNum: null,
          groupName: null,
          pic: null,
          status: null,
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
      handleCheckboxChange(groupId, isChecked) {
        if (isChecked) {
          this.ids.push(groupId);
        } else {
          const index = this.ids.indexOf(groupId);
          if (index > -1) {
            this.ids.splice(index, 1);
          }
        }
        this.single = this.ids.length!==1;
        this.multiple = !this.ids.length;        
      }, 
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = "添加聊天群组";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const groupId = row.groupId || this.ids
        getGroup(groupId).then(response => {
          if(response.data.appored!="0"){
          this.$modal.msgSuccess("编号为:" + groupId + "的单据已审核,请撤销审核再修改!");
          return;
          }
          this.form = response.data;
          this.open = true;
          this.title = "修改聊天群组";
        });
      },     
    /** 提交按钮 */
    submitForm() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.groupId != null) {
              updateGroup(this.form).then(response => {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              });
            } else {
              addGroup(this.form).then(response => {
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
        const groupIds = row.groupId || this.ids;
        const apporedList = await listApporedGroupIds(groupIds)
        if(apporedList.length>0){
          this.$modal.msgSuccess("编号为:" + groupIds + "的单据存在已审核单据,请撤销审核再删除!");
          return; 
        }
        else{
          this.$modal.confirm('是否确认删除编号为"' + groupIds + '"的数据项？').then(function() {
            return delGroup(groupIds);
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
        this.download('online/group/export', {
          ...this.queryParams
        }, `group_${new Date().getTime()}.xlsx`)
      },
     // 状态修改
     handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.groupName + '"吗？').then(function() {
        const groupId = row.groupId || this.ids;
        return changeGroupStatus(groupId, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0";
      });
    },  
     /** 审批操作 */
     handleAppor(row) {
      const groupIds = row.groupId || this.ids;
      this.$modal.confirm('是否确认审批发布编号为"' + groupIds + '"的数据项？').then(function() {
          return apporGroup(2,groupIds);
      }).then(() => {
          this.getList();
          this.$modal.msgSuccess("审批成功");
      }).catch(() => {});
    },            
    /** 撤销审批操作 */
    handleUnAppor(row) {
      const groupIds = row.groupId || this.ids;
      this.$modal.confirm('是否取消审批编号为"' + groupIds + '"的数据项？').then(function() {
          return unApporGroup(groupIds);
      }).then(() => {
          this.getList();
          this.$modal.msgSuccess("取消审批成功");
      }).catch(() => {});
    }      
  }
};
</script>

<style scoped>
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
  padding: 20px;  
}

.card-row {
  background-color: #ededed; 
  border: 1px solid #ccc; /* 添加边框 */
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2); /* 增加阴影效果 */
  font-size: 16px; /* 增大字体 */
  transition: all 0.3s ease; /* 添加过渡效果，使变化更平滑 */
}

.card-row:hover {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3); /* 鼠标悬停时加深阴影 */
  transform: translateY(-5px); /* 鼠标悬停时卡片向上移动一点 */
}

.card-item {
  margin-bottom: 15px;
  transition: transform 0.3s;  
}

.card-item:hover {
  transform: translateY(-3px);
}

/* 头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 0px;  
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.title {
  font-size: 15px;
  font-weight: 600;
}

/* 主体内容布局 */
.card-body {
  display: flex;
  gap: 15px;
  margin: 0px;
  padding: 0px;
}

.multiline-text {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 左侧图片容器 */
.card-media {
  flex: 0 0 100px;
}

.card-pic {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  background: #f5f7fa;
}

.image-error-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  color: #909399;
  font-size: 24px;
}

/* 右侧信息容器 */
.card-info {
  flex: 1;
  min-width: 0;
  font-size: 14px;
}

/* 底部操作栏 */
.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.item-label {
  /* 标签样式 */
  flex: 1;
}

.action-buttons {
  /* 按钮容器样式 */
  margin-left: auto;
}

.btn-delete {
  color: #f5c62d;
}

</style>
  
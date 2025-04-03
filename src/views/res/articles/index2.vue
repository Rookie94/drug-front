<template>
    <div class="app-container">
      <!-- 左侧分类 -->
      <div class="left-menu">
        <el-button-group class="vertical-group">
          <el-button
            v-for="(item, index) in primaryMenus"
            :key="index"
            :class="['menu-btn', { 'active-menu': activePrimary === index }]"
            @click="handlePrimaryClick(index)"
          >
            <i :class="item.icon"></i>
            {{ item.label }}
          </el-button>
        </el-button-group>
      </div>
  
      <!-- 右侧内容 -->
      <div class="right-content">
        <!-- 顶部功能区 -->
        <div class="top-area">
          <el-button-group class="sub-group">
            <el-button
              v-for="(item, index) in getSecondaryMenus()"
              :key="index"
              :class="['sub-btn', { 'active-sub': activeSecondary === index }]"
              @click="handleSecondaryClick(index)"
            >
              {{ item.label }}
            </el-button>
          </el-button-group>
  
          <!-- 查询区域 -->
          <div class="query-area">
            <el-form :model="queryParams" inline>
              <el-form-item label="文章名称">
                <el-input
                  v-model="queryParams.articleName"
                  placeholder="请输入名称"
                  clearable
                  style="width: 180px"
                />
              </el-form-item>
  
              <el-form-item label="发布时间">
                <el-date-picker
                  v-model="queryParams.startTime"
                  type="datetime"
                  placeholder="开始时间"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  style="width: 180px"
                />
                <span class="time-separator">至</span>
                <el-date-picker
                  v-model="queryParams.endTime"
                  type="datetime"
                  placeholder="结束时间"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  style="width: 180px"
                />
              </el-form-item>
  
                <!-- 一级分类 -->
                <el-form-item label="一级分类">
                    <el-select 
                    v-model="queryParams.category" 
                    @change="handleCategorySelectChange"
                    >
                    <el-option
                        v-for="item in primaryMenus"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                    </el-select>
                </el-form-item>
                <!-- 二级分类 -->
                <el-form-item label="二级子分类">
                    <el-select v-model="queryParams.subCategory">
                    <el-option label="全部" value="all" />
                    <el-option
                        v-for="item in getSubCategories(queryParams.category)"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                    </el-select>
                </el-form-item>
  
              <el-form-item>
                <el-button type="primary" @click="fetchData">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="success" icon="el-icon-plus" @click="showAddDialog">
              新增
            </el-button>
          </div>
        </div>
  
        <!-- 数据表格 -->
        <div class="data-table">
          <el-table
            :data="tableData"
            border
            stripe
            v-loading="loading"
            style="width: 100%"
          >
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="title" label="文章标题" min-width="150" />
            <el-table-column prop="category" label="分类" width="120">
              <template slot-scope="{ row }">
                {{ getCategoryName(row.category) }}
              </template>
            </el-table-column>
            <el-table-column prop="subCategory" label="子分类" width="120">
              <template slot-scope="{ row }">
                {{ getSubCategoryName(row.category, row.subCategory) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="文章状态" width="100" align="center" />
            <el-table-column prop="views" label="阅读量" width="100" align="center" />
            <el-table-column prop="publishTime" label="发布时间" width="180">
              <template slot-scope="{ row }">
                {{ formatTime(row.publishTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center">
              <template slot-scope="{ row }">
                <div class="action-buttons">
                  <el-button type="primary" size="small" @click="handlePublish(row)">发布</el-button>
                  <el-button type="text" size="small" @click="handleEdit(row)">编辑</el-button>
                  <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
  
      <!-- 新增对话框 -->
      <el-dialog
        :title="dialogTitle"
        :visible.sync="dialogVisible"
        width="600px"
        @closed="resetForm"
      >
        <el-form
          ref="dataForm"
          :model="formData"
          :rules="formRules"
          label-width="80px"
        >
          <el-form-item label="文章标题" prop="title">
            <el-input v-model="formData.title" />
          </el-form-item>
  
          <el-form-item label="一级分类" prop="category">
            <el-select v-model="formData.category" @change="handleCategoryChange">
              <el-option
                v-for="item in primaryMenus"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
  
          <el-form-item label="二级子分类" prop="subCategory">
            <el-select v-model="formData.subCategory">
               <el-option
                v-for="item in getSubCategories(formData.category)"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
  
          <el-form-item label="文章状态" prop="status">
            <el-select v-model="formData.status">
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
            </el-select>
          </el-form-item>
  
          <el-form-item label="阅读量" prop="views">
            <el-input v-model.number="formData.views" type="number" />
          </el-form-item>
  
          <el-form-item label="发布时间" prop="publishTime">
            <el-date-picker
              v-model="formData.publishTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择发布时间"
            />
          </el-form-item>
        </el-form>
  
        <div slot="footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ArticleManage',
    data() {
      return {
        // 左侧菜单
        primaryMenus: [
          {
            label: '心理课堂',
            value: 'tech',
            icon: 'el-icon-cpu',
            subCategories: [
              { label: '抗挫减压', value: 'front-end' },
              { label: '情绪情感', value: 'back-end' }
            ]
          },
          {
            label: '社会思考',
            value: 'news',
            icon: 'el-icon-news',
            subCategories: [
              { label: '互联网资讯', value: 'internet' },
              { label: '金融资讯', value: 'finance' }
            ]
          },
          {
            label: '心灵画廊',
            value: 'product',
            icon: 'el-icon-present',
            subCategories: [
              { label: '软件产品', value: 'software' },
              { label: '硬件产品', value: 'hardware' }
            ]
          }
        ],
        // 顶部菜单
        secondaryMenus: [
          { label: '全部', value: 'all' },
          { label: '技术文章', value: 'tech' },
          { label: '行业资讯', value: 'news' },
          { label: '产品动态', value: 'product' }
        ],
        // 激活状态
        activePrimary: 0,
        activeSecondary: 0,
        // 查询参数
        queryParams: {
          articleName: '',
          startTime: '',
          endTime: '',
          category: 'tech',
          subCategory: 'all'
        },
        // 表格数据
        tableData: [],
        loading: false,
        // 对话框相关
        dialogVisible: false,
        dialogTitle: '新增文章',
        formData: {
          id: null,
          title: '',
          category: 'tech',
          subCategory: 'all',
          status: 'draft',
          views: 0,
          publishTime: ''
        },
        formRules: {
          title: [
            { required: true, message: '请输入文章标题', trigger: 'blur' },
            { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }
          ],
          category: [
            { required: true, message: '请选择一级分类', trigger: 'change' }
          ],
          subCategory: [
            { required: true, message: '请选择二级子分类', trigger: 'change' }
          ],
          status: [
            { required: true, message: '请选择文章状态', trigger: 'change' }
          ],
          publishTime: [
            { required: true, message: '请选择发布时间', trigger: 'change' }
          ]
        }
      };
    },
    mounted() {
      this.fetchData();
    },
    methods: {
      // 获取数据
      async fetchData() {
        this.loading = true;
        try {
          // 模拟API请求，生成更多测试数据
          const mockData = [
            {
              id: 1,
              title: 'Vue最佳实践',
              category: 'tech',
              subCategory: 'front-end',
              status: 'published',
              views: 120,
              publishTime: '2024-03-20 14:00:00'
            },
            {
              id: 2,
              title: '产品更新日志',
              category: 'product',
              subCategory: 'software',
              status: 'draft',
              views: 20,
              publishTime: '2024-03-21 09:30:00'
            },
            {
              id: 3,
              title: '互联网金融趋势',
              category: 'news',
              subCategory: 'finance',
              status: 'published',
              views: 80,
              publishTime: '2024-03-22 11:15:00'
            },
            {
              id: 4,
              title: 'React性能优化',
              category: 'tech',
              subCategory: 'front-end',
              status: 'draft',
              views: 30,
              publishTime: '2024-03-23 15:45:00'
            },
            {
              id: 5,
              title: '新款手机发布',
              category: 'product',
              subCategory: 'hardware',
              status: 'published',
              views: 150,
              publishTime: '2024-03-24 13:30:00'
            },
            {
              id: 6,
              title: '云计算发展现状',
              category: 'tech',
              subCategory: 'back-end',
              status: 'draft',
              views: 40,
              publishTime: '2024-03-25 10:00:00'
            }
          ];
  
          this.tableData = this.filterData(mockData);
        } catch (error) {
          console.error('数据获取失败', error);
          this.$message.error('数据获取失败，请稍后重试');
        } finally {
          this.loading = false;
        }
      },
  
      // 过滤数据
      filterData(data) {
        return data.filter(item => {
          const nameMatch = item.title.includes(this.queryParams.articleName);
          const categoryMatch = this.queryParams.category === 'all' || item.category === this.queryParams.category;
          const subCategoryMatch = this.queryParams.subCategory === 'all' || item.subCategory === this.queryParams.subCategory;
          const timeMatch = this.checkTimeRange(item.publishTime);
  
          return nameMatch && categoryMatch && subCategoryMatch && timeMatch;
        });
      },
  
      // 时间范围检查
      checkTimeRange(time) {
        const target = new Date(time);
        const start = this.queryParams.startTime ? new Date(this.queryParams.startTime) : null;
        const end = this.queryParams.endTime ? new Date(this.queryParams.endTime) : null;
  
        if (start && target < start) return false;
        if (end && target > end) return false;
        return true;
      },
  
        // 分类点击
        handlePrimaryClick(index) {
        this.activePrimary = index;
        this.queryParams.category = this.primaryMenus[index].value;
        // 设置subCategory为'all'以展示当前一级分类下的全部数据
        this.queryParams.subCategory = 'all';
        // 更新activeSecondary为0，指向"全部"
        this.activeSecondary = 0;
        this.fetchData();
        },
        // 获取当前的二级菜单
        getSecondaryMenus() {
        const currentCategory = this.primaryMenus[this.activePrimary];
        if (currentCategory) {
            return [
            { label: '全部', value: 'all' },
            ...currentCategory.subCategories.map(item => ({ label: item.label, value: item.value }))
            ];
        }
        return this.secondaryMenus;
        },
  
        handleSecondaryClick(index) {
        const selectedMenu = this.getSecondaryMenus()[index];
        this.activeSecondary = index;
        this.queryParams.subCategory = selectedMenu.value; // ✅ 正确：更新二级分类
        this.fetchData();
        },
  
      // 重置查询
      resetQuery() {
        this.queryParams = {
          articleName: '',
          startTime: '',
          endTime: '',
          category: 'tech',
          subCategory: 'all'
        };
        this.activeSecondary = 0;
        this.fetchData();
      },
  
      // 显示新增对话框
      showAddDialog() {
        this.resetForm();
        this.formData.category = this.queryParams.category;
        this.formData.subCategory = this.queryParams.subCategory === 'all' ? '' : this.queryParams.subCategory;
        this.dialogTitle = '新增文章';
        this.dialogVisible = true;
      },
  
      // 提交表单
      submitForm() {
        this.$refs.dataForm.validate(valid => {
          if (valid) {
            // 模拟提交
            console.log('提交数据:', this.formData);
            this.$message.success('操作成功');
            this.dialogVisible = false;
            this.fetchData();
          }
        });
      },
  
      // 重置表单
      resetForm() {
        this.formData = {
          id: null,
          title: '',
          category: 'tech',
          subCategory: 'all',
          status: 'draft',
          views: 0,
          publishTime: ''
        };
      },
  
      // 格式化时间
      formatTime(time) {
        const date = new Date(time);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      },
  
      // 获取分类名称
      getCategoryName(value) {
        const item = this.primaryMenus.find(m => m.value === value);
        return item ? item.label : '未知分类';
      },
  
      // 获取子分类名称
      getSubCategoryName(category, subCategory) {
        const mainCategory = this.primaryMenus.find(m => m.value === category);
        if (mainCategory) {
          const subItem = mainCategory.subCategories.find(s => s.value === subCategory);
          return subItem ? subItem.label : '未知子分类';
        }
        return '未知分类';
      },
  
      // 获取子分类列表
      getSubCategories(category) {
        const mainCategory = this.primaryMenus.find(m => m.value === category);
        return mainCategory ? mainCategory.subCategories : [];
      },
  
      // 处理一级分类改变
      handleCategoryChange() {
        const mainCategory = this.primaryMenus.find(m => m.value === this.formData.category);
        if (mainCategory && mainCategory.subCategories.length > 0) {
          this.formData.subCategory = 'all';
        } else {
          this.formData.subCategory = null;
        }
      },
  
      // 处理一级分类选择改变
      handleCategorySelectChange() {
        this.queryParams.subCategory = 'all';
        this.fetchData();
      },
  
      // 获取当前的二级菜单
      getSecondaryMenus() {
        if (this.activePrimary === 0) {
          return [
            { label: '全部', value: 'all' },
            ...this.primaryMenus[0].subCategories.map(item => ({ label: item.label, value: item.value }))
          ];
        } else if (this.activePrimary === 1) {
          return [
            { label: '全部', value: 'all' },
            ...this.primaryMenus[1].subCategories.map(item => ({ label: item.label, value: item.value }))
          ];
        } else if (this.activePrimary === 2) {
          return [
            { label: '全部', value: 'all' },
            ...this.primaryMenus[2].subCategories.map(item => ({ label: item.label, value: item.value }))
          ];
        }
        return this.secondaryMenus;
      },
  
      // 发布文章
      handlePublish(row) {
        // 模拟发布操作
        row.status = 'published';
        this.$message.success('文章发布成功');
      },
  
      // 编辑文章
      handleEdit(row) {
        this.dialogTitle = '编辑文章';
        this.dialogVisible = true;
        this.formData = { ...row };
      },
  
      // 删除文章
      handleDelete(row) {
        this.$confirm('确定要删除这篇文章吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.tableData = this.tableData.filter(item => item.id!== row.id);
          this.$message.success('文章删除成功');
        }).catch(() => {
          this.$message.info('已取消删除');
        });
      }
    }
  };
  </script>
  
  <style lang="scss" scoped>
  .app-container {
    display: flex;
    height: calc(100vh - 120px);
    background: #f0f2f5;
  
    .left-menu {
      width: 200px;
      padding: 15px;
      background: #fff;
      border-right: 1px solid #ebeef5;
  
      .vertical-group {
        display: flex;
        flex-direction: column;
  
        .menu-btn {
          margin-bottom: 8px;
          height: 40px;
          text-align: left;
          padding: 0 20px;
          border-radius: 4px;
          transition: all 0.3s;
          border-color: transparent;
  
          i {
            margin-right: 8px;
            color: inherit;
          }
  
          &:hover {
            color: #1E90FF;
            background: rgba(#1E90FF, 0.1);
          }
  
          &.active-menu {
            color: #fff;
            background: #1E90FF;
            border-color: #1E90FF;
  
            &:hover {
              opacity: 0.9;
            }
          }
        }
      }
    }
  
    .right-content {
      flex: 1;
      padding: 15px;
  
      .top-area {
        background: #fff;
        padding: 15px;
        border-radius: 4px;
        margin-bottom: 15px;
  
        .sub-group {
          margin-bottom: 15px;
  
          .sub-btn {
            padding: 8px 15px;
            margin-right: 10px;
            border-radius: 4px;
            transition: all 0.3s;
  
            &:hover {
              color: #1E90FF;
              border-color: #1E90FF;
            }
  
            &.active-sub {
              color: #fff;
              background: #1E90FF;
              border-color: #1E90FF;
            }
          }
        }
  
        .query-area {
          .el-form {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
  
            .time-separator {
              margin: 0 5px;
              color: #606266;
            }
          }
          .el-button {
            margin-top: 10px;
          }
        }
      }
  
      .data-table {
        background: #fff;
        padding: 15px;
        border-radius: 4px;
  
        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 5px;
        }
      }
    }
  }
  
  // 对话框样式
  .el-dialog__body {
    .el-form {
      padding: 0 20px;
    }
  }
  
  @media (max-width: 768px) {
    .app-container {
      flex-direction: column;
  
      .left-menu {
        width: 100%;
        margin-bottom: 15px;
      }
  
      .query-area {
        .el-form-item {
          width: 100%;
  
          .el-date-editor {
            width: 100%;
          }
        }
      }
    }
  }
  </style>    
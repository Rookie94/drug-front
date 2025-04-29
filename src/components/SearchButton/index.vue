<template>
    <div>
      <el-col :span="1.5" class="elrow">
        <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        </el-form-item>
      </el-col>
      <el-col :span="1.5" class="elrow">
        <el-form-item>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-col>
      <el-col :span="1.5" class="elrow">
        <el-form-item>
          <el-button type="text" size="mini" @click="closeSearch">
            {{ word }}
            <i :class="foldAll ? 'el-icon-arrow-up ': 'el-icon-arrow-down'" />
          </el-button>
        </el-form-item>
      </el-col>
    </div>
  </template>
  
  <script>
  export default {
    props: {
        foldAll: {
        type: Boolean,
        defalut: true
      }
    },
    computed: {
      word: function() {
        if (this.foldAll === true) {
          // 对文字进行处理
          return '展开搜索'
        } else {
          return '收起搜索'
        }
      }
    },
    mounted() {
      /**
               * 收起搜索
               */
      this.$nextTick(function() {
        this.closeSearch()
      })
    },
    methods: {
      handleQuery() {
        this.$emit('handleQueryData')
      },
      resetQuery() {
        this.$emit('handleResetData')
      },
      closeSearch() {
        //this.foldAll = !this.foldAll;
        this.$emit('closepop')
        //console.log('子组件的状态：' + this.foldAll)
      }
    }
  }
  </script>
  
  <style>
  </style>
  
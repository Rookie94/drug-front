<template>
    <div class="sub-category-bar">
      <button v-for="(item, index) in subCategories" :key="index" :class="{ active: currentSubCategory === item }" @click="changeSubCategory(item)">{{ item }}</button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const subCategories = [
    '全部',
    '抗挫减压',
    '情绪情感',
    '婚姻情感',
    '品质培养',
    '目标规划',
    '情绪管理',
    '压力管理',
    '人际交往',
    '自我成长',
    '亲子教育',
    '书籍推荐',
    '疫情心理疏导',
    '了解强迫症',
    '预防抑郁',
    '教你如何缓解焦虑',
    '心理矫治方法'
  ];
  
  const currentSubCategory = ref('全部');
  
  const changeSubCategory = (category) => {
    currentSubCategory.value = category;
  };
  </script>
  
  <style scoped>
  .sub-category-bar {
    display: flex;
    margin-bottom: 10px;
  }
  button {
    padding: 5px 10px;
    border: 1px solid #ccc;
    background-color: #fff;
    cursor: pointer;
    margin-right: 5px;
  }
  .active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
  </style>
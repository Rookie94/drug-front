<template>
    <div class="menu">
      <ul>
        <li v-for="(item, index) in menuItems" :key="index">{{ item }}</li>
      </ul>
    </div>
  </template>
  
  <script setup>
  const menuItems = [
    '心情课堂',
    '社会思考',
    '心灵画廊',
    '心理放松',
    '拒毒训练',
    '心灵电台',
    '心理影院',
    '心理科普',
    '趣味测试',
    '每日一问',
    '分类管理',
    '全部分类'
  ];
  </script>
  
  <style scoped>
  .menu {
    width: 200px;
    border-right: 1px solid #ccc;
    padding: 10px;
  }
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  li {
    padding: 5px;
    cursor: pointer;
  }
  li:hover {
    background-color: #f0f0f0;
  }
  </style>
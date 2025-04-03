<template>
    <div id="app">
      <Menu />
      <div class="main-content">
        <SubCategoryBar />
        <ArticleList />
      </div>
    </div>
  </template>
  
  <script setup>
  import Menu from './Menu.vue';
  import SubCategoryBar from './SubCategoryBar.vue';
  import ArticleList from './ArticleList.vue';
  </script>
  
  <style>
  #app {
    display: flex;
  }
  .main-content {
    padding: 10px;
  }
  </style>
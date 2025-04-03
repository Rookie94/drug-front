<template>
    <div class="article-list">
      <div class="filter">
        <input type="text" placeholder="请输入名称" v-model="articleName">
        <input type="text" placeholder="发布时间" v-model="publishTime">
        <button @click="searchArticles">搜索查询</button>
      </div>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>缩略图</th>
            <th>标题</th>
            <th>所属分类</th>
            <th>状态</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(article, index) in articles" :key="index">
            <td><input type="checkbox"></td>
            <td><img :src="article.thumbnail" :alt="article.title" style="width: 100px;"></td>
            <td>{{ article.title }}</td>
            <td>{{ article.category }}</td>
            <td>{{ article.status }}</td>
            <td>{{ article.publishTime }}</td>
            <td>
              <a href="#">下架</a>
              <a href="#">编辑</a>
              <a href="#">删除</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const articleName = ref('');
  const publishTime = ref('');
  
  const articles = [
    {
      //thumbnail: require('./article1.jpg'),
      title: '脾气暴躁，易怒，记忆力不好，睡不着？往往与这两种疾病有关',
      category: '情绪管理',
      status: '已上架',
      publishTime: '2025-03-04 22:27:17'
    },
    {
      //thumbnail: require('./article2.jpg'),
      title: '22个超实用的人际交往小技巧（强烈推荐）',
      category: '人际交往',
      status: '已上架',
      publishTime: '2025-03-04 22:16:34'
    }
  ];
  
  const searchArticles = () => {
    // 这里可以添加实际的搜索逻辑，比如根据articleName和publishTime过滤articles数组
    console.log('搜索条件：', articleName.value, publishTime.value);
  };
  </script>
  
  <style scoped>
  .filter {
    margin-bottom: 10px;
  }
  input {
    margin-right: 5px;
    padding: 5px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 5px;
    text-align: left;
  }
  </style>
<template>
    <div class="comment-container">
      <div class="comment-header">
        <h3>全部留言（{{ total }}条）</h3>
      </div>
  
      <div class="comment-list">
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :current-user="currentUser"
          @delete-comment="handleDelete"
        />
      </div>
    </div>
  </template>
  
  <script>
  import CommentItem from './CommentItem.vue'
  
  export default {
    name: 'Comment',
    components: {
      CommentItem
    },
    data() {
      return {
        currentUser: '当前用户',
        comments: [
          {
            id: 1,
            user: '学员',
            content: '今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！\
            今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！\
            今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！\
            今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！\
            今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！\
            今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！今天天气好好哦！\
            今天天气好好哦！',
            time: '2015-05-17 17:36:12',
            replies: [
              {
                id: 11,
                user: '警官',
                content: '难得一见的一天呢',
                time: '2015-05-17 17:40:07',
                replies: []
              },
              {
                id: 12,
                user: '当前用户',
                content: '很适合出去游玩',
                time: '2015-05-17 17:39:20',
                replies: [
                  {
                    id: 121,
                    user: '戒毒大队',
                    content: '欢迎关注我们的公众号',
                    time: '2015-05-17 17:45:00',
                    replies: [
                      {
                        id: 1211,
                        user: '测试用户',
                        content: '已经关注啦！',
                        time: '2015-05-17 17:50:00',
                        replies: []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    computed: {
      total() {
        const count = arr => arr.reduce((acc, cur) => 
          acc + 1 + (cur.replies ? count(cur.replies) : 0), 0)
        return count(this.comments)
      }
    },
    methods: {
      handleDelete(commentId) {
        if (!confirm('确定要删除这条评论吗？')) return
        
        const deleteComment = (arr) => {
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].id === commentId) {
              arr.splice(i, 1)
              return true
            }
            if (arr[i].replies && deleteComment(arr[i].replies)) {
              return true
            }
          }
          return false
        }
  
        deleteComment(this.comments)
      }
    }
  }
  </script>
  
  <style scoped>
    .comment-header {
        padding-left: 30px;
        padding-bottom: 5px;
        border-bottom: 1px solid #eee;
        margin-bottom: 5px;
    }

  .comment-container {
    max-width: 800px;
    margin: 0px auto;
    padding: 0px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  

  </style>
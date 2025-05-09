<template>
    <div class="comment-container">
      <div class="comment-header">
        <h3>全部评论（{{ total }}）</h3>
      </div>
  
      <div class="comment-list">
        <!-- 一级评论 -->
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <!-- 主评论 -->
          <div class="comment-main">
            <div class="user-info">
              <span class="username">{{ comment.user }}</span>
              <span class="time">{{ comment.time | formatTime }}</span>
              <button 
                v-if="canDelete(comment)"
                class="delete-btn"
                @click="handleDelete(comment.id)"
              >删除</button>
            </div>
            <div class="content">{{ comment.content }}</div>
            <div class="actions">
              <button @click="toggleReply(comment.id)">回复</button>
            </div>
          </div>
  
          <!-- 一级回复表单 -->
          <div v-if="activeReply === comment.id" class="reply-box">
            <textarea v-model="replyContent" placeholder="写下你的回复..."></textarea>
            <button class="submit-btn" @click="submitReply(comment)">提交回复</button>
          </div>
  
          <!-- 子评论 -->
          <div v-if="comment.replies && comment.replies.length" class="sub-comments">
            <div 
              v-for="reply in comment.replies" 
              :key="reply.id" 
              class="sub-item"
            >
              <!-- 二级评论 -->
              <div class="comment-main">
                <div class="user-info">
                  <span class="username">{{ reply.user }}</span>
                  <span class="time">{{ reply.time | formatTime }}</span>
                  <button 
                    v-if="canDelete(reply)"
                    class="delete-btn"
                    @click="handleDelete(reply.id)"
                  >删除</button>
                </div>
                <div class="content">{{ reply.content }}</div>
                <div class="actions">
                  <button @click="toggleReply(reply.id)">回复</button>
                </div>
              </div>
  
              <!-- 二级回复表单 -->
              <div v-if="activeReply === reply.id" class="reply-box">
                <textarea v-model="replyContent" placeholder="写下你的回复..."></textarea>
                <button class="submit-btn" @click="submitReply(reply)">提交回复</button>
              </div>
  
              <!-- 三级评论 -->
              <div v-if="reply.replies && reply.replies.length" class="sub-comments">
                <div 
                  v-for="subReply in reply.replies" 
                  :key="subReply.id" 
                  class="sub-item"
                >
                  <div class="comment-main">
                    <div class="user-info">
                      <span class="username">{{ subReply.user }}</span>
                      <span class="time">{{ subReply.time | formatTime }}</span>
                      <button 
                        v-if="canDelete(subReply)"
                        class="delete-btn"
                        @click="handleDelete(subReply.id)"
                      >删除</button>
                    </div>
                    <div class="content">{{ subReply.content }}</div>
                    <div class="actions">
                      <button @click="toggleReply(subReply.id)">回复</button>
                    </div>
                  </div>
  
                  <!-- 三级回复表单 -->
                  <div v-if="activeReply === subReply.id" class="reply-box">
                    <textarea v-model="replyContent" placeholder="写下你的回复..."></textarea>
                    <button class="submit-btn" @click="submitReply(subReply)">提交回复</button>
                  </div>
  
                  <!-- 更多层级评论 -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Comment',
    data() {
      return {
        currentUser: '当前用户',
        activeReply: null,
        replyContent: '',
        comments: [
          {
            id: 1,
            user: '游客2015-05-17 17:36:12',
            content: '今天天气好好哦！',
            time: '2015-05-17 17:36:12',
            replies: [
              {
                id: 11,
                user: '游客2015-05-17 17:40:07',
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
                    user: 'PHP自学中心',
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
      canDelete(comment) {
        return comment.user === this.currentUser
      },
  
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
      },
  
      toggleReply(commentId) {
        this.activeReply = this.activeReply === commentId ? null : commentId
      },
  
      submitReply(parentComment) {
        if (!this.replyContent.trim()) return
        
        const newReply = {
          id: Date.now(),
          user: this.currentUser,
          content: this.replyContent,
          time: new Date().toISOString(),
          replies: []
        }
  
        if (!parentComment.replies) {
          this.$set(parentComment, 'replies', [])
        }
        parentComment.replies.unshift(newReply)
        this.replyContent = ''
        this.activeReply = null
      }
    },
  
    filters: {
      formatTime(val) {
        const date = new Date(val)
        return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
        
        function pad(n) { return n < 10 ? '0' + n : n }
      }
    }
  }
  </script>
  
  <style scoped>
  .comment-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .comment-header {
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }
  
  .comment-item {
    padding: 15px 0;
    border-bottom: 1px solid #f5f5f5;
  }
  
  .user-info {
    color: #666;
    margin-bottom: 8px;
    position: relative;
  }
  
  .username {
    color: #00a1d6;
    margin-right: 15px;
  }
  
  .time {
    font-size: 12px;
  }
  
  .content {
    line-height: 1.6;
    margin: 10px 0;
  }
  
  .actions button {
    background: none;
    border: none;
    color: #00a1d6;
    cursor: pointer;
    padding: 5px 10px;
  }
  
  .reply-box {
    margin: 15px 0 0 30px;
  }
  
  .reply-box textarea {
    width: 100%;
    height: 60px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
  }
  
  .submit-btn {
    background: #00a1d6;
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 4px;
    margin-top: 10px;
    cursor: pointer;
  }
  
  .sub-comments {
    margin: 15px 0 0 30px;
    border-left: 2px solid #eee;
    padding-left: 20px;
  }
  
  .sub-item {
    margin: 10px 0;
    padding: 10px;
    background: #f8f8f8;
    border-radius: 4px;
  }
  
  .delete-btn {
    background: none;
    border: none;
    color: #ff4d4f;
    cursor: pointer;
    margin-left: 10px;
    padding: 2px 6px;
    font-size: 12px;
  }
  
  .delete-btn:hover {
    background: #fff1f0;
    border-radius: 2px;
  }
  </style>
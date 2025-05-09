<template>
    <div class="comment-item" :class="'depth-' + depth">
      <div class="comment-main">
        <div class="user-info">
          <span class="username">{{ comment.user }}</span>
          <span class="time">{{ comment.time | formatTime }}</span>
          <button 
            v-if="comment.user === currentUser"
            class="delete-btn"
            @click="handleDelete(comment.id)"
          >删除</button>
        </div>
        <div class="content">{{ comment.content }}</div>
        <div class="actions">
          <button @click="toggleReply">回复</button>
        </div>
      </div>
  
      <div v-if="showReply" class="reply-box">
        <textarea v-model="replyContent" placeholder="写下你的回复..."></textarea>
        <button class="submit-btn" @click="submitReply">提交回复</button>
      </div>
  
      <div v-if="comment.replies && comment.replies.length" class="sub-comments">
        <CommentItem
          v-for="reply in comment.replies"
          :key="reply.id"
          :comment="reply"
          :current-user="currentUser"
          :depth="depth + 1"
          @delete-comment="$emit('delete-comment', $event)"
        />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CommentItem',
    props: {
      comment: {
        type: Object,
        required: true
      },
      currentUser: {
        type: String,
        required: true
      },
      depth: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        showReply: false,
        replyContent: ''
      }
    },
    methods: {
      toggleReply() {
        this.showReply = !this.showReply
      },
      submitReply() {
        if (!this.replyContent.trim()) return
        
        const newReply = {
          id: Date.now(),
          user: this.currentUser,
          content: this.replyContent,
          time: new Date().toISOString(),
          replies: []
        }
  
        if (!this.comment.replies) {
          this.$set(this.comment, 'replies', [])
        }
        this.comment.replies.unshift(newReply)
        this.replyContent = ''
        this.showReply = false
      },
      handleDelete(id) {
        this.$emit('delete-comment', id)
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

  .comment-main {
    padding-left: 30px;
    border-bottom: 1px solid #f5f5f5;
  }

  .comment-item {
    padding: 15px 0;
    border-bottom: 1px solid #f5f5f5;
  }
  
  .comment-item.depth-1 { margin-left: 20px; }
  .comment-item.depth-2 { margin-left: 30px; }
  .comment-item.depth-3 { margin-left: 40px; }
  
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
    color: #999;
  }
  
  .content {
    line-height: 1.6;
    margin: 10px 0;
    color: #333;
  }
  
  .actions button {
    background: none;
    border: none;
    color: #00a1d6;
    cursor: pointer;
    padding: 5px 10px;
    transition: opacity 0.3s;
  }
  
  .actions button:hover {
    opacity: 0.8;
  }
  
  .reply-box {
    margin: 5px 0 0 15px;
  }
  
  .reply-box textarea {
    width: 100%;
    height: 160px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
    font-family: inherit;
  }
  
  .submit-btn {
    background: #00a1d6;
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 4px;
    margin-top: 10px;
    cursor: pointer;
    transition: background 0.3s;
  }
  
  .submit-btn:hover {
    background: #0087b3;
  }
  
  .sub-comments {
    border-left: 2px solid #eee;
    margin-left: 20px;
    padding-left: 20px;
  }
  
  .delete-btn {
    background: none;
    border: none;
    color: #ff4d4f;
    cursor: pointer;
    margin-left: 10px;
    padding: 2px 6px;
    font-size: 12px;
    transition: background 0.3s;
  }
  
  .delete-btn:hover {
    background: #fff1f0;
    border-radius: 2px;
  }
  </style>
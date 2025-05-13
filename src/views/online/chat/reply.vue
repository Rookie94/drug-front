<template>
  <div class="forum-container">
    <!-- 主题帖区域 -->
    <div class="thread-post">
      <div class="thread-header">
        <h2>{{ threadTitle }}</h2>
        <div class="thread-meta">
          <span class="author">作者: {{ threadAuthor }}</span>
          <span class="time">发布时间: {{ threadTime }}</span>
        </div>
      </div>
      <div class="thread-content">
        {{ threadContent }}
      </div>
    </div>

    <!-- 评论区 -->
    <div class="comment-section">
      <div class="comment-header">
        <h3>全部回复（{{ total }}条）</h3>
        <button class="new-reply-btn" @click="showReplyBox = !showReplyBox">
          {{ showReplyBox ? '取消回复' : '发表回复' }}
        </button>
      </div>

      <!-- 回复框 -->
      <div v-if="showReplyBox" class="reply-box">
        <textarea v-model="newReplyContent" placeholder="写下你的回复..."></textarea>
        <div class="reply-actions">
          <button class="submit-btn" @click="submitReply">提交回复</button>
          <button class="cancel-btn" @click="showReplyBox = false">取消</button>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="comment-list">
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :current-user="currentUser"
          @delete-comment="handleDelete"
          @reply="handleReply"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CommentItem from './CommentItem.vue'

export default {
  components: {
    CommentItem
  },
  data() {
    return {
      threadTitle: '这是一个论坛主题帖标题',
      threadAuthor: '楼主',
      threadTime: '2023-05-15 10:30:00',
      threadContent: '这是主题帖的内容。论坛通常有一个主帖，然后下面是用户的回复。主题帖内容可以很长，包含各种讨论的内容。',
      currentUser: '当前用户',
      showReplyBox: false,
      newReplyContent: '',
      comments: [
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
      if (!confirm('确定要删除这条回复吗？')) return
      
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
    handleReply(username) {
      this.showReplyBox = true
      this.newReplyContent = `@${username} `
      this.$nextTick(() => {
        document.querySelector('.reply-box textarea').focus()
      })
    },
    submitReply() {
      if (!this.newReplyContent.trim()) return
      
      const newComment = {
        id: Date.now(),
        user: this.currentUser,
        avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
        content: this.newReplyContent,
        time: new Date().toISOString(),
        floor: this.comments.length + 1,
        replies: []
      }

      this.comments.push(newComment)
      this.newReplyContent = ''
      this.showReplyBox = false
    }
  }
}
</script>

<style scoped>
.forum-container {
  max-width: 900px;
  margin: 20px auto;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.thread-post {
  padding: 20px;
  border-bottom: 1px solid #eaeaea;
  background: #f9f9f9;
}

.thread-header {
  margin-bottom: 15px;
}

.thread-header h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.thread-meta {
  font-size: 14px;
  color: #666;
}

.thread-meta span {
  margin-right: 15px;
}

.thread-content {
  line-height: 1.6;
  color: #333;
  padding: 10px 0;
}

.comment-section {
  padding: 20px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.comment-header h3 {
  margin: 0;
  color: #333;
}

.new-reply-btn {
  padding: 8px 16px;
  background: #1e88e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.new-reply-btn:hover {
  background: #1565c0;
}

.reply-box {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  background: #f6f8fa;
}

.reply-box textarea {
  width: 100%;
  height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 10px;
}

.reply-actions {
  display: flex;
  gap: 10px;
}

.submit-btn, .cancel-btn {
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn {
  background: #1e88e5;
  color: white;
  border: none;
}

.submit-btn:hover {
  background: #1565c0;
}

.cancel-btn {
  background: none;
  border: 1px solid #ccc;
  color: #666;
}

.cancel-btn:hover {
  background: #f5f5f5;
}

.comment-list {
  margin-top: 20px;
  margin-left: 0px;
}

</style>
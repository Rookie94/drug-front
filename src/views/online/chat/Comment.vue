<template>
  <div class="forum-container">
    <!-- 主题帖区域 -->
    <div class="thread-post">
      <div class="thread-header">
        <h2>{{ primaryMessage.title }}</h2>
        <div class="thread-meta">
          <span class="author">学员名称: {{ primaryMessage.nickName }}</span>
          <span class="time">留言时间: {{ formatTime(primaryMessage.createTime) }}</span>
        </div>
      </div>
      <div class="thread-content">
        {{ primaryMessage.message }}
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
          :key="comment.messageId"
          :comment="comment"
          :current-user="currentUser"
          :primary-message-id="primaryMessage.messageId"
          @delete-comment="handleDelete"
          @reply-success="loadComments"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CommentItem from './CommentItem.vue'
import { getMessageTree, replyMsg, delMsg } from "@/api/online/msg";

export default {
  components: {
    CommentItem
  },
  props: {
    primaryMessage: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showReplyBox: false,
      newReplyContent: '',
      comments: [],
      currentUser: this.$store.getters.username
    }
  },
  watch: {
    primaryMessage: {
      handler() {
        this.loadComments();
      },
      immediate: true,
      deep: true
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
    formatTime(val) {
      if (!val) return '';
      const date = new Date(val)
      return `${date.getFullYear()}-${this.pad(date.getMonth()+1)}-${this.pad(date.getDate())} ${this.pad(date.getHours())}:${this.pad(date.getMinutes())}`
    },
    pad(n) { 
      return n < 10 ? '0' + n : n 
    },
    async loadComments() {
      if (!this.primaryMessage.messageId) return;
      
      try {
        const response = await getMessageTree(this.primaryMessage.messageId);
        this.comments = response.data;
      } catch (error) {
        console.error('加载评论失败', error);
        this.$message.error('加载评论失败');
      }
    },
    async handleDelete(commentId) {
      if (!confirm('确定要删除这条回复吗？')) return;
      
      try {
        await delMsg(commentId);
        this.loadComments();
        this.$message.success('删除成功');
      } catch (error) {
        console.error('删除失败', error);
        this.$message.error('删除失败');
      }
    },

    async submitReply() {
      // 1. 校验内容和 primaryMessage 是否存在
      if (!this.newReplyContent.trim()) {
        this.$message.warning('回复内容不能为空');
        return;
      }
      if (!this.primaryMessage) {
        this.$message.error('主题信息不存在，无法回复');
        return;
      }
      // 2. 校验需要的属性是否存在
      if (!this.primaryMessage.messageId || !this.primaryMessage.groupId) {
        this.$message.error('主题信息不完整，无法回复');
        return;
      }

      try {
        const replyData = {
          parentMessageId: this.primaryMessage.messageId,
          groupId: this.primaryMessage.groupId,
          message: this.newReplyContent,
          title: `回复: ${this.primaryMessage.title?.substring(0, 20) || ''}` // 兼容 title 可能不存在的情况
        };
        
        await replyMsg(replyData);
        this.newReplyContent = '';
        this.showReplyBox = false;
        this.loadComments();
        this.$message.success('回复成功');
      } catch (error) {
        console.error('提交回复失败', error);
        this.$message.error('提交回复失败，请重试');
      }
    }

  }
}
</script>

<style scoped>
/* 保持原有样式不变 */
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
  height: 180px;
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
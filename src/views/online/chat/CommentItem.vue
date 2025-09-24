<template>
  <div class="forum-comment-item">
    <div class="comment-avatar">
      <img :src="avatar" class="user-avatar" :alt="comment.user">
    </div>
    <div class="comment-body">
      <div class="comment-header">
        <span class="username">{{ comment.nickName }}</span>
        <span class="floor">#{{ comment.floor }}</span>
        <span class="time">{{ formatTime(comment.createTime) }}</span>
        <div class="comment-actions">
          <button 
            v-if="comment.createBy === currentUser"
            class="delete-btn"
            @click="handleDelete(comment.messageId)"
          >删除</button>
          <button 
            class="reply-btn"
            @click="toggleReply"
          >回复</button>
        </div>
      </div>
      <div class="comment-content">
        <template v-if="comment.replyTo">
          <span class="reply-prefix">回复 @{{ comment.replyTo.nickName }}:{{ comment.replyTo.message }} </span>
          <br>
        </template>
        <span class="reply-content"> {{ comment.message }} </span>        
      </div>

      <div v-if="showReply" class="reply-box">
        <textarea v-model="replyContent" :placeholder="'回复 @' + comment.nickName"></textarea>
        <div class="reply-actions">
          <button class="submit-btn" @click="submitReply">提交回复</button>
          <button class="cancel-btn" @click="showReply = false">取消</button>
        </div>
      </div>

      <div v-if="comment.replies && comment.replies.length" class="sub-comments">
        <CommentItem
          v-for="reply in comment.replies"
          :key="reply.messageId"
          :comment="reply"
          :current-user="currentUser"
          @delete-comment="$emit('delete-comment', $event)"
          @reply="$emit('reply', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { replyMsg } from "@/api/online/msg";

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
    primaryMessageId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      showReply: false,
      replyContent: ''
    }
  },
  computed: {
    ...mapGetters([
      'avatar'
    ])
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
    toggleReply() {
      this.showReply = !this.showReply
      if (this.showReply) {
        this.$nextTick(() => {
          this.$el.querySelector('.reply-box textarea').focus()
        })
      }
    },
    async submitReply() {
      if (!this.replyContent.trim()) return
      
      try {
        const replyData = {
          parentMessageId: this.comment.messageId,
          groupId: this.comment.groupId,
          message: this.replyContent,
          title: `回复@${this.comment.nickName}`,
          replyToMessageId: this.comment.messageId
        };
        
        await replyMsg(replyData);
        this.$emit('reply-success');
        this.replyContent = '';
        this.showReply = false;
      } catch (error) {
        console.error('提交回复失败', error);
        this.$message.error('提交回复失败，请重试');
      }
    },
    handleDelete(id) {
      this.$emit('delete-comment', id);
    }
  }
}
</script>

<style scoped>
/* 保持原有样式不变 */
.forum-comment-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  width: 100%;
}

.forum-comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  margin-right: 15px;
  width: 40px;
  flex-shrink: 0;
}

.comment-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-body {
  flex: 1;
  width: calc(100% - 55px);
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  flex-wrap: wrap;
}

.username {
  font-weight: bold;
  color: #1e88e5;
  margin-right: 10px;
}

.floor {
  color: #ff5722;
  margin-right: 10px;
  font-weight: bold;
}

.time {
  color: #999;
  font-size: 12px;
  margin-right: 10px;
}

.comment-actions {
  margin-left: auto;
}

.comment-content {
  line-height: 1.6;
  color: #333;
  margin-bottom: 10px;
  white-space: pre-line;
  background: #fff;
  padding: 0;
  border-radius: 4px;
}

.comment-content > template {
  color: #666;
  font-size: 0.9em;
  display: block;
  margin-bottom: 5px;
  padding-bottom: 5px;
  border-bottom: 1px dashed #eee;
}

.reply-btn, .delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 3px;
  transition: all 0.3s;
  margin-left: 5px;
}

.reply-btn {
  color: #1e88e5;
}

.reply-btn:hover {
  background: rgba(30, 136, 229, 0.1);
}

.delete-btn {
  color: #f44336;
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.1);
}

.reply-box {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  background: #f6f8fa;
}

.reply-box textarea {
  width: 100%;
  height: 180px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 8px;
}

.reply-actions {
  display: flex;
  gap: 10px;
}

.submit-btn, .cancel-btn {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 3px;
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

.sub-comments {
  margin-top: 15px;
  padding-left: 0;
  border-left: none;
  width: 100%;
}

.forum-comment-item .forum-comment-item {
  margin-left: 0;
  padding-left: 0;
}

.reply-prefix {
  color: #999;
  font-size: 0.9em;
}

.reply-content {
  color: #0f65ac;
  font-size: 0.9em;
  background-color: #f5f9ff;
  padding: 2px 4px;
  border-radius: 3px;
}
</style>
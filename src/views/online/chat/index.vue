<template>
    <div class="app-container">
      <el-card class="box-card chat-container">
        <div slot="header" class="clearfix">
          <span>聊天室</span>
        </div>
        
        <!-- 消息展示区域 -->
        <div class="message-list" ref="messageList" :style="{paddingBottom: inputAreaHeight + 'px'}">
          <div v-for="(message, index) in messages" :key="index" class="message-item" :class="{'self-message': message.isSelf}">
            <div class="message-avatar">
              <el-avatar :src="message.avatar"></el-avatar>
            </div>
            <div class="message-content">
              <div class="message-info">
                <span class="message-user">{{ message.isSelf ? '我' : message.userName }}</span>
                <span class="message-time">{{ message.time }}</span>
              </div>
              <div class="message-body">
                <div v-if="message.type === 'text'" class="message-text">{{ message.content }}</div>
                <el-image 
                  v-else-if="message.type === 'image'" 
                  :src="message.content" 
                  :preview-src-list="[message.content]"
                  fit="cover"
                  style="max-width: 200px; max-height: 200px; border-radius: 4px;"
                ></el-image>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 固定在底部的消息输入区域（宽度90%） -->
        <div class="fixed-input-container" ref="inputContainer">
          <div class="message-input-wrapper">
            <div class="input-toolbar">
              <el-button-group>
                <el-button size="mini" @click="showEmojiPicker = !showEmojiPicker">
                  <i class="el-icon-star-on"></i> 表情
                </el-button>
                <el-upload
                  class="upload-demo"
                  action=""
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleImageChange"
                >
                  <el-button size="mini">
                    <i class="el-icon-picture"></i> 图片
                  </el-button>
                </el-upload>
              </el-button-group>
            </div>
            
            <div v-show="showEmojiPicker" class="emoji-picker">
              <span 
                v-for="(emoji, index) in emojis" 
                :key="index"
                @click="insertEmoji(emoji)"
                class="emoji-item"
              >
                {{ emoji.symbol }}
              </span>
            </div>
            
            <el-input
              type="textarea"
              :rows="3"
              placeholder="请输入内容"
              v-model="inputMessage"
              @keyup.enter.native="handleEnterKey"
              ref="messageInput"
            ></el-input>
            
            <div class="input-action">
              <el-button type="primary" size="small" @click="sendMessage">发送</el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ChatPage',
    data() {
      return {
        inputMessage: '',
        showEmojiPicker: false,
        inputAreaHeight: 200,
        messages: [
          {
            id: 1,
            userName: '系统',
            avatar: require('@/assets/images/profile.jpg'),
            content: '欢迎来到聊天室！😊',
            time: this.formatTime(new Date()),
            type: 'text',
            isSelf: false
          }
        ],
        emojis: [
          { name: '微笑', symbol: '😊' },
          { name: '大笑', symbol: '😄' },
          { name: '爱心', symbol: '❤️' },
          { name: '点赞', symbol: '👍' },
          { name: '笑哭', symbol: '😂' },
          { name: '惊讶', symbol: '😲' },
          { name: '生气', symbol: '😠' },
          { name: '哭泣', symbol: '😢' },
          { name: '吐舌', symbol: '😛' },
          { name: '飞吻', symbol: '😘' },
          { name: '思考', symbol: '🤔' },
          { name: 'OK', symbol: '👌' }
        ]
      }
    },
    mounted() {
      this.scrollToBottom();
      this.calculateInputHeight();
      window.addEventListener('resize', this.calculateInputHeight);
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.calculateInputHeight);
    },
    methods: {
      calculateInputHeight() {
        this.$nextTick(() => {
          if (this.$refs.inputContainer) {
            this.inputAreaHeight = this.$refs.inputContainer.offsetHeight + 20; // 增加20px缓冲
          }
        });
      },
      
      handleEnterKey(event) {
        if (!event.shiftKey) {
          event.preventDefault();
          this.sendMessage();
        }
      },
      
      sendMessage() {
        const message = this.inputMessage.trim();
        if (!message) return;
        
        this.messages.push({
          id: Date.now(),
          userName: '当前用户',
          avatar: require('@/assets/images/profile.jpg'),
          content: message,
          time: this.formatTime(new Date()),
          type: 'text',
          isSelf: true
        });
        
        this.inputMessage = '';
        this.scrollToBottom();
        
        // 模拟回复
        setTimeout(() => {
          this.messages.push({
            id: Date.now() + 1,
            userName: '机器人',
            avatar: require('@/assets/images/profile.jpg'),
            content: '已收到: ' + message,
            time: this.formatTime(new Date()),
            type: 'text',
            isSelf: false
          });
          this.scrollToBottom();
        }, 800);
      },
      
      insertEmoji(emoji) {
        const input = this.$refs.messageInput;
        const textarea = input.$el.querySelector('textarea');
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        
        this.inputMessage = 
          this.inputMessage.substring(0, startPos) + 
          emoji.symbol + 
          this.inputMessage.substring(endPos);
        
        this.$nextTick(() => {
          textarea.selectionStart = startPos + emoji.symbol.length;
          textarea.selectionEnd = startPos + emoji.symbol.length;
          textarea.focus();
          this.showEmojiPicker = false;
        });
      },
      
      handleImageChange(file) {
        if (!file.raw.type.match('image.*')) {
          this.$message.warning('请选择图片文件');
          return;
        }
        
        if (file.raw.size > 2 * 1024 * 1024) {
          this.$message.warning('图片大小不能超过2MB');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          this.messages.push({
            id: Date.now(),
            userName: '当前用户',
            avatar: require('@/assets/images/profile.jpg'),
            content: e.target.result,
            time: this.formatTime(new Date()),
            type: 'image',
            isSelf: true
          });
          this.scrollToBottom();
        };
        reader.readAsDataURL(file.raw);
      },
      
      scrollToBottom() {
        this.$nextTick(() => {
          const container = this.$refs.messageList;
          container.scrollTop = container.scrollHeight;
        });
      },
      
      formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
  }
  </script>
  
  <style scoped>
  .app-container {
    padding: 20px;
    height: calc(100vh - 90px);
  }
  
  .chat-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  
  .message-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }
  
  .message-item {
    display: flex;
    margin-bottom: 15px;
  }
  
  .message-item.self-message {
    flex-direction: row-reverse;
  }
  
  .message-avatar {
    margin: 0 10px;
  }
  
  .message-content {
    max-width: 70%;
  }
  
  .message-info {
    margin-bottom: 5px;
    font-size: 12px;
    color: #909399;
  }
  
  .self-message .message-info {
    text-align: right;
  }
  
  .message-user {
    margin-right: 10px;
  }
  
  .message-body {
    padding: 8px 12px;
    background-color: #f5f7fa;
    border-radius: 4px;
    word-break: break-word;
  }
  
  .self-message .message-body {
    background-color: #e1f3fb;
  }
  
  .message-text {
    white-space: pre-wrap;
    font-size: 14px;
    line-height: 1.5;
  }
  
  /* 固定在底部的输入容器（宽度90%） */
  .fixed-input-container {
    position: fixed;
    bottom: 20px;
    left: 5%;
    width: 90%;
    background: #fff;
    padding: 10px;
    border-top: 1px solid #ebeef5;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    z-index: 10;
    border-radius: 8px;
  }
  
  .message-input-wrapper {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .input-toolbar {
    margin-bottom: 10px;
  }
  
  .emoji-picker {
    display: flex;
    flex-wrap: wrap;
    padding: 5px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    margin-bottom: 10px;
    max-height: 150px;
    overflow-y: auto;
    font-size: 24px;
    line-height: 1.5;
    background: #fff;
  }
  
  .emoji-item {
    margin: 5px;
    cursor: pointer;
    transition: transform 0.2s;
    padding: 3px;
    border-radius: 4px;
  }
  
  .emoji-item:hover {
    transform: scale(1.2);
    background: #f0f2f5;
  }
  
  .input-action {
    margin-top: 10px;
    text-align: right;
  }
  
  /* 响应式调整 */
  @media (max-width: 768px) {
    .fixed-input-container {
      left: 5%;
      width: 90%;
      bottom: 10px;
      padding: 8px;
    }
    
    .message-content {
      max-width: 80%;
    }
    
    .emoji-picker {
      font-size: 20px;
    }
  }
  
  @media (min-width: 1200px) {
    .fixed-input-container {
      left: calc(50% - 450px);
      width: 900px;
    }
  }
  </style>
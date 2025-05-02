<template>
  <div class="container">
    <!-- 顶部群组名称 -->
    <header class="header">
      <h2>{{ groupName }}</h2>
    </header>

    <div class="content">
      <!-- 左边栏 -->
      <div class="left-side">
        <div class="search-box">
          <el-input
            v-model="searchText"
            placeholder="搜索会话或用户"
            clearable
            prefix-icon="el-icon-search"
          />
        </div>
        <div class="list-container">
          <el-tabs v-model="activeTab" stretch>
            <el-tab-pane label="当前会话" name="sessions">
              <div class="list">
                <div
                  v-for="session in filteredSessions"
                  :key="session.id"
                  class="list-item"
                  :class="{ active: activeSession === session.id }"
                  @click="selectSession(session.id)"
                >
                  <div class="item-content">
                    <el-avatar :size="40" :src="session.avatar" class="item-avatar">
                      <i class="el-icon-chat-dot-round" v-if="!session.avatar"></i>
                    </el-avatar>
                    <div class="item-info">
                      <div class="item-name">{{ session.name }}</div>
                      <div class="item-desc">{{ session.lastMessage || '暂无消息' }}</div>
                    </div>
                    <div class="item-meta">
                      <div class="item-time">{{ session.time || '' }}</div>
                      <el-badge 
                        :value="session.unread" 
                        :hidden="!session.unread || session.unread === 0" 
                        class="item-badge"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="所有用户" name="users">
              <div class="list">
                <div
                  v-for="user in filteredUsers"
                  :key="user.id"
                  class="list-item"
                  :class="{ online: user.online }"
                >
                  <div class="item-content">
                    <el-avatar :size="40" :src="user.avatar" class="item-avatar">
                      <i class="el-icon-user" v-if="!user.avatar"></i>
                    </el-avatar>
                    <div class="item-info">
                      <div class="item-name">{{ user.name }}</div>
                      <div class="item-status">
                        <span class="status-dot"></span>
                        {{ user.online ? '在线' : '离线' }}
                      </div>
                    </div>
                    <div class="item-meta">
                      <el-tag 
                        v-if="user.role" 
                        :type="user.role === '管理员' ? 'danger' : ''"
                        size="mini"
                      >
                        {{ user.role }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 中间聊天区域 -->
      <div class="center">
        <div class="chat-container">
          <div class="chat-messages" ref="messagesContainer">
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="message"
              :class="{ 'message-right': message.sender === currentUser.name }"
            >
              <div class="message-header">
                <strong>{{ message.sender }}</strong>
                <span>{{ message.time }}</span>
              </div>
              <div class="message-content">
                <template v-if="message.type === 'text'">
                  {{ message.content }}
                </template>
                <template v-else-if="message.type === 'image'">
                  <el-image 
                    :src="message.content" 
                    :preview-src-list="[message.content]"
                    style="max-width: 200px; max-height: 200px;"
                  ></el-image>
                </template>
                <template v-else-if="message.type === 'emoji'">
                  <img 
                    :src="message.content" 
                    class="emoji"
                    :title="message.emojiName"
                  >
                </template>
              </div>
            </div>
          </div>
          <div class="send-box">
            <div class="toolbar">
              <el-button 
                type="text" 
                icon="el-icon-picture" 
                @click="showImageDialog = true"
                title="发送图片"
              ></el-button>
              <el-popover
                placement="top-start"
                width="300"
                trigger="click"
              >
                <div class="emoji-container">
                  <div 
                    v-for="(emoji, index) in emojis" 
                    :key="index"
                    class="emoji-item"
                    @click="insertEmoji(emoji)"
                  >
                    <img 
                      :src="emoji.url" 
                      :title="emoji.name"
                      class="emoji"
                    >
                  </div>
                </div>
                <el-button 
                  slot="reference" 
                  type="text" 
                  icon="el-icon-star-off"
                  title="发送表情"
                ></el-button>
              </el-popover>
            </div>
            <el-input
              v-model="newMessage"
              type="textarea"
              :rows="6"
              resize="none"
              @keyup.enter.native="sendMessage"
              ref="messageInput"
            />
            <el-button type="primary" @click="sendMessage">发送</el-button>
          </div>
        </div>
      </div>

      <!-- 右边用户信息 -->
      <div class="right-side">
        <div class="user-info">
          <el-avatar :size="100" :src="currentUser.avatar" />
          <h3>{{ currentUser.name }}</h3>
          <p>邮箱: {{ currentUser.email }}</p>
          <p>职位: {{ currentUser.position }}</p>
          <p>状态: 
            <el-tag :type="currentUser.status === '在线' ? 'success' : 'info'" size="small">
              {{ currentUser.status }}
            </el-tag>
          </p>
        </div>
      </div>
    </div>

    <!-- 图片上传对话框 -->
    <el-dialog 
      title="上传图片" 
      :visible.sync="showImageDialog" 
      width="30%"
      :before-close="handleClose"
    >
      <el-upload
        class="upload-demo"
        action="https://jsonplaceholder.typicode.com/posts/"
        :on-success="handleImageSuccess"
        :before-upload="beforeImageUpload"
        :show-file-list="false"
      >
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2MB</div>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      groupName: '线上求助',
      searchText: '',
      activeTab: 'sessions',
      activeSession: 1,
      newMessage: '',
      showImageDialog: false,
      
      // 表情数据
      emojis: [
        { name: '微笑', url: 'https://static.thenounproject.com/png/756729-200.png' },
        { name: '大笑', url: 'https://static.thenounproject.com/png/756730-200.png' },
        { name: '眨眼', url: 'https://static.thenounproject.com/png/756731-200.png' },
        { name: '爱心', url: 'https://static.thenounproject.com/png/756732-200.png' },
        { name: '惊讶', url: 'https://static.thenounproject.com/png/756733-200.png' },
        { name: '哭泣', url: 'https://static.thenounproject.com/png/756734-200.png' },
        { name: '愤怒', url: 'https://static.thenounproject.com/png/756735-200.png' },
        { name: '思考', url: 'https://static.thenounproject.com/png/756736-200.png' },
        { name: '生病', url: 'https://static.thenounproject.com/png/756737-200.png' }
      ],
      
      // 模拟数据
      sessions: [
        { 
          id: 1, 
          name: 'XXXXX', 
          avatar: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png',
          lastMessage: 'test',
          time: '12:30',
          unread: 3
        },
        { 
          id: 2, 
          name: 'XXXXXXXXXXXX',
          avatar: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png',
          lastMessage: '已更新',
          time: '昨天',
          unread: 0
        },
        {
          id: 3,
          name: 'XXXXXXXXXXXXXX',
          avatar: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png',
          lastMessage: '已上传',
          time: '周一',
          unread: 1
        }
      ],
      users: [
        { 
          id: 1, 
          name: '张三', 
          online: true, 
          avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          role: '管理员'
        },
        { 
          id: 2, 
          name: '李四', 
          online: false,
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
          role: '成员'
        },
        {
          id: 3,
          name: '王五',
          online: true,
          role: '成员'
        }
      ],
      messages: [
        { sender: '系统', content: '欢迎加入群聊', time: '09:00', type: 'text' },
        { sender: '张三', content: '大家好！', time: '09:05', type: 'text' },
        { 
          sender: '当前用户', 
          content: '大家好，我是新成员！', 
          time: '09:10',
          type: 'text' 
        },
        { 
          sender: '李四', 
          content: '有什么问题可以在这里提问', 
          time: '09:15',
          type: 'text' 
        },
        { 
          sender: '张三', 
          content: 'https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png', 
          time: '09:20',
          type: 'image' 
        },
        { 
          sender: '当前用户', 
          content: 'https://static.thenounproject.com/png/756729-200.png', 
          time: '09:25',
          type: 'emoji',
          emojiName: '微笑'
        }
      ],
      currentUser: {
        name: '当前用户',
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        email: 'user@example.com',
        position: '前端工程师',
        status: '在线'
      }
    }
  },
  computed: {
    filteredSessions() {
      return this.sessions.filter(session => 
        session.name.toLowerCase().includes(this.searchText.toLowerCase())
      )
    },
    filteredUsers() {
      return this.users.filter(user => 
        user.name.toLowerCase().includes(this.searchText.toLowerCase())
      )
    }
  },
  methods: {
    selectSession(id) {
      this.activeSession = id
      // 这里可以添加加载会话消息的逻辑
    },
    sendMessage() {
      if (this.newMessage.trim() || this.imageUrl) {
        this.messages.push({
          sender: this.currentUser.name,
          content: this.newMessage,
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          type: 'text'
        })
        this.newMessage = ''
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },
    // 发送图片
    handleImageSuccess(res, file) {
      this.showImageDialog = false
      this.messages.push({
        sender: this.currentUser.name,
        content: URL.createObjectURL(file.raw),
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        type: 'image'
      })
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    beforeImageUpload(file) {
      const isImage = file.type.indexOf('image/') === 0
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过2MB!')
      }
      return isImage && isLt2M
    },
    // 插入表情
    insertEmoji(emoji) {
      this.messages.push({
        sender: this.currentUser.name,
        content: emoji.url,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        type: 'emoji',
        emojiName: emoji.name
      })
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      container.scrollTop = container.scrollHeight
    },
    handleClose(done) {
      this.showImageDialog = false
      done()
    }
  },
  mounted() {
    this.scrollToBottom()
  }
}
</script>

<style scoped>
.container {
  height: 90vh;
  display: flex;
  flex-direction: column;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.header {
  padding: 15px 20px;
  border-bottom: 1px solid #e6e6e6;
  text-align: center;
  background-color: #409EFF;
}

.header h2 {
  margin: 0;
  font-size: 18px;
  color: white;
}

.content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-side {
  width: 280px;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  background-color: #fbfbfb;
}

.search-box {
  padding: 15px;
  border-bottom: 1px solid #e6e6e6;
}

.list-container {
  flex: 1;
  overflow: auto;
}

.list {
  padding: 0;
}

.list-item {
  padding: 12px 15px;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 1px solid #f5f5f5;
}

.list-item:hover {
  background-color: #f5f7fa;
}

.list-item.active {
  background-color: #ecf5ff;
  border-left: 3px solid #409eff;
}

.item-content {
  display: flex;
  align-items: center;
}

.item-avatar {
  flex-shrink: 0;
  margin-right: 12px;
  background-color: #f0f2f5;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
}

.item-desc, .item-status {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  margin-left: 10px;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.item-time {
  font-size: 12px;
  color: #c0c4cc;
  margin-bottom: 4px;
}

.item-badge {
  margin-top: 2px;
}

/* 用户在线状态 */
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #67c23a;
  margin-right: 5px;
}

.list-item:not(.online) .status-dot {
  background-color: #c0c4cc;
}

.center {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  position: relative;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 5px;
  background-color: #fff;
  max-width: 70%;
  box-shadow: 0 1px 2px rgba(87, 85, 85, 0.1);
  position: relative;
}

/* 当前用户消息样式 */
.message-right {
  margin-left: auto;
  background-color: #BBFFFF		;
  border-top-right-radius: 0;
}

/* 其他用户消息样式 */
.message:not(.message-right) {
  margin-right: auto;
  background-color: #C6E2FF;
  border-top-left-radius: 0;
}

/* 添加小三角指示 */
.message:not(.message-right)::before {
  content: '';
  position: absolute;
  top: 0;
  left: -8px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-right-color: #f0f0f0;
  border-left: 0;
  margin-top: 10px;
  margin-left: 0;
}

.message-right::after {
  content: '';
  position: absolute;
  top: 0;
  right: -8px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-left-color: #d9ecff;
  border-right: 0;
  margin-top: 10px;
  margin-right: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.9em;
}

.message-right .message-header {
  color: #1e80ff;
}

.message:not(.message-right) .message-header {
  color: #666;
}

.message-content {
  word-break: break-word;
  line-height: 1.5;
  color: #333;
}

.message-right .message-content {
  color: #1a1a1a;
}

.send-box {
  padding: 15px;
  border-top: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #f8f8f8;
}

.send-box .el-button {
  align-self: flex-end;
}

.toolbar {
  display: flex;
  gap: 5px;
  padding-bottom: 5px;
}

.right-side {
  width: 250px;
  border-left: 1px solid #e6e6e6;
  padding: 20px;
  background-color: #fbfbfb;
  overflow-y: auto;
}

.user-info {
  text-align: center;
}

.user-info h3 {
  margin: 15px 0 10px;
  color: #333;
}

.user-info p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.el-avatar {
  margin-bottom: 15px;
}

/* 表情样式 */
.emoji {
  width: 24px;
  height: 24px;
  vertical-align: middle;
}

.emoji-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.emoji-item:hover {
  transform: scale(1.2);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(144, 147, 153, 0.5);
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

.el-tag {
  margin-left: 5px;
}

.upload-demo {
  text-align: center;
}
</style>
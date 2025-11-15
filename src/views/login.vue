<template>
  <div class="login">
    <!-- 登录容器：标题 + Tab切换 -->
    <div class="login-container">
      <h3 class="title">{{ title }}</h3>

      <el-tabs v-model="activeTab" class="custom-tab" type="card">
        <!-- 账号密码登录 -->
        <el-tab-pane label="账号密码登录" name="passwordLogin">
          <el-form ref="passwordLoginForm" :model="loginForm" :rules="loginRules" class="login-form">
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="账号">
                <svg-icon slot="prefix" icon-class="user" />
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                :type="passwordVisible ? 'text' : 'password'"
                placeholder="密码"
                @keyup.enter.native="handlePasswordLogin"
              >
                <svg-icon slot="prefix" icon-class="password" />
                <span slot="suffix" class="password-eye" @click="togglePasswordVisibility">
                  <svg-icon :icon-class="passwordVisible ? 'eye-open' : 'eye'" class="eye-icon" />
                  <span v-if="passwordVisible" class="countdown-tip">{{ countdown }}s</span>
                </span>
              </el-input>
            </el-form-item>

            <el-form-item v-if="captchaEnabled" prop="code">
              <el-input v-model="loginForm.code" placeholder="验证码" style="width: 63%">
                <svg-icon slot="prefix" icon-class="validCode" />
              </el-input>
              <div class="login-code">
                <img :src="codeUrl" @click="getCode" class="login-code-img" />
              </div>
            </el-form-item>

            <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>

            <el-form-item>
              <el-button
                :loading="passwordLoading"
                type="primary"
                style="width: 100%"
                @click.native.prevent="handlePasswordLogin"
              >
                <span v-if="!passwordLoading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
              <router-link v-if="register" class="link-type" to="/register">立即注册</router-link>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 短信验证码登录 -->
        <el-tab-pane label="短信验证码登录" name="smsLogin">
          <el-form ref="smsLoginForm" :model="smsForm" :rules="smsRules" class="login-form">
            <el-form-item prop="phone">
              <el-input v-model="smsForm.phone" placeholder="请输入手机号">
                <svg-icon slot="prefix" icon-class="phone" />
              </el-input>
            </el-form-item>

            <!-- 滑块组件 -->
            <Verify
              v-if="useSmsCaptcha"
              ref="smsVerify"
              mode="pop"
              captcha-type="blockPuzzle"
              :img-size="{ width: '330px', height: '155px' }"
              @success="onSmsCaptchaOk" 
              @error="onSmsCaptchaError"
              @close="onSmsCaptchaClose"
            />

            <el-form-item prop="smsCode">
              <el-input
                v-model="smsForm.smsCode"
                placeholder="请输入短信验证码"
                style="width: 63%"
                @keyup.enter.native="handleSmsLogin"
              >
                <svg-icon slot="prefix" icon-class="validCode" />
              </el-input>
              <el-button
                type="text"
                style="width: 33%; float: right"
                :disabled="smsDisabled"
                @click="preGetSmsCode"
              >
                {{ smsDisabled ? `${count}s后重新获取` : '获取验证码' }}
              </el-button>
            </el-form-item>

            <el-form-item>
              <el-button
                :loading="smsLoading"
                type="primary"
                style="width: 100%"
                @click.native.prevent="handleSmsLogin"
              >
                <span v-if="!smsLoading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 邮箱验证码登录 -->
        <el-tab-pane label="邮箱验证码登录" name="emailLogin" v-if="false">
          <el-form ref="emailLoginForm" :model="emailForm" :rules="emailRules" class="login-form">
            <el-form-item prop="email">
              <el-input v-model="emailForm.email" placeholder="请输入邮箱地址">
                <svg-icon slot="prefix" icon-class="email" />
              </el-input>
            </el-form-item>

            <el-form-item prop="emailCode">
              <el-input
                v-model="emailForm.emailCode"
                placeholder="请输入邮箱验证码"
                style="width: 63%"
                @keyup.enter.native="handleEmailLogin"
              >
                <svg-icon slot="prefix" icon-class="validCode" />
              </el-input>
              <el-button
                type="text"
                style="width: 33%; float: right"
                :disabled="emailDisabled"
                @click="getEmailCode"
              >
                {{ emailDisabled ? `${emailCount}s后重新获取` : '获取验证码' }}
              </el-button>
            </el-form-item>

            <el-form-item>
              <el-button
                :loading="emailLoading"
                type="primary"
                style="width: 100%"
                @click.native.prevent="handleEmailLogin"
              >
                <span v-if="!emailLoading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
              <router-link v-if="register" class="link-type" to="/register">立即注册</router-link>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="el-login-footer">
      <span>Copyright © 2018-2025 All Rights Reserved.</span>
    </div>
  </div>
</template>

<script>
import { getCodeImg, sendSmsCode } from '@/api/login'
import Cookies from 'js-cookie'
import Verify from '@/components/verifition/Verify'
import { encrypt, decrypt } from '@/utils/jsencrypt'

export default {
  name: 'Login',
  components: { Verify },
  data() {
    return {
      title: process.env.VUE_APP_TITLE,
      codeUrl: '',
      activeTab: 'passwordLogin',
      passwordVisible: false,
      countdown: 0,
      countdownTimer: null,

      /* 账号密码登录 */
      loginForm: {
        username: 'admin',
        password: '',
        rememberMe: false,
        code: '',
        uuid: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
        password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
        code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
      },
      passwordLoading: false,

      /* 短信登录 */
      useSmsCaptcha: true,
      smsCaptchaVerification: '',
      smsForm: { phone: '', smsCode: '' },
      smsRules: {
        phone: [
          { required: true, trigger: 'blur', message: '请输入手机号' },
          { pattern: /^1[3-9]\d{9}$/, trigger: 'blur', message: '请输入正确的手机号' }
        ],
        smsCode: [
          { required: true, trigger: 'blur', message: '请输入短信验证码' },
          { pattern: /^\d{4}$/, trigger: 'blur', message: '请输入4位验证码' }
        ]
      },
      smsLoading: false,
      smsDisabled: false,
      count: 60,

      /* 邮箱登录 */
      emailForm: { email: '', emailCode: '' },
      emailRules: {
        email: [
          { required: true, trigger: 'blur', message: '请输入邮箱地址' },
          { type: 'email', trigger: 'blur', message: '请输入正确的邮箱格式' }
        ],
        emailCode: [
          { required: true, trigger: 'blur', message: '请输入邮箱验证码' },
          { pattern: /^\d{6}$/, trigger: 'blur', message: '请输入6位验证码' }
        ]
      },
      emailLoading: false,
      emailDisabled: false,
      emailCount: 60,

      /* 通用 */
      captchaEnabled: true,
      register: false,
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler(route) {
        this.redirect = route.query?.redirect
      },
      immediate: true
    }
  },
  created() {
    this.getCode()
    this.getCookie()
    console.log('Login component created, current activeTab:', this.activeTab)
  },
  beforeDestroy() {
    if (this.countdownTimer) clearInterval(this.countdownTimer)
  },
  methods: {
    /* 密码可见 */
    togglePasswordVisibility() {
      if (this.passwordVisible) {
        this.passwordVisible = false
        this.countdown = 0
        if (this.countdownTimer) clearInterval(this.countdownTimer)
      } else {
        this.passwordVisible = true
        this.countdown = 3
        if (this.countdownTimer) clearInterval(this.countdownTimer)
        this.countdownTimer = setInterval(() => {
          this.countdown--
          if (this.countdown <= 0) {
            this.passwordVisible = false
            clearInterval(this.countdownTimer)
            this.countdownTimer = null
          }
        }, 1000)
      }
    },

    /* 图形验证码 */
    getCode() {
      console.log('获取图形验证码')
      getCodeImg().then(res => {
        console.log('图形验证码获取成功:', res)
        this.captchaEnabled = res.captchaEnabled ?? true
        if (this.captchaEnabled) {
          this.codeUrl = 'data:image/gif;base64,' + res.img
          this.loginForm.uuid = res.uuid
        }
      }).catch(error => {
        console.error('获取图形验证码失败:', error)
      })
    },

    /* 记住密码 */
    getCookie() {
      const username = Cookies.get('username')
      const password = Cookies.get('password')
      const rememberMe = Cookies.get('rememberMe')
      this.loginForm = {
        username: username ?? this.loginForm.username,
        password: password ? decrypt(password) : this.loginForm.password,
        rememberMe: rememberMe ? Boolean(rememberMe) : false
      }
    },

    /* 账号密码登录 */
    handlePasswordLogin() {
      this.$refs.passwordLoginForm.validate(valid => {
        if (!valid) {
          console.log('表单验证失败')
          return
        }
        console.log('开始密码登录，用户名:', this.loginForm.username)
        this.passwordLoading = true
        if (this.loginForm.rememberMe) {
          Cookies.set('username', this.loginForm.username, { expires: 30 })
          Cookies.set('password', encrypt(this.loginForm.password), { expires: 30 })
          Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 })
        } else {
          Cookies.remove('username')
          Cookies.remove('password')
          Cookies.remove('rememberMe')
        }
        this.$store
          .dispatch('Login', this.loginForm)
          .then(() => {
            console.log('密码登录成功，跳转到:', this.redirect || '/')
            this.$router.push({ path: this.redirect || '/' })
          })
          .catch((error) => {
            console.error('密码登录失败:', error)
            this.passwordLoading = false
            this.captchaEnabled && this.getCode()
          })
      })
    },

    /* 滑块验证相关方法 */
    onSmsCaptchaOk(data) {
      console.log('滑块验证成功，返回数据:', data)
      // 尝试不同的可能字段名
      this.smsCaptchaVerification = data.captchaVerification || data.verification || data.captchaData
      console.log('提取的验证信息:', this.smsCaptchaVerification)
      
      if (!this.smsCaptchaVerification) {
        console.error('滑块验证成功但未获取到验证信息，完整返回数据:', data)
        this.$message.error('验证信息获取失败，请重试')
        return
      }
      
      this.$message.success('滑块验证成功，正在发送短信…')
      this.realSendSms()
    },

    onSmsCaptchaError(error) {
      console.error('滑块验证失败:', error)
      this.$message.error('滑块验证失败，请重试')
    },

    onSmsCaptchaClose() {
      console.log('滑块验证弹窗关闭')
      // 用户关闭滑块弹窗，不进行任何操作
    },

    /* 短信验证码登录 */
    preGetSmsCode() {
      console.log('点击获取短信验证码')
      this.$refs.smsLoginForm.validateField('phone', err => {
        if (err) {
          console.log('手机号验证失败:', err)
          this.$message.error('请先输入正确的手机号')
          return
        }
        console.log('手机号验证成功，显示滑块验证')
        if (this.$refs.smsVerify) {
          this.$refs.smsVerify.show()
        } else {
          console.error('滑块验证组件未找到')
          this.$message.error('验证组件加载失败，请刷新页面')
        }
      })
    },

    async realSendSms() {
      console.log('开始发送短信，手机号:', this.smsForm.phone)
      console.log('验证信息:', this.smsCaptchaVerification)
      
      if (!this.smsCaptchaVerification) {
        console.error('验证信息缺失')
        this.$message.error('验证信息缺失，请重新验证')
        this.smsDisabled = false
        return
      }

      if (!this.smsForm.phone) {
        console.error('手机号为空')
        this.$message.error('手机号不能为空')
        this.smsDisabled = false
        return
      }

      this.smsDisabled = true
      try {
        console.log('调用 sendSms API...')
        const requestData = {
          phoneNumber: this.smsForm.phone,
          captchaVerification: this.smsCaptchaVerification
        }
        console.log('发送短信请求参数:', requestData)
        
        const result = await sendSmsCode(requestData)
        console.log('短信发送成功，返回结果:', result)
        this.$message.success('短信验证码已发送，请注意查收')
        this.countDown()
      } catch (error) {
        console.error('短信发送失败:', error)
        let errorMsg = '短信发送失败，请重试'
        if (error.response && error.response.data) {
          errorMsg = error.response.data.msg || errorMsg
          console.error('错误详情:', error.response.data)
        }
        this.$message.error(errorMsg)
        this.smsDisabled = false
        // 重置验证信息，需要重新滑块验证
        this.smsCaptchaVerification = ''
      }
    },

    countDown() {
      console.log('开始倒计时')
      let t = 60
      this.count = t
      const timer = setInterval(() => {
        this.count = --t
        if (t <= 0) {
          clearInterval(timer)
          this.smsDisabled = false
          console.log('倒计时结束，可以重新获取验证码')
        }
      }, 1000)
    },

    handleSmsLogin() {
      console.log('开始短信登录')
      this.$refs.smsLoginForm.validate(valid => {
        if (!valid) {
          console.log('短信登录表单验证失败')
          return
        }
        console.log('短信登录表单验证成功')
        this.smsLoading = true
        this.$store
          .dispatch('SmsLogin', this.smsForm)
          .then(() => {
            console.log('短信登录成功，跳转到首页')
            this.$router.push('/')
          })
          .catch((error) => {
            console.error('短信登录失败:', error)
            this.$message.error('登录失败，请检查验证码')
          })
          .finally(() => {
            this.smsLoading = false
            console.log('短信登录流程结束')
          })
      })
    },

    /* 邮箱验证码登录 */
    getEmailCode() {
      this.$refs.emailLoginForm.validateField('email', err => {
        if (!err) {
          this.emailDisabled = true
          const timer = setInterval(() => {
            this.emailCount--
            if (this.emailCount <= 0) {
              clearInterval(timer)
              this.emailDisabled = false
              this.emailCount = 60
            }
          }, 1000)
        }
      })
    },
    
    handleEmailLogin() {
      this.$refs.emailLoginForm.validate(valid => {
        if (!valid) return
        this.emailLoading = true
        // 实际接口替换这里
        // this.$store.dispatch('EmailLogin', this.emailForm).then(() => { ... })
        this.emailLoading = false
      })
    }
  },
  beforeUnmount() {
    this.countdownTimer && clearInterval(this.countdownTimer)
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
  background-position: center;
  padding: 20px;
}

// 登录容器：标题 + Tab 整体包裹
.login-container {
  width: 100%;
  max-width: 480px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  padding: 35px 30px 25px;
}

// 标题样式（Tab上方）
.title {
  margin: 0 auto 28px;
  text-align: center;
  color: #1e293b;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

// 美化Tab样式
.custom-tab {
  // Tab头部容器
  .el-tabs__header {
    margin: 0 0 25px 0;
    padding: 0;
    background: transparent;
    border-bottom: 1px solid #e2e8f0;
  }

  // Tab导航栏
  .el-tabs__nav {
    height: 48px;
    line-height: 48px;
    background: transparent !important;
    border: none !important;
  }

  // 未激活Tab
  .el-tabs__item {
    height: 48px;
    line-height: 48px;
    padding: 0 22px;
    margin: 0;
    background: transparent !important;
    border: none !important;
    font-size: 15px;
    color: #64748b !important;
    transition: all 0.3s ease;

    // 鼠标悬浮
    &:hover {
      color: #165dff !important;
      background: rgba(22, 93, 255, 0.04) !important;
      border-radius: 8px;
    }
  }

  // 激活Tab
  .el-tabs__item.is-active {
    color: #165dff !important;
    font-weight: 500;
    position: relative;

    // 底部高亮条
    &::after {
      content: "";
      position: absolute;
      bottom: -1px; // 贴合底部边框
      left: 22px;
      right: 22px;
      height: 3px;
      background: #165dff;
      border-radius: 3px 3px 0 0;
    }
  }

  // 隐藏默认高亮条
  .el-tabs__active-bar {
    display: none !important;
  }

  // Tab内容区
  .el-tabs__content {
    padding: 0;
  }
}

// 登录表单
.login-form {
  width: 100%;

  .el-input {
    height: 44px;

    .input-icon {
      height: 39px;
      width: 14px;
      margin-left: 2px;
    }
    
    // 小眼睛图标样式
    .password-eye {
      display: flex;
      align-items: center;
      height: 100%;
      cursor: pointer;
      position: relative;
      
      .eye-icon {
        color: #c0c4cc;
        font-size: 16px;
        transition: color 0.2s;
        
        &:hover {
          color: #409eff;
        }
      }
      
      // 倒计时提示
      .countdown-tip {
        position: absolute;
        right: 25px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 12px;
        color: #f56c6c;
        background: rgba(245, 108, 108, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        animation: pulse 1s infinite;
      }
      
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.6; }
        100% { opacity: 1; }
      }
    }
  }
}
.login-code {
  width: 33%;
  height: 38px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 38px;
  width: 100%;
  object-fit: cover;
}
// 短信登录按钮样式
.el-form-item .el-button--text {
  height: 38px;
  line-height: 38px;
  color: #409eff;
}
</style>
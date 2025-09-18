<template>
  <div class="login">
    <!-- 登录容器：标题 + Tab切换 -->
    <div class="login-container">
      <!-- 标题移到Tab上方 -->
      <h3 class="title">{{title}}</h3>
      
      <!-- 三种登录方式Tab切换 -->
      <el-tabs v-model="activeTab" class="custom-tab" type="card">
        <!-- 账号密码登录 -->
        <el-tab-pane label="账号密码登录" name="passwordLogin">
          <el-form ref="passwordLoginForm" :model="loginForm" :rules="loginRules" class="login-form">
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                type="text"
                auto-complete="off"
                placeholder="账号"
              >
                <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                auto-complete="off"
                placeholder="密码"
                @keyup.enter.native="handlePasswordLogin"
              >
                <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
              </el-input>
            </el-form-item>
            <el-form-item prop="code" v-if="captchaEnabled">
              <el-input
                v-model="loginForm.code"
                auto-complete="off"
                placeholder="验证码"
                style="width: 63%"
                @keyup.enter.native="handlePasswordLogin"
              >
                <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
              </el-input>
              <div class="login-code">
                <img :src="codeUrl" @click="getCode" class="login-code-img"/>
              </div>
            </el-form-item>
            <el-checkbox v-model="loginForm.rememberMe" style="margin:0 0 25px 0;">记住密码</el-checkbox>
            <el-form-item style="width:100%;">
              <el-button
                :loading="passwordLoading"
                size="medium"
                type="primary"
                style="width:100%;"
                @click.native.prevent="handlePasswordLogin"
              >
                <span v-if="!passwordLoading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
              <div style="float: right;" v-if="register">
                <router-link class="link-type" :to="'/register'">立即注册</router-link>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 短信验证码登录 -->
        <el-tab-pane label="短信验证码登录" name="smsLogin">
          <el-form ref="smsLoginForm" :model="smsForm" :rules="smsRules" class="login-form">
            <el-form-item prop="phone">
              <el-input
                v-model="smsForm.phone"
                type="number"
                auto-complete="off"
                placeholder="请输入手机号"
              >
                <svg-icon slot="prefix" icon-class="phone" class="el-input__icon input-icon" />
              </el-input>
            </el-form-item>
            <el-form-item prop="smsCode">
              <el-input
                v-model="smsForm.smsCode"
                auto-complete="off"
                placeholder="请输入短信验证码"
                style="width: 63%"
                @keyup.enter.native="handleSmsLogin"
              >
                <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
              </el-input>
              <el-button 
                type="text" 
                style="width: 33%; float: right;"
                :disabled="smsDisabled"
                @click="getSmsCode"
              >
                {{smsDisabled ? `${count}s后重新获取` : '获取验证码'}}
              </el-button>
            </el-form-item>
            <el-form-item style="width:100%;">
              <el-button
                :loading="smsLoading"
                size="medium"
                type="primary"
                style="width:100%;"
                @click.native.prevent="handleSmsLogin"
              >
                <span v-if="!smsLoading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
              <div style="float: right;" v-if="register">
                <router-link class="link-type" :to="'/register'">立即注册</router-link>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 邮箱验证码登录 -->
        <el-tab-pane label="邮箱验证码登录" name="emailLogin">
          <el-form ref="emailLoginForm" :model="emailForm" :rules="emailRules" class="login-form">
            <el-form-item prop="email">
              <el-input
                v-model="emailForm.email"
                type="email"
                auto-complete="off"
                placeholder="请输入邮箱地址"
              >
                <svg-icon slot="prefix" icon-class="email" class="el-input__icon input-icon" />
              </el-input>
            </el-form-item>
            <el-form-item prop="emailCode">
              <el-input
                v-model="emailForm.emailCode"
                auto-complete="off"
                placeholder="请输入邮箱验证码"
                style="width: 63%"
                @keyup.enter.native="handleEmailLogin"
              >
                <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
              </el-input>
              <el-button 
                type="text" 
                style="width: 33%; float: right;"
                :disabled="emailDisabled"
                @click="getEmailCode"
              >
                {{emailDisabled ? `${emailCount}s后重新获取` : '获取验证码'}}
              </el-button>
            </el-form-item>
            <el-form-item style="width:100%;">
              <el-button
                :loading="emailLoading"
                size="medium"
                type="primary"
                style="width:100%;"
                @click.native.prevent="handleEmailLogin"
              >
                <span v-if="!emailLoading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
              <div style="float: right;" v-if="register">
                <router-link class="link-type" :to="'/register'">立即注册</router-link>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 底部 -->
    <div class="el-login-footer">
      <span>Copyright © 2018-2025 All Rights Reserved.</span>
    </div>
  </div>
</template>

<script>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from '@/utils/jsencrypt'

export default {
  name: "Login",
  data() {
    return {
      title: process.env.VUE_APP_TITLE,
      codeUrl: "",
      activeTab: "passwordLogin", // 默认激活账号密码登录
      // 账号密码登录
      loginForm: { username: "admin", password: "123456", rememberMe: false, code: "", uuid: "" },
      loginRules: {
        username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
        password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }]
      },
      passwordLoading: false,
      // 短信登录
      smsForm: { phone: "", smsCode: "" },
      smsRules: {
        phone: [
          { required: true, trigger: "blur", message: "请输入手机号" },
          { pattern: /^1[3-9]\d{9}$/, trigger: "blur", message: "请输入正确的手机号" }
        ],
        smsCode: [
          { required: true, trigger: "blur", message: "请输入短信验证码" },
          { pattern: /^\d{6}$/, trigger: "blur", message: "请输入6位验证码" }
        ]
      },
      smsLoading: false,
      smsDisabled: false,
      count: 60,
      // 邮箱登录
      emailForm: { email: "", emailCode: "" },
      emailRules: {
        email: [
          { required: true, trigger: "blur", message: "请输入邮箱地址" },
          { type: "email", trigger: "blur", message: "请输入正确的邮箱格式" }
        ],
        emailCode: [
          { required: true, trigger: "blur", message: "请输入邮箱验证码" },
          { pattern: /^\d{6}$/, trigger: "blur", message: "请输入6位验证码" }
        ]
      },
      emailLoading: false,
      emailDisabled: false,
      emailCount: 60,
      // 基础配置
      captchaEnabled: true,
      register: false,
      redirect: undefined
    };
  },
  watch: {
    $route: { handler(route) { this.redirect = route.query?.redirect; }, immediate: true }
  },
  created() {
    this.getCode();
    this.getCookie();
  },
  methods: {
    // 图形验证码
    getCode() {
      getCodeImg().then(res => {
        this.captchaEnabled = res.captchaEnabled ?? true;
        if (this.captchaEnabled) {
          this.codeUrl = "data:image/gif;base64," + res.img;
          this.loginForm.uuid = res.uuid;
        }
      });
    },
    // 读取Cookie
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get('rememberMe')
      this.loginForm = {
        username: username ?? this.loginForm.username,
        password: password ? decrypt(password) : this.loginForm.password,
        rememberMe: rememberMe ? Boolean(rememberMe) : false
      };
    },
    // 账号密码登录
    handlePasswordLogin() {
      this.$refs.passwordLoginForm.validate(valid => {
        if (valid) {
          this.passwordLoading = true;
          this.loginForm.rememberMe 
            ? (Cookies.set("username", this.loginForm.username, { expires: 30 }),
              Cookies.set("password", encrypt(this.loginForm.password), { expires: 30 }),
              Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 }))
            : (Cookies.remove("username"), Cookies.remove("password"), Cookies.remove('rememberMe'));
          this.$store.dispatch("Login", this.loginForm).then(() => {
            this.$router.push({ path: this.redirect || "/" }).catch(()=>{});
          }).catch(() => {
            this.passwordLoading = false;
            this.captchaEnabled && this.getCode();
          });
        }
      });
    },
    // 短信验证码
    getSmsCode() {
      this.$refs.smsLoginForm.validateField('phone', error => {
        if (!error) {
          this.smsDisabled = true;
          const timer = setInterval(() => {
            this.count--;
            this.count <= 0 && (clearInterval(timer), this.smsDisabled = false, this.count = 60);
          }, 1000);
        }
      });
    },
    // 短信登录
    handleSmsLogin() {
      this.$refs.smsLoginForm.validate(valid => {
        if (valid) {
          this.smsLoading = true;
          // 替换为实际短信登录接口
          // this.$store.dispatch("SmsLogin", this.smsForm).then(() => {
          //   this.$router.push({ path: this.redirect || "/" }).catch(()=>{});
          // }).catch(() => { this.smsLoading = false; });
        }
      });
    },
    // 邮箱验证码
    getEmailCode() {
      this.$refs.emailLoginForm.validateField('email', error => {
        if (!error) {
          this.emailDisabled = true;
          const timer = setInterval(() => {
            this.emailCount--;
            this.emailCount <= 0 && (clearInterval(timer), this.emailDisabled = false, this.emailCount = 60);
          }, 1000);
        }
      });
    },
    // 邮箱登录
    handleEmailLogin() {
      this.$refs.emailLoginForm.validate(valid => {
        if (valid) {
          this.emailLoading = true;
          // 替换为实际邮箱登录接口
          // this.$store.dispatch("EmailLogin", this.emailForm).then(() => {
          //   this.$router.push({ path: this.redirect || "/" }).catch(()=>{});
          // }).catch(() => { this.emailLoading = false; });
        }
      });
    }
  }
};
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
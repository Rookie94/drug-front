import axios from 'axios'
import { Notification, MessageBox, Message, Loading } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { tansParams, blobValidate } from "@/utils/ruoyi";
import cache from '@/plugins/cache'
import { saveAs } from 'file-saver'
// 引入加密、解密的方法
import { decryptSM4, encryptSM4 } from "@/utils/SM4Util";

const encryptEnabled = process.env.VUE_APP_ENCRYPT_ENABLED === 'true';
const noEncryptUrls = process.env.VUE_APP_NO_ENCRYPT_URLS?.split(',') || [];

const needReplace = process.env.VUE_APP_OSS_REPLACE === 'true'
const srcDomain = process.env.VUE_APP_OSS_SRC  // https://www.haomge.com:9000
const dstDomain = process.env.VUE_APP_OSS_DST  // http://172.24.160.42:9000

let downloadLoadingInstance;
// 是否显示重新登录
export let isRelogin = { show: false };

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: process.env.VUE_APP_BASE_API,
  // 超时
  timeout: 10000
})

/* ---------- OSS 地址替换工具函数（响应时：src -> dst） ---------- */
function replaceOssUrl(data) {
  if (!needReplace || !srcDomain || !dstDomain) return data
  
  // 构建正则表达式，匹配 srcDomain（包括协议和端口号）
  const srcPattern = srcDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const srcReg = new RegExp(srcPattern, 'g')
  
  const walk = (obj) => {
    if (typeof obj === 'string') {
      // 替换所有匹配的 srcDomain
      return obj.replace(srcReg, dstDomain)
    }
    if (Array.isArray(obj)) return obj.map(walk)
    if (obj && typeof obj === 'object') {
      // 特殊处理 FormData 等对象
      if (obj instanceof FormData || obj instanceof Blob || obj instanceof ArrayBuffer) {
        return obj
      }
      const tmp = {}
      for (const key in obj) tmp[key] = walk(obj[key])
      return tmp
    }
    return obj
  }
  
  return walk(data)
}

/* ---------- OSS 地址反向替换函数（请求时：dst -> src） ---------- */
function reverseReplaceOssUrl(data) {
  if (!needReplace || !srcDomain || !dstDomain) return data
  
  // 构建正则表达式，匹配 dstDomain（包括协议和端口号）
  const dstPattern = dstDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const dstReg = new RegExp(dstPattern, 'g')
  
  const walk = (obj) => {
    if (typeof obj === 'string') {
      // 替换所有匹配的 dstDomain
      return obj.replace(dstReg, srcDomain)
    }
    if (Array.isArray(obj)) return obj.map(walk)
    if (obj && typeof obj === 'object') {
      // 特殊处理 FormData 等对象
      if (obj instanceof FormData || obj instanceof Blob || obj instanceof ArrayBuffer) {
        return obj
      }
      const tmp = {}
      for (const key in obj) tmp[key] = walk(obj[key])
      return tmp
    }
    return obj
  }
  
  return walk(data)
}
/* -------------------------------------------------------------- */

// request拦截器
service.interceptors.request.use(config => {
  
  // 判断是否为需要处理的请求（非GET请求且有数据）
  const shouldProcessOss = needReplace && config.method !== 'get' && config.data
  
  
  // 处理加密逻辑
  if(encryptEnabled){
    const isUrlInWhitelist = noEncryptUrls.some(url => config.url.includes(url));
    
    if (!isUrlInWhitelist){  
      // 需要加密的请求
      if(config?.data !== undefined){
        let dataToEncrypt = config.data;
        
        // 如果需要替换且不是GET请求
        if (shouldProcessOss) {
          try {
            // 对数据进行OSS反向替换
            if (typeof dataToEncrypt === 'object') {
              dataToEncrypt = reverseReplaceOssUrl(dataToEncrypt);
            } else if (typeof dataToEncrypt === 'string') {
              try {
                // 尝试解析为JSON对象
                const parsed = JSON.parse(dataToEncrypt);
                const replaced = reverseReplaceOssUrl(parsed);
                dataToEncrypt = JSON.stringify(replaced);
              } catch (e) {
                // 如果不是JSON字符串，直接处理
                dataToEncrypt = reverseReplaceOssUrl(dataToEncrypt);
              }
            }            
          } catch (error) {
            console.warn('加密数据OSS反向替换失败:', error);
          }
        }
        
        // 加密处理
        config.data = typeof dataToEncrypt === "object" ? encryptSM4(JSON.stringify(dataToEncrypt)) : encryptSM4(dataToEncrypt);
      }  
    } else {
      // 不需要加密的请求，直接进行OSS反向替换
      if (shouldProcessOss) {
        try {
          config.data = reverseReplaceOssUrl(config.data);
        } catch (error) {
          console.warn('非加密数据OSS反向替换失败:', error);
        }
      }
    }
  } else {
    // 不启用加密时，直接进行OSS反向替换
    if (shouldProcessOss) {
      try {
        config.data = reverseReplaceOssUrl(config.data);
      } catch (error) {
        console.warn('非加密数据OSS反向替换失败:', error);
      }
    }
  }
  
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false
  // 是否需要防止数据重复提交
  const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
  if (getToken() && !isToken) {
    config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  
  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params);
    url = url.slice(0, -1);
    config.params = {};
    config.url = url;
  }
  
  if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
    const requestObj = {
      url: config.url,
      data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
      time: new Date().getTime()
    }
    const requestSize = Object.keys(JSON.stringify(requestObj)).length; // 请求数据大小
    const limitSize = 5 * 1024 * 1024; // 限制存放数据5M
    if (requestSize >= limitSize) {
      console.warn(`[${config.url}]: ` + '请求数据大小超出允许的5M限制，无法进行防重复提交验证。')
      return config;
    }
    const sessionObj = cache.session.getJSON('sessionObj')
    if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
      cache.session.setJSON('sessionObj', requestObj)
    } else {
      const s_url = sessionObj.url;                  // 请求地址
      const s_data = sessionObj.data;                // 请求数据
      const s_time = sessionObj.time;                // 请求时间
      const interval = 1000;                         // 间隔时间(ms)，小于此时间视为重复提交
      if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
        const message = '数据正在处理，请勿重复提交';
        console.warn(`[${s_url}]: ` + message)
        return Promise.reject(new Error(message))
      } else {
        cache.session.setJSON('sessionObj', requestObj)
      }
    }
  }
  
  return config
}, error => {
    console.log(error)
    Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(res => {
    // 如果是二进制响应（如下载请求），直接返回原始数据，不做任何解密处理
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data;
    }
    
    let data;  
    if(encryptEnabled){
      const isUrlInWhitelist = noEncryptUrls.some(url => res.config.url.includes(url));
      // 数据解密  
      if (res.data instanceof Blob || isUrlInWhitelist) { 
        data=res.data; // 跳过二进制数据解密
      }
      else{
        if (typeof res.data === 'string') {
          const dataStr = decryptSM4(res.data);
          try {
            data = JSON.parse(dataStr);
          } catch (e) {
            data = dataStr; // 非JSON数据直接返回
          }
        }
      }
    }
    else{
      data=res.data;
    }

    /* ---------- 解密/原始数据后再做 OSS 地址替换 ---------- */
    data = replaceOssUrl(data)
    /* --------------------------------------------------------- */

    // 未设置状态码则默认成功状态
    const code = data.code || 200;
    // 获取错误信息
    const msg = errorCode[code] || data.msg || errorCode['default']
    
    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true;
        MessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', { confirmButtonText: '重新登录', cancelButtonText: '取消', type: 'warning' }).then(() => {
          isRelogin.show = false;
          store.dispatch('LogOut').then(() => {
            location.href = '/index';
            })
        }).catch(() => {
          isRelogin.show = false;
        });
      }
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
    } else if (code === 500) {
      Message({ message: msg, type: 'error' })
      return Promise.reject(new Error(msg))
    } else if (code === 601) {
      Message({ message: msg, type: 'warning' })
      return Promise.reject('error')
    } else if (code !== 200) {
      Notification.error({ title: msg })
      return Promise.reject('error')
    } else {
      return data
    }
  },
  error => {
    console.log('err' + error)
    let { message } = error;
    if (message == "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    Message({ message: message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
  }
)

// 通用下载方法
export function download(url, params, filename, config) {
  // 添加日志查看传入的 filename
  console.log('下载参数:', {
    url,
    filename: filename,
    filename类型: typeof filename,
    filename原始值: filename
  })
  
  downloadLoadingInstance = Loading.service({ text: "正在下载数据，请稍候", spinner: "el-icon-loading", background: "rgba(0, 0, 0, 0.7)", })
  return service.post(url, params, {
    transformRequest: [(params) => { return tansParams(params) }],
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'blob',
    ...config
  }).then(async (data) => {
    const isBlob = blobValidate(data);
    if (isBlob) {
      const blob = new Blob([data])
      
      // 添加更多日志
      console.log('生成Blob:', {
        size: blob.size,
        type: blob.type,
        filename最终值: filename,
        filename类型: typeof filename
      })
      
      // 确保 filename 是字符串
      let finalFilename;
      if (typeof filename === 'string') {
        finalFilename = filename;
      } else if (filename && typeof filename === 'object') {
        // 尝试从对象中提取文件名
        console.warn('警告：filename参数是对象类型，正在尝试提取文件名', filename);
        
        if (filename.filename && typeof filename.filename === 'string') {
          finalFilename = filename.filename;
        } else if (filename.name && typeof filename.name === 'string') {
          finalFilename = filename.name;
        } else if (filename.value && typeof filename.value === 'string') {
          finalFilename = filename.value;
        } else {
          // 使用默认文件名
          const timestamp = new Date().getTime();
          finalFilename = `download_${timestamp}.xlsx`;
        }
      } else {
        // 其他情况使用默认文件名
        const timestamp = new Date().getTime();
        finalFilename = `download_${timestamp}.xlsx`;
      }
      
      // 确保文件名有正确的扩展名
      if (!finalFilename.includes('.')) {
        finalFilename += '.xlsx';
      }
      
      console.log('保存文件:', finalFilename, 'Blob大小:', blob.size);
      saveAs(blob, finalFilename);
    } else {
      const resText = await data.text();
      const rspObj = JSON.parse(resText);
      const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default'];
      Message.error(errMsg);
    }
    downloadLoadingInstance.close();
  }).catch((r) => {
    console.error('下载错误:', r);
    Message.error('下载文件出现错误，请联系管理员！');
    downloadLoadingInstance.close();
  })
}

export default service
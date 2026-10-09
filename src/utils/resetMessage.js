/**
 * 全局防抖与去重 Message
 * 解决 Element-UI 在接口拦截器与组件 catch 同时捕获、或者并发请求失败时弹窗重叠的问题
 */
import { Message } from 'element-ui'

const messageHistory = new Map()
const DEDUPE_TIMEOUT = 1200 // 1.2 秒内相同类型且相同内容的消息只展示一次

function getMessageKey(options) {
  let text = ''
  let type = 'info'
  if (typeof options === 'string') {
    text = options
  } else if (options && typeof options === 'object') {
    text = options.message || ''
    type = options.type || 'info'
  }
  return `${type}::${text}`
}

const resetMessage = function(options) {
  const key = getMessageKey(options)
  const now = Date.now()
  const lastTime = messageHistory.get(key) || 0

  if (now - lastTime < DEDUPE_TIMEOUT) {
    // 处于防抖窗口内的相同消息直接忽略
    return null
  }

  messageHistory.set(key, now)
  setTimeout(() => {
    messageHistory.delete(key)
  }, DEDUPE_TIMEOUT)

  return Message(options)
}

// 绑定类型快捷方法 (success, warning, info, error)
;['success', 'warning', 'info', 'error'].forEach(type => {
  resetMessage[type] = function(options) {
    if (typeof options === 'string') {
      options = { message: options, type }
    } else if (options && typeof options === 'object') {
      options.type = type
    }
    return resetMessage(options)
  }
})

resetMessage.close = Message.close
resetMessage.closeAll = Message.closeAll

export default resetMessage

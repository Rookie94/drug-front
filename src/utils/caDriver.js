/** 调用 SAP2000 安装在客户端的本机 WebSocket 服务。 */
export function getCaIdentityTicket(challengeInfo, onProgress) {
  if (challengeInfo.mock) {
    // 模拟同一把虚拟 UKey 的票据；仍须先在用户管理中绑定。
    return Promise.resolve('MOCK:' + challengeInfo.challenge)
  }

  const serverTarget = `${challengeInfo.serverIp || '认证中心'}:${challengeInfo.serverPort || 9021}`
  const TIMEOUT_MS = 60000 // 延长至 60 秒，为用户输入 PIN 码及网络取票留出充足时间

  return new Promise((resolve, reject) => {
    let socket
    let settled = false
    let currentStage = 'connect_driver' // connect_driver | check_key | get_token

    const timer = setTimeout(() => {
      if (currentStage === 'get_token') {
        finish(new Error(`UKey 认证超时：若弹出 PIN 码窗口请先输入确认；若未弹窗或已确认仍超时，说明本机网络无法连通认证服务器（${serverTarget}），请联系网络管理员开通 TCP 9021 策略或连接专网 VPN。`))
      } else if (currentStage === 'connect_driver') {
        finish(new Error('无法连接 UKey 本地驱动（ws://127.0.0.1:31018），请确认驱动程序已安装并在后台运行。'))
      } else {
        finish(new Error('UKey 设备检测超时，请重新拔插 UKey 后重试。'))
      }
    }, TIMEOUT_MS)

    function finish(error, ticket) {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (socket) {
        try { socket.close() } catch (e) {}
      }
      if (error) {
        error.isDriverError = true
        reject(error)
      } else {
        resolve(ticket)
      }
    }

    try {
      socket = new WebSocket('ws://127.0.0.1:31018')
      socket.onopen = () => {
        currentStage = 'check_key'
        socket.send(JSON.stringify({ FuncName: 'CheckKey' }))
      }
      socket.onerror = () => finish(new Error('无法连接 UKey 驱动，请确认已安装并启动（ws://127.0.0.1:31018）'))
      socket.onclose = () => {
        if (!settled) {
          finish(new Error('UKey 本地驱动连接已断开，请确认驱动程序正在运行'))
        }
      }
      socket.onmessage = event => {
        let response
        try {
          response = JSON.parse(event.data)
        } catch (error) {
          finish(new Error('UKey 驱动返回的数据无法解析'))
          return
        }

        // 1. 钥匙在位检测
        if (response.FuncName === 'CheckKey' || response.IsKeyIn !== undefined) {
          if (Number(response.IsKeyIn) !== 1) {
            finish(new Error('未检测到 UKey，请插入后重试'))
            return
          }
          currentStage = 'get_token'
          if (typeof onProgress === 'function') {
            onProgress('detected_key')
          }
          console.log(`[UKey] 设备在位，正在向驱动请求票据，目标服务器: ${serverTarget}`)
          socket.send(JSON.stringify({
            FuncName: 'GetSignAndToken',
            Parames: {
              IP: challengeInfo.serverIp,
              PORT: challengeInfo.serverPort,
              svrRandom: challengeInfo.challenge
            },
            sessionID: challengeInfo.challengeId
          }))
          return
        }

        // 2. 取票结果处理
        if (response.FuncName === 'GetSignAndToken') {
          if (response.sessionID !== challengeInfo.challengeId) {
            finish(new Error('UKey 驱动响应与本次登录不匹配，请重试'))
            return
          }
          if (response.result === 'success' && response.Taken) {
            finish(null, response.Taken)
            return
          }

          // 解析驱动返回的具体失败代码与错误描述
          const code = response.ErrorCode !== undefined ? String(response.ErrorCode) : ''
          const rawMsg = response.ErrorMsg || response.error || response.bstrError || response.msg || ''

          // 判断是否为网络连通性阻断（0x10000003 为 SAP2000 连接服务器超时/失败码）
          const isNetError = code === '0x10000003' || code === '268435459' ||
            /网络|连接|超时|connect|timeout|server/i.test(rawMsg)

          if (isNetError) {
            finish(new Error(`UKey 认证失败：本机网络无法连接到认证服务器（${serverTarget}），请联系管理员开通 9021 端口策略！`))
          } else if (/取消|cancel/i.test(rawMsg)) {
            finish(new Error('UKey 认证已取消：未完成 PIN 码输入'))
          } else if (rawMsg) {
            finish(new Error(`UKey 认证失败：${rawMsg}（错误码：${code || '未知'}）`))
          } else {
            finish(new Error(`UKey 认证失败（错误码：${code || '未知'}），若网络不通请检查到 ${serverTarget} 的连通性`))
          }
        }
      }
    } catch (error) {
      finish(new Error('当前浏览器无法连接 UKey 驱动'))
    }
  })
}

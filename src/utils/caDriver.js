/** 调用 SAP2000 安装在客户端的本机 WebSocket 服务。 */
export function getCaIdentityTicket(challengeInfo) {
  if (challengeInfo.mock) {
    // 模拟同一把虚拟 UKey 的票据；仍须先在用户管理中绑定。
    return Promise.resolve('MOCK:' + challengeInfo.challenge)
  }

  return new Promise((resolve, reject) => {
    let socket
    let settled = false
    const timer = setTimeout(() => finish(new Error('UKey 驱动连接或认证超时')), 15000)

    function finish(error, ticket) {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (socket) socket.close()
      if (error) reject(error)
      else resolve(ticket)
    }

    try {
      socket = new WebSocket('ws://127.0.0.1:31018')
      socket.onopen = () => socket.send(JSON.stringify({ FuncName: 'CheckKey' }))
      socket.onerror = () => finish(new Error('无法连接 UKey 驱动，请确认已安装并启动'))
      socket.onclose = () => finish(new Error('UKey 驱动连接已断开'))
      socket.onmessage = event => {
        let response
        try {
          response = JSON.parse(event.data)
        } catch (error) {
          finish(new Error('UKey 驱动返回的数据无法解析'))
          return
        }
        if (response.FuncName === 'CheckKey' || response.IsKeyIn !== undefined) {
          if (Number(response.IsKeyIn) !== 1) {
            finish(new Error('未检测到 UKey，请插入后重试'))
            return
          }
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
        if (response.FuncName === 'GetSignAndToken') {
          if (response.sessionID !== challengeInfo.challengeId) {
            finish(new Error('UKey 驱动响应与本次登录不匹配'))
          } else if (response.result === 'success' && response.Taken) {
            finish(null, response.Taken)
          } else {
            finish(new Error('UKey 认证失败，错误码：' + (response.ErrorCode || '未知')))
          }
        }
      }
    } catch (error) {
      finish(new Error('当前浏览器无法连接 UKey 驱动'))
    }
  })
}

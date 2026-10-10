import request from '@/utils/request'
import Message from '@/utils/resetMessage'

/**
 * 跳转到 qData 数据中台（单点登录免密自动进入）
 * @param {string} targetPath qData 平台目标路由，默认 '/index'
 */
export async function jumpToQData(targetPath = '/index') {
  try {
    // 1. 请求一体两翼后端签发临时授权码
    const res = await request({
      url: '/sso/createCode',
      method: 'get'
    })

    // 提取授权码（支持 ssoCode 或 data 属性）
    const ssoCode = res.ssoCode || res.data

    if (!ssoCode) {
      Message.error('获取单点登录凭证失败')
      return
    }

    const qDataBaseUrl = process.env.VUE_APP_QDATA_URL || 'http://localhost:81'

    // 2. 拼接 qData 已有的 /sso 路由地址
    const ssoUrl = `${qDataBaseUrl}/sso?code=${encodeURIComponent(ssoCode)}&source=yitiliangyi&state=${encodeURIComponent(targetPath)}`

    // 3. 打开新标签页进入 qData
    window.open(ssoUrl, '_blank')
  } catch (error) {
    console.error('SSO 跳转异常:', error)
    Message.error('跳转数据中台失败，请稍后重试')
  }
}

export default {
  jumpToQData
}

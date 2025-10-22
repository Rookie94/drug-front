import request from '@/utils/request'

// 获取指标
export function getMetrics() {
  return request({
    url: '/etl/report1/1',
    method: 'get'
  })
}

// 获取 30 日登录趋势
export function getLoginTrend() {
  return request({
    url: '/etl/report1/loginTrend',
    method: 'get'
  })
}
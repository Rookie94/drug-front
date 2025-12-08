// @/api/myboard/board2.js
import request from '@/utils/request'

// 获取统计分析数据
export function getStatisticsData(query) {
  return request({
    url: '/myboard/board2/getStatisticsData',
    method: 'post',
    data: query
  })
}

// 导出统计数据
export function exportData(query) {
  return request({
    url: '/myboard/board2/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}
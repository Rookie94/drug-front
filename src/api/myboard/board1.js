import request from '@/utils/request'

// 查询人员统计列表
export function listStatistics(query) {
  return request({
    url: '/myboard/board1/list',
    method: 'get',
    params: query
  })
}

// 导出人员统计数据
export function exportStatistics(query) {
  return request({
    url: '/myboard/board1/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
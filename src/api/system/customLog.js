import request from '@/utils/request'

// 查询自定义日志列表
export function listCustomLog(query) {
  return request({
    url: '/system/customLog/list',
    method: 'get',
    params: query
  })
}

// 查询自定义日志详细
export function getCustomLog(logId) {
  return request({
    url: '/system/customLog/' + logId,
    method: 'get'
  })
}

// 删除自定义日志
export function delCustomLog(logIds) {
  return request({
    url: '/system/customLog/' + logIds,
    method: 'delete'
  })
}
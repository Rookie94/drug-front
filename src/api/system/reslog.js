import request from '@/utils/request'

// 查询资源日志列表
export function listReslog(query) {
  return request({
    url: '/system/reslog/list',
    method: 'get',
    params: query
  })
}

// 查询资源日志详细
export function getReslog(logId) {
  return request({
    url: '/system/reslog/' + logId,
    method: 'get'
  })
}

// 新增资源日志
export function addReslog(data) {
  return request({
    url: '/system/reslog',
    method: 'post',
    data: data
  })
}

// 修改资源日志
export function updateReslog(data) {
  return request({
    url: '/system/reslog',
    method: 'put',
    data: data
  })
}

// 删除资源日志
export function delReslog(logId) {
  return request({
    url: '/system/reslog/' + logId,
    method: 'delete'
  })
}

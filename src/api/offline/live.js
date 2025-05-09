import request from '@/utils/request'

// 查询VIEW列表
export function listLive(query) {
  return request({
    url: '/offline/live/list',
    method: 'get',
    params: query
  })
}

// 查询VIEW详细
export function getLive(liveId) {
  return request({
    url: '/offline/live/' + liveId,
    method: 'get'
  })
}

// 新增VIEW
export function addLive(data) {
  return request({
    url: '/offline/live',
    method: 'post',
    data: data
  })
}

// 修改VIEW
export function updateLive(data) {
  return request({
    url: '/offline/live',
    method: 'put',
    data: data
  })
}

// 删除VIEW
export function delLive(liveId) {
  return request({
    url: '/offline/live/' + liveId,
    method: 'delete'
  })
}

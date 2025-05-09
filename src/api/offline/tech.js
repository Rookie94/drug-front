import request from '@/utils/request'

// 查询活动戒治技术资料列表
export function listTech(query) {
  return request({
    url: '/offline/tech/list',
    method: 'get',
    params: query
  })
}

// 查询活动戒治技术资料详细
export function getTech(techId) {
  return request({
    url: '/offline/tech/' + techId,
    method: 'get'
  })
}

// 新增活动戒治技术资料
export function addTech(data) {
  return request({
    url: '/offline/tech',
    method: 'post',
    data: data
  })
}

// 修改活动戒治技术资料
export function updateTech(data) {
  return request({
    url: '/offline/tech',
    method: 'put',
    data: data
  })
}

// 删除活动戒治技术资料
export function delTech(techId) {
  return request({
    url: '/offline/tech/' + techId,
    method: 'delete'
  })
}

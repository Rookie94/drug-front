import request from '@/utils/request'

// 查询活动签到列表
export function listCheckin(query) {
  return request({
    url: '/offline/checkin/list',
    method: 'get',
    params: query
  })
}

// 查询活动签到详细
export function getCheckin(checkinId) {
  return request({
    url: '/offline/checkin/' + checkinId,
    method: 'get'
  })
}

// 新增活动签到
export function addCheckin(data) {
  return request({
    url: '/offline/checkin',
    method: 'post',
    data: data
  })
}

// 修改活动签到
export function updateCheckin(data) {
  return request({
    url: '/offline/checkin',
    method: 'put',
    data: data
  })
}

// 删除活动签到
export function delCheckin(checkinId) {
  return request({
    url: '/offline/checkin/' + checkinId,
    method: 'delete'
  })
}

import request from '@/utils/request'

// 查询活动发布列表
export function listActivities(query) {
  return request({
    url: '/offline/activities/list',
    method: 'get',
    params: query
  })
}

// 查询活动发布详细
export function getActivities(activityId) {
  return request({
    url: '/offline/activities/' + activityId,
    method: 'get'
  })
}

// 新增活动发布
export function addActivities(data) {
  return request({
    url: '/offline/activities',
    method: 'post',
    data: data
  })
}

// 修改活动发布
export function updateActivities(data) {
  return request({
    url: '/offline/activities',
    method: 'put',
    data: data
  })
}

// 删除活动发布
export function delActivities(activityId) {
  return request({
    url: '/offline/activities/' + activityId,
    method: 'delete'
  })
}

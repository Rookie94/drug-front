import request from '@/utils/request'

// 查询活动发布列表（用于选择框）
export function selectActivityList(query) {
  return request({
    url: '/offline/activities/selectList',
    method: 'get',
    params: query
  })
}

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

// 修改状态
export function changeActivitiesStatus(activityId, status) {
  const data = {
    activityId,
    status
  }
  return request({
    url: '/offline/activities/changeStatus',
    method: 'put',
    data: data
  })
}

// 审批
export function apporActivities(flag,ids,publishtime) {
  const data = {
    "flag":flag,
    "ids":ids,
    "publishTime":publishtime
  }
  return request({
    url: '/offline/activities/appor',
    method: 'post',
    data: data
  })
}

// 撤销审批
export function unApporActivities(activityIds) {
  return request({
    url: '/offline/activities/unappor/' + activityIds,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedActivitiesIds(activityIds) {
  return request({
    url: '/offline/activities/list/' + activityIds,
    method: 'get'
  })
}

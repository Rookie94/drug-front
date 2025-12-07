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

// 修改状态
export function changeLiveStatus(liveId, status) {
  const data = {
    liveId,
    status
  }
  return request({
    url: '/offline/live/changeStatus',
    method: 'put',
    data: data
  })
}

// 审批
export function apporLive(flag,ids,publishtime) {
  const data = {
    "flag":flag,
    "ids":ids,
    "publishTime":publishtime
  }
  return request({
    url: '/offline/live/appor',
    method: 'post',
    data: data
  })
}

// 撤销审批
export function unApporLive(activityIds) {
  return request({
    url: '/offline/live/unappor/' + activityIds,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedLiveIds(activityIds) {
  return request({
    url: '/offline/live/list/' + activityIds,
    method: 'get'
  })
}


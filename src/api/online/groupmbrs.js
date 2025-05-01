import request from '@/utils/request'

// 查询聊天群组列表
export function listGroup(query) {
  return request({
    url: '/online/groupmbrs/listgroup',
    method: 'get',
    params: query
  })
}

// 查询群工作人员列表
export function listGroupmbrs(query) {
  return request({
    url: '/online/groupmbrs/list',
    method: 'get',
    params: query
  })
}

// 查询群工作人员详细
export function getGroupmbrs(mbrId) {
  return request({
    url: '/online/groupmbrs/' + mbrId,
    method: 'get'
  })
}

// 新增群工作人员
export function addGroupmbrs(data) {
  return request({
    url: '/online/groupmbrs',
    method: 'post',
    data: data
  })
}

// 修改群工作人员
export function updateGroupmbrs(data) {
  return request({
    url: '/online/groupmbrs',
    method: 'put',
    data: data
  })
}

// 删除群工作人员
export function delGroupmbrs(mbrId) {
  return request({
    url: '/online/groupmbrs/' + mbrId,
    method: 'delete'
  })
}

// 修改状态
export function changeGroupmbrsStatus(mbrId, status) {
  const data = {
    mbrId,
    status
  }
  return request({
    url: '/online/groupmbrs/changeStatus',
    method: 'put',
    data: data
  })
}

// 审批
export function apporGroupmbrs(flag,ids) {
  const data = {
    "flag":flag,
    "ids":ids
  }
  return request({
    url: '/online/groupmbrs/appor',
    method: 'post',
    data: data
  })
}

// 撤销审批
export function unApporGroupmbrs(groupIds) {
  return request({
    url: '/online/groupmbrs/unappor/' + groupIds,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedGroupmbrsIds(groupIds) {
  return request({
    url: '/online/groupmbrs/list/' + groupIds,
    method: 'get'
  })
}
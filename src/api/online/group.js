import request from '@/utils/request'

// 查询聊天群组列表
export function listGroup(query) {
  return request({
    url: '/online/group/list',
    method: 'get',
    params: query
  })
}

// 查询聊天群组详细
export function getGroup(groupId) {
  return request({
    url: '/online/group/' + groupId,
    method: 'get'
  })
}

// 新增聊天群组
export function addGroup(data) {
  return request({
    url: '/online/group',
    method: 'post',
    data: data
  })
}

// 修改聊天群组
export function updateGroup(data) {
  return request({
    url: '/online/group',
    method: 'put',
    data: data
  })
}

// 删除聊天群组
export function delGroup(groupId) {
  return request({
    url: '/online/group/' + groupId,
    method: 'delete'
  })
}

// 修改状态
export function changeGroupStatus(groupId, status) {
  const data = {
    groupId,
    status
  }
  return request({
    url: '/online/group/changeStatus',
    method: 'put',
    data: data
  })
}

// 审批
export function apporGroup(flag,ids) {
  const data = {
    "flag":flag,
    "ids":ids
  }
  return request({
    url: '/online/group/appor',
    method: 'post',
    data: data
  })
}

// 撤销审批
export function unApporGroup(groupIds) {
  return request({
    url: '/online/group/unappor/' + groupIds,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedGroupIds(groupIds) {
  return request({
    url: '/online/group/list/' + groupIds,
    method: 'get'
  })
}



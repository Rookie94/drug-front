import request from '@/utils/request'

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

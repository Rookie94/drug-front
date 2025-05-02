import request from '@/utils/request'

// 查询聊天群组列表
export function listGroup(query) {
  return request({
    url: '/online/chat/list',
    method: 'get',
    params: query
  })
}

// 查询聊天群组详细
export function getGroup(groupId) {
  return request({
    url: '/online/chat/' + groupId,
    method: 'get'
  })
}

export function joinGroup(data) {
  return request({
    url: '/online/chat/joingroup',
    method: 'post',
    data: data
  })
}
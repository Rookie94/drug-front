import request from '@/utils/request'

// 查询留言列表
export function listMsg(query) {
  return request({
    url: '/online/msg/list',
    method: 'get',
    params: query
  })
}

// 查询留言详细
export function getMsg(messageId) {
  return request({
    url: '/online/msg/' + messageId,
    method: 'get'
  })
}

// 获取留言树结构
export function getMessageTree(parentMessageId) {
  return request({
    url: '/online/msg/getMessageTree/' + parentMessageId,
    method: 'get'
  })
}

// 回复留言
export function replyMsg(data) {
  return request({
    url: '/online/msg',
    method: 'post',
    data: data
  })
}

// 修改留言
export function updateMsg(data) {
  return request({
    url: '/online/msg',
    method: 'put',
    data: data
  })
}

// 删除留言
export function delMsg(messageId) {
  return request({
    url: '/online/msg/' + messageId,
    method: 'delete'
  })
}
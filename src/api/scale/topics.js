import request from '@/utils/request'

// 查询量表题目列表
export function listTopics(query) {
  return request({
    url: '/scale/topics/list',
    method: 'get',
    params: query
  })
}

// 查询量表题目详细
export function getTopics(topicId) {
  return request({
    url: '/scale/topics/' + topicId,
    method: 'get'
  })
}

// 新增量表题目
export function addTopics(data) {
  return request({
    url: '/scale/topics',
    method: 'post',
    data: data
  })
}

// 修改量表题目
export function updateTopics(data) {
  return request({
    url: '/scale/topics',
    method: 'put',
    data: data
  })
}

// 删除量表题目
export function delTopics(topicId) {
  return request({
    url: '/scale/topics/' + topicId,
    method: 'delete'
  })
}

// 查询量表下拉树结构
export function contextTreeSelect() {
  return request({
    url: '/scale/topics/contextTree',
    method: 'get'
  })
}

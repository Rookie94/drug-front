import request from '@/utils/request'

// 查询预约详情列表
export function listSignup(query) {
  return request({
    url: '/offline/signup/list',
    method: 'get',
    params: query
  })
}

// 查询预约详情详细
export function getSignup(signId) {
  return request({
    url: '/offline/signup/' + signId,
    method: 'get'
  })
}

// 新增预约详情
export function addSignup(data) {
  return request({
    url: '/offline/signup',
    method: 'post',
    data: data
  })
}

// 修改预约详情
export function updateSignup(data) {
  return request({
    url: '/offline/signup',
    method: 'put',
    data: data
  })
}

// 删除预约详情
export function delSignup(signId) {
  return request({
    url: '/offline/signup/' + signId,
    method: 'delete'
  })
}

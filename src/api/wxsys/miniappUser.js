import request from '@/utils/request'

// 查询小程序用户列表
export function listMiniappUser(query) {
  return request({
    url: '/wxsys/miniappUser/list',
    method: 'get',
    params: query
  })
}

// 查询小程序用户列表(关联查询)
export function innerJoinList(query) {
  return request({
    url: '/wxsys/miniappUser/innerJoinList',
    method: 'get',
    params: query
  })
}

// 查询小程序用户详细
export function getMiniappUser(id) {
  return request({
    url: '/wxsys/miniappUser/' + id,
    method: 'get'
  })
}

// 新增小程序用户
export function addMiniappUser(data) {
  return request({
    url: '/wxsys/miniappUser',
    method: 'post',
    data: data
  })
}

// 修改小程序用户
export function updateMiniappUser(data) {
  return request({
    url: '/wxsys/miniappUser',
    method: 'put',
    data: data
  })
}

// 删除小程序用户
export function delMiniappUser(id) {
  return request({
    url: '/wxsys/miniappUser/' + id,
    method: 'delete'
  })
}

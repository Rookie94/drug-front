import request from '@/utils/request'

// 查询流水号管理列表
export function listSerialno(query) {
  return request({
    url: '/system/serialno/list',
    method: 'get',
    params: query
  })
}

// 查询流水号管理详细
export function getSerialno(id) {
  return request({
    url: '/system/serialno/' + id,
    method: 'get'
  })
}

// 新增流水号管理
export function addSerialno(data) {
  return request({
    url: '/system/serialno',
    method: 'post',
    data: data
  })
}

// 修改流水号管理
export function updateSerialno(data) {
  return request({
    url: '/system/serialno',
    method: 'put',
    data: data
  })
}

// 删除流水号管理
export function delSerialno(id) {
  return request({
    url: '/system/serialno/' + id,
    method: 'delete'
  })
}

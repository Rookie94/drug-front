import request from '@/utils/request'

// 查询小程序信息列表
export function listMiniapp(query) {
  return request({
    url: '/wxsys/miniapp/list',
    method: 'get',
    params: query
  })
}

// 查询小程序信息详细
export function getMiniapp(id) {
  return request({
    url: '/wxsys/miniapp/' + id,
    method: 'get'
  })
}

// 新增小程序信息
export function addMiniapp(data) {
  return request({
    url: '/wxsys/miniapp',
    method: 'post',
    data: data
  })
}

// 修改小程序信息
export function updateMiniapp(data) {
  return request({
    url: '/wxsys/miniapp',
    method: 'put',
    data: data
  })
}

// 删除小程序信息
export function delMiniapp(id) {
  return request({
    url: '/wxsys/miniapp/' + id,
    method: 'delete'
  })
}

// 查询select下拉框（所有小程序信息）
export function listSelect() {
  return request({
    url: '/wxsys/miniapp/listSelect',
    method: 'get'
  })
}
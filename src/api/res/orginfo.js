import request from '@/utils/request'

// 查询戒治机构列表
export function listOrginfo(query) {
  return request({
    url: '/res/orginfo/list',
    method: 'get',
    params: query
  })
}

// 查询戒治机构详细
export function getOrginfo(orgid) {
  return request({
    url: '/res/orginfo/' + orgid,
    method: 'get'
  })
}

// 新增戒治机构
export function addOrginfo(data) {
  return request({
    url: '/res/orginfo',
    method: 'post',
    data: data
  })
}

// 修改戒治机构
export function updateOrginfo(data) {
  return request({
    url: '/res/orginfo',
    method: 'put',
    data: data
  })
}

// 删除戒治机构
export function delOrginfo(orgid) {
  return request({
    url: '/res/orginfo/' + orgid,
    method: 'delete'
  })
}

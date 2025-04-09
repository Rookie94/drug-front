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

// 修改戒治机构状态
export function changOrgStatus(orgid, status) {
  const data = {
    orgid,
    status
  }
  return request({
    url: '/res/orginfo/changeStatus',
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

// 审批戒治机构
export function apporOrginfo(orgid) {
  return request({
    url: '/res/orginfo/appor/' + orgid,
    method: 'post'
  })
}

// 撤销审批戒治机构
export function unApporOrginfo(orgid) {
  return request({
    url: '/res/orginfo/unappor/' + orgid,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedOrgInfoIds(orgids) {
  return request({
    url: '/res/orginfo/list/' + orgids,
    method: 'get'
  })
}
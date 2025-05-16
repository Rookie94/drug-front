import request from '@/utils/request'

// 查询测评报告列表
export function listReport(query) {
  return request({
    url: '/scale/report/list',
    method: 'get',
    params: query
  })
}

// 查询测评报告详细
export function getReport(resultId) {
  return request({
    url: '/scale/report/' + resultId,
    method: 'get'
  })
}

// 新增测评报告
export function addReport(data) {
  return request({
    url: '/scale/report',
    method: 'post',
    data: data
  })
}

// 修改测评报告
export function updateReport(data) {
  return request({
    url: '/scale/report',
    method: 'put',
    data: data
  })
}

// 删除测评报告
export function delReport(resultId) {
  return request({
    url: '/scale/report/' + resultId,
    method: 'delete'
  })
}

// 查询量表下拉树结构
export function contextTreeSelect() {
  return request({
    url: '/scale/report/contextTree',
    method: 'get'
  })
}

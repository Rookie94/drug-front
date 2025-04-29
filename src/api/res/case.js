import request from '@/utils/request'

// 查询戒治案例列表
export function listCase(query) {
  return request({
    url: '/res/case/list',
    method: 'get',
    params: query
  })
}

// 查询戒治案例详细
export function getCase(caseid) {
  return request({
    url: '/res/case/' + caseid,
    method: 'get'
  })
}

// 新增戒治案例
export function addCase(data) {
  return request({
    url: '/res/case',
    method: 'post',
    data: data
  })
}

// 修改戒治案例
export function updateCase(data) {
  return request({
    url: '/res/case',
    method: 'put',
    data: data
  })
}

// 删除戒治案例
export function delCase(caseid) {
  return request({
    url: '/res/case/' + caseid,
    method: 'delete'
  })
}

// 修改戒治案例状态
export function changeCaseStatus(caseid, status) {
  const data = {
    caseid,
    status
  }
  return request({
    url: '/res/case/changeStatus',
    method: 'put',
    data: data
  })
}

// 审批
export function apporCase(flag,ids,publishtime) {
  const data = {
    "flag":flag,
    "ids":ids,
    "publishTime":publishtime
  }
  return request({
    url: '/res/case/appor',
    method: 'post',
    data: data
  })
}

// 撤销审批戒治案例
export function unApporCase(caseids) {
  return request({
    url: '/res/case/unappor/' + caseids,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedCaseIds(caseids) {
  return request({
    url: '/res/case/list/' + caseids,
    method: 'get'
  })
}

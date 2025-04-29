import request from '@/utils/request'

// 查询戒治专家列表
export function listExpert(query) {
  return request({
    url: '/res/expert/list',
    method: 'get',
    params: query
  })
}

// 查询戒治专家详细
export function getExpert(expertid) {
  return request({
    url: '/res/expert/' + expertid,
    method: 'get'
  })
}

// 新增戒治专家
export function addExpert(data) {
  return request({
    url: '/res/expert',
    method: 'post',
    data: data
  })
}

// 修改戒治专家
export function updateExpert(data) {
  return request({
    url: '/res/expert',
    method: 'put',
    data: data
  })
}

// 删除戒治专家
export function delExpert(expertids) {
  return request({
    url: '/res/expert/' + expertids,
    method: 'delete'
  })
}

// 修改戒治专家状态
export function changExpertStatus(expertid, status) {
  const data = {
    expertid,
    status
  }
  return request({
    url: '/res/expert/changeStatus',
    method: 'put',
    data: data
  })
}


// 审批
export function apporExpert(flag,ids,publishtime) {
  const data = {
    "flag":flag,
    "ids":ids,
    "publishTime":publishtime
  }
  return request({
    url: '/res/expert/appor',
    method: 'post',
    data: data
  })
}

// 撤销审批戒治专家
export function unApporExpert(expertids) {
  return request({
    url: '/res/expert/unappor/' + expertids,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedExpertIds(expertids) {
  return request({
    url: '/res/expert/list/' + expertids,
    method: 'get'
  })
}

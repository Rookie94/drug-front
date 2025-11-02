import request from '@/utils/request'

// 查询戒治技术宣传列表
export function listTech(query) {
  return request({
    url: '/res/tech/list',
    method: 'get',
    params: query
  })
}

// 查询戒治技术宣传详细
export function getTech(techId) {
  return request({
    url: '/res/tech/' + techId,
    method: 'get'
  })
}

// 新增戒治技术宣传
export function addTech(data) {
  return request({
    url: '/res/tech',
    method: 'post',
    data: data
  })
}

// 修改戒治技术宣传
export function updateTech(data) {
  return request({
    url: '/res/tech',
    method: 'put',
    data: data
  })
}

// 删除戒治技术宣传
export function delTech(techIds) {
  return request({
    url: '/res/tech/' + techIds,
    method: 'delete'
  })
}

// 修改状态
export function changeTechStatus(techId, status) {
  const data = {
    techId,
    status
  }
  return request({
    url: '/res/tech/changeStatus',
    method: 'put',
    data: data
  })
}

// 审批
export function apporTech(flag,ids,publishtime) {
  const data = {
    "flag":flag,
    "ids":ids,
    "publishTime":publishtime
  }
  return request({
    url: '/res/tech/appor',
    method: 'post',
    data: data
  })
}

// 撤销审批工作
export function unApporTech(techIds) {
  return request({
    url: '/res/tech/unappor/' + techIds,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedTechIds(techIds) {
  return request({
    url: '/res/tech/list/' + techIds,
    method: 'get'
  })
}





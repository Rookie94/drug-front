import request from '@/utils/request'

// 查询戒治处方列表
export function listRxdata(query) {
  return request({
    url: '/res/rxdata/list',
    method: 'get',
    params: query
  })
}

// 查询戒治处方详细
export function getRxdata(rxId) {
  return request({
    url: '/res/rxdata/' + rxId,
    method: 'get'
  })
}

// 新增戒治处方
export function addRxdata(data) {
  return request({
    url: '/res/rxdata',
    method: 'post',
    data: data
  })
}

// 修改戒治处方
export function updateRxdata(data) {
  return request({
    url: '/res/rxdata',
    method: 'put',
    data: data
  })
}

// 删除戒治处方
export function delRxdata(rxId) {
  return request({
    url: '/res/rxdata/' + rxId,
    method: 'delete'
  })
}

// 修改状态
export function changeRxdataStatus(rxId, status) {
  const data = {
    rxId,
    status
  }
  return request({
    url: '/res/rxdata/changeStatus',
    method: 'put',
    data: data
  })
}

// 审批
export function apporRxdata(flag,ids,publishtime) {
  const data = {
    "flag":flag,
    "ids":ids,
    "publishTime":publishtime
  }
  return request({
    url: '/res/rxdata/appor',
    method: 'post',
    data: data
  })
}

// 撤销审批工作
export function unApporRxdata(rxIds) {
  return request({
    url: '/res/rxdata/unappor/' + rxIds,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedRxdataIds(rxIds) {
  return request({
    url: '/res/rxdata/list/' + rxIds,
    method: 'get'
  })
}




import request from '@/utils/request'

// 查询量表目录列表
export function listContexts(query) {
  return request({
    url: '/scale/contexts/list',
    method: 'get',
    params: query
  })
}

// 查询量表目录详细
export function getContexts(contextId) {
  return request({
    url: '/scale/contexts/' + contextId,
    method: 'get'
  })
}

// 新增量表目录
export function addContexts(data) {
  return request({
    url: '/scale/contexts',
    method: 'post',
    data: data
  })
}

// 修改量表目录
export function updateContexts(data) {
  return request({
    url: '/scale/contexts',
    method: 'put',
    data: data
  })
}

// 删除量表目录
export function delContexts(contextId) {
  return request({
    url: '/scale/contexts/' + contextId,
    method: 'delete'
  })
}

// 修改状态
export function changeContextsStatus(contextId, status) {
  const data = {
    contextId,
    status
  }
  return request({
    url: '/scale/contexts/changeStatus',
    method: 'put',
    data: data
  })
}

// 审批
export function apporContexts(flag,ids) {
  const data = {
    "flag":flag,
    "ids":ids
  }
  return request({
    url: '/scale/contexts/appor',
    method: 'post',
    data: data
  })
}

// 撤销审批
export function unApporContexts(contextIds) {
  return request({
    url: '/scale/contexts/unappor/' + contextIds,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedContextsIds(contextIds) {
  return request({
    url: '/scale/contexts/list/' + contextIds,
    method: 'get'
  })
}

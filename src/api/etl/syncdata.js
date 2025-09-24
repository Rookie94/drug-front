import request from '@/utils/request'

// 查询数据清洗列表
export function listSyncdata(query) {
  return request({
    url: '/etl/syncdata/list',
    method: 'get',
    params: query
  })
}

// 查询数据清洗详细
export function getSyncdata(syncId) {
  return request({
    url: '/etl/syncdata/' + syncId,
    method: 'get'
  })
}

// 新增数据清洗
export function addSyncdata(data) {
  return request({
    url: '/etl/syncdata',
    method: 'post',
    data: data
  })
}

// 修改数据清洗
export function updateSyncdata(data) {
  return request({
    url: '/etl/syncdata',
    method: 'put',
    data: data
  })
}

// 删除数据清洗
export function delSyncdata(syncId) {
  return request({
    url: '/etl/syncdata/' + syncId,
    method: 'delete'
  })
}

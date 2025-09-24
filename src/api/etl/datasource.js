import request from '@/utils/request'

// 查询数据源管理列表
export function listDatasource(query) {
  return request({
    url: '/etl/datasource/list',
    method: 'get',
    params: query
  })
}

// 查询数据源管理详细
export function getDatasource(configId) {
  return request({
    url: '/etl/datasource/' + configId,
    method: 'get'
  })
}

// 新增数据源管理
export function addDatasource(data) {
  return request({
    url: '/etl/datasource',
    method: 'post',
    data: data
  })
}

// 修改数据源管理
export function updateDatasource(data) {
  return request({
    url: '/etl/datasource',
    method: 'put',
    data: data
  })
}

// 删除数据源管理
export function delDatasource(configId) {
  return request({
    url: '/etl/datasource/' + configId,
    method: 'delete'
  })
}

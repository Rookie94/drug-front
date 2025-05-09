import request from '@/utils/request'

// 查询行政区域列表
export function listArea(query) {
  return request({
    url: '/system/area/list',
    method: 'get',
    params: query
  })
}

// 查询行政区域详细
export function getArea(id) {
  return request({
    url: '/system/area/' + id,
    method: 'get'
  })
}

// 新增行政区域
export function addArea(data) {
  return request({
    url: '/system/area',
    method: 'post',
    data: data
  })
}

// 修改行政区域
export function updateArea(data) {
  return request({
    url: '/system/area',
    method: 'put',
    data: data
  })
}

// 修改状态
export function changeAreaStatus(id, status) {
  const data = {
    id,
    status
  }
  return request({
    url: '/system/area/changeStatus',
    method: 'put',
    data: data
  })
}

// 删除行政区域
export function delArea(id) {
  return request({
    url: '/system/area/' + id,
    method: 'delete'
  })
}

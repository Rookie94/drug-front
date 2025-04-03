import request from '@/utils/request'

// 查询job列表
export function listJob(query) {
  return request({
    url: '/job/zhaopin/list',
    method: 'get',
    params: query
  })
}

// 查询job详细
export function getJob(jobId) {
  return request({
    url: '/job/zhaopin/' + jobId,
    method: 'get'
  })
}


// 新增job
export function addJob(data) {
  return request({
    url: '/job/zhaopin',
    method: 'post',
    data: data
  })
}

// 修改job
export function updateJob(data) {
  return request({
    url: '/job/zhaopin',
    method: 'put',
    data: data
  })
}

// 删除job
export function delJob(jobId) {
  return request({
    url: '/job/zhaopin/' + jobId,
    method: 'delete'
  })
}

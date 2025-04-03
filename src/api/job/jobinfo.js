import request from '@/utils/request'

// 查询招聘信息列表
export function listJobinfo(query) {
  return request({
    url: '/job/jobinfo/list',
    method: 'get',
    params: query
  })
}

// 查询招聘信息详细
export function getJobinfo(jobId) {
  return request({
    url: '/job/jobinfo/' + jobId,
    method: 'get'
  })
}

// 新增招聘信息
export function addJobinfo(data) {
  return request({
    url: '/job/jobinfo',
    method: 'post',
    data: data
  })
}

// 修改招聘信息
export function updateJobinfo(data) {
  return request({
    url: '/job/jobinfo',
    method: 'put',
    data: data
  })
}

// 删除招聘信息
export function delJobinfo(jobId) {
  return request({
    url: '/job/jobinfo/' + jobId,
    method: 'delete'
  })
}

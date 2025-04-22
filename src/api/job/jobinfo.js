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
export function getJobinfo(jobid) {
  return request({
    url: '/job/jobinfo/' + jobid,
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
export function delJobInfo(jobid) {
  return request({
    url: '/job/jobinfo/' + jobid,
    method: 'delete'
  })
}

// 修改工作状态
export function changeJobInfoStatus(jobid, status) {
  const data = {
    jobid,
    status
  }
  return request({
    url: '/job/jobinfo/changeStatus',
    method: 'put',
    data: data
  })
}

// 审批
export function apporJobInfo(flag,ids,publishtime) {
  const data = {
    "flag":flag,
    "ids":ids,
    "publishTime":publishtime
  }
  return request({
    url: '/job/jobinfo/appor',
    method: 'post',
    data: data
  })
}

// 撤销审批工作
export function unApporJobInfo(jobids) {
  return request({
    url: '/job/jobinfo/unappor/' + jobids,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedJobInfoIds(jobids) {
  return request({
    url: '/job/jobinfo/list/' + jobids,
    method: 'get'
  })
}


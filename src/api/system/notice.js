import request from '@/utils/request'

// 查询通知公告列表
export function listNotice(query) {
  return request({
    url: '/system/notice/list',
    method: 'get',
    params: query
  })
}

// 查询通知公告详细
export function getNotice(noticeId) {
  return request({
    url: '/system/notice/' + noticeId,
    method: 'get'
  })
}

// 新增通知公告
export function addNotice(data) {
  return request({
    url: '/system/notice',
    method: 'post',
    data: data
  })
}

// 修改通知公告
export function updateNotice(data) {
  return request({
    url: '/system/notice',
    method: 'put',
    data: data
  })
}

// 删除通知公告
export function delNotice(noticeId) {
  return request({
    url: '/system/notice/' + noticeId,
    method: 'delete'
  })
}

// 修改通知公告状态
export function changeNoticeStatus(noticeId, status) {
  const data = {
    noticeId,
    status
  }
  return request({
    url: '/system/notice/changeStatus',
    method: 'put',
    data: data
  })
}

// 审批通知公告
export function apporNotice(noticeIds) {
  return request({
    url: '/system/notice/appor/' + noticeIds,
    method: 'post'
  })
}

// 撤销通知公告工作
export function unApporNotice(noticeIds) {
  return request({
    url: '/system/notice/unappor/' + noticeIds,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedNoticeIds(noticeIds) {
  return request({
    url: '/system/notice/list/' + noticeIds,
    method: 'get'
  })
}
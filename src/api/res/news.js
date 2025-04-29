import request from '@/utils/request'

// 查询戒毒资讯列表
export function listNews(query) {
  return request({
    url: '/res/news/list',
    method: 'get',
    params: query
  })
}

// 查询戒毒资讯详细
export function getNews(newsid) {
  return request({
    url: '/res/news/' + newsid,
    method: 'get'
  })
}

// 新增戒毒资讯
export function addNews(data) {
  return request({
    url: '/res/news',
    method: 'post',
    data: data
  })
}

// 修改戒毒资讯
export function updateNews(data) {
  return request({
    url: '/res/news',
    method: 'put',
    data: data
  })
}

// 删除戒毒资讯
export function delNews(newsid) {
  return request({
    url: '/res/news/' + newsid,
    method: 'delete'
  })
}

// 修改戒毒资讯状态
export function changNewsStatus(newsid, status) {
  const data = {
    newsid,
    status
  }
  return request({
    url: '/res/news/changeStatus',
    method: 'put',
    data: data
  })
}

// 审批
export function apporNews(flag,ids,publishtime) {
  const data = {
    "flag":flag,
    "ids":ids,
    "publishTime":publishtime
  }
  return request({
    url: '/res/news/appor',
    method: 'post',
    data: data
  })
}


// 撤销审批戒毒资讯
export function unApporNews(newsids) {
  return request({
    url: '/res/news/unappor/' + newsids,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedNewsIds(newsids) {
  return request({
    url: '/res/news/list/' + newsids,
    method: 'get'
  })
}


import request from '@/utils/request'

// 查询资讯发布列表
export function listArticles(query) {
  return request({
    url: '/res/articles/list',
    method: 'get',
    params: query
  })
}

// 查询资讯发布详细
export function getArticles(articleId) {
  return request({
    url: '/res/articles/' + articleId,
    method: 'get'
  })
}

// 新增资讯发布
export function addArticles(data) {
  return request({
    url: '/res/articles',
    method: 'post',
    data: data
  })
}

// 修改资讯发布
export function updateArticles(data) {
  return request({
    url: '/res/articles',
    method: 'put',
    data: data
  })
}

// 删除资讯发布
export function delArticles(articleId) {
  return request({
    url: '/res/articles/' + articleId,
    method: 'delete'
  })
}

// 修改状态
export function changeArticlesStatus(caseid, status) {
  const data = {
    caseid,
    status
  }
  return request({
    url: '/res/articles/changeStatus',
    method: 'put',
    data: data
  })
}

// 审批
export function apporArticles(caseids) {
  return request({
    url: '/res/articles/appor/' + caseids,
    method: 'post'
  })
}

// 撤销审批
export function unApporArticles(caseids) {
  return request({
    url: '/res/articles/unappor/' + caseids,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedArticlesIds(caseids) {
  return request({
    url: '/res/articles/list/' + caseids,
    method: 'get'
  })
}
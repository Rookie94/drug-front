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

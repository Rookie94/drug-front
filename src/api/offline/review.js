import request from '@/utils/request'

// 查询活动评价列表
export function listReview(query) {
  return request({
    url: '/offline/review/list',
    method: 'get',
    params: query
  })
}

// 查询活动评价详细
export function getReview(reviewId) {
  return request({
    url: '/offline/review/' + reviewId,
    method: 'get'
  })
}

// 新增活动评价
export function addReview(data) {
  return request({
    url: '/offline/review',
    method: 'post',
    data: data
  })
}

// 修改活动评价
export function updateReview(data) {
  return request({
    url: '/offline/review',
    method: 'put',
    data: data
  })
}

// 删除活动评价
export function delReview(reviewId) {
  return request({
    url: '/offline/review/' + reviewId,
    method: 'delete'
  })
}

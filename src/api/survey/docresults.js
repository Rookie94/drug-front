import request from '@/utils/request'

// 查询问卷答案结果
export function listDocs(query) {
  return request({
    url: '/survey/docs/list',
    method: 'get',
    params: query
  })
}

// 查询问卷答案结果json详细
export function getDocs(resultId) {
  return request({
    url: '/survey/docs/' + resultId,
    method: 'get'
  })
}

// 刷新问卷答案结果json
export function refreshDocs(resultIds) {
  return request({
    url: '/survey/docs/refresh/' + resultIds,
    method: 'post'
  })
}


// 删除问卷答案结果json
export function delDocs(resultIds) {
  return request({
    url: '/survey/docs/' + resultIds,
    method: 'delete'
  })
}
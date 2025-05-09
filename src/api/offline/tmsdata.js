import request from '@/utils/request'

// 查询现场经颅磁列表
export function listTmsdata(query) {
  return request({
    url: '/offline/tmsdata/list',
    method: 'get',
    params: query
  })
}

// 查询现场经颅磁详细
export function getTmsdata(analyzeId) {
  return request({
    url: '/offline/tmsdata/' + analyzeId,
    method: 'get'
  })
}

// 新增现场经颅磁
export function addTmsdata(data) {
  return request({
    url: '/offline/tmsdata',
    method: 'post',
    data: data
  })
}

// 修改现场经颅磁
export function updateTmsdata(data) {
  return request({
    url: '/offline/tmsdata',
    method: 'put',
    data: data
  })
}

// 删除现场经颅磁
export function delTmsdata(analyzeId) {
  return request({
    url: '/offline/tmsdata/' + analyzeId,
    method: 'delete'
  })
}

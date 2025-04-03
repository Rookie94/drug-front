import request from '@/utils/request'

// 查询技能信息列表
export function listSkill(query) {
  return request({
    url: '/job/skill/list',
    method: 'get',
    params: query
  })
}

// 查询技能信息详细
export function getSkill(skillId) {
  return request({
    url: '/job/skill/' + skillId,
    method: 'get'
  })
}

// 新增技能信息
export function addSkill(data) {
  return request({
    url: '/job/skill',
    method: 'post',
    data: data
  })
}

// 修改技能信息
export function updateSkill(data) {
  return request({
    url: '/job/skill',
    method: 'put',
    data: data
  })
}

// 删除技能信息
export function delSkill(skillId) {
  return request({
    url: '/job/skill/' + skillId,
    method: 'delete'
  })
}

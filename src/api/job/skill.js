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
export function getSkill(skillid) {
  return request({
    url: '/job/skill/' + skillid,
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
export function delSkill(skillid) {
  return request({
    url: '/job/skill/' + skillid,
    method: 'delete'
  })
}


// 修改工作状态
export function changSkillStatus(skillid, status) {
  const data = {
    skillid,
    status
  }
  return request({
    url: '/job/skill/changeStatus',
    method: 'put',
    data: data
  })
}

// 审批
export function apporSkill(flag,ids,publishtime) {
  const data = {
    "flag":flag,
    "ids":ids,
    "publishTime":publishtime
  }
  return request({
    url: '/job/skill/appor',
    method: 'post',
    data: data
  })
}

// 撤销审批工作
export function unApporSkill(skillids) {
  return request({
    url: '/job/skill/unappor/' + skillids,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedSkillIds(skillids) {
  return request({
    url: '/job/skill/list/' + skillids,
    method: 'get'
  })
}


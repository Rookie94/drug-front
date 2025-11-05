import request from '@/utils/request'

// 查询问卷列表
export function listSurvey(query) {
  return request({
    url: '/survey/vote/list',
    method: 'get',
    params: query
  })
}

// 查询问卷详细
export function getSurvey(surveyId) {
  return request({
    url: '/survey/vote/' + surveyId,
    method: 'get'
  })
}

// 新增问卷
export function addSurvey(data) {
  return request({
    url: '/survey/vote',
    method: 'post',
    data: data
  })
}

// 修改问卷
export function updateSurvey(data) {
  return request({
    url: '/survey/vote',
    method: 'put',
    data: data
  })
}

// 修改戒治案例状态
export function changeSurveyStatus(surveyId, status) {
  const data = {
    surveyId,
    status
  }
  return request({
    url: '/survey/vote/changeStatus',
    method: 'put',
    data: data
  })
}

// 删除问卷
export function removeSurvey(surveyId) {
  return request({
    url: '/survey/vote/remove/' + surveyId,
    method: 'put'
  })
}

// 永久删除问卷
export function delSurvey(surveyId) {
  return request({
    url: '/survey/vote/' + surveyId,
    method: 'delete'
  })
}

// 发布问卷
export function publishSurvey(surveyId) {
  return request({
    url: '/survey/vote/publish/' + surveyId,
    method: 'put'
  })
}

// 撤销发布问卷
export function revokeSurvey(surveyId) {
  return request({
    url: '/survey/vote/revoke/' + surveyId,
    method: 'put'
  })
}

// 还原问卷
export function restoreSurvey(surveyId) {
  return request({
    url: '/survey/vote/restore/' + surveyId,
    method: 'put'
  })
}

// 导出问卷
export function exportSurvey(query) {
  return request({
    url: '/survey/vote/export',
    method: 'get',
    params: query
  })
}
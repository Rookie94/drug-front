import request from '@/utils/request'

export function listSurvey(query) {
  return request({
    url: '/survey/statistics/list',
    method: 'get',
    params: query
  })
}

export function getStatistics(surveyId) {
  return request({
    url: '/survey/statistics/' + surveyId,
    method: 'get'
  })
}
import request from '@/utils/request'

export function listSurvey(query) {
  return request({
    url: '/survey/report/listSurvey',
    method: 'get',
    params: query
  })
}

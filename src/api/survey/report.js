import request from '@/utils/request'

// 获取问卷列表
export function listSurvey(query) {
  return request({
    url: '/survey/report/listSurvey',
    method: 'get',
    params: query
  })
}

// 生成统计报告
export function generateReport(data) {
  return request({
    url: '/survey/report/generate',
    method: 'post',
    data: data
  })
}
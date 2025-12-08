import request from '@/utils/request'

// 获取活动总览信息
export function getActivityOverview(activityId) {
  return request({
    url: '/offline/overview/' + activityId,
    method: 'get'
  })
}
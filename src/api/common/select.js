import request from '@/utils/request'

// 通用数据选择接口
export function getSelectData(params) {
  return request({
    url: '/pub/common/getData',
    method: 'get',
    params
  })
}

// 用户数据选择
export function getUserSelectData(params) {
  return request({
    url: '/pub/common/getData',
    method: 'get',
    params: {
      dataType: 'user',
      ...params
    }
  })
}

// 部门数据选择
export function getDeptSelectData(params) {
  return request({
    url: '/pub/common/getData',
    method: 'get',
    params: {
      dataType: 'department',
      ...params
    }
  })
}

// 角色数据选择
export function getRoleSelectData(params) {
  return request({
    url: '/pub/common/getData',
    method: 'get',
    params: {
      dataType: 'role',
      ...params
    }
  })
}

// 根据数据类型获取选择数据
export function getDataByType(dataType, params) {
  return request({
    url: '/pub/common/getData',
    method: 'get',
    params: {
      dataType,
      ...params
    }
  })
}
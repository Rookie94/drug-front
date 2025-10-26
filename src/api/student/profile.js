import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询学员列表
export function listUser(query) {
  return request({
    url: '/student/profile/list',
    method: 'get',
    params: query
  })
}

// 查询学员详细
export function getUser(userId) {
  return request({
    url: '/student/profile/' + parseStrEmpty(userId),
    method: 'get'
  })
}

// 查询省份
export function getProvince() {
  return request({
    url: '/student/profile/getProvince',
    method: 'get'
  })
}

// 查询地市
export function getCityByParentId(parentId) {
  return request({
    url: '/student/profile/getCityByParentId/' + parentId,
    method: 'get'
  })
}

// 新增学员
export function addUser(data) {
  return request({
    url: '/student/profile',
    method: 'post',
    data: data
  })
}

// 修改学员
export function updateUser(data) {
  return request({
    url: '/student/profile',
    method: 'put',
    data: data
  })
}

// 删除学员
export function delUser(userId) {
  return request({
    url: '/student/profile/' + userId,
    method: 'delete'
  })
}

// 学员密码重置
export function resetUserPwd(userId, password) {
  const data = {
    userId,
    password
  }
  return request({
    url: '/student/profile/resetPwd',
    method: 'put',
    data: data
  })
}

// 学员状态修改
export function changeUserStatus(userId, status) {
  const data = {
    userId,
    status
  }
  return request({
    url: '/student/profile/changeStatus',
    method: 'put',
    data: data
  })
}

// 查询学员个人信息
export function getUserProfile() {
  return request({
    url: '/student/profile/profile',
    method: 'get'
  })
}

// 修改学员个人信息
export function updateUserProfile(data) {
  return request({
    url: '/student/profile',
    method: 'put',
    data: data
  })
}

// 学员密码重置
export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword
  }
  return request({
    url: '/student/profile/updatePwd',
    method: 'put',
    data: data
  })
}


// 查询授权角色
export function getAuthRole(userId) {
  return request({
    url: '/student/profile/authRole/' + userId,
    method: 'get'
  })
}

// 保存授权角色
export function updateAuthRole(data) {
  return request({
    url: '/student/profile/authRole',
    method: 'put',
    params: data
  })
}

// 查询部门下拉树结构
export function deptTreeSelect() {
  return request({
    url: '/student/profile/deptTree',
    method: 'get'
  })
}

// 解绑微信
export function unBindWx(userId) {
  return request({
    url: '/student/profile/unBindWx/' + userId,
    method: 'delete'
  })
}

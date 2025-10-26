import request from '@/utils/request'

// 查询轮播图列表
export function listSlider(query) {
  return request({
    url: '/res/slider/list',
    method: 'get',
    params: query
  })
}

// 查询轮播图详细
export function getSlider(sliderId) {
  return request({
    url: '/res/slider/' + sliderId,
    method: 'get'
  })
}

// 新增轮播图
export function addSlider(data) {
  return request({
    url: '/res/slider',
    method: 'post',
    data: data
  })
}

// 修改轮播图
export function updateSlider(data) {
  return request({
    url: '/res/slider',
    method: 'put',
    data: data
  })
}

// 删除轮播图
export function delSlider(sliderId) {
  return request({
    url: '/res/slider/' + sliderId,
    method: 'delete'
  })
}

// 修改状态
export function changeSliderStatus(sliderId, status) {
  const data = {
    sliderId,
    status
  }
  return request({
    url: '/res/slider/changeStatus',
    method: 'put',
    data: data
  })
}

// 审批
export function apporSlider(flag,ids,publishtime) {
  const data = {
    "flag":flag,
    "ids":ids,
    "publishTime":publishtime
  }
  return request({
    url: '/res/slider/appor',
    method: 'post',
    data: data
  })
}

// 撤销审批工作
export function unApporSlider(sliderIds) {
  return request({
    url: '/res/slider/unappor/' + sliderIds,
    method: 'post'
  })
}

//查询已审批的单据
export function listApporedSliderIds(sliderIds) {
  return request({
    url: '/res/slider/list/' + sliderIds,
    method: 'get'
  })
}

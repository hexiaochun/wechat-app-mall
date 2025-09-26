const WXAPI = require('apifm-wxapi')
const CMS = require('../../utils/cms')
Page({
  data: {
    categoryId: undefined, // 分类id
  },
  onLoad (options) {
    this.data.categoryId = options.categoryId
    this.cmsCategoryDetail()
    this.articles()
  },
  onShow: function () {

  },
  async cmsCategoryDetail() {
    // 使用工具函数构建参数，支持预约统计和用户预约数据
    const params = CMS.buildCmsCategoryDetailParams(this.data.categoryId, {
      includeYuyueStatistics: true, // 获取预约报名数量统计
      includeUserYuyue: true        // 获取用户预约数据
    })
    
    const res = await WXAPI.cmsCategoryDetail(params)
    if (res.code == 0) {
      this.setData({
        category: res.data
      })
      wx.setNavigationBarTitle({
        title: res.data.info.name,
      })
    }
  },
  async articles() {
    wx.showLoading({
      title: '',
    })
    const params = CMS.buildCmsArticlesParams({
      categoryId: this.data.categoryId || ''
    })
    const res = await WXAPI.cmsArticlesV3(params)
    wx.hideLoading()
    if (res.code == 0) {
      this.setData({
        cmsArticles: res.data.result
      })
    } else {
      this.setData({
        cmsArticles: null
      })
    }
  },
  onShareAppMessage: function() {    
    return {
      title: this.data.category.info.name,
      path: '/pages/cms/list?categoryId='+ this.data.categoryId +'&inviter_id=' + wx.getStorageSync('uid')
    }
  },
  onShareTimeline() {    
    return {
      title: this.data.category.info.name,
      query: 'categoryId='+ this.data.categoryId +'&inviter_id=' + wx.getStorageSync('uid'),
      imageUrl: this.data.category.info.icon,
    }
  },
})
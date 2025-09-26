const WXAPI = require('apifm-wxapi')
Page({
  data: {

  },
  onLoad: function (options) {
    this.category()
  },
  onShow: function () {

  },
  async category() {
    // 准备请求参数
    const params = {}
    
    // 如果用户已登录，添加token参数
    const token = wx.getStorageSync('token')
    if (token) {
      params.token = token
    }
    
    // 如果有shopId配置，添加shopId参数
    const shopInfo = wx.getStorageSync('shopInfo')
    if (shopInfo && shopInfo.id) {
      params.shopId = shopInfo.id
    }
    
    const res = await WXAPI.cmsCategories(params)
    if (res.code == 0) {
      const category = res.data.filter(ele => {
        return ele.type == 'qa'
      })
      this.setData({
        category: category
      })
      if (category && category.length > 0) {
        this.articles(category[0].id)
      }
    }
  },
  async articles(categoryId) {
    wx.showLoading({
      title: '',
    })
    const res = await WXAPI.cmsArticlesV3({
      categoryId
    })
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
  categoryChange(e) {
    const index = e.detail
    const category = this.data.category[index]
    this.articles(category.id)
  },
  onShareAppMessage: function() {
    const uid = wx.getStorageSync('uid')
    return {
      title: wx.getStorageSync('mallName') + ' - 帮助中心',
      path: `/pages/help/index?inviter_id=${ uid ? uid : ''}`,
      imageUrl: wx.getStorageSync('share_pic')
    }
  },
  onShareTimeline() {
    const uid = wx.getStorageSync('uid')   
    return {
      title: wx.getStorageSync('mallName') + ' - 帮助中心',
      query: `inviter_id=${ uid ? uid : ''}`,
      imageUrl: wx.getStorageSync('share_pic')
    }
  },
})
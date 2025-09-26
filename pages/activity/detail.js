const WXAPI = require('apifm-wxapi')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    activityDetail: null,
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.loadActivityDetail(options.id)
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  /**
   * 加载活动详情
   */
  loadActivityDetail: function(id) {
    this.setData({
      loading: true
    })

    // 使用现有的noticeDetail接口来获取详情
    WXAPI.noticeDetail(id).then(res => {
      console.log('活动详情响应:', res)
      this.setData({
        loading: false
      })

      if (res.code === 0 || res.code === 200) {
        this.setData({
          activityDetail: res.data
        })
        
        // 设置页面标题
        if (res.data && res.data.title) {
          wx.setNavigationBarTitle({
            title: res.data.title
          })
        }
      } else {
        wx.showToast({
          title: res.msg || '加载失败',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    }).catch(err => {
      console.error('加载活动详情失败:', err)
      this.setData({
        loading: false
      })
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    })
  },

  /**
   * 分享活动
   */
  onShareAppMessage: function () {
    const activity = this.data.activityDetail
    return {
      title: activity ? activity.title : '精彩活动',
      path: `/pages/activity/detail?id=${activity ? activity.id : ''}`,
      imageUrl: activity && activity.pic ? activity.pic : ''
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    const activity = this.data.activityDetail
    return {
      title: activity ? activity.title : '精彩活动',
      imageUrl: activity && activity.pic ? activity.pic : ''
    }
  }
})

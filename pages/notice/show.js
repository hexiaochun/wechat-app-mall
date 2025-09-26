const app = getApp();
const WXAPI = require('apifm-wxapi')
Page({
  data: {
  
  },
  onLoad: function (options) {
    var that = this;
    WXAPI.noticeDetail(options.id).then(function (res) {
      if (res.code == 0) {
        that.setData({
          notice: res.data
        });
      }
    })
  },
  /**
   * 分享给朋友
   */
  onShareAppMessage() {
    const notice = this.data.notice
    return {
      title: notice ? notice.title : '活动公告',
      path: '/pages/notice/show?id=' + (notice ? notice.id : ''),
      imageUrl: notice && notice.pic ? notice.pic : wx.getStorageSync('share_pic')
    }
  },
  
  /**
   * 分享到朋友圈
   */
  onShareTimeline() {    
    const notice = this.data.notice
    return {
      title: notice ? notice.title : '活动公告',
      query: 'id=' + (notice ? notice.id : ''),
      imageUrl: notice && notice.pic ? notice.pic : wx.getStorageSync('share_pic')
    }
  },
  subscribe() {
    const notice_subscribe_ids = wx.getStorageSync('notice_subscribe_ids')
    if (notice_subscribe_ids) {
      wx.requestSubscribeMessage({
        tmplIds: notice_subscribe_ids.split(','),
        success(res) {
          wx.showToast({
            title: '订阅成功',
          })
        },
        fail(err) {
          console.error(err)
        },
      })
    }
  },
})
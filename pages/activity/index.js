const WXAPI = require('apifm-wxapi')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    noticeList: [], // 公告列表
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadNoticeList()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 加载公告列表
   */
  loadNoticeList: function(isLoadMore = false) {
    if (this.data.loading) {
      return
    }

    this.setData({
      loading: true
    })

    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize
    }

    // 如果用户已登录，添加token参数
    const token = wx.getStorageSync('token')
    if (token) {
      params.token = token
    }

    WXAPI.noticeList(params).then(res => {
      console.log('公告列表响应:', res)
      this.setData({
        loading: false
      })

      if (res.code === 0) {
        const newList = res.data.dataList || res.data || []
        
        if (isLoadMore) {
          this.setData({
            noticeList: [...this.data.noticeList, ...newList]
          })
        } else {
          this.setData({
            noticeList: newList
          })
        }

        // 判断是否还有更多数据
        if (newList.length < this.data.pageSize) {
          this.setData({
            hasMore: false
          })
        }
      } else {
        this.setData({
          noticeList: isLoadMore ? this.data.noticeList : []
        })
        if (!isLoadMore) {
          wx.showToast({
            title: res.msg || '加载失败',
            icon: 'none'
          })
        }
      }
    }).catch(err => {
      console.error('加载公告列表失败:', err)
      this.setData({
        loading: false
      })
      if (!isLoadMore) {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 查看公告详情
   */
  viewNoticeDetail: function(e) {
    const item = e.currentTarget.dataset.item
    if (item && item.id) {
      wx.navigateTo({
        url: `/pages/notice/show?id=${item.id}`
      })
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      hasMore: true,
      noticeList: []
    })
    this.loadNoticeList()
    wx.stopPullDownRefresh()
  },

  /**
   * 上拉加载更多
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      })
      this.loadNoticeList(true)
    }
  }
})

const WXAPI = require('../../miniprogram_npm/apifm-wxapi/index')
const TOOLS = require('../../utils/tools.js')
const AUTH = require('../../utils/auth')
const CONFIG = require('../../config.js')
const APP = getApp()

Page({
  data: {
    banners: [], // 轮播图数据
    membershipPackages: [ // 会员充值套餐数据
      {
        id: 1,
        title: '套餐一',
        price: '49.8',
        originalPrice: '100',
        validity: '5折',
        description: '100积分'
      },
      {
        id: 2,
        title: '套餐二',
        price: '89.9',
        originalPrice: '200',
        validity: '5折',
        description: '200积分'
      },
      {
        id: 3,
        title: '套餐三',
        price: '129.8',
        originalPrice: '300',
        validity: '5折',
        description: '300积分'
      },
      {
        id: 4,
        title: '套餐四',
        price: '169.8',
        originalPrice: '400',
        validity: '5折',
        description: '400积分'
      },
      {
        id: 5,
        title: '套餐五',
        price: '209.8',
        originalPrice: '500',
        validity: '5折',
        description: '500积分'
      },
      {
        id: 6,
        title: '套餐六',
        price: '266.8',
        originalPrice: '600',
        validity: '5折',
        description: '600积分'
      }
    ]
  },

  onLoad: function(e) {
    wx.showShareMenu({
      withShareTicket: true,
    })
    const that = this
    // 读取分享链接中的邀请人编号
    if (e && e.inviter_id) {
      wx.setStorageSync('referrer', e.inviter_id)
    }
    // 读取小程序码中的邀请人编号
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene)
      if (scene) {        
        wx.setStorageSync('referrer', scene.substring(11))
      }
    }
    AUTH.checkHasLogined().then(isLogined => {
      if (isLogined) {
        TOOLS.showTabBarBadge()
      } else {
        getApp().loginOK = () => {
          TOOLS.showTabBarBadge()
        }
      }
    })
    this.initBanners()
    // 读取系统参数
    this.readConfigVal()
    getApp().configLoadOK = () => {
      this.readConfigVal()
    }
  },

  readConfigVal() {
    const mallName = wx.getStorageSync('mallName')
    if (!mallName) {
      return
    }
    wx.setNavigationBarTitle({
      title: mallName || '游戏中心'
    })
    this.setData({
      mallName: wx.getStorageSync('mallName') ? wx.getStorageSync('mallName') : '游戏中心',
    })
    const shopMod = wx.getStorageSync('shopMod')
    const shopInfo = wx.getStorageSync('shopInfo')
    if (shopMod == '1' && !shopInfo) {
      wx.redirectTo({
        url: '/pages/shop/select'
      })
    }
  },

  onShow: function(e) {
    this.setData({
      navHeight: APP.globalData.navHeight,
      navTop: APP.globalData.navTop,
      windowHeight: APP.globalData.windowHeight,
      menuButtonObject: APP.globalData.menuButtonObject //小程序胶囊信息
    })
    this.setData({
      shopInfo: wx.getStorageSync('shopInfo')
    })
    // 获取购物车数据，显示TabBarBadge
    TOOLS.showTabBarBadge()
    const refreshIndex = wx.getStorageSync('refreshIndex')
    if (refreshIndex) {
      this.onPullDownRefresh()
      wx.removeStorageSync('refreshIndex')
    }
  },

  // 初始化轮播图（优先使用游戏轮播图，没有则使用index轮播图）
  async initBanners() {
    try {
      // 先尝试获取游戏轮播图
      let res = await WXAPI.banners({
        type: 'game'
      })
      
      if (res.code == 700) {
        // 如果没有游戏轮播图，则获取首页轮播图
        res = await WXAPI.banners({
          type: 'index'
        })
      }
      
      if (res.code == 0) {
        this.setData({
          banners: res.data
        })
      } else {
        // 使用默认图片
        this.setData({
          banners: [
            {
              id: 1,
              picUrl: '/images/default.png',
              linkType: 0,
              linkUrl: ''
            }
          ]
        })
      }
    } catch (error) {
      console.error('获取轮播图失败:', error)
      // 使用默认图片
      this.setData({
        banners: [
          {
            id: 1,
            picUrl: '/images/default.png',
            linkType: 0,
            linkUrl: ''
          }
        ]
      })
    }
  },

  // 轮播图点击事件
  tapBanner(e) {
    const item = e.currentTarget.dataset.item
    if (item.linkType == 1) {
      // 跳转到小程序
      wx.navigateToMiniProgram({
        appId: item.appid,
        path: item.linkUrl || '',
      })
    } else {
      if (item.linkUrl) {
        wx.navigateTo({
          url: item.linkUrl
        })
      }
    }
  },

  // 积分商城兑换入口
  goPointsMall() {
    wx.showToast({
      title: '积分商城兑换功能开发中',
      icon: 'none'
    })
    // TODO: 后续跳转到积分商城页面
    // wx.navigateTo({
    //   url: '/pages/points-mall/index'
    // })
  },

  // 兑换联盟入口
  goExchangeAlliance() {
    wx.showToast({
      title: '兑换联盟功能开发中',
      icon: 'none'
    })
    // TODO: 后续跳转到兑换联盟页面
    // wx.navigateTo({
    //   url: '/pages/exchange-alliance/index'
    // })
  },

  // 会员充值套餐点击
  onPackageClick(e) {
    const packageInfo = e.currentTarget.dataset.package
    wx.showModal({
      title: '充值确认',
      content: `确定购买${packageInfo.title}吗？价格：¥${packageInfo.price}`,
      success: (res) => {
        if (res.confirm) {
          this.handleRecharge(packageInfo)
        }
      }
    })
  },

  // 处理充值逻辑
  handleRecharge(packageInfo) {
    wx.showToast({
      title: '充值功能开发中',
      icon: 'none'
    })
    // TODO: 后续实现充值逻辑
    console.log('充值套餐:', packageInfo)
  },

  onPullDownRefresh: function() {
    this.initBanners()
    wx.stopPullDownRefresh()
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '"' + wx.getStorageSync('mallName') + '" ' + wx.getStorageSync('share_profile'),
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },

  onShareTimeline() {
    return {
      title: '"' + wx.getStorageSync('mallName') + '" ' + wx.getStorageSync('share_profile'),
      query: 'inviter_id=' + wx.getStorageSync('uid'),
      imageUrl: wx.getStorageSync('share_pic')
    }
  }
})
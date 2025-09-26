const WXAPI = require('../../miniprogram_npm/apifm-wxapi/index')
const TOOLS = require('../../utils/tools.js')
const AUTH = require('../../utils/auth')
const CONFIG = require('../../config.js')
const APP = getApp()

Page({
  data: {
    banners: [], // 轮播图数据
    categories: [], // 商品分类数据
    membershipPackages: [], // 会员充值商品数据（从接口获取）
    loading: false // 加载状态
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
    this.initCategories()
    this.initMembershipPackages()
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

  // 初始化商品分类
  async initCategories() {
    try {
      const res = await WXAPI.goodsCategory()
      if (res.code == 0) {
        // 只取前两个一级分类
        const firstCategories = res.data.filter(ele => ele.level == 1).slice(0, 2)
        this.setData({
          categories: firstCategories
        })
      }
    } catch (error) {
      console.error('获取商品分类失败:', error)
    }
  },

  // 初始化会员充值商品
  async initMembershipPackages() {
    try {
      this.setData({ loading: true })
      
      const res = await WXAPI.goodsv2({
        categoryId: 546803, // 会员充值分类ID
        page: 1,
        pageSize: 20
      })
      
      if (res.code == 0 && res.data && res.data.result) {
        // 转换数据格式以适配现有布局
        const packages = res.data.result.map(item => {
          console.log('商品数据:', item) // 调试输出，查看实际字段
          
          // 计算折扣信息
          let discount = ''
          let minPrice = item.minPrice || item.discountPrice || item.originalPrice
          let originalPrice = item.originalPrice
          
          // 如果有会员价格且比原价低，计算折扣
          if (minPrice && originalPrice && minPrice < originalPrice) {
            const discountRate = ((originalPrice - minPrice) / originalPrice * 100).toFixed(0)
            discount = `${discountRate}折`
          }
          
          return {
            id: item.id,
            title: item.name,
            minPrice: minPrice ? minPrice.toFixed(2) : '0.00',
            originalPrice: originalPrice ? originalPrice.toFixed(2) : null,
            discount: discount,
            description: item.subName || item.purchaseNotes || item.characteristic,
            pic: item.pic,
            tags: item.tags,
            rawData: item // 保存原始数据用于后续处理
          }
        })
        
        this.setData({
          membershipPackages: packages
        })
      } else {
        console.error('获取会员充值商品失败:', res.msg)
        wx.showToast({
          title: res.msg || '获取商品失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('获取会员充值商品异常:', error)
      wx.showToast({
        title: '网络异常，请稍后重试',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 分类点击事件
  onCategoryClick(e) {
    const categoryId = e.currentTarget.dataset.id
    const categoryName = e.currentTarget.dataset.name
    
    // 跳转到分类页面
    wx.setStorageSync('_categoryId', categoryId)
    wx.switchTab({
      url: '/pages/category/category'
    })
  },

  // 全部分类点击事件
  goAllCategories() {
    wx.switchTab({
      url: '/pages/category/category'
    })
  },

  // 会员充值商品点击
  onPackageClick(e) {
    const packageInfo = e.currentTarget.dataset.package
    
    // 跳转到商品详情页
    wx.navigateTo({
      url: `/pages/goods-details/index?id=${packageInfo.id}`
    })
  },

  // 刷新会员充值商品
  refreshMembershipPackages() {
    this.initMembershipPackages()
  },

  onPullDownRefresh: function() {
    this.initBanners()
    this.initMembershipPackages()
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
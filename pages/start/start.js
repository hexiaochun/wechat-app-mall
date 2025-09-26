const WXAPI = require('apifm-wxapi')
const CONFIG = require('../../config.js')
Page({
  data: {
    banners:[],
    swiperMaxNumber: 0,
    swiperCurrent: 0,
    countdown: 0,
    autoTimer: null,
    countdownTimer: null,
    hasInitialized: false  // 防止重复初始化
  },
  onLoad(e){
    // e.shopId = 6040 // 测试，测试完了注释掉
    this.data.shopId = e.shopId
    this.readConfigVal()
    // 补偿写法
    getApp().configLoadOK = () => {
      this.readConfigVal()
    }
  },
  onShow:function(){
    
  },
  
  onUnload: function() {
    // 页面卸载时清理定时器
    this.clearTimers();
  },
  
  onHide: function() {
    // 页面隐藏时清理定时器
    this.clearTimers();
  },
  
  // 启动倒计时
  startCountdown: function() {
    // 清理已存在的倒计时，防止重复
    this.clearTimers();
    
    this.setData({
      countdown: 3
    });
    
    // 倒计时更新
    this.data.countdownTimer = setInterval(() => {
      let countdown = this.data.countdown - 1;
      
      if (countdown <= 0) {
        this.clearTimers();
        this.goToIndex();
      } else {
        this.setData({
          countdown: countdown
        });
      }
    }, 1000);
  },
  
  // 清理所有定时器
  clearTimers: function() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.data.countdownTimer = null;
    }
    if (this.data.autoTimer) {
      clearTimeout(this.data.autoTimer);
      this.data.autoTimer = null;
    }
  },
  async readConfigVal() {
    // 防止重复初始化
    if (this.data.hasInitialized) {
      return
    }
    
    const mallName = wx.getStorageSync('mallName')
    if (!mallName) {
      return
    }
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    let shopMod = wx.getStorageSync('shopMod')
    if (!shopMod) {
      shopMod = 0
    }
    // 每次都展示启动页
    const res = await WXAPI.banners({
      type: 'app'
    })
    if (res.code == 700) {
      if (shopMod==1) {
        this.goShopSelectPage()
      } else {
        wx.switchTab({
          url: '/pages/index/index',
        })
      }
    } else {
      this.setData({
        banners: res.data,
        swiperMaxNumber: res.data.length,
        hasInitialized: true  // 标记已初始化
      });
      
      // 启动倒计时
      this.startCountdown();
    }
  },
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  goLeft() {
    if (this.data.swiperCurrent == 0) {
      this.setData({
        swiperCurrent: this.data.swiperMaxNumber - 1
      })
    } else {
      this.setData({
        swiperCurrent: this.data.swiperCurrent - 1
      })
    }
  },
  goRight() {
    if (this.data.swiperCurrent == this.data.swiperMaxNumber - 1) {
      this.setData({
        swiperCurrent: 0
      })
    } else {
      this.setData({
        swiperCurrent: this.data.swiperCurrent + 1
      })
    }
  },
  goToIndex: function (e) {
    // 清理倒计时
    this.clearTimers();
    
    let shopMod = wx.getStorageSync('shopMod')
    if (!shopMod) {
      shopMod = 0
    }
    if (getApp().globalData.isConnected) {
      if (shopMod == 1) {
        this.goShopSelectPage()
      } else {
        wx.switchTab({
          url: '/pages/index/index',
        });
      }
    } else {
      wx.showToast({
        title: '当前无网络',
        icon: 'none',
      })
    }
  },
  async goShopSelectPage() {
    if (!this.data.shopId) {
      wx.redirectTo({
        url: '/pages/shop/select'
      })
      return
    }
    // 有传入门店ID
    const res = await WXAPI.shopSubdetail(this.data.shopId)
    if (res.code != 0) {
      wx.redirectTo({
        url: '/pages/shop/select'
      })
      return
    }
    wx.setStorageSync('shopInfo', res.data.info)
    wx.setStorageSync('shopIds', res.data.info.id)
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
});
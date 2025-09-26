/**
 * CMS相关工具函数
 */

/**
 * 构建CMS分类列表接口参数
 * @param {Object} customParams 自定义参数
 * @returns {Object} 完整的请求参数
 */
function buildCmsCategoriesParams(customParams = {}) {
  const params = { ...customParams }
  
  // 如果用户已登录，添加token参数
  const token = wx.getStorageSync('token')
  if (token) {
    params.token = token
  }
  
  // 如果有门店配置，添加shopId参数
  const shopInfo = wx.getStorageSync('shopInfo')
  if (shopInfo && shopInfo.id) {
    params.shopId = shopInfo.id
  }
  
  return params
}

/**
 * 构建CMS分类详情接口参数
 * @param {string|number|Object} categoryIdOrParams 分类ID或参数对象
 * @param {Object} options 选项配置
 * @param {boolean} options.includeYuyueStatistics 是否包含预约统计
 * @param {boolean} options.includeUserYuyue 是否包含用户预约数据
 * @returns {Object} 完整的请求参数
 */
function buildCmsCategoryDetailParams(categoryIdOrParams, options = {}) {
  let params = {}
  
  // 处理参数
  if (typeof categoryIdOrParams === 'string' || typeof categoryIdOrParams === 'number') {
    params.id = categoryIdOrParams
  } else if (typeof categoryIdOrParams === 'object' && categoryIdOrParams !== null) {
    params = { ...categoryIdOrParams }
  }
  
  // 如果用户已登录，添加token参数
  const token = wx.getStorageSync('token')
  if (token) {
    params.token = token
    
    // 如果需要获取用户在当前类目下的预约数量
    if (options.includeUserYuyue) {
      const uid = wx.getStorageSync('uid')
      if (uid) {
        params.yuyueUid = uid
      }
    }
  }
  
  // 如果需要获取该类目下的预约报名数量统计
  if (options.includeYuyueStatistics) {
    params.yuyueStatistics = '1'
  }
  
  return params
}

/**
 * 构建CMS文章列表接口参数
 * @param {Object} customParams 自定义参数
 * @returns {Object} 完整的请求参数
 */
function buildCmsArticlesParams(customParams = {}) {
  const params = { ...customParams }
  
  // 如果用户已登录，添加token参数
  const token = wx.getStorageSync('token')
  if (token) {
    params.token = token
  }
  
  return params
}

module.exports = {
  buildCmsCategoriesParams,
  buildCmsCategoryDetailParams,
  buildCmsArticlesParams
}

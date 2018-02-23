/**
 * 首页约伴
 * jiangshunbin
 */

//获取应用实例
const app = getApp();
var carryAPI = require('../../utils/carryhttp/carryAPI.js').CarryAPI;
const util = require('../../utils/util.js');
var globalData = require('../../utils/global_data.js');
var crypto_aes = require('../../utils/wxaes.js').CryptoJS;

Page({
  data: {
      logined: false,
      // banner数据
      banners: [],
      // 当前显示banner的序号
      bannerCurrentIndex: 0
  },

  onBannerChanged: function (event) {
      this.data.bannerCurrentIndex = event.detail.current;
  },
  onBannerClick: function (e) {
    //   console.log(this.data.bannerCurrentIndex);
      var web_url = this.data.banners[this.data.bannerCurrentIndex].link;
    //   console.log(web_url);
    wx.navigateTo({
          //url: '/pages/webpage/webpage?title=' + 'Carry电竞' + '&web_url=' + web_url
        url: '/pages/webpage/webpage?web_url=' + web_url
      });
  },
  getBanners: function(){
      var self = this;
      carryAPI.getBanners({
          onSuccess(data) {
              // console.log(data.carousels);
              self.setData({
                  banners: data.carousels
              });

          }
      });
  },

  getWeixinUserToLogin: function(){
    if(app.globalData.unionId != null){
        //去登录 
        this.snsLogin();
    }else{
        //app.js里的 getUserInfo 和 getSessionKey 不一定谁先执行完，然后有了sessionKey 和 加密信息后，才能解密出 unionId，然后才能用unionId 来三方登录

        if (!app.globalData.wxUserInfo) {
            app.userInfoReadyCallback = res => {
                this.getUnionIdToLogin();
            }
        }

        app.sessionKeyReadyCallback = res => {
            //如果关注过微信公众号，此时会有unionid返回，否则没有
            if(res.unionid){
                // 去登录 
                this.snsLogin();
            }else{
                this.getUnionIdToLogin();
            }
        }

    }

  },

  snsLogin: function(){
      var self = this;
        if(!this.data.logined){
            //三方登录
            carryAPI.snsLogin(app.globalData.unionId, {
                onSuccess: function (data) {
                    self.data.logined = true;
                }
            }); 

            //登录之后，获取数据
            this.loadData();
        }
  },

  getUnionIdToLogin: function () {
      this.decryptWeixinUserData(app.encData.sessionKey, app.encData.encryptedData, app.encData.iv);
  },

    //解析unionId
    //unionID机制说明：https://mp.weixin.qq.com/debug/wxadoc/dev/api/uinionID.html
  decryptWeixinUserData: function (sessionKey, encryptedData, iv) {
      if (sessionKey && encryptedData && iv) {
          var key = crypto_aes.enc.Base64.parse(sessionKey);
          var iv = crypto_aes.enc.Base64.parse(iv);
          var decrypted = crypto_aes.AES.decrypt(encryptedData, key,
              {
                  iv: iv,
                  mode: crypto_aes.mode.CBC,
                  padding: crypto_aes.pad.Pkcs7
              });
          var decryptData = crypto_aes.enc.Utf8.stringify(decrypted).toString();
          decryptData = JSON.parse(decryptData);
          if (decryptData.unionId) { //绑定了开放平台才有unionId
              //app.globalData.unionId = decryptData.unionId;
              app.setUnionId(decryptData.unionId);
              
              this.snsLogin();
          }else{
              //TODO 提示用户关注公众号？
          }
      }
  },

  loadData: function(){
    this.getBanners();  //加载banner

    //TODO 加载其他数据
  },

  onLoad: function () {
      this.getWeixinUserToLogin();
  },
  onPullDownRefresh: function(){
    wx.stopPullDownRefresh(); //隐藏下拉刷新的icon
    // XXX 下拉刷新，如果数据发生改变，比如轮播图由5个变成2个，如果是在第2个时下拉刷新的，那么，呈现出来的图就是新数据的第2张图；如果是在第2个以后下拉刷新的，则轮播图无法呈现，也无法正常运行了，这是swiper的缺陷，哪怕做了如下的设置也不管用
    // this.setData({
    //     bannerCurrentIndex: 0,
    //     banners: []
    // });
    this.loadData();
  }
})

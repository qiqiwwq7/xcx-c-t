//app.js
var carryEnv = require('/utils/carryhttp/carryEnv.js');
var carryAPI = require('/utils/carryhttp/carryAPI.js').CarryAPI;
const commonData = require('/utils/commondata.js').commonData;
var constants = require('/utils/constants.js');
var globalData = require('/utils/global_data.js');
// const util = require('/utils/util.js');
// import wxValidate from '/utils/wxValidate'
// App({
//   wxValidate: (rules, messages) => new wxValidate(rules, messages)
// })

App({
  onLaunch: function () {
    var self = this;

    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    //获取设备类型，炫耀党接口需要传递设备类型做参数...
    wx.getSystemInfo({
        success: function (res) {
            globalData.systemInfo = res;
            
            if (res.system.toLowerCase().indexOf('ios') >= 0) {
                commonData.deviceType = 'ios';
            } else if (res.system.toLowerCase().indexOf('android') >= 0) {
                commonData.deviceType = 'android';
            } else {
                commonData.deviceType = 'unknown';
            }

            //XXX 构造 commonData.deviceId，目前使用unionId来作为deviceId
        }
    });

    carryEnv.CarryEnv.init(carryEnv.AppRunType.Test);
    // carryEnv.CarryEnv.init(carryEnv.AppRunType.Buddy);

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        // 同一个微信开放平台下的相同主体的App、公众号、小程序，如果用户已经关注公众号，或者曾经登录过App或公众号，则用户打开小程序时，开发者可以直接通过wx.login获取到该用户UnionID，无须用户再次授权
        //carryAPI.weixinLogin(res.code, null);
          this.getSessionKey(res.code);
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.wxUserInfo = res.userInfo;

              this.encData.encryptedData = res.encryptedData;
              this.encData.iv = res.iv;

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res.userInfo)
              }
            }
          })
        } else {
          //用户未授权
            // console.log('用户未授权');
            //用户授权参 https://mp.weixin.qq.com/debug/wxadoc/dev/api/authorize-index.html
          wx.authorize({
            scope: 'scope.userInfo',
            success(data){
              wx.getSetting();
            },
            fail(err){
                // if (err.errMsg === "authorize:fail auth deny") {  // 用户曾经拒绝授权（则短期内不会出现授权弹窗）

                // }
                wx.showToast({
                    title: '很遗憾，因为授权失败，您将无法正常使用此小程序。请到设置里(右上角 - 关于 - 右上角 - 设置)重新授权。',
                    icon: 'none',
                    duration: 5000
                })
            }
          })
          // wx.openSetting({
          //   success(data){
          //     console.log(data)
          //   },
          //   fail(err){
          //     //TODO 如果用户已拒绝授权，则短期内不会出现弹窗，而是直接进入接口 fail 回调。请开发者兼容用户拒绝授权的场景
          //   }
          // })
        }
      }
    })
  },

  /**
   * 获取小程序会话密钥 session_key，此方法可考虑在服务端进行
   * 官方文档建议【开发者服务器使用登录凭证 code 获取 session_key 和 openid】【session_key 不应该在网络上传输】
   * https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-login.html#wxloginobject
   * https://www.jianshu.com/p/bb1ed9512dd1
   */
  getSessionKey: function (code){
      var that = this;
      var getSessionKeyUrl = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + constants.APP_ID + 
          '&secret=' + constants.APP_SECRET + '&js_code=' + code + '&grant_type=authorization_code';
      //根据jscode调接口拿到openid和session_key
      wx.request({
          url: getSessionKeyUrl,
          success: function (res) {
              if(res.data.errcode == null){
                that.globalData.openId = res.data.openid;
                //如果关注过微信公众号，此时会有res.data.unionid返回，否则没有
                if(res.data.unionid){
                    that.setUnionId(res.data.unionid);
                }

                that.encData.sessionKey = res.data.session_key;

                  if (that.sessionKeyReadyCallback) {
                      that.sessionKeyReadyCallback(res.data)
                  }
              }else{
                  wx.showToast({
                      title: res.data.errmsg,
                      icon: 'none',
                      duration: 2000
                  })
              }
          },
          fail: function(err){
            console.log(err);
          }
      })
  },

  setUnionId: function(unionId){
      this.globalData.unionId = unionId;
      commonData.deviceId = unionId;  //deviceId用unionId来标记
  },
  
  globalData: {
    wxUserInfo: null,  //微信用户信息
    openId: null,
    unionId: null
  },

    //用于解密unionId的数据
  encData: {
      sessionKey: '',
      encryptedData: null,
      iv: null,
  }
})
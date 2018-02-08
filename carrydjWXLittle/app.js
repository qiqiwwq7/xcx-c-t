//app.js
var carryEnv = require('/utils/carryhttp/carryEnv.js');
var carryAPI = require('/utils/carryhttp/carryAPI.js').CarryAPI;
const commonData = require('/utils/commondata.js').commonData;
var constants = require('/utils/constants.js');
var wxaes = require('/utils/wxaes.js');
var crypto_aes = wxaes.CryptoJS;
var globalData = require('/utils/global_data.js');

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

            //TODO 构造 commonData.deviceId
        }
    });

    carryEnv.CarryEnv.init(carryEnv.AppRunType.Test);
    // carryEnv.CarryEnv.init(carryEnv.AppRunType.Buddy);

    // carryAPI.getUserInfo('975689757604734976', {
    //     onSuccess(data) {
    //         console.log('获取跟人信息数据成功');
    //         console.log(data);
    //     },
    //     onFail(err) {
    //         console.log(err);
    //     }
    // });
    // carryAPI.getOrderList('975689757604734976', {
    //     onSuccess(data) {
    //         console.log(data);
    //     },
    //     onFail(err) {
    //         console.log(err);
    //     }
    // });

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
              this.globalData.userInfo = res.userInfo

              if(this.globalData.unionId == null){
                  if (this.encData.sessionKey){  
                    this.decryptWeixinUserData(res.encryptedData, res.iv);
                  }else{
                      //如果sessionKey还没拿回来，则将加密数据暂存，一会儿解密
                      this.encData.encryptedData = res.encryptedData;
                      this.encData.iv = res.iv;
                  }
              }

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        } else {
          //用户未授权
          wx.authorize({
            scope: 'scope.userInfo',
            success(data){
              wx.getSetting();
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
                that.encData.sessionKey = res.data.session_key;

                //如果关注过微信公众号，此时会有unionid返回，否则没有
                if(res.data.unioinId != null){
                    // that.globalData.unionId = res.data.unionid;
                    that.setUnionIdAndLogin(res.data.unionid);
                } else {  
                    //证明wx.getSetting先返回了值，那时这里还没返回，就没有sessionKey，无法解密数据
                    that.decryptWeixinUserData(that.encData.encryptedData, that.encData.iv);
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

  decryptWeixinUserData: function (encryptedData, iv){
    if(this.encData.sessionKey){
        if(encryptedData && iv){
            var key = crypto_aes.enc.Base64.parse(this.encData.sessionKey);
            var iv = crypto_aes.enc.Base64.parse(iv);
            var decrypted = crypto_aes.AES.decrypt(encryptedData, key,
                {
                    iv: iv,
                    mode: crypto_aes.mode.CBC,
                    padding: crypto_aes.pad.Pkcs7
                });
            var decryptData = crypto_aes.enc.Utf8.stringify(decrypted).toString();
            decryptData = JSON.parse(decryptData);
            if (decryptData.unionId){ //绑定了开放平台才有unionId
                // this.globalData.unionId = decryptData.unionId;
                this.setUnionIdAndLogin(decryptData.unionId);
            }
        }
    }
  },

  setUnionIdAndLogin: function(unionId){
      this.globalData.unionId = unionId;
      carryAPI.snsLogin(unionId, {
          onSuccess: function(data){

          }
      });
  },

  globalData: {
    userInfo: null,  //微信用户信息
    openId: null,
    unionId: null
  },

  encData: {
      sessionKey: '',
      encryptedData: null,
      iv: null,
  }
})
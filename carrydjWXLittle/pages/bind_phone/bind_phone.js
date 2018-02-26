/**
 * 三方绑定 
 *  ：wangwenqi
 */

//获取应用实例
const app = getApp();
var carryAPI = require('../../utils/carryhttp/carryAPI.js').CarryAPI;
const util = require('../../utils/util.js');
var globalData = require('../../utils/global_data.js');
var crypto_aes = require('../../utils/wxaes.js').CryptoJS;
console.log('****app',app);
// console.log(globalData);
Page({
  data:{
    phone: '',
    code: '',
    codeText: '获取验证码',
    flog: true
  },
  onLoad: function(){
  },
  setPhone: function (e) {
    this.setData({
      phone: e.detail.value
    });
  },
  setCode: function (e) {
    this.setData({
      code: e.detail.value
    });
  },
  getVerifyCode: function () {
    if (!this.data.flog || this.data.phone.length < 11) {
      return;

    }
    carryAPI.getVerifyCode(
      { 
        'mobilePhone': this.data.phone,
        'type': 1
      },{
        onSuccess(data) {
          console.log('验证码获取成功');
          console.log(data);
        },
        onFail(err) {
          console.log(err);
        }
      }
    );
  },
  submitInfor: function () {
    if (this.data.phone.length !== 11 && this.data.code !== '') {
      return;
    }
    /**
     * bindPhone 参数说明：
     * 手机号
     * 验证码
     * 第三方唯一标识
     * 第三方称呢
     * 第三方头像
     */
    carryAPI.bindPhone(
      {
        'mobilePhone': this.data.phone,
        'code': this.data.code,
        'snsUid': app.globalData.unionId,
        'snsNickName': app.globalData.wxUserInfo.nickName,
        'snsHeadPhoto': app.globalData.wxUserInfo.avatarUrl
      },{
      onSuccess(data) {
        console.log('绑定成功');
        console.log(data);
      }
      // onFail(err) {
      //   console.log(err);
      // }
    });
  }
})
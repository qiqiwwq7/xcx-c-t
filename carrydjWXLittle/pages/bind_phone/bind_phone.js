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
console.log(app);
// console.log(globalData);
Page({
  data:{
    
  },
  onLoad: function(){
    carryAPI.bindPhone(app.globalData.wxUserInfo.avatarUrl, '1', '(975689757604734976)', '', '0', '20', {
      onSuccess(data) {
        console.log('获取通知列表数据成功');
        console.log(data);s
      },
      onFail(err) {
        console.log(err);
      }
    })
  },
  getCode: function () {
     // kk
  }
})
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


console.log('****carryAPI', carryAPI);

Page({
  data:{
    phone: ''
  },
  onLoad: function(){

  },
  setPhone: function (e) {
    // var phoneReg = /\d{11}/;
    // var phone = e.detail.value;

    // if (phone.test()) {

    // }
    this.setData({
      phone: e.detail.value
    });
  },
  getVerifyCode: function () {
    console.log('*****phone', this.data.phone);
    carryAPI.bindPhone();
  }
})
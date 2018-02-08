/**
 * API接口请求定义，所有的API都在这里定义，页面里直接使用这里的方法，拿到业务数据进行处理即可
 * 有的接口直接在这层不返回失败的回调，因为经过统一错误处理后，页面并不需要错误返回
 * jiangshunbin
 */

var CarrySignJS = require('carrySign.js');
var CarryHttp = require('carryHttp.js').CarryHttp;
const commonData = require('/../commondata.js').commonData;
const globalData = require('/../global_data.js');
const util = require('/../util.js');

var CarryAPI = CarryAPI || (function () {
    var APIs = {
        //登录，在这里统一处理userId，token以及其他用户个人信息的全局变量存储（而不是到页面去做这种逻辑处理）

        /**
         * 获取轮播图
         * jiangshunbin
         */
        getBanners: function(callback){
            var path = '/recommend/getCarousels';
            CarryHttp.doGet(path, 
            {
                'platform': 'h5'
            }, 
            null, callback);
        },

        //获取公共数据（游戏信息等），无需签名 Created by :jiangshunbin
        getCommonData: function (callback){
            var path = '/game/getCommonData';
            CarryHttp.doGet(path, null, null, callback);
        },

        //通过微信登录授权码 去登录Carry电竞
        // weixinLogin: function(code, callback){
        //     var path = '/sns/weixinLogin';
        //     CarryHttp.doPost(path, 
        //         {
        //             'code': code,
        //             'authType': '0',
        //             'terminalDef': commonData.terminalDef,
        //             'deviceKind': commonData.deviceType,
        //             'deviceId': commonData.deviceId
        //         }, 
        //         CarrySignJS.NewSign, 
        //         //登录返回后统一处理
        //         {
        //             onSuccess(data){
        //                 console.log(data);
        //             },
        //             onFail(err){
        //                 console.log(err);
        //             }
        //         });
        // },

        /**
         * 微信三方登录
         * 登录后先统一处理下返回数据
         * jiangshunbin
         */
        snsLogin: function(unionId, callback){
            var path = '/sns/snsLogin';
            CarryHttp.doPost(path,
                {
                    //'snsUid': app.globalData.unionId,
                    'snsUid': unionId,
                    'snsType': 'weixin',
                    'terminalDef': commonData.terminalDef,
                    'deviceKind': commonData.deviceType,
                    'deviceId': commonData.deviceId
                },
                null,
                {
                    onSuccess(data) {
                        // console.log(data);
                        if(util.isNullObj(data.userInfo)){
                            globalData.userInfo = data.userInfo;
                            commonData.loginUserId = data.userInfo.loginUserId;
                            commonData.token = data.userInfo.token;

                            if(callback){
                                callback.onSuccess(data);
                            }
                        }else{
                            //用户未绑定过手机号，跳转绑定
                            wx.showModal({
                                title: '请绑定手机',
                                content: '需要绑定手机'
                            })
                        }
                    },
                    onFail(err){
                        if (callback) {
                            callback.onFail(err);
                        }
                    }
                });
        },

        /**
         * 获取用户信息，旧签名
         * jiangshunbin
         */
        getUserInfo: function (userId, callback){
            var path = '/user/getUserInfo';
            CarryHttp.doGet(path, 
                {
                    'loginUserId': userId
                }, 
                CarrySignJS.OldSign, 
                callback);
        },

        /**
         * 获取用户订单列表，新签名
         * jiangshunbin
         */
        getOrderList: function (userId, callback) {
            var path = '/order/getByUserId';
            // CarryHttp.needCache = true;
            CarryHttp.doGet(path,
                {
                    'loginUserId': userId,
                    'pageLastId': '1',
                    'orderGroupCode': '',
                    'pageSize': '20'
                },
                CarrySignJS.NewSign,
                callback);
        },

        // 获取消息 Created by :jiangshunbin
        getNotices: function (loginUserId, type, noticeTags, time, pageLastId, pageSize, callback) {
            var path = '/notice/getNotices';
            var params = {
                loginUserId: loginUserId,
                'type': type,
                noticeTags: noticeTags,
                time: time,
                pageLastId: pageLastId,
                pageSize: pageSize
            }

            //使用mockdata
            ////CarryHttp.setMockdataFromJSONFile('notice_getNotices_1.json');
            var notice_getNotices_success_data = require('./mockdata/notice_getNotices_success.js').default;
            var notice_getNotices_fail_data = require('./mockdata/notice_getNotices_fail.js').default;
            CarryHttp.mockdata = notice_getNotices_success_data;
            // CarryHttp.mockdata = notice_getNotices_fail_data;
            CarryHttp.doGet(path, params, CarrySignJS.OldSign, callback);
        },


    }

    return APIs;
}());

module.exports = {
    CarryAPI: CarryAPI
}
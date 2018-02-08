/**
 * web页面
 * web-view不支持支付能力,是指无法唤起小程序的直接支付窗口，对于h5的那套支付应该是支持的，但是web-view 里边没法使用 微信支付的 JSAPI，也就是可能可以h5的相关的的支付中心来支付
 */

Page({
    data:{
        web_url: ''
    },

    onLoad: function (options){
        // console.log(options.web_url);
        options.web_url ? this.setData({ web_url: options.web_url }) : wx.navigateBack({ delta: 2 });
    },
    onShareAppMessage(options) {
        //console.log(options.webViewUrl)
    }
})
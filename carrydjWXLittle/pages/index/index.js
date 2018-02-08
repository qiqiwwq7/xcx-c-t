/**
 * 首页约伴
 * jiangshunbin
 */

var carryAPI = require('../../utils/carryhttp/carryAPI.js').CarryAPI;
var app = getApp()
console.log(app, 'app');
Page({
  data: {
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
          url: '/pages/webpage/webpage?web_url=' + web_url
      })
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

  onLoad: function () {
    this.getBanners();
  },
  onPullDownRefresh: function(){
    wx.stopPullDownRefresh(); //隐藏下拉刷新的icon
    // XXX 下拉刷新，如果数据发生改变，比如轮播图由5个变成2个，如果是在第2个时下拉刷新的，那么，呈现出来的图就是新数据的第2张图；如果是在第2个以后下拉刷新的，则轮播图无法呈现，也无法正常运行了，这是swiper的缺陷，哪怕做了如下的设置也不管用
    // this.setData({
    //     bannerCurrentIndex: 0,
    //     banners: []
    // });
    this.getBanners();
  }
})

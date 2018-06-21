// pages/article/article.js
var app = getApp();
//article url
var todayDateArray = require('../../utils/util.js').todayDateArray;
var articleExtract = require('../../utils/articleExtract.js')
var baseUri = "http://paper.people.com.cn/rmrb/html"

//拼接url的变量
var y_m = "";
var baseUri2 = "";
var newsHref = "";
var pagenum = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    articleObj:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    newsHref = options.newshref;
    pagenum = parseInt(options.pagenum);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var self = this;
    //选择的日期
    var todayArray = todayDateArray();
    y_m = todayArray.slice(0, 2).join("-");
    baseUri2 = [baseUri, y_m, todayArray[2]].join("/");
    var url =  [baseUri2, newsHref].join('/');
    //获取文章
    self.getArticle(url, newsHref, pagenum);
  },
  //请求文章
  getArticle: function (url, newsHref, pagenum) {
    var self = this;
    var reqObj = { url: url };
    wx.request({
      url: url,
      success:function(res){
        var html = res.data;
        console.log("文章html",html)
        //解析文章html，获取文章标题、内容等相关信息
        var tmpArticleObj = articleExtract(html, newsHref, pagenum);
        console.log('解析的文章',tmpArticleObj)
        self.setData({
          articleObj: tmpArticleObj,
        });
      }
    });
  },

})
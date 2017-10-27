// pages/paper/paper.js
//http://paper.people.com.cn/rmrb/html/2017-08/03/nbs.D110000renmrb_01.htm
var app = getApp();
var todayDateArray = require('../../utils/util.js').todayDateArray;
const apiUrl = 'http://paper.people.com.cn/rmrb/html';  //接口地址
const imgUrl = 'http://paper.people.com.cn/rmrb';  //接口地址
//宽高比用于计算适合该设备的coords的区域
//请求的数字报图片为400*571px
const widthRatio = 0;//数字报图片与手机的宽比
const heightRatio = 0;//数字报图片与手机的高比

Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowWidth: 0,
    windowHeight: 0,
    // imgSrc:"",
    paperInfo: []//报纸信息,(数组索引+1)代表版面的编号，如第0个元素代表第一版版面信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    //获取系统宽高，并计算宽高比
    if (app.globalData.systemInfo) {
      var systemInfo = app.globalData.systemInfo;
      self.setData({
        windowWidth: systemInfo.windowWidth,
        windowHeight: systemInfo.windowHeight
      });
    } else {
      //异步请求系统信息
      console.log("异步请求系统信息");
    }

    var todayArray = todayDateArray();
    var y_m = todayArray.slice(0, 2).join("-");
    var sectionUrl = 'nbs.D110000renmrb_01.htm';
    var url = [apiUrl, y_m, todayArray[2], sectionUrl].join('/');
    console.log("第一版url", url);

    wx.request({
      url: url,
      success: function (res) {
        //  console.log(res.data);
        var html = res.data;
        var pagePicMapReg = /<map[^>]+name=pagepicmap[^>]*>.*<\/map>/i;
        var pagePicImgReg = /<img[^>]+src=(.*)\s+border=0\s+usemap=#pagepicmap[^>]*>/i;
        var pagePicMapMatch = html.match(pagePicMapReg);
        var pagePicImgMatch = html.match(pagePicImgReg);
        // console.log("map and img", pagePicMapMatch, pagePicImgMatch);
        var mapHtml = "";
        var imgSrc = "";
        pagePicMapMatch && (mapHtml = pagePicMapMatch[0]);
        pagePicImgMatch && (imgSrc = pagePicImgMatch[1].replace('../../..', imgUrl));
        console.log("imgSrc", imgSrc);
        var areaReg = /<area\s+coords="(.*?)"[^>]+href="(.*?)"[^>]*>/ig;
        var area;
        var areaArray = []
        while ((area = areaReg.exec(mapHtml)) != null) {
          areaArray.push({ "coords": area[1].split(",").map(self.computeCoords), "href": area[2] });//href为当前版面每条文章的链接
        }
        console.log("areaArray ", areaArray);
        self.setData({
          // imgSrc: imgSrc,
          paperInfo: [{ "imgSrc": imgSrc, "areaArray": areaArray }]
        });
      }
    })
  },

  //判断点击区域是否在某coords内 cn方法
  //cn原理：过点向右做一条线，若与封闭图形边的交叉点的个数为偶数的话，则在该多边形外面，为奇数则在里面
  //两点确定一条直线的该直线方程为 一般方程为 Ax+By+C=0,(y2-y1)x+(x1-x2)y+(x2*y1-x1*y2)=0
  //两点式方程为(x-x1)/(x2-x1)=(y-y1)/(y2-y1)
  pointInRegin: function (point, coords) {
    //coords中每两个是一对坐标
    var count = 0;//统计目标点向右画射线与多边形相交次数
    var x = point[0];//用户触点x位置
    var y = point[1];//用户触点y位置
    var i = 0, j = 0;//j代表i的下一个坐标点
    //coords中确定一条直线的两点的坐标
    var xi = 0;
    var yi = 0;
    var xj = 0;
    var yj = 0;
    for (i = 0, j = coords.length - 2; i < coords.length - 1; j = i, i = i+2) {
      
      xi = coords[i];
      yi = coords[i + 1];
      xj = coords[j];
      yj = coords[j + 1];
      console.log("当前定点信息：",i , j , xi, yi, xj, yj);
      if (yi == yj) {continue; }//如果两点水平，则跳过
      if (y < Math.min(yi, yj)||y > Math.max(yi, yj)) {continue; }//如果触点低于该线段，则跳过
      if (x >= Math.max(xi, xj)) {continue; }//如果触点在该线段的右边，则跳过
      //该触点与coords所确定的区域有交叉，求该交叉点的x坐标的值
      var intersection_x = (xj - xi) * (y - yi) / (yj - yi) + xi;
      if (x < intersection_x) { count++; }//如果交叉点在触点的右边，相交次数加1
    }
    if (count % 2 == 0) { return false; }//在多边形外面或边上
    if (count % 2 == 1) { return true; }//在多边形里面

  },

  
  /**
  * 确定触点的文章
  * 返回文章的href
  * pagenum代表版面号（从1开始编号）
  */
  getArticleHref: function (fingerx, fingery, pagenum) {
    var self = this;

    var currentPageAreas = self.data.paperInfo[pagenum - 1].areaArray;
    var aresLength = currentPageAreas.length;
    // console.log("currentPageAreas,aresLength", currentPageAreas, aresLength);
    var i;
    var points = [];
    for (i = 0; i < aresLength; i++) {
      points = currentPageAreas[i].coords;
      if (self.pointInRegin([fingerx, fingery], points)) {
        console.log("找到href",currentPageAreas[i].href);
        return currentPageAreas[i].href;
      }else{console.log("未在当前coords内");}
    }
  },
  /**
* 点击跳转到相关文章
*/
  toArticle: function (e) {
    var self = this;
    var fingerx = e.detail.x;//x,y代表距离其父文档左上角的距离
    var fingery = e.detail.y; console.log("fingerx fingery", fingerx,fingery);
    var pagenum = e.target.dataset.pagenum;
    //获取触点所在的文章href
    var href = self.getArticleHref(fingerx, fingery, pagenum);
    if (href) {
      wx.navigateTo({
        url: "../article/article?newshref=" + href + "&pagenum=" + pagenum
      });
    }else{
      console.log("未找到文章id");
    }
  },
  //计算适合该设备的coords大小
  computeCoords: function (coord, index) {
    var self = this;
    var tmpCoord = parseInt(coord);
    if (index % 2 == 1) {//代表x坐标
      tmpCoord = Math.ceil(tmpCoord * (400 / self.data.windowWidth));
    }
    if (index % 2 == 0) {//代表y坐标
      tmpCoord = Math.floor(tmpCoord * (571 / self.data.windowHeight));
    }
    return tmpCoord;
  },
})
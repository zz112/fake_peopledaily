var articleObj = {};
var articleExtract = function (html, newsHref, pagenum) {
  articleObj["newshref"] = newsHref; //该文章的链接
  articleObj["pagenum"] = pagenum; //该文章所在版面编号
  var html = html.replace(/<br\/>/ig, "\r\n");
  // console.log(articleHtml);
  /*正则*/
  //文章部分
  var titleReg = /<div[^>]+class="text_c"[^>]*>[\s\S]+?<\/div>/i; //会匹配到class=lai的结束</div>为止，所以只能用标题部分的
  //来源部分
  var sourceReg = /<div[^>]+class="lai"[^>]*>([\s\S]+?)<\/div>/i;
  //正文图片
  var imgReg = /<table[^>]+class="pci_c"[^>]*>[\s\S]+?<\/table>/ig;
  //正文文章
  var contentReg = /<!--enpcontent--><p>[\s\S]*?<\/p><!--\/enpcontent-->/i;


  //中间变量
  // var articleHtml = articleMatch[0];//存放匹配的文章部分的html
  var titleHtml = "";
  var imgHtmlArray = ""; //存放匹配的正文图片部分的html
  var contentHtml = ""; //存放匹配的正文文章部分的html

  //正则匹配结果
  var titleMatch = html.match(titleReg); //存放匹配的文章的结果
  var sourceMatch = html.match(sourceReg); //存放的标题部分的html
  var imgMatch = html.match(imgReg); //存放匹配的正文图片部分的html
  var contentMatch = html.match(contentReg); //存放匹配的正文文章部分的html


  //结果变量
  var h1 = ""; //主标题
  var h2 = ""; //副标题
  var h3 = ""; //引标题
  var h4 = ""; //不知道代表啥标题
  var source = ""; //来源及日期
  var imgArray = []; //图片及图片说明
  var contentArray = []; //文章每段的内容

  //给中间变量赋值
  titleMatch && (titleHtml = titleMatch[0]);
  sourceMatch && (source = sourceMatch[1].replace(/\s+/g, ''));
  imgMatch && (imgHtmlArray = imgMatch);
  contentMatch && (contentHtml = contentMatch[0]);

  /***********图片***********************/
  if (imgHtmlArray) {
    var i;
    var imgSrc = ''
    var imgDesc = ''

    for (i = 0; i < imgHtmlArray.length; i++) {
      imgSrc = imgMatch[i].match(/<img src="(.*?)"[^]*>/i)[1].replace("../../../", 'http://paper.people.com.cn/rmrb/');
      imgDesc = imgMatch[i].match(/<p>([\s\S]*?)<\/P>/i)[1]
      imgArray.push({
        imgSrc: imgSrc,
        imgDesc: imgDesc
      })
    }
    console.log("图片匹配", imgArray);
  }

  /*************标题*********************/
  h1 = titleHtml.match(/<h1>([\s\S]+?)<\/h1>/i)[1]; //标题肯定存在，所以用 +
  h2 = titleHtml.match(/<h2>([\s\S]*?)<\/h2>/i)[1] //副标题不一定存在，所以用 *
  h3 = titleHtml.match(/<h3>([\s\S]*?)<\/h3>/i)[1] //引标题不一定存在，所以用 *
  h4 = titleHtml.match(/<h4>([\s\S]*?)<\/h4>/i)[1] //h4不知道是啥标题，所以用 *
  console.log("标题 ", h1);
  console.log("副标题 ", h2);
  console.log("引标题 ", h3);
  console.log("不知道是啥的h4 ", h4);
  console.log("来源", source);
  console.log("图片列表", imgHtmlArray);
  console.log("文章段落列表", contentHtml);

  /*************正文*********************/
  if (contentHtml) {
    var contents = contentHtml.match(/<p>.*?<\/p>/ig);
    var p = {};
    var text = "";
    var strong = "strong";

    //某些新闻没有正文内容（比如广告，只有一张图片），因此需要判断一下
    if (contents) {
      for (i = 0; i < contents.length; i++) {
        var currentP = contents[i];
        text = currentP.match(/<p>(.*?)<\/p>/i)[1].replace(/(&nbsp;)+/g, '\t');
        if ((text.indexOf('STRONG') != -1) || (text.indexOf('FONT') != -1)) {
          text = text.match(/<strong>(.*?)<\/strong>/i)[1].replace(/(&nbsp;)+/g, '\t');
          contentArray.push({ "text": text, "strong": strong });
        } else {
          contentArray.push({ "text": text });
        }
      }
    }
  }

  articleObj["titleObj"] = {
    title: h1,
    sub: h2,
    quote: h3,
    unknown: h4,
    source: source
  }
  articleObj["imgArray"] = imgArray

  articleObj['contentArray'] = contentArray;

  return articleObj
  /*
    //图片或其他
    var attachmentReg = /<([-A-Za-z0-9_]+)\s+class="[^>]*attachment"[^>]*>[\s\S]*<\/\1>(?=\s+<div class="article-content" id="APP-Content">)/ig;
    //正文
    var contentReg = /<([-A-Za-z0-9_]+)\s+class="[^>]*article-content"[^>]*>[\s\S]*?<\/\1>/i;
    //匹配结果
    //标题
    var titles = html.match(titleReg);
    var attachment = html.match(attachmentReg);
    var content = html.match(contentReg);
    var titleObj = {};
    //如果匹配的结果存在
    if (titles) {
      //引标题
      var tmpIntrotitle = titles[0].match(/<([-A-Za-z0-9_]+)\s+[-A-Za-z0-9_]+=".*"\s+id="[^>]*APP-PreTitle"[^>]*>([\s\S]*?)<\/\1>/i);
      //正标题
      var tmpTitle = titles[0].match(/<([-A-Za-z0-9_]+)\s+id="[^>]*APP-Title"[^>]*>([\s\S]*?)<\/\1>/i);
      //副标题
      var subTitle = titles[0].match(/<([-A-Za-z0-9_]+)\s+[-A-Za-z0-9_]*=".*"\s+id="[^>]*APP-Subtitle"[^>]*>([\s\S]*?)<\/\1>/i);
      var authors = titles[0].match(/<([-A-Za-z0-9_]+)\s+[-A-Za-z0-9_]*=".*"\s+id="[^>]*APP-Author"[^>]*>([\s\S]*?)<\/\1>/i);
      // console.log("titles", titles)
      //如果以上标题内容都存在，则进行赋值，内容都在匹配结果的第二个分组中
      tmpIntrotitle && (titleObj["introTitle"] = tmpIntrotitle[2]);
      tmpTitle && (titleObj["title"] = tmpTitle[2]);
      subTitle && (titleObj["subTitle"] = subTitle[2]);
      authors && (titleObj["authors"] = authors[2]);
      // console.log('titleObj', titleObj);
      articleObj["titleObj"] = titleObj;
    }
    if (attachment) {
      console.log("attachment", attachment);
      //高级资源，如图片等
      var attachments = attachment[0].match(/<([-A-Za-z0-9_]+)\s+class="[^>]*attachment-image APP-Image"[^>]*>[\s\S]*?<\/\1>/ig);
      if (attachments) {
        var i;
        var imgArray = [];
  
        var imgSrc = '';//图片的连接
        var imgAlt = '';//图片的说明，如果有的话
  
        for (i = 0; i < attachments.length; i++) {
          var currentAtt = attachments[i];
          console.log('currentAtt', currentAtt);
  
          if (currentAtt.indexOf('TABLE') != -1) {
            var tdReg = /<td>[\s\S]*?<\/td>/ig;
            var tds = currentAtt.match(tdReg);
            console.log('tds', tds);
            imgSrc = tds[0].match(/<img src="(.*?)"[^>]*>/i)[1].replace("../../../", 'http://www.81.cn/jfjbmap/');
            imgAlt = tds[1].match(/<td>([\s\S]*?)<\/td>/i)[1].toString();
  
          } else {
            //一种情况是img标签直接写在class=attachment-image APP-Image的div内
            //这种情况的图片说明 情况暂时不明
            imgSrc = currentAtt.match(/<img src="(.*?)"[^>]*>/i)[1].replace("../../../", 'http://www.81.cn/jfjbmap/');
          }
          imgArray.push({ "imgSrc": imgSrc, "imgAlt": imgAlt });
  
        }
      }
      articleObj["imgArray"] = imgArray;
    }
    if (content) {
      console.log("content", content);
      var contentArray = [];
      var contents = content[0].match(/<p>.*?<\/p>/ig);
      var p = {};
      var text = "";
      var strong = "strong";
      //某些新闻没有正文内容（比如广告，只有一张图片），因此需要判断一下
      if (contents) {
        for (i = 0; i < contents.length; i++) {
          var currentP = contents[i];
          text = currentP.match(/<p>(.*?)<\/p>/i)[1].replace(/(&nbsp;)+/g, '\t');
          if ((text.indexOf('STRONG') != -1) || (text.indexOf('FONT') != -1)) {
            text = text.match(/<strong>(.*?)<\/strong>/i)[1].replace(/(&nbsp;)+/g, '\t');
            contentArray.push({ "text": text, "strong": strong });
          } else {
            contentArray.push({ "text": text });
          }
        }
        articleObj['contentArray'] = contentArray;
      }
  
    }
    return articleObj;*/
}

module.exports = articleExtract;
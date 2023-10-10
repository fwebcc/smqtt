var DEFAULT_VERSION = "11.0";
var ua = navigator.userAgent.toLowerCase();
var isIE = ua.indexOf("msie") > -1;
var safariVersion;
if (isIE) {safariVersion = ua.match(/msie ([\d.]+)/)[1];} //获取浏览器版本号 
//若版本号低于IE9，则跳转到如下页面
if (safariVersion * 1 <= DEFAULT_VERSION * 1) {window.location.href = "/browser"; }//提示页面（修改路径）

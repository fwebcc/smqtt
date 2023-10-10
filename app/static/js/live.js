//直播转换只支持H264格式
LIVE_STAT='s';
LIVE_STAT_ID='';
function live_ffmpeg(id,mode,title,Publish){
      np='<div class="container mt-3">'+ 
               '<div class="d-flex justify-content-between mb-3 alert alert-success">'+
                   '<div class="p-2">'+title+'</div>'+
                   '<div class="p-2"><div id="cat_log_but_page"></div></div>'+
                   '<div class="p-2"><div id="live_close"></div></div>'+
               '</div>'+          
               '<div id="d_Time_page"></div><div id="live_video_dir"></div><div id="live_log_dir"></div>'+
          '</div>';
      $("#mpage").html(np); 

      if(Publish.indexOf("rtsp")!=-1){
            d_C_Time();
            N_ID='live_'+id;
            stat_movie('live_ffmpeg_start',Publish,N_ID);
            url='../'+N_ID+'.m3u8';
            //close_but='<a href="javascript:void(0);" onclick = "stat_movie(\'live_ffmpeg_stop\',\'y\',\''+N_ID+'\')"  class="text-dange"><i class="fa fa-close text-dange" style="font-size:35px"></i></a>';
            cat_log_but='<a href="javascript:void(0);" onclick = "cat_log(\''+N_ID+'\')"  class="text-dange"><i class="fa fa-search text-dange"></i></a>';
            //$("#live_close").html(close_but); 
            $("#live_close").html(cat_log_but); 
            LIVE_STAT='y';
            LIVE_STAT_ID=N_ID;
            setTimeout(function() {tomovie(url);}, 6000);
      }else{
            url=Publish;
            tomovie(url);
      };      

}
function stat_movie(stat,url=n,id) {
   if (url!='n'){
    data = {"mode": "get_cmd_sh","keywords": stat+' '+url+' '+id};
    get_ajax('/API',data);
    if(url=='y'){$("#mpage").html('后台视频已关闭!');$('#myModal').modal('hide');}
 }
}
//倒计时
function d_C_Time() {
               var count = 6;
               var countdown = setInterval(function() {
               // 将计时器显示在页面上
               $("#d_Time_page").html("<div class='alert alert-primary'>正在连接：" + count + "秒</div>");
               count--;
               // 倒计时结束时清除计时器
               if (count === -1) {
                 clearInterval(countdown);
                    $("#d_Time_page").empty();
               }}, 1000);
}
//监听模态框关闭
$(function() {
    $('#myModal').on('hide.bs.modal',
    function() {
        if (LIVE_STAT=='y'){LIVE_STAT='s';stat_movie('live_ffmpeg_stop','y',LIVE_STAT_ID)}
        })
});

function cat_log(d) {
    data = {"mode": "get_cmd_sh","keywords": 'cat_log '+d};
    bak=get_ajax('/API',data);
            cat_log_close_but='<div class="float-md-right"><a href="javascript:void(0);" onclick = "cat_log_close_d()"  class="text-dange"><i class="fa fa-close text-dange" style="font-size:35px"></i></a></div><hr>';
    if(bak.info=='y'){$("#live_log_dir").html(cat_log_close_but+'<div>'+bak.data.replace(/[\n]/g,'<br>'))+'</div>';}

}
function cat_log_close_d() {$("#live_log_dir").empty()}
function tomovie(path) {
  to_page_live='<video id="video" width="100%" height="350px" controls crossorigin="anonymous" preload="auto"></video>'
  $("#live_video_dir").html(to_page_live);
  $.get('../static/js/hls.js', function(content) {
      var video = document.getElementById("video");
      if (Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(path);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
           video.play();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = path;
        video.addEventListener("loadedmetadata", function () {
          video.play();
        });
     }
 })
}

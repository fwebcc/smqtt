//浏览器定位信息获取
latitude='';
longitude='';
//定位数据获取成功响应
function  onSuccess(p){
      map_rec(p.coords.latitude,p.coords.longitude)
      latitude=p.coords.latitude;
      longitude=p.coords.longitude;
}
//定位数据获取失败响应
function onError(error) {
  switch(error.code)
  {
    case error.PERMISSION_DENIED:
    $("#idname").html("您拒绝对获取地理位置的请求");
    break;
    case error.POSITION_UNAVAILABLE:
    $("#idname").html("位置信息是不可用的");
    break;
    case error.TIMEOUT:
    $("#idname").html("请求您的地理位置超时");
    break;
    case error.UNKNOWN_ERROR:
    $("#idname").html("请求您的地理位置发生未知错误");
    break;
  }
};
MAP_topic='';
map_auto();
function map_auto(){
        json=SETUP_JSON.key.uuid;
        isrec='n';
        MAP_topic='';
        browser='';
        for(var i=0,l=json.length;i<l;i++){
             if(b_name2==json[i].id){isrec=json[i].RecordIP;MAP_topic=json[i].topic;browser=json[i].browser}
        };
        if(isrec=='y'){
                      //浏览器定位信息获取
                      if(navigator.geolocation){navigator.geolocation.getCurrentPosition(onSuccess , onError,{enableHighAccuracy: true,timeout: 2000,maximumAge: 1000});}
        };
        $("#idname").html(browser);
}
//自动记录浏览器定位
function map_rec(lo,la){
       if (isEmpty(lo) == true){
               tzlocal=get_ajax('/API',{"mode": "format_offset"});
               if(tzlocal.info=='y'){
                    bak={'la':tzlocal.data.latitude,'lo':tzlocal.data.longitude} 
              }else{
                    bak={'la':0,'lo':0} 
              }
       }else{
               bak={'la':la,'lo':lo} 
       }

       //t_m_d='{"lon":"'+ bak.lo+'","lat":"'+bak.la+'","mod":"gps"}';//JSON.stringify()
       t_m_d={
              lng:bak.la,
              lat:bak.lo,
              mod:'gps'
       }
       var data = {"topic": MAP_topic+'/'+b_name2, "message":JSON.stringify(t_m_d), "qos": 1};
       T_socket.emit('publish', data = data);
}

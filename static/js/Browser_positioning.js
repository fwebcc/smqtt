//定位数据获取成功响应
longitude='';
latitude='';
function  onSuccess(p){
               longitude=p.coords.longitude;
               latitude=p.coords.latitude;
               window.setTimeout(LOCL_GO(latitude,longitude,'gps'),1000);

}

//定位数据获取失败响应
function onError(error) {
  switch(error.code)
  {
    case error.PERMISSION_DENIED:
    $("#idname").html("您拒绝地理位置的请求");
    break;
    case error.POSITION_UNAVAILABLE:
    $("#idname").html("位置信息取不到");
    break;
    case error.TIMEOUT:
    $("#idname").html("请求位置超时");
    break;
    case error.UNKNOWN_ERROR:
    $("#idname").html("请求您的地理位置发生未知错误");
    break;
  }
};
MAP_topic='';
b_uuid='';
browser='';
map_auto();
function map_auto(){
        json=SETUP_JSON.key.uuid;
        isrec='n';
        MAP_topic='';
        browser='';
        b_uuid='';
        for(var i=0,l=json.length;i<l;i++){
             if(b_name2==json[i].id){isrec=json[i].RecordIP;MAP_topic=json[i].topic;browser=json[i].browser;b_uuid=json[i].id}
        };
        $("#idname").html(browser); 
        if(isrec=='y'){
                      //浏览器定位信息获取
                      
                      if(navigator.geolocation){
                          navigator.geolocation.getCurrentPosition(onSuccess , onError,{enableHighAccuracy: true,timeout: 3000,maximumAge: 1000});
                      }else{
                          
                          //map_rec(MAP_topic,latitude,longitude,'locl',b_uuid);
                           locl='locl' 
                           longitude=SETUP_JSON.conf.longitude.v;
                           latitude=SETUP_JSON.conf.latitude.v;
  
                           window.setTimeout(LOCL_GO(longitude,latitude,locl),1000);

                      }

 }
}
function LOCL_GO(lo,la,m){return function(){map_rec(lo,la,m);}}
//自动记录浏览器定位
//console.log(browser)
function map_rec(lo,la,m){
       t_m_d={
              lng:la,
              lat:lo,
              mod:m
       }
       data = {"topic": MAP_topic+'/'+browser, "message":JSON.stringify(t_m_d), "qos": 0};
       if(isEmpty(b_uuid) != true){T_socket.emit('rec_maps', data = data);}
   }

//地图定位
function map_get(){
    page="<div id='allmap' style='overflow: hidden;width:100%;height:500px;margin: 0;border:#ccc solid 1px;'>"+LOADING+"</div>"    
          +"<div id='list_map'></div>"
          +"<div id='val_map' class='text-danger'></div>"
    $('#page_list').html(page)
    MtitlePOPMOD='n';

}
//页面显示设备名称
$.getScript("../static/js/TrackAnimation.min.js") 
$.getScript("../static/js/WGS_BD09.js") 
URL_BAIDU_MAPS='https://api.map.baidu.com/api?type=webgl&v=3.0&ak='+SETUP_JSON.conf.BaiduAK.v+'&callback=TO_IP_MAPS'
$.getScript(URL_BAIDU_MAPS)

Tdata={};
map='';
function TO_IP_MAPS(){
   data = SETUP_JSON.conf
   vlat=data.latitude.v;
   vlng=data.longitude.v;
   //CONF_EBAKV=map_edit2('gps',vlng,vlat);//GPS->BADU修正
   B_EBAKV=map_edit2('gps',longitude,latitude);//GPS->BADU修正

   if(MtitlePOPMOD=='n'){map = new BMapGL.Map('allmap');}else{map = new BMapGL.Map('MAP_POP');}   
   map.centerAndZoom(new BMapGL.Point(vlng, vlat), 8);
   map.enableScrollWheelZoom(true);
   window.map = map;
   if(MtitlePOPMOD=='n'){
        Tdata={
	  "menu": [
                    // {
			//"lat":vlat,
			//"lng": vlng,
			//"title": "您的位置",
			//"mod": "gps",
                       // "time":getTime_dir2()
		   //}
               ]
          }
        if(isEmpty(latitude)==false){
           ADD_dATA={
			"lat":B_EBAKV.lat,
			"lng":B_EBAKV.lng,
			"title": "浏览器定位",
			"mod": "gps",
			"time":getTime_dir2()
                  }
          Tdata.menu.push(ADD_dATA);
       };
       $.each(L_LIST.data, function(i, x) {
         if(x.mode=='map'){
             if (isEmpty(x.stat)==false){
                       SNGPS=$.parseJSON(x.stat.replace(/'/g, '"'));
                       SBAKV=map_edit2(SNGPS.mod,SNGPS.lng,SNGPS.lat);//GPS->BADU修正
               SBEI={'lat':SBAKV.lat,
                   'lng':SBAKV.lng,
                   'title':x.title,
                   'mod':SNGPS.mod,
                   'time':getTime_dir2()
               };
               Tdata.menu.push(SBEI);
             }
         }
       })
   }else{
         tiao=Every*2;
         data2={'mode':'table_to_sec','tablename':'Rec_stat','d1':0,'d2':tiao,'keywords':MtitlePOPMOD,'title':'title'};	
         bdata=get_ajax('/API',data2);
         if (bdata.data!='n'){
                 var npoints = [];
                 bdata2 =bdata.data.reverse();
                 $.each(bdata2, function(i, x) { 
                       NGPS=$.parseJSON(x.stat.replace(/'/g, '"'));
                       EBAKV=map_edit2(NGPS.mod,NGPS.lng,NGPS.lat);//GPS->BADU修正
                       npoints.push({'lng':EBAKV.lng, 'lat':EBAKV.lat, 'mod':EBAKV.mod});
                 });     
                 pl = new BMapGL.Polyline(npoints);
                 setTimeout('maps_start()', 3000);
         }

   }
   if(MtitlePOPMOD=='n'){
          MAKE_MAPS(vlat,vlng);
          GO_MAP_list(vlng,vlat,'您填写的位置','n')
   }else{
         const point = new BMapGL.Point(vlng, vlat);
         const geo = new BMapGL.Geocoder();
         markerx = new BMapGL.Marker(point); 
         map.addOverlay(markerx);
         map.panTo(point);
         MAP_label(vlng, vlat,vlng, vlat,MtitlePOPMOD,'gps');  
   }
};
function maps_start(){
        trackAni = new BMapGLLib.TrackAnimation(map, pl, {
            overallView: true,
            tilt: 30,
            duration: 20000,
            delay: 300
        });
        trackAni.start();
}
function MAKE_MAPS(vlat,vlng) {
   list=''
   $.each(Tdata.menu, function(i, x) {
      GO_MAP_list(x.lng,x.lat,x.title,x.mod);
      list+='<li class="list-group-item""><a href="javascript:void(0);" onclick="map.clearOverlays();GO_MAP_list(\''+x.lng+'\',\''+x.lat+'\',\''+x.title+'\',\'n\');"><i class="fa fa-clock-o"></i> '+x.time+' <i class="fa fa-globe"></i>'+x.lng+','+x.lat+'<i class="fa fa-tablet text-danger"></i> '+x.title+'</a></li>'
   })
   list2='<li class="list-group-item"><z><a href="javascript:void(0);" onclick="map.clearOverlays();GO_MAP_list(\''+vlng+'\',\''+vlat+'\',\'您填写的位置\',\'n\');"><i class="fa fa-globe"></i>'+vlng+','+vlat+'<i class="fa fa-tablet text-danger"></i>您填写的位置</a></z></li>'
   $("#list_map").html("<ul class='list-group'>"+list2+list+'</div><div id="li_map"></div></ul>');
   map.addEventListener('click', function (e) {
          map.clearOverlays(); 
          $("#li_map").html('<li class="list-group-item list-group-item-danger"><a href="javascript:void(0);" onclick="map.clearOverlays();GO_MAP_list(\''+e.latlng.lng+'\',\''+e.latlng.lat+'\',\'拾取坐标\',\'n\')"><i class="fa fa-globe"></i>拾取坐标：' + e.latlng.lng + ',' + e.latlng.lat+'</a></li>')
   });
}
//点击坐标出现标注
function GO_MAP_list(lng,lat,title,mod) {
        //map.clearOverlays(); 
        EBAKV=map_edit2(mod,lng,lat);//GPS->BADU修正
        Xlng=EBAKV.lng;
        Xlat=EBAKV.lat;
        map.centerAndZoom(new BMapGL.Point(Xlng,Xlat),18);

        const point = new BMapGL.Point(lng,lat);
        const geo = new BMapGL.Geocoder();
        markerx = new BMapGL.Marker(point); 
        map.addOverlay(markerx);
        map.panTo(point); 
        MAP_label(Xlng,Xlat,lng,lat,title,mod) 
}
function MAP_label(Xlng,Xlat,lng,lat,title,mod) {
      var opts = {
        position: new BMapGL.Point(Xlng,Xlat),
        offset: new BMapGL.Size(30, -30)
      };
      var label = new BMapGL.Label('<a href="javascript:void(0);" onclick="map.clearOverlays();GO_MAP_list(\''+lng+'\',\''+lat+'\',\''+title+'\',\'n\');">'+title+'</a>', opts);
      label.setStyle({
        color: 'blue',
        borderRadius: '5px',
        borderColor: '#ccc',
        padding: '10px',
        fontSize: '16px',
        height: '30px',
        lineHeight: '10px',
        fontFamily: '微软雅黑'
      });
      map.addOverlay(label);
}

//百度地图修正精确代码
function map_edit2(mod,lng,lat){
          if(mod=='gps'){   
               cWGS=new Convertor();
               BAK=cWGS.WGS2BD09({'lng':parseFloat(parseFloat(lng).toFixed(6)),'lat':parseFloat(parseFloat(lat).toFixed(6))});
          }else{
               BAK={'lng':parseFloat(parseFloat(lng).toFixed(6)),'lat':parseFloat(parseFloat(lat).toFixed(6))}
          }
          return BAK   
}
function getTime_dir2(){ 
      var dateTime = new Date(+new Date()+8*3600*1000);
      return new Date(dateTime).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
}
function MPS_Listener() {
   //拾取坐标点<a href="javascript:void(0);" onclick="MPS_Listener()">坐标拾取</a>
   map.addEventListener('click', function (e) {//console.log(e)
          map.clearOverlays(); 
          $("#li_map").html('<li class="list-group-item list-group-item-danger"><a href="javascript:void(0);" onclick="map.clearOverlays();GO_MAP_list(\''+e.latlng.lng+'\',\''+e.latlng.lat+'\',\'♥\',\'n\')"><i class="fa fa-globe"></i>' + e.latlng.lng + ',' + e.latlng.lat+'</a></li>')
          var new_point = new BMapGL.Point(e.latlng.lng,e.latlng.lat);
          var markerx = new BMapGL.Marker(new_point); 
          map.addOverlay(markerx);
          map.panTo(new_point);    
          MAP_label(e.latlng.lng, e.latlng.lat,e.latlng.lng, e.latlng.lat,'♥','n') 
          new_point = new BMapGL.Marker(new BMapGL.Point(e.latlng.lng,e.latlng.lat));
          map.addOverlay(new_point);

  });

}

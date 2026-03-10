    if(XMODE=='y'){
        GVAL={'lng':longitude,'lat':latitude}
    }else{
        GVAL=map_edit2('gps',longitude,latitude);
    };

function TO_IP_MAPS(){
    var map = new BMapGL.Map("container2");
    map.centerAndZoom(new BMapGL.Point(GVAL.lng,GVAL.lat),15);
    map.enableScrollWheelZoom(true);
///////////////
    MAPLD=[]
    TOMAPVAL={'lng':GVAL.lng,'lat':GVAL.lat,'title':Xtitle}
    data_m2={'mode':'table_to_title','tablename':'list','keywords':'map','title':'mode'};	
    bdata_m2=get_ajax('/API',data_m2);
    if (bdata_m2['info']!='n'){
        $.each(bdata_m2['data'], function(i, x) {
             data_m3={'mode':'table_to_one','tablename':'Rec_stat','keywords':'listid','title':x.ID};	
             bdata_m3=get_ajax('/API',data_m3);
             if (bdata_m3['info']!='n'){
                     LSIDVAL=JSON.parse(bdata_m3['data']['stat'].replace(/'/g, '"'))
                     ioc='<i class="fa fa-map-marker text-danger" style="font-size:48px;"></i><p class="badge badge-secondary">'+bdata_m3['data']['title']+'</p>'
                     if (LSIDVAL.mod=='gps'){
                                   EBAKV=map_edit2(LSIDVAL.mod,parseFloat(LSIDVAL.lng),parseFloat(LSIDVAL.lat))
                                   MAPLD.push({'lng':EBAKV.lng,'lat':EBAKV.lat,'title':bdata_m3['data']['title']});
                     }else{
                                   MAPLD.push({icon:ioc,position:[parseFloat(LSIDVAL.lng), parseFloat(LSIDVAL.lat)]});
                     }
             }else{
                     MAPLD.push(TOMAPVAL);
             }
        });
        MAPLD.push(TOMAPVAL);
    }else{
        MAPLD.push(TOMAPVAL);
    }
    //console.log(MAPLD)
    $.each(MAPLD, function (n, m) {
         map_make(map,m.title,m.lng,m.lat)
    })

///////////////
    map.addEventListener('click', function (e) {
       map.clearOverlays(); 
       map_make(map,'拾取坐标',e.latlng.lng,e.latlng.lat)
       $("#val_map").html('<li class="list-group-item list-group-item-danger"><a href="javascript:void(0);" onclick=""><i class="fa fa-globe"></i>拾取坐标：' + e.latlng.lng + ',' + e.latlng.lat+'</a></li>')
    });

}

//创建标记点
function map_make(map,title,lng,lat){
    map.addOverlay(new BMapGL.Marker(new BMapGL.Point(lng,lat)));
    map.addOverlay(new BMapGL.Label(title,{position: new BMapGL.Point(lng,lat),offset: new BMapGL.Size(10, -30)}));

}
//百度地图修正精确代码
function map_edit2(mod,lng,lat){
          if(mod=='gps'){   
               CWGS=new Convertor();
               BAK=CWGS.WGS2BD09({'lng':parseFloat(parseFloat(lng).toFixed(6)),'lat':parseFloat(parseFloat(lat).toFixed(6))});
          }else{
               BAK={'lng':parseFloat(parseFloat(lng).toFixed(6)),'lat':parseFloat(parseFloat(lat).toFixed(6))}
          }
          return BAK   
}

function TO_MOVE_PAGE(){
  page='<div class="text-white">'+
    '<p >轨迹回放控制'+
        '<a href="javascript:void(0);" class="text-white" value="开始动画" id="start" onclick="startAnimation()"/><i class="fa fa-play-circle" style="font-size:24px"></i></a>'+
        '<a href="javascript:void(0);" class="text-white" value="暂停动画" id="pause" onclick="pauseAnimation()"/><i class="fa fa-pause-circle" style="font-size:24px"></i></a>'+
        '<a href="javascript:void(0);" class="text-white" value="继续动画" id="resume" onclick="resumeAnimation()"/><i class="fa fa-check-circle" style="font-size:24px"></i></a>'+
        '<a href="javascript:void(0);" class="text-white" value="停止动画" id="stop" onclick="stopAnimation()"/><i class="fa fa-stop-circle" style="font-size:24px"></i></a>'+
  '</p></div>'
  $('#MPSMOVEINFO').html(page)
}

function TO_MOVE_MAPS2(id){
         tiao=Every*2;
         data2={'mode':'table_to_sec','tablename':'Rec_stat','d1':0,'d2':tiao,'keywords':id,'title':'listid'};	
         bdata=get_ajax('/API',data2);
         var npoints = [];
         if (bdata.data!='n'){

                 bdata2 =bdata.data;
                 $.each(bdata2, function(i, x) { //.reverse()
                       NGPS=$.parseJSON(x.stat.replace(/'/g, '"'));
                       if (NGPS.mod=='gps'){
                          EBAKV=map_edit2(NGPS.mod, parseFloat(NGPS.lng),parseFloat(NGPS.lat))//GPS->GAODE修正
                          npoints.push({ 'lng':EBAKV.lng,'lat': EBAKV.lat});
                       }else{
                          npoints.push({ 'lng':NGPS.lng,'lat': NGPS.lat});
                       }
                 });     
         }else{
                 npoints=''
         }
     console.log(npoints)
///////////////
var bmap = new BMapGL.Map("container");
bmap.centerAndZoom(new BMapGL.Point(GVAL.lng,GVAL.lat), 17);
bmap.enableScrollWheelZoom(true);
var path = npoints;
var point = [];
for (var i = 0; i < path.length; i++) {
    point.push(new BMapGL.Point(path[i].lng, path[i].lat));
}
var pl = new BMapGL.Polyline(point);
setTimeout('start()', 3000);
trackAni = new BMapGLLib.TrackAnimation(bmap, pl, {
    overallView: true,
    tilt: 30,
    duration: 20000,
    delay: 300
});
}
function startAnimation () {
    trackAni.start();
}
function pauseAnimation () {
    trackAni.pause();
}
function resumeAnimation () {
    trackAni.continue();
}


function TO_IP_MAPS(){
    if(XMODE=='y'){
        GVAL={'longitude':longitude,'latitude':latitude}
    }else{
        GVAL=transformFromWGSToGCJ(parseFloat(latitude), parseFloat(longitude))
    };

     marker,map = new AMap.Map('container2', {
        resizeEnable: true,
        center: [GVAL.longitude,GVAL.latitude],
        zoom: 13
    });
    map.clearMap();  // 清除地图覆盖物

    markers=[]
    TOMAPVAL={icon: '<i class="fa fa-map-marker text-danger" style="font-size:48px;"></i><p class="badge badge-secondary">'+Xtitle+'</p>',position: [GVAL.longitude,GVAL.latitude]}
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
                                   EBAKV=transformFromWGSToGCJ(parseFloat(LSIDVAL.lat), parseFloat(LSIDVAL.lng))//GPS->GAODE修正
                                   markers.push({icon:ioc,position:[EBAKV.longitude,EBAKV.latitude]});
                     }else{
                                   markers.push({icon:ioc,position:[parseFloat(LSIDVAL.lng), parseFloat(LSIDVAL.lat)]});
                     }
             }else{
                     markers.push(TOMAPVAL);
             }
        });
        markers.push(TOMAPVAL);
    }else{
        markers.push(TOMAPVAL);
    }
    // 添加一些分布不均的点到地图上,地图上添加三个点标记，作为参照
    markers.forEach(function(marker) {
        new AMap.Marker({
            map: map,
            content: marker.icon,
            position: [marker.position[0], marker.position[1]],
            offset: new AMap.Pixel(-13, -30)
        });
    });

        var center = map.getCenter();
        map.setFitView(null, false, [150, 60, 100, 60]);
        var newCenter = map.getCenter();
    map.on('click', function(e) {
        map.remove(marker2);
        page='<div class="alert alert-secondary"><i class="fa fa-globe"></i>拾取的坐标: '+e.lnglat.getLng() + ',' + e.lnglat.getLat()+'</div>'
        $('#val_map').html(page)

        var markerContent2 = 
          '<div class="custom-content-marker">' +
          '<i class="fa fa-map-marker text-primary" style="font-size:48px;"></i>' +
          '<div class="badge badge-primary" ><i class="fa fa-globe"></i>拾取的坐标</div>' +
          '</div>';
        position2 = new AMap.LngLat(e.lnglat.getLng(),e.lnglat.getLat());
        marker2 = new AMap.Marker({
          position: position2,
          content: markerContent2,
          offset: new AMap.Pixel(-12, -48)
        });
        map.add(marker2);
    });
}
    // 清除 marker
    function clearMarker() {
        map.remove(marker2);
    }
//轨迹
function TO_MOVE_MAPS2(id){
         tiao=Every*2;
         data2={'mode':'table_to_sec','tablename':'Rec_stat','d1':0,'d2':tiao,'keywords':id,'title':'listid'};	
         bdata=get_ajax('/API',data2);
         var npoints = [];
         if (bdata.data!='n'){

                 bdata2 =bdata.data;
                 $.each(bdata2, function(i, x) { //.reverse()

let raw = x.stat.trim();
let cleaned = raw.replace(/^['"]|['"]$/g, '');
let v1 = cleaned.replace(/'/g, '"');
try {
    NGPS = JSON.parse(v1);
} catch (e) {
    console.error("解析失败，清洗后的字符串为:", v1);
}                    


                       if (NGPS.mod=='gps'){
                          EBAKV=transformFromWGSToGCJ(parseFloat(NGPS.lat), parseFloat(NGPS.lng))//GPS->GAODE修正
                          npoints.push([EBAKV.longitude,EBAKV.latitude]);
                       }else{
                          npoints.push([NGPS.lng,NGPS.lat]);
                       }
                 });     
         }else{
                 npoints=[[116.478935,39.997761],[116.478939,39.997825],[116.478912,39.998549],[116.478912,39.998549],[116.478998,39.998555],[116.478998,39.998555],[116.479282,39.99856],[116.479658,39.998528],[116.480151,39.998453],[116.480784,39.998302],[116.480784,39.998302],[116.481149,39.998184],[116.481573,39.997997],[116.481863,39.997846],[116.482072,39.997718],[116.482362,39.997718],[116.483633,39.998935],[116.48367,39.998968],[116.484648,39.999861]];

         }
    AMap.plugin('AMap.MoveAnimation', function(){
        var marker, lineArr =npoints;
        var map = new AMap.Map("container", {
            resizeEnable: true,
            center: npoints[0],
            zoom: 17
        });

        marker = new AMap.Marker({
            map: map,
            position: npoints[npoints.length - 1],
            icon: "../static/img/car.png",
            offset: new AMap.Pixel(-13, -26),
        });

        // 绘制轨迹
        var polyline = new AMap.Polyline({
            map: map,
            path: lineArr,
            showDir:true,
            strokeColor: "#28F",  //线颜色
            // strokeOpacity: 1,     //线透明度
            strokeWeight: 6,      //线宽
            // strokeStyle: "solid"  //线样式
        });

        var passedPolyline = new AMap.Polyline({
            map: map,
            strokeColor: "#AF5",  //线颜色
            strokeWeight: 6,      //线宽
        });


        marker.on('moving', function (e) {
            passedPolyline.setPath(e.passedPath);
            map.setCenter(e.target.getPosition(),true)
        });

        map.setFitView();

        window.startAnimation = function startAnimation () {
            marker.moveAlong(lineArr, {
                // 每一段的时长
                duration: 500,//可根据实际采集时间间隔设置
                // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
                autoRotation: true,
            });
        };
        window.pauseAnimation = function (){
            marker.pauseMove();
        };

        window.resumeAnimation = function () {
            marker.resumeMove();
        };

        window.stopAnimation = function () {
            marker.stopMove();
        };

    });
}
// 实例化点标记
function addMarker() {
      if (!marker) {
        marker = new AMap.Marker({
          icon: "../static/img/poi-marker-red.png",
          position: [parseFloat($('#lat').val()),parseFloat($('#lng').val())],
          offset: new AMap.Pixel(-13, -30)
        });
     marker,map = new AMap.Map('container2', {
        resizeEnable: true,
        center: [parseFloat($('#lat').val()),parseFloat($('#lng').val())],
        zoom: 13
    });

        marker.setMap(map);
      }
    map.on('click', function(e) {
        map.remove(marker2);
        page='<div class="alert alert-secondary"><i class="fa fa-globe"></i>拾取的坐标: '+e.lnglat.getLng() + ',' + e.lnglat.getLat()+'</div>'
        $('#val_map').html(page)

        var markerContent2 = 
          '<div class="custom-content-marker">' +
          '<i class="fa fa-map-marker text-primary" style="font-size:48px;"></i>' +
          '<div class="badge badge-primary" ><i class="fa fa-globe"></i>拾取的坐标</div>' +
          '</div>';

        position2 = new AMap.LngLat(e.lnglat.getLng(),e.lnglat.getLat());
        marker2 = new AMap.Marker({
          position: position2,
          content: markerContent2,
          offset: new AMap.Pixel(-12, -48)
        });
        map.add(marker2);
    });

}
 
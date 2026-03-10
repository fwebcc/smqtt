//地图定位
if(isEmpty(latitude)==false){
           longitude=longitude;
           latitude=latitude;
           Xtitle='浏览器定位';
           XMODE='gps';
}else{
           data = SETUP_JSON.conf
           longitude=data.longitude.v;
           latitude=data.latitude.v;
           Xtitle='您填写的位置';
           XMODE='y';
}
marker2 ='';
marker='';map=''
function map_get() {
    // 1. 使用模板字面量，解决引号嵌套痛苦，方便后期维护
    const inputv = `
        <div class="form-inline">
            <label class="mb-2 mr-sm-2">经度:</label>
            <input type="text" class="form-control mb-2 mr-sm-2" id="lat" value="116.406315">
            
            <label class="mb-2 mr-sm-2">纬度:</label>
            <input type="text" class="form-control mb-2 mr-sm-2" id="lng" value="39.908775">
            
            <div class="form-check mb-2 mr-sm-2"></div>    
            
            <button type="button" class="btn btn-primary mb-2 btn-sm" onclick="addMarker()">定位</button>
        </div>`;

    // 2. 整合页面结构，修正原代码末尾多余的 </div>
    const page = `
        <div id="allmap"></div>
        <div id="container2" style="position:relative; overflow:hidden; width:100%; height:600px; margin:0; border:#ccc solid 1px;">
            ${LOADING}
        </div>
        <div id="val_map" class="text-danger"></div>
        ${inputv}`;

    // 3. 渲染
    $('#page_list').html(page);
};
function map_get_move(title) {
    const page = `
        <div id="allmap2" class="text-white">
            <h4>${title}</h4>
        </div>
        <div id="container" style="position:relative; overflow:hidden; width:100%; height:600px; margin:0; border:#ccc solid 1px;">
            ${LOADING}
        </div>
        <div id="val_map2" class="text-danger"></div>
        <div id="MPSMOVEINFO"></div>`;

    $('#mpage').html(page);
};
function TO_MOVE_PAGE() {
    // 使用模板字面量，修复了原代码中 <a> 标签错误的自闭合写法 (/>)
    const page = `
        <div class="text-white">
            <p>轨迹回放控制
                <a href="javascript:void(0);" class="text-white" id="start" onclick="startAnimation()">
                    <i class="fa fa-play-circle" style="font-size:24px"></i>
                </a>
                <a href="javascript:void(0);" class="text-white" id="pause" onclick="pauseAnimation()">
                    <i class="fa fa-pause-circle" style="font-size:24px"></i>
                </a>
                <a href="javascript:void(0);" class="text-white" id="resume" onclick="resumeAnimation()">
                    <i class="fa fa-check-circle" style="font-size:24px"></i>
                </a>
                <a href="javascript:void(0);" class="text-white" id="stop" onclick="stopAnimation()">
                    <i class="fa fa-stop-circle" style="font-size:24px"></i>
                </a>
            </p>
        </div>`;

    $('#MPSMOVEINFO').html(page);
};
if (SETUP_JSON.conf.SELMAP.v=='amap'){

    $.getScript("../static/js/WGS-84.js") 
    $.getScript("../static/js/map_amap.js") 
    window.onApiLoaded = function (){TO_IP_MAPS()}
    var urlgaode = 'https://webapi.amap.com/maps?v=2.0&key='+SETUP_JSON.conf.GaodeAK.v+'&callback=onApiLoaded';
    var jsapi = document.createElement('script');
    jsapi.charset = 'utf-8';
    jsapi.src = urlgaode;
    document.head.appendChild(jsapi);
    function  localmap(id,mode,title,Publish,Subscribe,value,serial,unit,name){
       map_get_move(title)
       TO_MOVE_PAGE();
       window.onApiLoaded = function (){TO_MOVE_MAPS2(id);}
    }
//function localmap(id,mode,title,Publish,value,serial,unit,name){window.onApiLoaded = function (){localmap(id);}}
}
if (SETUP_JSON.conf.SELMAP.v=='baidu'){
    Tdata={};
    map='';
    XMODE='';

    $.getScript("../static/js/TrackAnimation.min.js") 
    $.getScript("../static/js/WGS_BD09.js") 
    $.getScript("../static/js/map_baidu.js")
    window.onApiLoaded = function (){TO_IP_MAPS()}
    URL_BAIDU_MAPS='https://api.map.baidu.com/api?type=webgl&v=3.0&ak='+SETUP_JSON.conf.BaiduAK.v+'&callback=onApiLoaded'
    $.getScript(URL_BAIDU_MAPS)
    function localmap(id,mode,title,Publish,Subscribe,value,serial,unit,name){
       map_get_move(title)
       TO_MOVE_PAGE();
       window.onApiLoaded = function (){TO_MOVE_MAPS2(id);}
    }

}
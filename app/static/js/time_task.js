//tzlocal=$.ajax({url:'/API',data:{"mode":"tzlocal"},cache:false,async: false});
//tzlocal=JSON.parse(tzlocal.responseText);
SYS_T='';
L_TIME ='';
//timerId ='n';
//定时任务列表
function times_list() {
         //Refresh_data();
         var gettask=get_ajax('/gettask');
         SYS_T=get_ajax('/API',{"mode":"Query_sunrise_and_sunset","keywords":"n"});
         page='';
         L_TIME = get_ajax('/API',{"mode": "table_to_all","tablename":"time"});
         //获取定时列表
         if (L_TIME.info!='n'){
		  $.each(L_TIME.data, function (n, m) {
		     	if(m.mode=='interval'){mode='循环';dir_time=m.second+'秒'}  
		     	if(m.mode=='cron'){mode='定时';dir_time='星期:['+m.week+']时间:['+m.hour+':'+m.minute+']'} 
		     	if(m.mode=='sun'){mode='日落日出';if(m.second=='sunset'){dir_time='日落:'+SYS_T.data.sunset+m.minute}else{dir_time='日出:'+data.val.sunrise+m.minute}} 
		     	if(JSON.stringify(gettask).indexOf(m.ID) != -1){ 
		     	   //停止
		     	    butt='<a href="javascript:void(0);" onclick="stop_time(\''+n+'\',\''+m.ID+'\',\'n\')">'+LOADING+'</a>'
		     	}else{
		     	   //开始
		     	   butt='<a href="javascript:void(0);" onclick="stop_time(\''+n+'\',\''+m.ID+'\',\'y\')" ><i class="fa fa-play-circle" style="font-size:24px"></i></a>'
		     	}
		     	//删除
		     	butt_del='<a href="javascript:void(0);" onclick="stop_time(\''+n+'\',\''+m.ID+'\',\'n\');del_new_list(\'time\',\''+m.ID+'\',\'times_list\');" class="text-danger">'+
                                 '<i class="fa fa-times-circle" style="font-size:24px"></i></a>';
                        if(n<BGCOLOUR.length){BGCARD=n}else{BGCARD=Math.round(n%BGCOLOUR.length);}; 
		     	page+='<div class="col-sm-4"  style="margin-top:20px;">'+
		     	      '<ul class="list-group">'+
				     //'<li class="list-group-item list-group-item-'+BGCOLOUR[BGCARD]+'">ID:<h class="text-primary">'+n+'</h></li>'+
			             '<li class="list-group-item list-group-item-'+BGCOLOUR[BGCARD]+'">名称:<h class="text-primary">'+m.title+'</h></li>'+
			             '<li class="list-group-item">模式:<h class="text-primary">'+mode+'</h></li>'+						 
				     '<li class="list-group-item">设备:<h class="text-primary">'+m.time_list_title+'</h></li>'+
			             '<li class="list-group-item">命令:<h class="text-primary">'+m.cmd.substring(0,10)+'</h></li>'+//fontNumber()
				     '<li class="list-group-item">时间:<h class="text-primary">'+dir_time+'</h></li>'+
			             '<li class="list-group-item">'+butt_del+'<span class="badge">'+butt+'</span></li>'+				 
			      '</ul>'+
		         '</div>';
		 })
         }else{
                 page='没有获取数据'
         }
         //显示填写参数页面
         page2='<div class="col-sm-4"  style="margin-top:20px;">'+
		       '<ul class="list-group">'+
					       '<li class="list-group-item">名称:  <input type="text" id="T_title" value=""></li>'+
					       '<li class="list-group-item">模式:  <select id="T_mode" onchange="addtime_input()"></select></li>'+						 
					       '<li class="list-group-item">设备:  <select id="T_time_list_id" onchange="addtime_id()"></select><input type="hidden" id="T_time_list_title"" value=""><input type="hidden" id="T_time_list_Publish"" value=""></li>'+
					       '<li class="list-group-item">命令:  <input type="text" id="T_cmd" value="">[on|off]</li>'+
					       '<li class="list-group-item">时间:  <io><input type="text" id="T_second" value="" onkeyup="if(this.value.length==1){this.value=this.value.replace(/[^1-9]/g,\'\')}else{this.value=this.value.replace(/\D/g,\'\')}"'+
                                                  'onafterpaste="if(this.value.length==1){this.value=this.value.replace(/[^1-9]/g,\'0\')}else{this.value=this.value.replace(/\D/g,\'\')}">[>30s]</io></li>'+
					       '<li class="list-group-item"><a href="javascript:void(0);" onclick="add_time_save()" ><i class="fa fa-plus-circle" style="font-size:24px"></i></a></li>'+					 
		       '</ul>'+
                '</div>'; 
         $('#page_list').html('<div id="time_info"></div><div class="bg_info" id="s_t_p">服务器时间:<v id="showDate" class="text-danger font-weight-bold"></v></div><div class="row">'+page2+page+'</div>')

         $.each(L_LIST.data, function (t, x) {
			 if(x.mode!='lock' && x.mode!='card' && x.mode!='iframe' && x.mode!='camera' && x.mode!='warther' && x.mode!='sensor'){
				 $("#T_time_list_id").append('<option value="'+x.ID+'">'+x.title+'</option>');
			  }
		 			            
         })
          $("#T_time_list_id").append('<option value="ID_clean_day">定时清理历史记录</option>');

         $.each(GLOB_CONF.timemode, function (t, x) {
			 $("#T_mode").append('<option value="'+x.mode+'">'+x.title+'</option>');		            
         })	
         addtime_id();
         getTime_dir();
         //if(timerId=='n'){setInterval("getTime_dir();",1000);}
         //timerId='y';
         //let timerId = setInterval(() => {getTime_dir()}, 1000);
}
//设备ID记录	  
function addtime_id(){
	$.each(L_LIST.data, function (t, x) {
		if($('#T_time_list_id').val() == x.ID){$('#T_time_list_title').val(x.title);$('#T_time_list_Publish').val(x.Publish);}
	});
	if($("#T_time_list_id").val()=='ID_clean_day'){
		$("#T_time_list_title").val('定时清理历史记录');
		$("#T_time_list_Publish").val('clean_day_db');
	}

}	  
//时间模式选择	  
function addtime_input(){
	if($('#T_mode').val()=='sun'){
               sun_page='<select id="sel_sun">'+
                           '<option value="sunrise">日出:'+SYS_T.data.sunrise+'</option>'+
                           '<option value="sunset">日落:'+SYS_T.data.sunset+'</option>'+
                        '</select>'+
                          '<hr>提前输入-x分钟，推迟+x分钟<hr><input id="sun_mut" type="text" value="" />'
                $('io').html(sun_page)
	}
	if($('#T_mode').val()=='interval'){$('io').html('<input type="text" id="T_second" value="">[>30s]')}
	if($('#T_mode').val()=='cron'){
		weekinput='';
		for(var i=0;i <= 6;i ++){
                english=["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
		    weekinput+='<input name="TS_WEEK" type="checkbox" value="'+english[i]+'" />'+i
		}
		page='<ul class="list-group">'+
		              '<li class="list-group-item">星期: '+
					            weekinput+
					  '</li>'+
					  '<li class="list-group-item">时:<select id="T_hour"></select>分:<select id="T_minute"></select></li>'+
		     '</ul>'
		$('io').html(page)
		for(var i=0;i <= 23;i ++){
		      $("#T_hour").append('<option value="' + i + '">' + i + '时</option>');
		}
		for(var i=0;i <= 59;i ++){
                      $("#T_minute").append('<option value="' + i + '">' + i + '分</option>');
		}		
	}
}	 
//定时任务保存
function  add_time_save(){
	if($('#T_mode').val()=='cron'){
	                var result = new Array();
	                $("[name = TS_WEEK]:checkbox").each(function () {
	                    if ($(this).is(":checked")) {
	                        result.push($(this).attr("value"));
	                    }
	                });

	                TS_week=result.join(",");
	                if(TS_week.length == 0){ mod='y'}else{mod='n'}
	                TS_hour=$('#T_hour').val();
	                TS_minute=$('#T_minute').val();
	                TS_second='';
	}
	if($('#T_mode').val()=='interval'){
	                TS_week='';
	                TS_hour='';
	                TS_minute='';
	                //t_second=$('#TS_second').val();
	                if($('#T_second').val()<30){TS_second=30;}else{TS_second=$('#T_second').val();}
	                mod='n'				
		
	}
	if($('#T_mode').val()=='sun'){
	                TS_week='';
	                TS_hour='';
	                TS_minute=$('#sun_mut').val();
	                TS_second=$('#sel_sun').val();
	                mod='n'
	}
	jobs={
		"time_list_id": $('#T_time_list_id').val(),
		"stat":'y',
		"hour":TS_hour,
		"cmd": $('#T_cmd').val(),
		"time_list_title": $('#T_time_list_title').val(),
		"second": TS_second,
		"minute":TS_minute,
		"title": $('#T_title').val(),
		"week":TS_week,
		"time_list_Publish": $('#T_time_list_Publish').val(),
		"mode": $('#T_mode').val()
	}
	val='';
	$.each(jobs, function (t, x) {val+='"'+x+'",'});

        job="null,"+val.substr(0, val.length - 1)
	if(isEmpty($('#T_title').val())==false && mod=='n'){
           data={'mode':'add_db_data','tablename':'time','keywords':job}
           bak=get_ajax('/API',data);
           if(bak.info=='y'){times_list();}//clearInterval(timerId);
	}else{  
          info_cmd('danger','名称不能为空','time_info');
        }
}

//启动定时任务暂停定时任务eval(refun)
function stop_time(i,id,s){
    job='stat="'+s+'"'
    data={'mode':'edit_db','tablename':'time','title':id,'keywords':job}
    bak=get_ajax('/API',data);
    if(bak.info=='y'){times_list();}
    
    if (s=='n'){
                    //停止
	            datas={"id":id}
	            $.get("/remove_task",datas,function(result){if(result.info=='y'){times_list();}})
    }else{
                    //开始
	            $.get("/addjob",{'keywords':i},function(result){if(result.info=='y'){times_list()}})
       }
}	    
function getTime_dir(){ 
  DEVTIME =new Date(SYS_T.data.now_time.replace(/-/g,"/")).valueOf();
  PCTIME =new Date().getTime();
  SHICHA=(PCTIME - DEVTIME)
  if (SHICHA<2000 && SHICHA>-2000){
  setInterval(function() {
   var date = new Date();
   var Y = date.getFullYear() + "-";
   var M =
    (date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1) + "-";
   var D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + " ";
   var h = (date.getHours()< 10 ? "0" + date.getHours() : date.getHours())+ ":";

   var m = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())+ ":";
   var s = (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());
   t=Y + M + D + h + m + s;
   $("#showDate").html(t);
  }, 1000);
 }else{topage="时差"+SHICHA/1000+'秒'; $("#showDate").html(topage);}
 
}

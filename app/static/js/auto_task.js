L_AUTO='';
//获取在运行的列表
function auto_task() {
     gettask=get_ajax('/gettask');
     if (L_AUTO.info!='n'){
        $.each(L_AUTO.data, function (n, m) {
            if(gettask.indexOf('ID_Y'+m.ID)!=-1){yids=LOADING}else{yids=''};
            $("#TS"+m.ID).html(yids)
        })  
     }
}
//自动任务列表
function auto_list() {
     L_AUTO = get_ajax('/API',{"mode": "table_to_all","tablename":"auto"});
     page='';
     if (L_AUTO.info!='n'){
      $.each(L_AUTO.data, function (n, m) {
        title='';
        stitle='';
        $.each(L_LIST.data, function (t, x) {
	            NSUB=m.discover_topic.split('|');
	            NSEN=m.send_topic.split('|');
	            title=NSUB[0];
	            stitle=NSEN[0];
	            //if(x.Subscribe.toLocaleUpperCase()==NSUB[0].toLocaleUpperCase()){title=x.title}else{title=NSUB[0]};
	            //if(x.Publish.toLocaleUpperCase()==NSEN[0].toLocaleUpperCase()){stitle=x.title}else{stitle=NSEN[0]};
                             
        })

        if(m.stat == 'y'){
	            butt='<a href="javascript:void(0);" onclick="stop_auto(\''+m.ID+'\',\'n\')">'+LOADING+'</a>';
        }else{
	            butt='<a href="javascript:void(0);" onclick="stop_auto(\''+m.ID+'\',\'y\')" ><i class="fa fa-play-circle" style="font-size:24px"></i></a>';
        };
        if(n<BGCOLOUR.length){BGCARD=n}else{BGCARD=Math.round(n%BGCOLOUR.length);}; 

        page+='<div class="col-sm-4"  style="margin-top:20px;">'+
		     '<ul class="list-group">'+
		       '<li class="list-group-item list-group-item-'+BGCOLOUR[BGCARD]+'">触发名称:<h class="text-danger font-weight-bold">'+m.title+'<xo id="TS'+m.ID+'"></xo></h></li>'+
		       '<li class="list-group-item  list-group-item-secondary">检测到主题:<h class="text-danger font-weight-bold">'+title+'</h></li>'+						 
		       '<li class="list-group-item  list-group-item-secondary">检测到命令:<h class="text-primary">'+m.discover_cmd.substring(0,10)+'</h></li>'+
		       '<li class="list-group-item list-group-item-dark">'+GET_Change2(m.mod,m.val,m.time)+'</li>'+
			       '<li class="list-group-item  list-group-item-secondary">执行主题: <h class="text-primary">'+stitle+'</h></li>'+
		       '<li class="list-group-item list-group-item-secondary">执行命令: <h class="text-primary">'+m.send_cmd.substring(0,10)+'</h></li>'+
		       '<li class="list-group-item list-group-item-dark"><a href="javascript:void(0);" onclick="del_new_list(\'auto\',\''+m.ID+'\',\'auto_list\')" ><i class="fa fa-times-circle text-danger" style="font-size:24px"></i></a>'+
		       '<span class="badge">'+butt+'</span></li>'+							 
		     '</ul>'+
	      '</div>'; 
		 })
                }else{ page='没有获取数据'}
 		page2='<div class="col-sm-4" style="margin-top:20px;">'+
		       '<ul class="list-group">'+
			   '<li class="list-group-item list-group-item-dark">触发名称:<input type="text" id="AO_title" value=""></li>'+
			   '<li class="list-group-item  list-group-item-secondary">检测到主题: <select id="AO_discover_topic"></select></li>'+						 
			   '<li class="list-group-item  list-group-item-secondary">检测到命令:<input type="text" id="AO_discover_cmd" value=""></li>'+
			   '<li class="list-group-item list-group-item-dark">条件:<select id="AO_mod" onchange="if_mod_Change()"></select></li>'+
			   '<li class="list-group-item  list-group-item-secondary"><select id="AO_val" onchange="conditionChange()"></select><io></io></li>'+
			   '<li class="list-group-item  list-group-item-secondary">执行主题: <select id="AO_send_topic"></select></li>'+
			    '<li class="list-group-item  list-group-item-secondary">执行命令: <input type="text" id="AO_send_cmd" value=""><input type="hidden" id="AO_stat" value="y"></li>'+
			   '<li class="list-group-item list-group-item-dark"><a href="javascript:void(0);" onclick="add_auto_list()" ><i class="fa fa-plus-circle" style="font-size:24px"></i></a></li>'+					 
		       '</ul>'+
		      '</div>'; 
		 $('#page_list').html('<div id="auto_info"></div><div class="row">'+page2+page+'</div>')

		 $.each(L_LIST.data, function (t, x) {
                                          //Subscribe=Base64.encode(x.key1)
                                           //Publish=Base64.encode(x.key1)
			                  $("#AO_discover_topic").append('<option value="'+x.Subscribe+'|'+x.ID+'">'+x.title+'</option>');
                                          $("#AO_send_topic").append('<option value="'+x.Publish+'|'+x.ID+'">'+x.title+'</option>')		  			            
		 })  
		 $.each(GLOB_CONF.automode, function (t, x) {
                                           $("#AO_mod").append('<option value="'+x.mode+'">'+x.title+'</option>');   
		 });
                             if_mod_Change();
                             auto_task();
                             window.setInterval("auto_task()",10000);
}
//获取定时任务类型
function if_mod_Change() {

               mto_page='<select id="AO_val" onchange="conditionChange(this.value)"></select>';
               $('#mod_page').html(mto_page);
               mod=$("#AO_mod").val()
               TO_Change(mod);

}
function TO_Change(mod){
                 $("#AO_val").empty()
		 $.each(GLOB_CONF.automode, function (t, x) {
                                      if(x.mode==mod){
                                         $.each(x.val, function (i, c) {
                                           $("#AO_val").append('<option value="'+c.mod+'">'+c.title+'</option>'); 
                                         })
                                      }
		 })
                            
                conditionChange()
}
//获取单位和默认值2
function GET_Change2(m,d,v){
		 mod=m;
		 unt='';
		 val='';
		 Gname='';
		 Vname='';
		 $.each(GLOB_CONF.automode, function (t, x) {
                                      if(x.mode==mod){
                                         Gname=x.title;
                                         $.each(x.val, function (i, c) {
                                            if(c.mod==d){
                                                    Vname=c.title;
                                                    unt=c.unt;
                                                    val=c.val;
                                            }

                                         })
                                      }
		 })

                             dir_time_m=Gname+Vname+':<h class="text-primary">'+v+'</h>'+unt;
                             //console.log(bak) 
                             return dir_time_m

}
//获取单位和默认值
function GET_Change(d){
		 mod=$("#AO_mod").val();
		 unt='';
		 val='';
		 $.each(GLOB_CONF.automode, function (t, x) {
                                      if(x.mode==mod){
                                         $.each(x.val, function (i, c) {
                                            if(c.mod==d){
                                                    unt=c.unt;
                                                    val=c.val;
                                            }

                                         })
                                      }
		 })
                             bak={'unt':unt,'val':val};
                             //console.log(bak) 
                             return bak

}

function conditionChange(){
	       $('io').empty()
               mod=$("#AO_val").val()
               gj=GET_Change(mod)
               mto_page='<input type="text" id="AO_time" value="'+gj.val+'">'+gj.unt;
              $('io').html(mto_page)

}
//添加任务
function add_auto_list() {
        val = get_db_menu('auto','AO');
	if(isEmpty($('#AO_title').val())==false){
              data = {
                'mode': 'add_list_db',
                'tablename': 'auto',
                'keywords': JSON.stringify(val)
             }
              //info_cmd('success','添加成功','add_info');
              bak=get_ajax('/API',data);
              if(bak.info=='y'){auto_list()};
	}else{  
          info_cmd('danger','名称不能为空','auto_info');
 }
}
//暂停任务
function stop_auto(ID,s) {
    job='stat="'+s+'"'
    data={'mode':'edit_db','tablename':'auto','title':ID,'keywords':job}
    bak=get_ajax('/API',data);
    if(bak.info=='y'){auto_list();}

    if (s=='n'){
	      data={"id":'_Y'+ID}
	      $.get("/remove_task",data,function(result){
		         if(result.info=='y'){auto_list()}
  	     })
      }
}

//自动任务列表==================================================	
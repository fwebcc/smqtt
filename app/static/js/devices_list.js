//设备列表===============
L_MODE = '';
L_LIST = '';
L_GROUP ='';
function Refresh_data() {
   L_MODE = get_ajax('/API',{"mode": "table_to_all","tablename":"mode"});
   L_LIST = get_ajax('/API',{"mode": "table_to_all","tablename":"list"});
   L_GROUP = get_ajax('/API',{"mode": "table_to_all","tablename":"group"});
};
Refresh_data();
plist();
//输出类型模块
function plist() {     
    L_TYPE = '';
    if (L_MODE.info=="y"){
        L_MODE.data.sort(function(a,b){
            if(a.xulie>b.xulie) return 1 ;
            if(a.xulie<b.xulie) return -1 ;
            return 0 ;
        }) ;

        $.each(L_MODE.data, function(i, m) {
            GROUP_title='';
            $.each(L_GROUP.data, function(p, q) { 
                GROUP_title+= '<div style="display: none;" id="X_'+m.mode+q.val+'"><div class="alert-secondary"><strong class="text-danger">'+q.title+'</strong></div><o id="L_'+m.mode+q.val+'"></o></div>' ;
            })
            if(i<BGCOLOUR.length){BGCARD=i}else{BGCARD=Math.round(i%BGCOLOUR.length);}; 
            L_TYPE +=  '<div class="col-sm-4 flexl" id="div_'+m.ID+'_'+m.xulie+'"><div class="card-header alert-'+BGCOLOUR[BGCARD]+'"><i class="fa ' + m.ioc + '" style="font-size:28px"></i>' + m.title +'</div></ul>'+GROUP_title+'</div>';   

        })
    }else{
            L_TYPE =GET_DATA_INFO;
    }
    $('#page_list').html('<div id="top_page"><a href="javascript:void(0);" onclick="get_list()"><i class="fa fa-edit" style="font-size:24px"></i></a></div><div class="row gbin1-list">' + L_TYPE + '</div></div>');
    to_plist();
    get_list_stat('y');
    plist_movie();
}

//添加编辑设备
function get_list() {
        $("#history_list_page").empty() 
        $("#mpage").empty() 
        linfo = '<div class="row">' +
            '<div class="col-sm-6"><a href="javascript:void(0);"  data-toggle="modal" data-target="#myModal" onclick="add_newlist_page()"><i class="fa fa-plus-circle" style="font-size:24px"></i></a></div>' +
            '<div class="col-sm-6"><div class="float-md-right"><a href="javascript:void(0);" onclick="plist()" class="text-danger"><i class="fa fa-backward" style="font-size:24px"></i></a></div></div>' +
            '</div>'
        get_list_stat('n')
        $('#top_page').html(linfo)
}
//获取设备列表，根据类型添加到类目
function to_plist() {
    L_PAGE = '';
    if (L_LIST.info=="y"){
              $.each(L_LIST.data, function(i, x) { 
                    if(x.stat.length>5){stat2=''}else{stat2=x.stat}; 
                    L_button=to_type_ADD(x.ID,x.mode,x.title,x.Publish,x.unit,stat2,i);
                    L_PAGE = '<li class="list-group-item">'+
                         '<a href="javascript:void(0);" data-toggle="modal" data-target="#myModal" onclick = "GET_HOSTOR_ONE(\''+x.title+'\',\'history_list_page\',\''+x.ip+'\',\''+x.Publish+'\',\''+x.mode+'\')" >'+
                              x.title+
                         '</a>'+
                         '<span class="badge" id="D_' + x.ID + '">'+
                              L_button+
                          '</span>'+
                     '</li>';
                  $('#L_'+x.mode+x.groups).append(L_PAGE)
                  $('#X_'+x.mode+x.groups).show()
              })
    }else{
            L_PAGE =GET_DATA_INFO;
            $('#page_list').html(L_PAGE)
    }
}
function GET_HOSTOR_ONE(m1,m2,m3,m4,m5) {
      $.getScript('../static/js/history.js',function(){get_history(0,0,m1,m2,m3,m4,m5);});
}

//从类型中查找支持的格式
function to_type_ADD(id,mode,title,Publish,unit,stat,serial) { 
    plight='';
    $.each(L_MODE.data, function(k, l) {
      if(mode == l.mode){
                      plight=to_type(id,l.type,title,Publish,unit,stat,serial)
                      plight=plight
      }
    })
    return plight
}
//右侧按钮或者拉条输出
function to_type(id,mode,title,Publish,unit,stat,serial) {
    type='';
    $.each(GLOB_CONF['type'], function(k, t) {
                  //优先选择单位类型输出
                  if(unit==t.val){
                        //拉条模块直接输出VALUE值替换
                       type=SW_replace(t.data,id,mode,title,Publish,stat,serial,unit)
                  }else{   
                        if (mode==t.val){type=SW_replace(t.data,id,mode,title,Publish,stat,serial,unit)}
                  }
    })
    return type
}
//读取list记录状态输出替换页面按钮状态
function get_list_stat(xjj) { 
    L_TYPE = '';
    if (L_LIST.info=="y"){
        $.each(L_LIST.data, function(i, m) {
          if(xjj=='y'){
           stat=to_type_ADD_stat(m.mode,m.unit);
           //如果是按钮输出正反开关
           if(stat.type=='switch'){
                 if(isEmpty(m.stat)){
                        value='off';
                 }else{
                        if(m.stat.length>4){
                              value='off';
                        }else{
                              value=m.stat;
                        }
                 }
               
                 type=SW_replace(stat.data,m.ID,m.mode,m.title,m.Publish,value.toLowerCase(),i,stat.unit)
                 $('#D_'+m.ID).html(type);
          };
           //如果是数字输出单位
           if(stat.type=='number'){
                 NUMBER_MYMODL='<a href="javascript:void(0);" data-toggle="modal" data-target="#myModal" onclick = "get_pages(\''+m.title+'\',\''+i+'\',\''+stat.type+'\',\''+m.Publish+'\',\''+m.ip+'\',\''+m.unit+'\')" >' +
                               m.stat+m.unit+
                             '</a>'  
                $('#D_'+m.ID).html(NUMBER_MYMODL)
           }; 
          }else{
                   edit_sw='<span class="badge" id="E' + m.ID + '">' +
                                    '<a href="javascript:void(0);" onclick="del_new_list(\'list\',\'' + m.ID + '\',\'plist\')" class="text-danger"><i class="fa fa-times-circle" style="font-size:24px"></i></a>' +
                                    '<a href="javascript:void(0);" data-toggle="modal" data-target="#myModal" onclick="edit_new_list(\'' + i + '\')"><i class="fa fa-edit" style="font-size:24px"></i></a>'

              $('#D_'+m.ID).html(edit_sw)
          }   
        })
    }
}
//编辑list设备参数	
function edit_new_list(i) {
      $("#history_list_page").empty() 
      $("#mpage").empty() 
        val = '';
        ID = '';

        $.each(L_LIST['data'][i], function(t, x) {
            tx = ''
            ID = L_LIST['data'][i]['ID']
            if (GLOB_CONF['addinput'][t] != undefined) {
                keyname = GLOB_CONF['addinput'][t]
            } else if (GLOB_CONF['addir'][t] != undefined) {

                if (L_LIST['data'][i]['mode'] == 'ir') {
                    keyname = GLOB_CONF['addir'][t]
                    tx = t
                } else {
                    keyname = ''
                    tx = 'n'
                }
            } else {
                keyname = t
            }

            if (t == 'mode') {
                vale = '';
                vals = '<div class="row"><div class="col-sm-3">' + keyname + '</div><div class="col-sm-9"><select id="E_' + t + '"></select></div></div>'
            } else if (t == 'groups' || t == 'timemode') {
                vale = '';
                vals = '<div class="row"><div class="col-sm-3">' + keyname + '</div><div class="col-sm-9"><select id="E_' + t + '"></select></div></div>'
            } else if (t == 'ID') {
                vale = ''; //'<div class="row"><div class="col-sm-3">'+keyname+'</div><div class="col-sm-9"><input type="text" id="E_'+t+'" value="'+x+'" disabled="disabled"></div></div>';
                vals = ''
            } else if (t == 'email') {
                vale = '';
                vals = '<div class="row"><div class="col-sm-3">' + keyname + '</div><div class="col-sm-9"><select id="E_' + t + '"></select></div></div>'

            } else {
                vale = '<div class="row"><div class="col-sm-3">' + keyname + '</div><div class="col-sm-9"><input type="text" id="E_' + t + '" value="' + x + '" ></div></div>';
                vals = ''
            };
            if (tx != 'n')
                val += vals + vale
        });

        butt = '<a href="javascript:void(0);" onclick="edit_newlist_go(\'' + i + '\',\'' + ID + '\')"><i class="fa fa-check-circle" style="font-size:24px"></i></a>'
        $("#mpage").html('编辑设备<div id="edit_info"></div><hr><div class="card-body">' + val + '<div id="air_page"></div>' + butt + '</div>');
        $.each(L_MODE.data, function(t, x) {
            if (L_LIST['data'][i]['mode'] == x.mode) {
                $("#E_mode").append('<option value="' + L_LIST['data'][i]['mode'] + '" selected>' + x.title + '</option>');
            } else {
                $("#E_mode").append('<option value="' + x.mode + '">' + x.title + '</option>');
            }
        })
        $.each(L_GROUP.data, function(t, x) {
            if (L_LIST['data'][i]['groups'] == x.val) {
                $("#E_groups").append('<option value="' + L_LIST['data'][i]['groups'] + '" selected>' + x.title + '</option>');
            } else {
                $("#E_groups").append('<option value="' + x.val + '">' + x.title + '</option>');
            }
        })
            if (L_LIST['data'][i]['email'] == 'y') {
                sel='selected';
                sel='';
                sel2='';
            } else {
                sel='';
                sel2='selected';

            }
        $("#E_email").append('<option value="y" '+sel+'>是</option><option value="n" '+sel2+'>否</option>');
        $.each(GLOB_CONF['timemode'], function(t, x) {
            if (L_LIST['data'][i]['timemode'] == x.timemode) {
                $("#E_timemode").append('<option value="' + x.mode + '" selected>' + x.title + '</option>');
            } else {
                $("#E_timemode").append('<option value="' + x.mode + '">' + x.title + '</option>');
            }
        })

    }

//保存list修改值
function edit_newlist_go(i, ID) {
    jval = get_db_menu('list','E');
    val='';
    $.each(jval.lie, function(t, x) {
          if(x!=='ID'){val += x+ '="' + jval['val'][t-1] + '",';}
    });
    job = val.substr(0, val.length - 1);
    if (isEmpty($('#E_title').val())==false||isEmpty($('#E_name').val())==false) {
        data = {
            'mode': 'edit_dbs',
            'tablename': 'list',
            'title': ID,
            'keywords':job
        }
        bak=get_ajax('/API',data);
        if(bak.info=='y'){Refresh_data();$("#edit_info").html(info_cmd('success','修改成功','edit_info'))};
    } else {
        info_cmd('danger','带*填空不能为空','edit_info')
    }
}
//添加新的设备
function add_newlist_page() {

        if (L_MODE.info != 'n' || L_GROUP.info != 'n') {
            val = '';
            $.each(GLOB_CONF['addinput'], function(t, x) {
                if (t == 'mode') {
                    vale = '';
                    vals = '<div class="row"><div class="col-sm-3">' + GLOB_CONF['addinput'][t] + '</div><div class="col-sm-9"><select id="A_' + t + '" onchange="addir()"></select></div></div>'
                } else if (t == 'groups' || t == 'timemode') {
                    vale = '';
                    vals = '<div class="row"><div class="col-sm-3">' + GLOB_CONF['addinput'][t] + '</div><div class="col-sm-9"><select id="A_' + t + '"></select></div></div>'
                } else if (t == 'email') {
                    vale = '';
                    vals = '<div class="row"><div class="col-sm-3">' + GLOB_CONF['addinput'][t] + '</div><div class="col-sm-9"><select id="A_' + t + '"></select></div></div>'

                } else {
                    vale = '<div class="row"><div class="col-sm-3">' + GLOB_CONF['addinput'][t] + '</div><div class="col-sm-9"><input type="text" id="A_' + t + '" value="" ></div></div>';
                    vals = ''
                };
                val += vals + vale
            })

            butt = '<a href="javascript:void(0);" onclick="add_newlist_save()" ><i class="fa fa-plus-circle" style="font-size:24px"></i></a>'
            $("#mpage").html('添加设备<div id="add_info"></div><hr><div class="card-body">' + val + '<div id="air_page"></div>' + butt + '</div>');
            $.each(L_MODE.data, function(t, x) {
                $("#A_mode").append('<option value="' + x.mode + '" selected>' + x.title + '</option>');
            })
            $.each(L_GROUP.data, function(t, x) {
                $("#A_groups").append('<option value="' + x.val + '" selected>' + x.title + '</option>');
            })
           $("#A_email").append('<option value="y">是</option><option value="n" selected>否</option>');
        } else {
            $("#mpage").html('请先去设置里添加,组别,类型才可以添加新设备!');
        }
    }
/*触发遥控器参数填写*/
function addir() {
        if ($('#A_mode').val() == 'ir' || $('#E_mode').val() == 'ir') {
            val = '';
            $.each(GLOB_CONF['addir'], function(t, x) {
                val += '<div class="row"><div class="col-sm-3">' + GLOB_CONF['addir'][t] + '</div><div class="col-sm-9"><input type="text" id="A_' + t + '" value="" ></div></div>';
            });
            $("#air_page").html(val);
        } else {
            $("#air_page").html('');
        }
}
function add_newlist_save() {
        name= 'n';
        name2= 'n';
        if (L_LIST.info != 'n'){
                $.each(L_LIST.data, function(t, x) {
                        if (x.title==$('#A_title').val() || x.name==$('#A_name').val()){name=x.ID;name2=x.ID};
                  })
                }
        val = get_db_menu('list','A');;
        if (isEmpty($('#A_title').val())==false && isEmpty($('#A_name').val())==false) {
           if (name == 'n' && name2 == 'n') {
              data = {
                'mode': 'add_list_dbs',
                'tablename': 'list',
                'keywords': JSON.stringify(val)
             }
              bak=get_ajax('/API',data);
              if(bak.info=='y'){Refresh_data();plist();$("#edit_info").html(info_cmd('success','添加成功','add_info'))};
           }else {
              info_cmd('danger','中文或者英文名称已存在','add_info')
           }
       }else {
              info_cmd('danger','带*填空不能为空','add_info')
       }
    }

//读取list记录状态输出_计算属于什么模式
function to_type_ADD_stat(mode,unit) { 
    plight='';
    $.each(L_MODE.data, function(k, l) {
      if(mode == l.mode){
                      plight=to_type_stat(l.type,unit);
      }
    })
    return plight;
}
//读取list记录状态输出_计算什么类型
function to_type_stat(val,unit) {
    type='';
    number='';
    $.each(GLOB_CONF['type'], function(k, t) {
          if(unit==t.val){
                  bak={'type':t.val,'number':k,'data':t.data,'unit':t.val};
          }else{
                  if(val==t.val){
                       bak={'type':t.val,'number':k,'data':t.data,'unit':t.val};
                   }
          }
    })
    return bak;
}
//弹出层
MtitlePOPMOD='n';
function Popup(id,mode,title,Publish,value,serial,unit) {
      $("#history_list_page").empty(); 
      $("#mpage").empty();
      $('#mpage').html(LOADING); 
      if (mode=='camera'){
                 //视频直播
                 $.getScript('../static/js/live.js',function(){live_ffmpeg(id,mode,title,Publish);});
        }else if (mode == 'map') {
                 //地图
                 $('#mpage').html('<div style="height: 550px"><h4>'+title+'</h4><div id="MAP_POP" style="overflow: hidden;width:100%;height:500px;margin: 0;border:#ccc solid 1px;">'+LOADING+'</div></div>');
                 $.getScript('../static/js/map.js',function(){MtitlePOPMOD=title;});
        }else if (mode == 'ir'){
                 //遥控器
                 $.get('../static/txt/ir.txt', function(content) {
                     $('#mpage').html('<div style="height: 400px">'+title+'<p id="info_ir_'+id+'"></p>' + SW_replace(content,id,mode,title,Publish,value,serial,unit) + '</div>');
                 });
        }else if (mode =='card'){
                 //油卡
                 $.getScript('../static/js/petroleum.js',function(){petroleum(Publish);});
        }else if (mode == 'warther'){
                 //天气预报
                 $.getScript('../static/js/weather.js',function(){weather(Publish);});
        }else{
                 $('#mpage').html(GET_DATA_INFO);
      }

}
//替换按钮参数
function SW_replace(data,id,mode,title,Publish,value,serial,unit) { 
    type=data.replaceAll(new RegExp('idx', 'g'), id).replaceAll(new RegExp('mode', 'g'), mode).replaceAll(new RegExp('title', 'g'), title).replaceAll(new RegExp('Publish', 'g'), Publish).replaceAll(new RegExp('VALUE', 'g'), value).replaceAll(new RegExp('serial', 'g'), serial).replaceAll(new RegExp('unit', 'g'), unit);
    return type;
}
//按钮操作
function Pstat(id,mode,title,Publish,value,serial,unit) { 
  //dvalue=['ir','Dimmer','light','switch','lock'];
  if(unit=='Dimmer'){
         value=$('#L_'+id).val();
         $('#L_'+id).val(value)
  }else{
         if (mode=='light'||mode=='switch'||mode=='lock'){
           if(isEmpty(value)){value='off'}else{if(value.toLowerCase()=='on'){value='off'}else{value='on'}};
           typev=to_type_stat('switch','switch')
           type=SW_replace(typev.data,id,mode,title,Publish,value,serial,unit);
           $('#D_'+id).html(type);
    }
    if (mode=='ir'){
         values=L_LIST['data'][serial]['cmd'+title]
         Publish=value;
         value=values
    }
    if(mode=='Dimmer'){
         value=$('#L_'+id).val();
         $('#L_'+id).val(value)
    }
  }
  //console.log(Publish,value);
  mqtt_Publish_Message(value.toUpperCase(),Publish)
}
//WS推送消息按钮操作
function Pstat_2(id,mode,title,Publish,value,serial,unit) { 
  if(unit=='Dimmer'){
         $('#L_'+id).val(value)
  }else{
         if (mode=='light'||mode=='switch'||mode=='lock'){
             typev=to_type_stat('switch','switch')
             type=SW_replace(typev.data,id,mode,title,Publish,value.toLowerCase(),serial,unit);
             $('#D_'+id).html(type);
         }
         if (mode=='ir'){
             $('#ir_info').html(value);       
         }
         if(mode=='Dimmer'){
             $('#L_'+id).val(value)
         }
         if(mode=='sensor'){
             $('#L_'+id).val(value)
         }

  }
}
BZX_todata='';
//波折线和监控历史
function get_pages(titles,i,mode,add,inub,get_unit) {
      $("#history_list_page").empty();
      $("#mpage").empty(); 
      np='<div class="card"><div class="card-header">'+titles+'<a href="'+inub+'" target="_blank" >IP:'+inub+'</a></div><div class="card-body"><div id="gh_'+i+'" style="width:100%;height: 300px;"></div></div></div>'
      $("#history_list_page").html(np) 

      if (mode=='camera') {
             $("#history_list_page").empty(); 
             $("#mpage").empty(); 
             $("#mpage").html(add);
      }else{ 

             tiao=Every*20
             data={'mode':'table_to_sec','tablename':'Rec_stat','d1':0,'d2':tiao,'title':'title','keywords':titles}	
             day_datas=get_ajax('/API',data); 	

             if(day_datas.info=='n'){
                          $("#history_list_page").html(GET_DATA_INFO)
             }else{

               BZX_todata = [];
               $.each(day_datas.data, function(x,y){
                       BZX_todata.push([parseInt(y.time),parseInt(y.stat)])    
               })
               to_div='gh_'+i
               $.getScript('../static/js/hchart.js',function(){bozhexian(to_div,titles,get_unit);})
           }
      }
}
//版本栏显示设备号
function config_get_v() {
        json=SETUP_JSON.key.uuid;
        for(var i=0,l=json.length;i<l;i++){
             if(b_name2==json[i].id){b_namex=json[i].browser}else{b_namex=''}
        }
        $("#idname").html(b_namex);
}
config_get_v()
function plist_movie(){
   $('.gbin1-list').sortable().bind('sortupdate', function() {
                $("#myModal").modal('show');
                $('#mpage').html(LOADING)
                var arr = $(".gbin1-list").sortable('toArray');
                $.each(arr, function(i, x) { 
                     NNUB=x.split('_')[1];
		     val='xulie="'+i+'"';
                     Tdata={'mode':'edit_db','tablename':'mode','title':NNUB,'keywords':val};
                     if(x.split('_')[2]!=i){bak=get_ajax('/API',Tdata);}
                     
                });
                //location.reload();
                L_MODE = get_ajax('/API',{"mode": "table_to_all","tablename":"mode"});plist();
                $("#myModal").modal('hide');
   });
}
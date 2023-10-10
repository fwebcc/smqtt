function config_get() {
    $.get('../static/txt/config.txt', function(content) {
        $('#page_list').html(content)
        json=SETUP_JSON.key.uuid;
        for(var i=0,l=json.length;i<l;i++){
             if(b_name2==json[i].id){b_namex=json[i].browser}else{b_namex=b_name}
        }
        $("#msnget").html(b_namex);
        
    });
}

function get_mqtt() {
        SETUP_JSON = get_ajax('/API',{"mode": "read_setup"});
    $.get("../static/txt/smqtt.txt", function(result) {
        $("#smqtt").html(result);
        $('#url').val(SETUP_JSON.mqtt.url)
        $('#port').val(SETUP_JSON.mqtt.port)
        $('#path').val(SETUP_JSON.mqtt.path)
        $('#muser').val(SETUP_JSON.mqtt.user)
        $('#mid').val(SETUP_JSON.mqtt.id)
        $('#mtport').val(SETUP_JSON.mqtt.mtport)
        $('#mpass').val(SETUP_JSON.mqtt.pass)
        if (SETUP_JSON.mqtt.tls == true) {
            $("#tls").attr("checked", "checked");
        }
        if (SETUP_JSON.mqtt.cleansession == true) {
            $("#cleansession").attr("checked", "checked");
        }
        $('#mTopic').val(SETUP_JSON.mqtt.topic)
        $('#qos').val(SETUP_JSON.mqtt.qos)
        $('#reconnectTimeout').val(SETUP_JSON.mqtt.reconnectTimeout)
    })
}
function get_group() {
        Gpage = '';
        $("#add_group").empty();
        if (L_GROUP.info != 'n') {
            $.each(L_GROUP.data, function(i, x) {

                Gpage += '<div class="col-sm-4">' +
                    '<ul class="list-group">' +
                    // '<li class="list-group-item">组ID:  '+x.val+'</li>'+
                    '<li class="list-group-item">名称:  <input type="text" id="GROP_' + x.val + '" value="' + x.title + '"></li>' +
                    '<li class="list-group-item">' +
                    '<a href="javascript:void(0);" onclick="del_new_list(\'group\',\'' + x.ID + '\',\'get_group\')" class="text-danger"><i class="fa fa-times-circle" style="font-size:24px"></i></a>' +
                    '<span class="badge"><a href="javascript:void(0);" onclick="edit_group(\'' + x.val + '\',\'' + x.ID + '\')"><i class="fa fa-check-circle" style="font-size:24px"></i></a></span></li>' +
                    '</ul>' +
                    '</div>'
                    //添加组类别	
                $("#add_group").append('<option value="' + x.val + '">' + x.title + '</option>');
            })
        } else {
            Gpage = ''
        }
        addG = '<div class="col-sm-4">' +
            '<ul class="list-group">' +
            // '<li class="list-group-item">组ID:  <input type="text" id="add_group_id" value="L'+timestamp+'"></li>'+
            '<li class="list-group-item">名称:  <input type="text" id="add_group_tiele" value=""></li>' +
            '<li class="list-group-item"><a href="javascript:void(0);" onclick="add_group()" ><i class="fa fa-plus-circle" style="font-size:24px"></i></a></li>' +
            '</ul>' +
            '</div>'
        $('#group').html('<div class="row">' + Gpage + addG + '</div>')

    }
//组的编辑删除增加
function add_group() {
    job = 'null,"' + $("#add_group_tiele").val() + '","' + $("#add_group_tiele").val() + '"'
    if (isEmpty($('#add_group_tiele').val())==false) {
        data={'mode':'add_db_data','tablename':'group','keywords':job}
        bak=get_ajax('/API',data);
        if(bak.info=='y'){Refresh_data();get_group();};

    } else {
        info_cmd('danger', '名称不能为空', 'y');
    }

}
//编辑组
function edit_group(i, ID) {
    job = 'val="' + $('#GROP_' + i).val() + '",title="' + $('#GROP_' + i).val() + '"'
    if (isEmpty($('#GROP_' + i).val())==false) {
        data={'mode':'edit_db','tablename':'group','keywords':job,'title':ID}
        bak=get_ajax('/API',data);
        if(bak.info=='y'){Refresh_data();get_group();info_cmd('danger', '完成', 'y');};
    } else {
        info_cmd('danger', '名称不能为空', 'y');
    }
}

//类型页面
function get_mode() {
    Spage = '';
    if (L_MODE.info != 'n') {
        $("#add_list").empty();
        $.each(L_MODE.data, function(i, x) {
            group_title='';
            $.each(GLOB_CONF.type_ADD, function(d, t) {
               $.each(t, function(e, r) {
                     if(x.mode==r.val){
                        group_title=r.title
                                         }
                              })
            })
            type_title='';
            $.each(GLOB_CONF.type, function(s, n) {
                     if(x.type==n.val){type_title=n.title}
            })
            Spage += '<div class="col-sm-4">' +
                '<ul class="list-group">' +
                '<li class="list-group-item">图标: <i id="ioc_dir' + i + '"><i class="fa ' + x.ioc + '" style="font-size:24px"></i></i></i><input type="text" id="add_mode_ioc' + i + '" value="' + x.ioc + '"><a href="javascript:void(0);" data-toggle="modal" data-target="#myModal" onclick = "to_img(' + i + ',\'n\')" class="text-white btn btn-info btn-sm">选择</a></li>' +
                '<li class="list-group-item">模式: ' + type_title + '</li>' +
                '<li class="list-group-item">名称: <input type="text" id="add_mode_title' + i + '" value="' + x.title + '"></li>' +
                '<li class="list-group-item">类型:' + group_title + '</li>' +
                '<li class="list-group-item">' +
                '<a href="javascript:void(0);" onclick="del_new_list(\'mode\',\'' + x.ID + '\',\'get_mode\')" class="text-danger"><i class="fa fa-times-circle" style="font-size:24px"></i></a>' +
                '<span class="badge"><a href="javascript:void(0);" onclick="edit_mode(\'' + i + '\',\'' + x.mode + '\',\'' + x.type + '\',\'' + x.ID + '\')"><i class="fa fa-check-circle" style="font-size:24px"></i></a></span></li>' +
                '</li>' +
                '</ul>' +
                '</div>'

            $("#add_list").append('<option value="' + x.mode + '">' + x.title + '</option>');

        })
    } else {
        Spage = ''
    }
    addM = '<div class="col-sm-4">' +
        '<ul class="list-group">' +
        '<li class="list-group-item">图标: <i id="ioc_dir"><i class="fa fa-user" style="font-size:24px"></i></i><input type="text" id="add_mode_ioc" value="fa-user"><a href="javascript:void(0);" data-toggle="modal" data-target="#myModal" onclick = "to_img(\'\')" class="text-white btn btn-info btn-sm">选择</a></li>' +
        '<li class="list-group-item">模式: <select id="add_mode_type" onchange="grade_zubie()"></select></li>' +
        '<li class="list-group-item">名称:<input type="text" id="add_mode_title" value=""></li>' +
        '<li class="list-group-item">类型:<select id="add_mode_mode"></select></li>' +

        '<li class="list-group-item"><a href="javascript:void(0);" onclick="add_mode()" ><i class="fa fa-plus-circle" style="font-size:24px"></i></a></li>' +
        '</ul>' +
        '</div>'
    $('#Slist').html('<div class="row">' + Spage + addM + '</div>')
    $("#add_mode_type").empty();
    $.each(GLOB_CONF.type, function(i, x) {
        $("#add_mode_type").append('<option value="' + x.val + '">' + x.title + '</option>');
    })
    $.each(GLOB_CONF.mode, function(i,x) {
        $("#type_list").append('<option>' + x.mod + '</option>');
    })
    grade_zubie();
}
function grade_zubie() {
         VAL=$("#add_mode_type").val();
         $("#add_mode_mode").empty();
         $.each(GLOB_CONF['type_ADD'][VAL], function(e, r) {
               $("#add_mode_mode").append('<option value="' + r.val + '">' + r.title + '</option>');
         })
}
//类型的增加删除编辑
function add_mode() {
    job = 'null,"' + $('#add_mode_ioc').val() + '","' + $('#add_mode_title').val() + '","' + $('#add_mode_type').val() + '","' + $('#add_mode_mode').val() + '"'
    if (isEmpty($('#add_mode_title').val())==false) {
        data={'mode':'add_db_data','tablename':'mode','keywords':job}
        bak=get_ajax('/API',data);
        if(bak.info=='y'){Refresh_data();get_mode();};

    } else {
        info_cmd('danger', '名称不能为空', 'y');
    }
}
//类的编辑
function edit_mode(i, mode, type, ID) {
        job = 'ioc="' + $('#add_mode_ioc' + i).val() + '",title="' + $('#add_mode_title' + i).val() + '",type="' + type + '",mode="' + mode + '"'
        if (isEmpty($('#add_mode_title' + i).val())==false) {
        data={'mode':'edit_db','tablename':'mode','keywords':job,'title':ID}
        bak=get_ajax('/API',data);
        if(bak.info=='y'){Refresh_data();get_group();info_cmd('danger', '完成', 'y');};
    } else {
        info_cmd('danger', '名称不能为空', 'y');
    }
    }

function to_img(t,s='n') {
    $.getJSON("../static/js/awesome.json", function(result) {
        ioc_list = ''
        $.each(result, function(i, x) {
              if(s=='y'){
                 if(x.name.indexOf($("#ioc_txt").val()) > -1){
                   ioc_list += '<div class="col-sm-12">'+
                        '<a href="javascript:void(0);" onclick="img_dir(\'' + x.name + '\',\'' + t + '\')" >'+
                        '<i class="fa ' + x.name + '" style="font-size:24px"></i>' + x.name + '</a></div>';
                   }
              }else{
                 ioc_list += '<div class="col-sm-3">'+
                        '<a href="javascript:void(0);" onclick="img_dir(\'' + x.name + '\',\'' + t + '\')" >'+
                        '<i class="fa ' + x.name + '" style="font-size:24px"></i>' + x.name + '</a></div>';

              }   
        })
       if(s=='y'){val=$("#ioc_txt").val()}else{val=''}
        sousuo='<div class="" style="padding: 10px;"><div class="input-group"><input id="ioc_txt" type="text" class="form-control" value="'+val+'" placeholder="关键字"/><button class="btn btn-success" onclick = "to_img(\'' + t + '\',\'y\')"><i class="fa fa-search"></i></button></div></div>';
        $('#mpage').html(sousuo+'<div style="height:450px;width:95%;overflow-x:hidden;overflow-y:auto;margin:0 auto;"><div class="row">' + ioc_list + '</div></div>')
 
    })
}

function img_dir(p, i) {
    $('#ioc_dir' + i).html('<i class="fa ' + p + '" style="font-size:24px"></i>')
    $('#add_mode_ioc' + i).val(p)
    $("#myModal").modal('hide');
}

function up_file() {
        file_obj = $('#file').get(0).files[0];
        formdata = new FormData;
        formdata.append('file', file_obj);
        $.ajax({
            url: '/upload',
            type: "POST",
            data: formdata,
            processData: false,
            contentType: false,
            success: function(res) {
                location.reload()
            }
        });
    }
//设置参数
function get_conf() {
        $("#w_conf").html('')
        conf_page = ''
        data = SETUP_JSON.conf
        $.each(data, function(t,k) {//console.log(t)
            if ('homekit|debug|https'.indexOf(t) != -1) {
                if (k.v == 'y') {
                    che = "checked";
                } else {
                    che = '';
                }
                secl = '<input type="checkbox" value="" id="C_' + t + '" ' + che + '>'

            } else {
                secl = '<input type="text" id="C_' + t + '" value="' + k.v + '">'

            }
            conf_page += '<div class="col-3">' + k.t + '</div><div class="col-9">' + secl + '</div>'

        })
        hurl = ''
        if (data.homekit.v == 'y') {
           but_homekit = '<button type="submit" class="btn btn-danger btn-sm" onclick = "return restart_homekit_go()"><i class="fa fa-refresh"></i></button>'
           stop_homekit = '<button type="submit" class="btn btn-danger btn-sm" onclick = "return stop_homekit_go()"><i class="fa fa-times"></i></button>'
           start_homekit = '<button type="submit" class="btn btn-success btn-sm" onclick = "start_homekit_go()"><i class="fa fa-arrow-circle-right"></i></button>'
           homekit_url = get_ajax('./API',{"mode": "get_cmd_sh","keywords": "hk_get"});
            if (homekit_url.info == 'n') {
                if (homekit_url.data.info == 'y') {
                    homekit_page = 'HOMEKIT <div class="card"><div class="card-body  text-center"><div id="qrcode" class="qrcode"></div>' + homekit_url.val.url + '</div></div><div class="card bg-light text-dark  text-center"><div class="card-body">' + homekit_url.val.id + '</div></div>' + but_homekit
                    hurl = homekit_url.val.url
                } else {
                   homekit_page = '<div class="card"><div class="card-body  text-center"><button type="submit" class="btn btn-warning btn-sm" onclick = "get_homekit_code()">HOMEKIT 未启动'+start_homekit+'</button></div></div>';
                    hurl =''
                }
           } else {
                 if (homekit_url.data.info == 'y') {
                   s_info = '<div class="alert alert-success">HOMEKIT'+stop_homekit+'</div>'
                 } else {
                   s_info = '<div class="alert alert-danger">HOMEKIT'+start_homekit+'</div>'
                 }
                homekit_page = '<div class="card"><div class="card-body  text-center" id="homekit_code"><br>' + s_info + but_homekit + '</div></div>'
          }
        } else {
            homekit_page = ''
        }


        but = '<button type="submit" class="btn btn-info btn-sm" onclick = "edit_conf_go()">保存</button>'
        conf_page_all = '<div class="row"><div class="col-8"><div class="row">' + conf_page + but + '</div></div><div class="col-4">' + homekit_page + '</div></div>'
        $("#w_conf").html(conf_page_all)
        qrcode(hurl)

    }
//自动生成信息
function auto_x_y_go(){
   tzlocal=get_ajax('./API',{"mode":"format_offset"});
   if (isEmpty(latitude)==false){
        vlatitude=latitude;
        vlongitude=longitude;
   }else{
        vlatitude=tzlocal.data.latitude;
        vlongitude=tzlocal.data.longitude;

   }
   if(tzlocal.info=="y"){
       $('#C_latitude').val(vlatitude);
       $('#C_longitude').val(vlongitude);
       $('#C_city').val(tzlocal.data.city);

       $('#C_ETC').val(tzlocal.data.timezone);
       $('#C_country').val(tzlocal.data.country);
       info_cmd('success','填写完成','y')
   }else{$('#C_ETC').val(Intl.DateTimeFormat().resolvedOptions().timeZone);info_cmd('danger','获取失败...','y')}
}
//重新绑定
function restart_homekit_go() {
        if (!confirm('?')) return false;
        data = {
                    "mode": "get_cmd_sh",
                    "keywords": "hk_restart"
        };

    $.get("/API", data, function(result) { 
         get_conf();
         $('#homekit_code').html(LOADING)
         setTimeout(function() {get_conf()}, 4000);;
     })
    }
//启动homekit
function start_homekit_go() {

        data = {
                    "mode": "get_cmd_sh",
                    "keywords": "start_hk"
        };
    $.get("/API", data, function(result) { 
         $('#homekit_code').html(LOADING)
         setTimeout(function() {get_conf()}, 2000);;

     })

    }
//关闭homekit
function stop_homekit_go() {
        if (!confirm('?')) return false;
        data = {
                    "mode": "get_cmd_sh",
                    "keywords": "stop_hk"
        };
    $.get("/API", data, function(result) { 
         $('#homekit_code').html(LOADING)
         setTimeout(function() {get_conf()}, 6000);;

     })

    }
//生成二维码
function qrcode(url) {
        jQuery('#qrcode').qrcode({
            render: "canvas",
            width: 200,
            height: 200,
            background: "rgba(255,228,180, 0.0)",
            foreground: "#726193",
            text: url
        });
    }
//设置参数保存
function edit_conf_go() {
        val = '';
        data = SETUP_JSON.conf
        $.each(data, function(t,k) {
            if ('homekit|debug|https'.indexOf(t) != -1) {
                if ($("#C_" + t).is(":checked")) {
                    vals = 'y';
                } else {
                    vals = 'n';
                }
                val += '"' + t + '":{"v":"' + vals + '","t":"'+k.t+'"},'
            } else if (t == 'pass') {
                if (data[t]==$('#C_' + t).val()){
                                                 val+= '"' + t + '":{"v":"' + $('#C_' + t).val() + '","t":"'+k.t+'"},'
                                   }else{
                                                 val+= '"' + t + '":{"v":"' + md5($('#C_' + t).val()) + '","t":"'+k.t+'"},'
                              }
                
            } else {
                val+= '"' + t + '":{"v":"' + $('#C_' + t).val() + '","t":"'+k.t+'"},'
            }
        })
        job = '{' + val.substr(0, val.length - 1) + '}'
        data = {
            mode: 'json_edit',
            d1: '',
            title: 'conf',
            keywords: job,
            tablename: 'SETUP',
            d2: 'edit_json'
        };
           bak=get_ajax('/API',data);
           if(bak.info=='y'){info_cmd('info', '保存成功', 'y');} 
    }
//保存用户名密码
function edit_user_go() {
    user = $('#X_user').val()
    pass = $('#X_pass').val()
    pass2 = $('#X_pass2').val()
    if (isEmpty(user)==false && isEmpty(pass)==false) {
        if (pass == pass2) {
            job = {
                'user': md5(user),
                'pass': md5(pass2),
                'uuid':SETUP_JSON.key.uuid
            }
        data = {
            mode: 'json_edit',
            d1: '',
            title: 'key',
            keywords: JSON.stringify(job),
            tablename: 'SETUP',
            d2: 'edit_json'
        };
           bak=get_ajax('/API',data);
           if(bak.info=='y'){exit();} 
        } else {
            info_cmd('danger', '两次密码不一样', 'y')
        }

    } else {
        info_cmd('danger', '用户名密码不为空', 'y')
    }
}
token_table='';
//认证
function get_token(pnumber, val) {
    // to_data();
    data = {
        'mode': 'table_to_all_h',
        'tablename': 'toke',
        'd1': val,
        'd2': Every
    }
    confip = $.ajax({
        url: "/API",
        data: data,
        async: false,
        cache: false
    })
    confip = JSON.parse(confip.responseText);
    ndata = confip.data
    sell = confip.count;
    pagings = paging(pnumber, sell, 'get_token');
    LIST_html = '';
    page = '';
    LIST_name = '';
    if (ndata != 'n') {
        $.each(ndata, function(i, x) {
            LIST_one = '';
            LIST_name = '';

            $.each(x, function(n) {
                if (n == 'title') {
                    dell='<a href="javascript:;" onclick = "return del_token(\''+x['ID']+'\',\''+pnumber+'\',\''+ val+'\')"><i class="fa fa-trash-o" style="color:red"></i></a>';
                    LIST_one += '<th>' + x[n] + '</th><th>'+dell+'</th>'
                } else {
                    LIST_one += '<th>' + x[n] + '</th>'
                }
                LIST_name += '<th>' + n + '</th>'
            })
            page += '<tr >' + LIST_one + '</tr>';

        })
        Rpage = '<div id="token_list"><h4><i class="fa fa-th" style="font-size:24px"></i>' + sell + '</h4>' + 
                 '<a href="javascript:void(0);" data-toggle="modal" data-target="#myModal" onclick = "add_toke_page()" >'+
                 '<i class="fa fa-plus-circle" style="color:bule"></i></a><table  class="table table-hover table-sm text-muted" style="width:100%;">' + 
                  '<thead class="table">' + LIST_name +'<tr>' + '</tr>' + '</thead>' + 
                   '<tbody id="thedata">' + page + '</tbody>' + '</table>' + '<p class="text-danger"></p>' + '<hr>' + pagings + 
                '</div><div id="bub_list"></div>'
        $("#Stoken").html(Rpage)

    } else {
        $("#Stoken").html('没有数据')
    }
}
function del_token(id,p,v) {
     if (!confirm('?')) return false;
         data={'mode':'del_table_user_data','tablename':'toke','title':id,'val':id,'keywords':'ID'};
         $.get("/API", data, function(result) { 
         get_token(p,v)
     })
}
function add_toke_page() {
   but='<p><a href="javascript:void(0);" data-toggle="modal" data-target="#myModal" onclick = "add_token()"><i class="fa fa-plus-circle" style="color:bule"></i></a></p>'
   page='<div class="card">'+'<p>标题:<input type="text" id="token_title" value="str"></p>'+but+'</dir>'
   $('#mpage').html(page)
}
//创建随机数
function randomCoding(){
 	var arr = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
 	var idvalue ='';
 	for(var i=0;i<6;i++){
    	idvalue+=arr[Math.floor(Math.random()*26)];
 	}
	 return idvalue;
 }
function add_token() {
   job = 'null,"' + $('#token_title').val() + '","' +randomCoding()+ '","' +randomCoding()+ '","17600000","'  +randomCoding()+ '"'

    data={'mode':'add_db_data','tablename':'toke','keywords':job};
    $.get("/API", data, function(result) { 
       get_token(0,0)
    })
}
//mqtt服务器设置
function mqtt_save() {
        if ($("#tls").is(":checked")) {
            var useTLS = true;
        } else {
            var useTLS = false;
        }

        if ($("#cleansession").is(":checked")) {
            var cleansession = true;
        } else {
            var cleansession = false;
        }

        job = {
            "url": $('#url').val(),
            "path": $('#path').val(),
            "port": $('#port').val(),
            "user": $('#muser').val(),
            "pass": $('#mpass').val(),
            "tls": useTLS,
            "id": $('#mid').val(),
            "topic": $('#mTopic').val(),
            "mtport": $('#mtport').val(),
            "qos": $('#qos').val(),
            "cleansession": cleansession,
            "reconnectTimeout": $('#reconnectTimeout').val()
        }

        job = JSON.stringify(job);
        data = {
            mode: 'json_edit',
            d1: '',
            title: 'mqtt',
            keywords: job,
            tablename: 'SETUP',
            d2: 'edit_json'

        };
           bak=get_ajax('/API',data);
           if(bak.info=='y'){get_mqtt();info_cmd('info', '保存成功', 'y');} 
    }
//MQTT重启
function mqtt_restart() {
    data = {
        mode: 'get_cmd_sh',
        keywords: 'mqtt_restart'
    };
   $.get("/API", data, function(result) { })
}
//免登陆操作
GET_D_LIST=[];
function get_login(){
        SETUP_JSON = get_ajax('/API',{"mode": "read_setup"});
        json=SETUP_JSON.key.uuid;
        GET_D_LIST=[];
        to_list='';
        if_list='';
        TCD='';
        for(var i=0,l=json.length;i<l;i++){
                 GET_D_LIST.push(json[i].id);
                if(json[i].RecordIP=='y'){TCD='checked';}else{TCD=''};
                if(json[i].id==b_name2){if_list='y';CL_SS='class="alert alert-danger"';}else{CL_SS='class="alert alert-info"';but_i=''};
                but_i='<a href="javascript:void(0);" onclick="del_login_list(\''+i+'\')"><i class="fa fa-times-circle text-danger" style="font-size:24px"></i></a>';
　　　　         to_list+='<div '+CL_SS+'>'+'记录位置:<input type="checkbox" id="Gbox'+i+'" value="y" '+TCD+' onclick="checlick(this,'+i+')"/>已添加:'+json[i].topic+'/'+json[i].id+' 浏览器:'+json[i].browser.replace(/ /g,'_')+but_i+'</div>'    
        }
        if(if_list=='y'){
           add_but=to_list;

        }else{
           add_but=to_list+'<div class="alert alert-danger">记录位置:<input type="checkbox" id="cbox2"/>'+'指纹:'+b_name2+'主题<input type="text" id="topic"  value="loog" />浏览器:<input type="text" id="cbox1"  value="'+b_name+'" /><a href="javascript:void(0);" onclick="add_login_list(\''+b_name+'\',\''+b_name2+'\')"><i class="fa fa-plus-circle" style="font-size:24px"></i></a></div>'

                };
        $('#login_list').html('<div id="get_login_info"></div>'+add_but);
    }

//操作免登录命令
function dir_name() {
   Cjson=conf.key.uuid;
   for(var i=0,l=Cjson.length;i<l;i++){
             if(b_name2==Cjson[i].id){b_name=Cjson[i].browser}else{b_name=b_name}
   }
  $("#logoinfo").html(b_name)
}

function add_login_list(browser,id){
   if(isEmpty($('#topic').val())==false){
     if (GET_D_LIST.indexOf(id)==-1){
        var isChecked = $('#cbox2').is(':checked');
        if ( isChecked == true){VTCD='y';}else{VTCD='n';}
        new_data={
		"browser": $('#cbox1').val().replace(/\s+/g,""),
		"id": id,
		"topic": $('#topic').val(),
                            "RecordIP":VTCD
               }
        data = {       
            mode: 'json_edit',
            d1: '["key"]',
            title: 'uuid',
            keywords: JSON.stringify(new_data),
            tablename: 'SETUP',
            d2: 'add_json'
            }
           bak=get_ajax('/API',data);
           if(bak.info=='y'){get_login();} 
    }else{
         info_cmd('danger', '已存在', 'y');
    }
  }else{
         info_cmd('danger', '填写主题', 'y');
  }
}
function del_login_list(i){
        data = {       
            mode: 'json_edit',
            d1: '["key"]',
            title: 'uuid',
            keywords: i,
            tablename: 'SETUP',
            d2: 'del_json'
          }
           bak=get_ajax('/API',data);
           if(bak.info=='y'){get_login();} 
}
//恢复数据
//汉字符号格式化
function toUtf8(chineseChar) {    
    var str = chineseChar.replace(/\’|\‘/g,"'").replace(/\“|\”/g,"\"");
    str = str.replace(/\【/g,"[").replace(/\】/g,"]").replace(/\｛/g,"{").replace(/\｝/g,"}");
    str = str.replace(/，/g,",").replace(/：/g,":"); 
    return str;
} 

function up_file(m){
                file_i = $("#"+m+'_file').get(0).files[0]; 
	data = new FormData();
	filename=toUtf8(file_i.name);
	data.append("file", file_i);
	data.append('modes','up');
	data.append('filename', filename);
	url = "/API";
	$.ajax({
		data: data,
		type: "POST",
		url: url,
		cache: false,
		contentType: false,
		processData: false,
		success: function(res) {
			if (res.info == 'y') {
                                                        info_cmd('info', '保存成功', 'y');
			} else {
                                                       info_cmd('danger', res.data, 'y');
			}
		}
	})

}

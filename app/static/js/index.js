LOADING='<i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw" style="font-size:24px;"></i> <span class="sr-only">Loading...</span>';
GET_DATA_INFO='<div class="alert col-sm-12 alert-danger">没有获取到数据</div>';
//获取基础数据
var SETUP_JSON = get_ajax('/API',{"mode": "read_setup"});
var Every= SETUP_JSON.conf.Every.v
GLOB_CONF = get_ajax('/API',{"mode": "read_json"});
var timestamp = (new Date()).valueOf();
version=$.ajax({url: '../static/txt/version',cache: false,async: false});
$('#logoinfo').html(version.responseText)
//BGCOLOUR=['success','info','warning','danger','primary','secondary','dark','light'];
BGCOLOUR=['secondary','dark'];
//获取菜单目录
run_menu();
function run_menu() {
    pmenu = ''
    $.each(GLOB_CONF.menu, function(i, x) {
        pmenu += '<li class="nav-item">' +
                  '<a class="nav-link" href="javascript:void(0);" onclick ="add_css(\'' + x.mode + '\');TO_JS(\'' + x.mode  + '\')" id="' + x.mode + '">' + x.ioc + '</a>' +
                 '</li>';
    })
    $("#menu").html('<ul class="nav nav-tabs">' + pmenu + '</ui>');
    $("#home").addClass("active");
    TO_JS('home');
}
function add_css(p) {
    $.each(GLOB_CONF.menu, function(i, x) {
        $('#' + x.mode).removeClass('active')
    })
    $("#" + p).addClass("active")
    if (p=='cmd'){$('#page_cmd').show();$('#page_list').hide();}else{$('#page_list').show();$('#page_cmd').hide()}
    
}
function TO_JS(m) {
   $.each(GLOB_CONF.menu, function(i, x) {
     if(m==x.mode && isEmpty(x.js)==false)$.getScript('../static/js/'+x.js,function(){eval(x.onclick+'()');});
    })
}
//api命令接口.responseText;
function get_cmd(data, refun) {
    $.get("/API", data, function(result) {
        if (result.info == 'y') {
            eval(refun)
        }
    })
}
function get_ajax(url,data) {
    VAL=$.ajax({url: url,data: data,cache: false,async: false});
    VAL = JSON.parse(VAL.responseText);
    return VAL
}


String.prototype.replaceAll = function(FindText, RepText) {
    return this.replace(new RegExp(FindText, "g"), RepText);
}
//提示框代码
function info_cmd(p, q, z) {
    $('#mpage').empty();
    $('#history_list_page').empty();
    $("#myModal").modal('show');
    //$("#" + z).show();
    info = '<div class="alert alert-' + p + '"><strong>' + q + '</strong></div>'
    //$('#' + z).html(info)
    $('#mpage').html(info);
    //setTimeout('$("#' + z + '").hide()', 3000);
setTimeout("$('#myModal').modal('hide')", 3000);
$("#myModal").modal({backdrop:'static', keyboard: false});
}
//写cookies
function write_cookie(name, value){
                var Days = 1;
                var exp = new Date();
                exp.setTime(exp.getTime() +  60 * 60 * 1000);
                document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}
//读取cookies
function getCookie(name) {
    var strcookie = document.cookie;
    var arrcookie = strcookie.split("; "); 
    for (var i = 0; i < arrcookie.length; i++) {
        var arr = arrcookie[i].split("=");
        if (arr[0] == name) {
            return arr[1];
        }
    }
    return "n";
}
//退出销毁
function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null)
        document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}

function exit() {
    delCookie('email');
    delCookie('toke');
    location.reload()
}

//分页码
function paging(pnumber, sell, fun, email, tpage) {
    var JP = Math.ceil(Number(sell) / Number(Every));
    var ip_MIX = Number(Every) * Number(Number(pnumber));
    var nt = JP - 1

    var paging_pages = ''
    var paging_pages2 = '...<li class="page-item" style="display:inline-block;"><a class="page-link" href="javascript:;" onclick = "' + fun + '(\'' + nt + '\',\'' + ip_MIX + '\',\'' + email + '\',\'' + tpage + '\')">' + JP + '</a></li>'
    var paging_pages3 = ''


    if (JP < 6) {
        s = 0;
        e = JP;
        paging_pages2 = ''
    } else {
        var s = Number(pnumber) - 2;
        var e = Number(pnumber) + 3
        if (s < 0) {
            s = 0;
            e = 5;

        } else {
            if (e >= JP) {
                e = JP;
                s = JP - 5;
                paging_pages2 = ''
                paging_pages3 = '<li class="page-item" style="display:inline-block;"><a class="page-link" href="javascript:;" onclick = "' + fun + '(\'0\',\'0\',\'' + email + '\',\'' + tpage + '\')">' + 1 + '</a></li>...'
            } else {
                s = s;
                e = e;
                paging_pages3 = '<li class="page-item" style="display:inline-block;"><a class="page-link" href="javascript:;" onclick = "' + fun + '(\'0\',\'0\',\'' + email + '\',\'' + tpage + '\')">' + 1 + '</a></li>...'
            }
        }
    }

    for (t = s; t < e; t++) {
        p = t + 1
        ip_MIX2 = Number(Every) * Number(Number(t));
        if (JP > 1) {
            if (pnumber == t) {
                var act = 'active';
            } else {
                var act = ''
            };

            paging_pages += '<li class="page-item ' + act + '" style="display:inline-block;"><a class="page-link" href="javascript:;" onclick = "' + fun + '(\'' + t + '\',\'' + ip_MIX2 + '\',\'' + email + '\',\'' + tpage + '\')">' + p + '</a></li>';

        } else {
            paging_pages += '';

        }
    }
    page = '<div class="text-center" style="margin:0 auto;">' + '<ul class="pagination" style="vertical-align:top;display:inline-block;">' + paging_pages3 + paging_pages + paging_pages2 + '</ul>' + '</div>'
    //'<div style="width:400px; margin:0 auto;"><ul class="pagination">'+paging_pages3+paging_pages+paging_pages2+'</ul></div>'
    return page
}
//时间转换
function tostamp(times) { 
  if(times){
       times=times.replace(/-/g, '/')
       let time = new Date(times)
       return time.getTime()
  }else{
       return ""
  }
}
function timestampToTime(timestamp) {
  // 时间戳为10位需*1000，时间戳为13位不需乘1000
  var date = new Date(parseInt(timestamp));
  var Y = date.getFullYear() + "-";
  var M =
    (date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1) + "-";
  var D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + " ";
  var h = (date.getHours()< 10 ? "0" + date.getHours() : date.getHours())+ ":";

  var m = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())+ ":";
  var s = (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());
  return Y + M + D + h + m + s;
}


// 判断是否为json数据
/** 判断字符串是否是json结构 */
function isJson(str) {
    try {
      if (typeof JSON.parse(str) == "object") {
        return true;
      }
    } catch(e) {}
    return false;
}
//单位转换
function bytesToSize(bytes) {
    if (bytes == 0) return '0';
        var k = 1024, // or 1024
        sizes = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
   return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}
//判断变量是否为空
function isEmpty(data) {
    if (data == "" || data == undefined || data == null || data.length == 0 ||  data == 'undefined' || data == 'null' ) {
     return true;
  }else{
     return false;
  }
}

//获取list设备数据库表名
function get_db_menu(n,q) {
    json_s=get_ajax('/API',{"mode": "cat_db_type","tablename":n});
    get_menu=[];
    $.each(json_s.data, function (i, o) {get_menu.push(o.name);});
    val = {'lie':["ID"],'val':[]};
    $.each(get_menu, function(t, x) {
              if(x!=='ID'){
                val.lie.push(x);
                if(isEmpty($('#'+q+'_' + x).val())==true){nv=''}else{nv=$('#'+q+'_' + x).val().replaceAll(new RegExp('"', 'g'), '\'')};
                val.val.push(nv);
             };
    });
    return val;
}
//删除数据库设备
function del_new_list(name, id, func) {
        if (confirm("确定删除?")) {
            data = {
                mode: 'del_table_user_data',
                tablename: name,
                title: 'ID',
                keywords:id 
            };
            bak=get_ajax('/API',data);
            if(bak.info=='y'){Refresh_data();eval(func+'()');};
        }
}
//监听模态框弹出
$('.modal').on('show.bs.modal', function () {
      return true;
})


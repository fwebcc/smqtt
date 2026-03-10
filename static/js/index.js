// 1. 预定义所有全局变量
var SETUP_JSON = {}, GLOB_CONF = {}, Every = "";
var L_MODE = [], L_LIST = [], L_GROUP = [], L_DASH = []; L_DASH_name = [];
const BGCOLOURALL = ['success', 'info', 'warning', 'danger', 'primary', 'secondary', 'dark', 'light'];
var BGCOLOUR = ['secondary', 'dark'];
var LOADING = '<i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw loading-colorful" style="font-size:24px;"></i><span class="sr-only">Loading...</span>';
var GET_DATA_INFO = '<div class="alert col-sm-12 alert-danger">没有获取到数据</div>';
// 2. 核心同步获取函数
function get_config_sync() {
    try {
        SETUP_JSON = $.ajax({ url: '/API', data: { "mode": "read_setup" }, async: false, dataType: 'json' }).responseJSON;
        GLOB_CONF = $.ajax({ url: '/API', data: { "mode": "read_json" }, async: false, dataType: 'json' }).responseJSON;
        
        if (SETUP_JSON && SETUP_JSON.conf) {
            Every = SETUP_JSON.conf.Every ? SETUP_JSON.conf.Every.v : "";
        }
        
        var version = $.ajax({ url: '../static/txt/version', cache: false, async: false });
        $('#logoinfo').html(version.responseText);
    } catch (e) {
        console.error("❌ 基础配置加载失败:", e);
    }
}
// 3. Socket.io 初始化
let T_socket = null;
if (typeof io !== 'undefined') {
    T_socket = io({ transports: ["polling", "websocket"] });
    T_socket.on("connect", () => { T_socket.sendBuffer = []; });
} else {
    console.warn("⚠️ Socket.io 库未加载");
}

// 4. 业务数据刷新函数 (增加并发锁)
let isRefreshing = false;
async function Refresh_data() {
    if (isRefreshing) return; 
    isRefreshing = true;
    try {
        const [modes, lists, groups, dash] = await Promise.all([
            $.getJSON('/API', { "mode": "table_to_all", "tablename": "mode" }),
            $.getJSON('/API', { "mode": "table_to_all", "tablename": "list" }),
            $.getJSON('/API', { "mode": "table_to_all", "tablename": "group" }),
            $.getJSON('/API', { "mode": "table_to_all", "tablename": "CONUT_LIST" })
        ]);

        L_MODE = modes;
        L_LIST = lists;
        L_GROUP = groups;
        L_DASH = dash;

        if (typeof map_auto === 'function') {
            map_auto();
        }
    } catch (error) {
        console.error("⚠️ 业务数据刷新失败", error);
    } finally {
        isRefreshing = false;
    }
}
// --- 核心执行区：确保顺序执行 ---
async function initializeApp() {
    // 1. 先同步加载基础配置
    get_config_sync();
    
    // 2. 异步加载业务数据
    await Refresh_data();
    
    // 3. 数据加载完后再渲染菜单并执行初始页面逻辑
    run_menu('y');
}
// 启动应用
initializeApp();

const REFRESH_THROTTLE_MS = 3000;
let lastRefreshTime = 0;

const handleVisibilityChange = async () => {
    const now = Date.now();
    if (document.visibilityState === 'visible' && (now - lastRefreshTime > REFRESH_THROTTLE_MS)) {
        lastRefreshTime = now;
        await refreshTokenAndState(window.b_name2);
    }
};

const refreshTokenAndState = async (uuid) => {
    const url = `/token?uuid=${encodeURIComponent(uuid)}&email=uuid`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.info === 'y') {
            write_cookie('toke', data.val);
            // 刷新数据并更新UI
            await Refresh_data();
            if (typeof plist === 'function') plist();
            if (typeof run_menu === 'function') run_menu('n');
        }
    } catch (error) {
        console.error('Failed to refresh session:', error);
    }
};

if (SETUP_JSON?.conf?.Refresh?.v === 'y') {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
};

function run_menu(m = 'y') {
    if (typeof GLOB_CONF === 'undefined' || !GLOB_CONF.menu) {
        return;
    }

    let pmenu = '';
    $.each(GLOB_CONF.menu, function(i, x) {
        const mode = x.mode || '';
        const ioc = x.ioc || '未命名';
        pmenu += `<li class="nav-item">
                    <a class="nav-link" href="javascript:void(0);" 
                       onclick="add_css('${mode}'); TO_JS('${mode}')" 
                       id="${mode}">${ioc}</a>
                  </li>`;
    });

    $("#menu").html('<ul class="nav nav-tabs">' + pmenu + '</ul>');
    $("#home").addClass("active");

    if (m === 'y') {
        if (typeof TO_JS === 'function') TO_JS('home');
    }
}

function add_css(p) {
    $.each(GLOB_CONF.menu, function(i, x) {
        $('#' + x.mode).removeClass('active')
    })
    $("#" + p).addClass("active")
    if (p=='cmd'){$('#page_cmd').show();$('#page_list').hide();}else{$('#page_list').show();$('#page_cmd').hide()}
}
// 在函数外部或全局定义一个记录器
const LOADED_SCRIPTS = {};

function TO_JS(m) {
    $.each(GLOB_CONF.menu, function(i, x) {
        if (m == x.mode && x.js) {
            const scriptUrl = '../static/js/' + x.js + '?v=' + new Date().getTime();
            $.ajax({
                url: scriptUrl,
                dataType: "text",
                cache: false,
                success: function(rawCode) {
                    const safeCode = rawCode.replace(/\bconst\b/g, 'var').replace(/\blet\b/g, 'var');
                    try {
                        const scriptElement = document.createElement('script');
                        scriptElement.text = safeCode;
                        document.head.appendChild(scriptElement).parentNode.removeChild(scriptElement);
                        
                        const funcName = x.onclick.replace('()', ''); 
                        if (typeof window[funcName] === "function") {
                            if (!LOADED_SCRIPTS[x.js]) {

                                window[funcName](); 
                                LOADED_SCRIPTS[x.js] = true; 
                            } else {
                                window[funcName]('y');
                            }
                        }                        
                    } catch (e) {
                        console.error('Code execution failed:', e);
                    }
                }
            });
            return false;
        }
    });
}
function get_cmd(data, refun) {
    $.get("/API", data, function(result) {
        if (result.info == 'y') eval(refun);
    })
}

function get_ajax(url,data) {
    var VAL = $.ajax({url: url, data: data, cache: false, async: false});
    return JSON.parse(VAL.responseText);
}

String.prototype.replaceAll = function(FindText, RepText) {
    return this.replace(new RegExp(FindText, "g"), RepText);
}

function info_cmd(p, q, z='n') {
    var info = '<div class="alert alert-' + p + '"><strong>' + q + '</strong></div>'
    if (z=='n'){
       $('#mpage').empty();
       $('#history_list_page').empty();
       $("#myModal").modal('show');
       $("#mpage").html(info);
       setTimeout(function(){ $('#myModal').modal('hide'); }, 3000);
       $("#myModal").modal({backdrop:'static', keyboard: false});
    }else{
       $("#" + z).show().html(info);
       setTimeout(function(){ $("#" + z).hide(); }, 3000);
   }
}

function write_cookie(name, value){
    var expires = new Date("Sat, 01 Jan 2140 00:00:00 UTC");
    document.cookie = name + "=" + escape(value) + ";expires=" + expires.toUTCString() + ";path=/";
}

function getCookie(name) {
    var strcookie = document.cookie;
    var arrcookie = strcookie.split("; "); 
    for (var i = 0; i < arrcookie.length; i++) {
        var arr = arrcookie[i].split("=");
        if (arr[0] == name) return arr[1];
    }
    return "n";
}

function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null) document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() + ";path=/";
}

function exit() {
    delCookie('email');
    delCookie('toke');
    location.reload();
}
function paging(pnumber, sell, fun, key = '', tpage = '', tablename = '') {
    const currentIdx = parseInt(pnumber) || 0;
    const totalCount = parseInt(sell) || 0;
    const perPage = parseInt(window.Every) || 10; 
    
    const totalPages = Math.ceil(totalCount / perPage);
    if (totalPages <= 1) return '';

    let start = 0, end = totalPages, headHtml = '', tailHtml = '';

    const buildItem = (idx, label, isActive = false, isDisabled = false) => {
        const offset = idx * perPage;
        return `<li class="page-item ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}" style="display:inline-block;">
                    <a class="page-link" href="javascript:void(0);" 
                       onclick="${isDisabled ? '' : `${fun}('${idx}', '${offset}', '${key}', '${tpage}', '', '', '', '', '${tablename}')`}">
                       ${label}
                    </a>
                </li>`;
    };

    if (totalPages >= 6) {
        start = Math.max(0, currentIdx - 2);
        end = Math.min(totalPages, start + 5);
        if (end === totalPages) start = Math.max(0, end - 5);

        if (start > 0) headHtml = buildItem(0, '1') + `<li class="page-item disabled" style="display:inline-block;"><span class="page-link">...</span></li>`;
        if (end < totalPages) tailHtml = `<li class="page-item disabled" style="display:inline-block;"><span class="page-link">...</span></li>` + buildItem(totalPages - 1, totalPages);
    }

    let midHtml = '';
    for (let i = start; i < end; i++) midHtml += buildItem(i, i + 1, i === currentIdx);

    return `<div class="text-center" style="margin:20px auto; width:100%;">
                <ul class="pagination" style="display:inline-flex; vertical-align:top; white-space:nowrap; list-style:none; padding:0;">
                    ${headHtml}${midHtml}${tailHtml}
                </ul>
            </div>`;
}

function tostamp(times) { 
  if(times){
       times=times.replace(/-/g, '/')
       return new Date(times).getTime();
  }
  return "";
}

function timestampToTime(timestamp) {
  var date = new Date(parseInt(timestamp*1000));
  var Y = date.getFullYear() + "-";
  var M = (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1) + "-";
  var D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + " ";
  var h = (date.getHours()< 10 ? "0" + date.getHours() : date.getHours())+ ":";
  var m = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())+ ":";
  var s = (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());
  return Y + M + D + h + m + s;
}

function isJson(str) {
    try { return typeof JSON.parse(str) == "object"; } catch(e) { return false; }
}

function bytesToSize(bytes) {
    if (bytes == 0) return '0';
    var k = 1024, sizes = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

function isEmpty(data) {
    return data == "" || data == undefined || data == null || data.length == 0 || data == 'undefined' || data == 'null';
}

function get_db_menu(n,q) {
    var json_s = get_ajax('/API',{"mode": "cat_db_type","tablename":n});
    var val = {'lie':["ID"],'val':[]};
    $.each(json_s.data, function (i, o) {
        if(o.name !== 'ID'){
            val.lie.push(o.name);
            var nv = $('#'+q+'_' + o.name).val();
            val.val.push(isEmpty(nv) ? '' : nv.replaceAll('"', '\'').replace(/\s/g,""));
        }
    });
    return val;
}

async function del_new_list(name, id, callbackName) {

    if (!confirm("确定删除吗？")) return;
    info_cmd('info', '正在删除...', 'n');

    try {
        const response = await get_ajax('/API', { 
            mode: 'del_table_user_data', 
            tablename: name, 
            title: 'ID', 
            keywords: id 
        });

        if (response.info === 'y') {
            // 4. 等待数据刷新
            await Refresh_data();

            // 5. 安全地执行回调
            if (callbackName && typeof window[callbackName] === 'function') {
                window[callbackName]();
            }
            
            info_cmd('info', '删除成功,无其他修改请刷新页面', 'y');
        } else {
            info_cmd('info', '删除失败：' + (response.msg || '未知错误'), 'n');
        }
    } catch (error) {
        console.error("Delete Error:", error);
        info_cmd('info', '网络错误，请重试', 'n');
    }
}
function find_ip(p){
    var ip = '';
    $.each(L_LIST.data || [], function (x,n) { if(n.ID==p) ip=n.ip; });
    return ip;
}

function isNumeric(value) {
    return /^[+-]?\d+(\.\d+)?$/.test(value);
}

let cachedIcons = null;
function to_img(t, m, ioc, name) {
    const $mpage2 = $("#mpage2");
    const tval = (m === 'sosuo') ? $("#sosuo_txt").val().toLowerCase() : "";

    const renderIcons = (icons) => {
        let ioc_list = '';
        icons.forEach(x => {
            if (m !== 'sosuo' || x.name.toLowerCase().includes(tval)) {
                ioc_list += `<div class="col-sm-4 p-2">
                                <a href="javascript:void(0);" onclick="img_dir('${x.name}', '${t}', '${ioc}')">
                                    <i class="fa ${x.name}" style="font-size:24px"></i> ${x.name}
                                </a>
                             </div>`;
            }
        });

        if (m !== 'sosuo' || $mpage2.find('.icon-container').length === 0) {
            $mpage2.html(`
                <div class="alert-light p-2">
                    <div class="input-group">
                        <input id="sosuo_txt" type="text" class="form-control" value="${tval}" placeholder="关键字"/>
                        <button class="btn btn-success" onclick="to_img('${t}','sosuo','${ioc}','${name}')"><i class="fa fa-search"></i></button>
                    </div>
                    <div class="icon-container" style="height:450px;width:100%;overflow:auto;margin:0 auto;">
                        <div class="row p-4">${ioc_list}</div>
                    </div>
                </div>`);
            $("#history_list_page").empty();
        } else {
            $mpage2.find('.row.p-4').html(ioc_list);
        }
    };

    if (cachedIcons) renderIcons(cachedIcons);
    else $.getJSON("../static/js/awesome.json", function(res) { cachedIcons = res; renderIcons(res); });
}

function img_dir(name,t,ioc) {
    $('#' + ioc).html('<i class="fa ' + name + '" style="font-size:24px"></i>');
    $('#'+ t).val(name);
    $("#myModal2").modal('hide');
}

function CON_VAL(DATA,M,U,T){
    var VAL = '';
    $.each(DATA, function(i, x) { if(x[M]==U) VAL=x[T]; });
    return VAL;
}

function cat_log(d, divn) {
    $("#history_list_page").empty();
    $("#mpage").empty();
    const $mpage = $("#mpage");
    $mpage.html('<div class="text-center p-5"><div class="spinner-border text-primary"></div><p>加载中...</p></div>');
    $.ajax({
        url: '/API',
        data: { "mode": "get_cmd_sh", "keywords": 'cat_log ' + d },
        dataType: 'json',
        success: function(bak) {
            if (bak && bak.info === 'y') {
                const safeData = (bak.data || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');
                $mpage.html(`<div class="alert-light p-3"><div id="log_viewer_container" style="height:600px;overflow:auto;background:#1e1e1e;color:#d4d4d4;padding:15px;border-radius:4px;font-family:monospace;">${safeData}</div></div>`);
                setTimeout(() => { var c = document.getElementById('log_viewer_container'); if(c) c.scrollTop = c.scrollHeight; }, 100);
            }
        }
    });
}


function cat_log_close_d(divn) {$(divn).empty();$(divn).css({'height': 0});$('#log_close').empty();}
//定时任务查找
function findAndFormatById(targetId, sourceData) {
  const item = sourceData.find(item => item.id === targetId);
  if (!item) return false;
  const date = new Date(item.next_run);
  return {
    ...item,
    next_run: date.toLocaleString()
  };
}

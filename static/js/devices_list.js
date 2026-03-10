function plist(m='n') {
    if (m=='y'){Refresh_data();};
    T_MODE = '';
    const LIST_PAGE_TO = `
        <div>
            <div id="top_page">
                <div id="Dashboard"  style="margin-left:12px"></div>
                <div class="mb-3 d-flex justify-content-end" style="margin-right: 10px;">
                   <a href="javascript:void(0);" class="btn btn-light btn-sm text-info rounded-circle shadow-sm" onclick="get_list()">
                    <i class="fa fa-edit text-info"></i>
                  </a>
             </div>
            </div>
            <div id="Sensor"></div>
            <div id="PID_MODE"></div>
        </div>`;
    $("#page_list").html(LIST_PAGE_TO);
    CMD_MODE();
    Dash_CMD();
};
C_MODE = [];
function CMD_MODE() {
    let T_MODE_DATA = [...L_MODE.data];
    T_MODE_DATA.sort((a, b) => {
        return parseFloat(a.xulie) - parseFloat(b.xulie);
    });
    M_MODE = '';
    C_MODE = {};
    const NUBS = Math.floor(Math.random() * 2);
    T_MODE_DATA.forEach(m => {
        let M_GROUP = '';
        const remainder = (parseInt(m.xulie) + NUBS) % 6;
        C_MODE[m.mode] = remainder;
        const BG_CLO = BGCOLOURALL[remainder];
        if (L_GROUP && L_GROUP.data) {
            L_GROUP.data.forEach(y => {
             M_GROUP += `
        <div class="waterfall-item" style="display: none;" id="M_P${m.mode}${y.val}">
            <div class="alert alert-${BG_CLO} py-1 px-3 mt-0 mb-2 mx-2 small" id="G_${m.mode}_${y.val}" style="border-radius: 20px; color: black; line-height: 1.2;">
                ${y.title}
            </div>
          <div style="all: revert; display: -webkit-box; display: -webkit-flex; display: flex; -webkit-flex-wrap: wrap; flex-wrap: wrap;margin-left:5px" class="row"  id="M_${m.mode}${y.val}"></div>
        </div>`;
            });
        }
        M_MODE += `
            <div class="waterfall-item" id="div_${m.ID}_${m.xulie}">
                <div class="shadow-sm-soft bg-white">
                    <div class="card-header-clean d-flex align-items-center" style="padding-bottom: 0px;">
                          <div class="bg-white text-primary text-center rounded-circle shadow-sm mr-2" style="width:30px; height:30px; line-height:30px;">
                        <i class="fa ${m.ioc} me-2" style="font-size:20px"></i>
                          </div>
                        <strong id="T_${m.mode}" style="font-size: 1.1rem;color:black">
                            ${m.title}
                        </strong>
                    </div>
                    <div>
                        ${M_GROUP}
                    </div>
                </div>
            </div>`;
    });
    $("#PID_MODE").html(`<div class="waterfall-container gbin1-list">${M_MODE}</div>`);
    CMD_LIST();
    plist_movie();
    GET_S();
};
function CMD_LIST() {
    var hasJsonArr = [];    
    var noJsonArr = [];     
    var jsonColors = {}; 
    var softColors = [
        'rgba(0, 122, 255, 0.05)', 
        'rgba(255, 59, 48, 0.05)',  
        'rgba(52, 199, 89, 0.05)',  
        'rgba(255, 149, 0, 0.05)',  
        'rgba(175, 82, 222, 0.05)', 
        'rgba(88, 86, 214, 0.05)'   
    ];
    $.each(L_LIST.data, function(i, item) {
        if (item.mode === 'sensor' && item.JSON && item.JSON !== "") {
            hasJsonArr.push(item);
        } else {
            noJsonArr.push(item);
        }
    });
    hasJsonArr.sort(function(a, b) {
        var valA = String(a.JSON);
        var valB = String(b.JSON);
        if (valA !== valB) {
            return valA.localeCompare(valB);
        }
        return (a.title || "").localeCompare(b.title || "");
    });
    var colorIdx = 0;
    $.each(hasJsonArr, function(i, item) {
        if (!jsonColors[item.JSON]) {
            jsonColors[item.JSON] = softColors[colorIdx % softColors.length];
            colorIdx++;
        }
    });
    var finalData = noJsonArr.concat(hasJsonArr);
    $.each(finalData, function(i, x) {
        var currentStat = x.stat || "";
        var statusUpper = currentStat.toUpperCase();
        var Bcolor = 'dark';
        var BIOC = 'off';
        if (['light', 'switch'].includes(x.mode)) {
            if (isEmpty(x.stat) == false) {
                if (["BUTTON5", "BUTTON6"].includes(x.button_down) && statusUpper == 'ON' && x.mode == 'light') { 
                    L_S.push([x.title, x.groups + statusUpper, statusUpper]); 
                };
                if (["BUTTON5", "BUTTON6"].includes(x.button_down) && statusUpper == 'ON' && x.mode == 'switch') { 
                    S_S.push([x.title, x.groups + statusUpper, statusUpper]); 
                };
            }
        }
        if (statusUpper.includes("ON")) {
            BIOC = 'on'; Bcolor = 'red';
        } else if (statusUpper.includes("OFF")) {
            BIOC = 'off'; Bcolor = 'dark';
        }
        HOSTOR_P = SW_replace(GLOB_CONF.BUTTONP.HOSTOR_P, x.ID, 'history_list_page', '', '', x.Subscribe, '', 'Rec_stat', '', '');
        CARD_P = SW_replace(GLOB_CONF.BUTTONP.CARD_P, x.ID, x.mode, x.title, x.Publish, x.Subscribe, '', i, x.unit, x.name);
        PSTAT = SW_replace(GLOB_CONF.BUTTONP.PSTAT, x.ID, x.mode, x.title, x.Publish, x.Subscribe, currentStat, $('#L_' + x.ID).val(), x.unit, x.button_down);
        GPAGE = SW_replace(GLOB_CONF.BUTTONP.GPAGE, x.ID, i, '', x.title, x.Subscribe, '', x.unit, 'Rec_stat', '');
        BUTTON1 = SW_replace(GLOB_CONF.BUTTONP.BUTTON1, x.ID, '', '', PSTAT, '', currentStat, '', '', '');
        BUTTON2 = '';
        BUTTON3 = SW_replace(GLOB_CONF.BUTTONP.BUTTON3, '', '', '', CARD_P, '', '', '', '', '');
        var statVal = parseFloat(currentStat.split('|')[0] || 0).toFixed(2);
        BUTTON4 = SW_replace(GLOB_CONF.BUTTONP.BUTTON4, '', '', '', '', '', statVal, '', x.unit, '');
        BUTTON5 = SW_replace(GLOB_CONF.BUTTONP.BUTTON5, '', Bcolor, '', PSTAT, '', BIOC, '', '', '');
        BUTTON6 = SW_replace(GLOB_CONF.BUTTONP.BUTTON6, '', Bcolor, '', PSTAT, '', '', '', '', '');
        if (isEmpty(x.button_up) == false) {
            CMD_GO = eval(x.button_up);
            BUTTON = eval(x.button_down);
        } else {
            CMD_GO = x.button_up;
            BUTTON = x.button_down;
        }
        IOC = CON_VAL(L_MODE.data, 'mode', x.mode, 'ioc');
        ran = C_MODE[x.mode] || 0;
        BG_CLO = BGCOLOURALL[ran] || 'info';
        BGFAS = '<i class="fa ' + IOC + '" style="font-size:40px;color: white;position: absolute;right: 10px;top: 10px;opacity: 0.3;"></i>';
        if (x.mode == 'sensor') {
            if (!currentStat) {
                var val1 = val2 = val3 = "0"; 
            } else {
                var stats = currentStat.split('|');
                var val0 = parseFloat(stats[3] || 0).toFixed(2);
                var val1 = parseFloat(stats[2] || 0).toFixed(2);
                var val2 = parseFloat(stats[1] || 0).toFixed(2);
                var val3 = parseFloat(stats[0] || 0).toFixed(2);
            }
            var unit = x.unit || "";
            var bgColor = (x.JSON && jsonColors[x.JSON]) ? jsonColors[x.JSON] : "#ffffff";
            var borderColor = (x.JSON && jsonColors[x.JSON]) ? jsonColors[x.JSON].replace('0.05', '0.2') : "rgba(0,0,0,0.03)";
            var page = `
            <div class="col-4 p-1">
                <div id="BC_${x.ID}" class="modern-sensor-widget" style="
                    width: 105px; height: 110px; background: ${bgColor}; border-radius: 22px; 
                    position: relative; overflow: hidden; display: flex; flex-direction: column; 
                    padding: 14px 12px; border: 1px solid ${borderColor};
                    box-shadow: 0 10px 20px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.02) !important;
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); cursor: pointer;">
                    <div style="font-size: 10px; color: #a1a1a6; font-weight: 700; z-index: 3; letter-spacing: 0.4px; text-transform: uppercase; line-height: 1;">
                        <div style="margin-top: 6px; z-index: 3;" data-toggle="modal" data-target="#myModal" onclick="${CMD_GO}">
                            ${x.title}
                        </div>
                    </div>
                    <div id="D_${x.ID}" style="z-index: 3; flex-grow: 1; margin-top: 5px;">
                        <a href="javascript:void(0);" onclick="${GPAGE}" data-toggle="modal" data-target="#myModal" style="font-size: 9px; color: #007aff; text-decoration: none; font-weight: 700; letter-spacing: 0.3px;">
                            <div style="display: flex; align-items: baseline;">
                                <span style="font-size: 20px; font-weight: 800; color: #1d1d1f; line-height: 1; letter-spacing: -0.5px;">
                                    ${val3}<span style="font-size: 10px; color: #007aff; font-weight: 600; margin-left: 2px;">${unit}</span>
                                </span>
                            </div>
                        </a>
                    </div>
                    <canvas id="chart_${x.ID}" width="105" height="45" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 45px; pointer-events: none; z-index: 1; opacity: 0.7;"></canvas>
                </div>
                <style>
                    .modern-sensor-widget:hover {
                        transform: scale(1.1);
                        box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important;
                        border-color: rgba(0,113,227,0.4);
                    }
                </style>
            </div>`;
            $("#M_" + x.mode + x.groups).append(page);
            make_canvas(x.ID, val0, val1, val2, val3);
        } else {
            var page2 = `
            <div class="col-4 p-1">
                <div id="BC_${x.ID}" class="modern-sensor-widget alert-${BG_CLO}" style="
                    width: 105px; height: 110px; border-radius: 22px;
                    position: relative; overflow: hidden; display: flex; flex-direction: column; 
                    padding: 14px 12px;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.02) !important;
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); cursor: pointer;
                    border: 1px solid rgba(0,0,0,0.05);">
                    <div style="font-size: 14px; font-weight: 700; z-index: 3; letter-spacing: 0.4px; text-transform: uppercase; line-height: 1.2; opacity: 0.8;">
                        <a href="javascript:void(0);" style="color:inherit; text-decoration:none;" data-toggle="modal" data-target="#myModal" onclick="${CMD_GO}">
                            <div style="margin-top: 6px;">${x.title}${BGFAS}</div>
                        </a>
                    </div>
                    <div id="D_${x.ID}" style="z-index: 3; flex-grow: 1; margin-top: 5px; display: flex; align-items: center; justify-content: center;">
                        ${BUTTON}
                    </div>
                </div>
            </div>`;     
            $("#M_" + x.mode + x.groups).append(page2);
        }
        $("#M_P" + x.mode + x.groups).show();
    });
};
function make_canvas(id, v1, v2, v3, v4) { // 接收 4 个参数
    setTimeout(function() {
        var canvas = document.getElementById('chart_' + id);
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width; 
        var h = canvas.height;

        // 1. 将数据存入数组并处理比例
        var arr = [parseFloat(v1), parseFloat(v2), parseFloat(v3), parseFloat(v4)];
        var max = Math.max(...arr);
        var min = Math.min(...arr);
        var padding = (max - min) * 0.25 || 1;
        var range = (max - min) + (padding * 2);
        var base = min - padding;

        // 2. 映射 Y 轴坐标点
        var points = arr.map(val => h - ((val - base) / range) * h);

        // 3. 计算 X 轴间隔
        // 4个点对应3个区间，每个区间宽度为 w / 3
        var segment = w / (points.length - 1);

        ctx.clearRect(0, 0, w, h);

        // 绘制路径的方法（为了复用填充和描边逻辑）
        function drawPath(context) {
            context.moveTo(0, points[0]);
            for (var i = 0; i < points.length - 1; i++) {
                var x1 = i * segment;
                var x2 = (i + 1) * segment;
                var cp1x = x1 + segment * 0.5; // 控制点1的X
                var cp2x = x1 + segment * 0.5; // 控制点2的X
                
                // 使用贝塞尔曲线连接相邻两点
                context.bezierCurveTo(cp1x, points[i], cp2x, points[i+1], x2, points[i+1]);
            }
        }

        // --- 绘制填充区域 ---
        ctx.beginPath();
        drawPath(ctx);
        ctx.lineTo(w, h); 
        ctx.lineTo(0, h);
        ctx.closePath(); 
        
        var g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, 'rgba(0, 113, 227, 0.25)');
        g.addColorStop(1, 'rgba(0, 113, 227, 0)');
        ctx.fillStyle = g;
        ctx.fill();

        // --- 绘制顶部线条 ---
        ctx.beginPath();
        drawPath(ctx);
        ctx.strokeStyle = '#0071e3';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

    }, 180);
}
L_S = [];
S_S = [];
function GET_S(list = '') {
    if (!isEmpty(list)) {
        const status = list.stat.toUpperCase();
        const groupKey = list.groups + "ON";
        const itemToMatch = [list.title, groupKey, "ON"];
        if (status === 'ON') {
            if (["BUTTON5", "BUTTON6"].includes(list.button_down)) {
                if (list.mode === 'light') {
                    if (!findIn2DArray(L_S, list.title)) L_S.push(itemToMatch);
                } else if (list.mode === 'switch') {
                    if (!findIn2DArray(S_S, list.title)) S_S.push(itemToMatch);
                }
            }
        } else {
            if (list.mode === 'light') {
                removeFirstArrayItem(L_S, itemToMatch);
            } else if (list.mode === 'switch') {
                removeFirstArrayItem(S_S, itemToMatch);
            }
        }
    }
    $('#T_light, #T_switch').css('color', 'black');
    if (L_S.length > 0) $("#T_light").css('color', 'red');
    if (S_S.length > 0) $("#T_switch").css('color', 'red');
    if (L_GROUP && L_GROUP.data) {
        $.each(L_GROUP.data, function(i, m) {
            if (findIn2DArray(L_S, m.val + 'ON')) {
                $("#G_light_" + m.val).html('<strong class="text-danger">' + m.title + '</strong>');
            } else {
                $("#G_light_" + m.val).html('<strong class="text-muted">' + m.title + '</strong>');
            }
            if (findIn2DArray(S_S, m.val + 'ON')) {
                $("#G_switch_" + m.val).html('<strong class="text-danger">' + m.title + '</strong>');
            } else {
                $("#G_switch_" + m.val).html('<strong class="text-muted">' + m.title + '</strong>');
            }
        });
    }
}
function removeFirstArrayItem(arr, itemToRemove) {
    const index = arr.findIndex(item => 
        Array.isArray(item) && 
        item[0] === itemToRemove[0] && 
        item[1] === itemToRemove[1]
    );
    if (index !== -1) {
        arr.splice(index, 1);
    }
    return arr;
}
function findIn2DArray(arr, target) {
    return arr.some((row) => row.includes(target));
}
function GET_HOSTOR_ONE(m1,m2,m3,m4,m5,m6,m7,m8,m9) {
      $.getScript('../static/js/history.js',function(){get_history(0,0,m1,m2,m3,m4,m5,m6,m7,m8,m9);});
}
function SW_replace(conval,id,mode,title,Publish,Subscribe,value,serial,unit,DOWN) { 
    GODATA=conval.replaceAll(new RegExp('idx', 'g'), id).replaceAll(new RegExp('mode', 'g'), mode).replaceAll(new RegExp('title', 'g'), title).replaceAll(new RegExp('Publish', 'g'), Publish).replaceAll(new RegExp('VALUE', 'g'), value).replaceAll(new RegExp('serial', 'g'), serial).replaceAll(new RegExp('unit', 'g'), unit).replaceAll(new RegExp('DOWN', 'g'), DOWN).replaceAll(new RegExp('Subscribe', 'g'), Subscribe);
    return GODATA;
}
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
                L_MODE = get_ajax('/API',{"mode": "table_to_all","tablename":"mode"});plist();
                $("#myModal").modal('hide');
   });
};
function config_get_v() {
    const uuidList = SETUP_JSON?.key?.uuid || [];
    let browserName = ''; 
    const match = uuidList.find(item => item.id === b_name2);
    if (match) {
        browserName = match.browser;
    }
    $("#idname").html(browserName);
};
config_get_v();
var LOADED_JS_MODULES = {};
function Popup(id, mode, title, Publish, Subscribe, value, serial, unit, name) {
    $("#history_list_page").empty();
    $("#mpage").empty().html(LOADING);
    var scriptPath = '../static/js/' + mode + '.js';
    var runModule = function() {
        if (typeof window[mode] === 'function') {
            window[mode](id, mode, title, Publish, Subscribe, value, serial, unit, name);
        } else {
            console.error("找不到函数: " + mode);
            $("#mpage").html('<span style="color:red">插件函数加载失败</span>');
        }
    };
    if (LOADED_JS_MODULES[mode]) {
        runModule();
    } else {
        $.getScript(scriptPath)
            .done(function() {
                LOADED_JS_MODULES[mode] = true; 
                runModule();
            })
            .fail(function(jqxhr, settings, exception) {
                $("#mpage").html('<span style="color:red">脚本加载失败或存在语法错误</span>');
                console.error("加载脚本失败: " + scriptPath, exception);
            });
    }
};
async function get_pages(titles, i, mode, add, Subscribe, inub, get_unit, tablename = 'Rec_stat') {
    const $historyPage = $("#history_list_page");
    const $mPage = $("#mpage");
    $historyPage.empty();
    $mPage.empty();
    if (mode === 'camera') {
        $mPage.html(add);
        return; 
    }
    const ip = typeof find_ip === 'function' ? find_ip(titles) : 'Unknown';
    const containerId = 'TBPIC';
    const htmlTemplate = `
        <div class="modern-card" style="background: #fff; border-radius: 22px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">
            <h4>${add}</h4>
                    <a href="http://${ip}" target="_blank" style="font-size:12px; color:#bfbfbf; margin-left: '65px'};">
                        <i class="fa fa-link"></i> 设备 IP: ${ip}
                    </a>
            <div id="${containerId}" style="position: relative; overflow: hidden; height: 400px; display: flex; align-items: center; justify-content: center;">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">${typeof GET_DATA_INFO !== 'undefined' ? GET_DATA_INFO : 'Loading...'}</span>
                </div>
            </div>
        </div>`;
    $historyPage.html(htmlTemplate);
    try {
        const interval = (window.Every || 1) * 40; 
        const postData = {
            'mode': 'table_to_sec',
            'tablename': tablename,
            'd1': 0,
            'd2': interval,
            'title': 'listid',
            'keywords': titles
        };
        const response = await get_ajax('/API', postData);
        if (!response || response.info === 'n' || !response.data) {
            $(`#${containerId}`).html(typeof GET_DATA_INFO !== 'undefined' ? GET_DATA_INFO : '暂无数据');
            return;
        }
        const chartData = response.data.map(item => [
            parseFloat(item.time),
            parseFloat(item.stat)
        ]);
        if (typeof bozhexian === 'function') {
            $(`#${containerId}`).empty(); 
            bozhexian(containerId, add, get_unit, chartData);
        } else {
            console.error("图表插件 'bozhexian' 未定义");
        }
    } catch (error) {
        console.error("获取监控历史失败:", error);
        $(`#${containerId}`).html('<div class="text-danger">数据加载失败，请重试</div>');
    }
};
function Pstat(id, mode, title, Publish, Subscribe, value, serial, unit, button_down) {
    let targetValue = value;
    if (["BUTTON5", "BUTTON6"].includes(button_down)) {
        const currentStatus = String(value).toUpperCase();
        targetValue = (currentStatus === "OFF") ? "ON" : "OFF";
    } 
    else if (button_down === 'BUTTON1') {
        const inputVal = $(`#L_${id}`).val();
        if (inputVal === undefined || inputVal === "") {
            console.warn("输入值为空，取消发布");
            return;
        }
        targetValue = inputVal;
    }
    if (Publish) {
        if (mode === 'lock') {
            if (!confirm(`您确定要执行 "${title || '此操作'}" 吗？`)) {
                console.log("用户取消了发布");
                return;
            }
        }
        try {
            mqtt_Publish_Message(targetValue, Publish);
            show_toast(`指令 ${targetValue} 已发送`); 
        } catch (e) {
            console.error("MQTT 发布异常:", e);
        }
    } else {
        console.error("未定义 Publish 主题");
    }
}
function show_toast(msg) {
    console.log(`[Action]: ${msg}`);
};
function Pstat_2(id, mode, title, Publish, Subscribe, value, serial, unit, ip, button_down,stat) {
    const { BUTTONP } = GLOB_CONF;
    if (!BUTTONP) return;
    let BIOC = '';
    let Bcolor = '';
    if (["BUTTON5", "BUTTON6"].includes(button_down)) {
        const valUpper = String(value || "").toUpperCase();
        if (valUpper.includes("ON")) {
            BIOC = 'on';
            Bcolor = 'red';
        } else if (valUpper.includes("OFF")) {
            BIOC = 'off';
            Bcolor = 'dark';
        }
    }
    const serialVal = $('#L_' + id).val();
    const formattedVal = !isNaN(parseFloat(value)) ? parseFloat(value).toFixed(2) : value;
    const HOSTOR_P = SW_replace(BUTTONP.HOSTOR_P, id, 'history_list_page', '', '', '', Subscribe, 'Rec_stat', '', '');
    const CARD_P   = SW_replace(BUTTONP.CARD_P, id, mode, title, Publish, Subscribe, '', unit, name); 
    const PSTAT    = SW_replace(BUTTONP.PSTAT, id, mode, title, Publish, Subscribe, value, serialVal, unit, button_down);
    const GPAGE    = SW_replace(BUTTONP.GPAGE, id, '', '', title, Subscribe, '', unit, 'Rec_stat', '');
    const buttons = {
        BUTTON1: SW_replace(BUTTONP.BUTTON1, id, '', '', PSTAT, '', value, '', '', ''),
        BUTTON2: '',
        BUTTON3: SW_replace(BUTTONP.BUTTON3, '', '', '', CARD_P, '', '', '', '', ''),
        BUTTON4: SW_replace(BUTTONP.BUTTON4, '', '', '', GPAGE, '', formattedVal, '', unit, ''),
        BUTTON5: SW_replace(BUTTONP.BUTTON5, '', Bcolor, '', PSTAT, '', BIOC, '', '', ''),
        BUTTON6: SW_replace(BUTTONP.BUTTON6, '', Bcolor, '', PSTAT, '', '', '', '', '')
    };
    if (mode === 'ir') {
        info_cmd('danger', '发送完成', 'ir_info');
    }
    if (mode === 'sensor') {
        if (!stat) {
            var val1 = val2 = val3 = "0.00"; 
        } else {
            var stats = stat.split('|');
            var val0 = parseFloat(stats[3] || 0).toFixed(2);
            var val1 = parseFloat(stats[2] || 0).toFixed(2);
            var val2 = parseFloat(stats[1] || 0).toFixed(2);
            var val3 = parseFloat(stats[0] || 0).toFixed(2);
            make_canvas(id,val0, val2, val3, value);
        }
    }
    if (!isEmpty(button_down)) {
        const targetHtml = buttons[button_down] || "";
        $('#D_' + id).html(targetHtml);
    }
}
function get_list() {
    $("#history_list_page, #mpage").empty();
    const topHtml = `
        <div class="row p-3">
            <div class="col-sm-6">
                <a href="javascript:void(0);" data-toggle="modal" data-target="#myModal" onclick="add_newlist_page()">
                    <i class="fa fa-plus-circle" style="font-size:24px"></i>
                </a>
            </div>
            <div class="col-sm-6">
                <div class="float-md-right">
                    <a href="javascript:void(0);" onclick="plist();" class="text-danger">
                        <i class="fa fa-backward" style="font-size:24px"></i>
                    </a>
                </div>
            </div>
        </div>`;
    $('#top_page').html(topHtml);
    if (!window.L_LIST || !L_LIST.data) {
        console.warn("L_LIST.data 未定义，无法渲染编辑开关");
        return;
    }
    $.each(L_LIST.data, function(i, m) {
        if (!m.ID) return; 
        const editHtml = `
            <span class="badge" id="E${m.ID}">
                <a href="javascript:void(0);" 
                   onclick="del_new_list('list', '${m.ID}', 'plist')" 
                   class="text-danger">
                   <i class="fa fa-times-circle" style="font-size:24px"></i>
                </a>
                &nbsp;&nbsp;
                <a href="javascript:void(0);" 
                   data-toggle="modal" 
                   data-target="#myModal" 
                   onclick="edit_new_list('${i}')">
                   <i class="fa fa-edit text-primary" style="font-size:24px"></i>
                </a>
            </span>`;
        const $container = $('#D_' + m.ID);
        if ($container.length > 0) {
            $container.html(editHtml);
        }
    });
};
function edit_new_list(i) {
    $("#history_list_page, #mpage").empty();
    const listData = L_LIST['data'][i];
    const itemID = listData['ID'];
    let formHtml = '';
    $.each(listData, function(key, value) {
        if (key === 'ID') return; 
        const config = GLOB_CONF['addinput'][key] || GLOB_CONF['addir'][key];
        if (!config) return;
        const keyName = config.title;
        let fieldHtml = '';
        if (config.mode === 'selec') {
            fieldHtml = `<select id="E_${key}" class="form-control"></select>`;
        } else if (config.mode === 'input') {
            fieldHtml = `<input type="text" id="E_${key}" value="${value}" class="form-control">`;
        }
        if (fieldHtml) {
            formHtml += `
                <div class="row mb-2">
                    <div class="col-sm-5 d-flex justify-content-end align-items-center">${keyName}</div>
                    <div class="col-sm-5">${fieldHtml}</div>
                </div>`;
        }
    });
    const actionButtons = `
        <div class="row mt-3">
            <div class="col-sm-3"></div>
            <div class="col-sm-9">
                <a href="javascript:void(0);" onclick="edit_newlist_go('${i}', '${itemID}')">
                    <i class="fa fa-check-circle" style="font-size:24px; color: #28a745;"></i>
                </a>
                <div id="E_I"></div>
            </div>
        </div>`;
    const pageLayout = `
        <div class="container">
            <h4 class="text-white p-2">编辑设备</h4>
            <div class="card p-3">
                <div class="d-flex justify-content-around">
                    <div class="container m-4">
                        ${formHtml}
                        ${actionButtons}
                    </div>
                    <div id="air_page"></div>
                    <div id="edit_info"></div>
                </div>
            </div>
        </div>`;
    $("#mpage").html(pageLayout);
    const populateSelect = (selector, dataArray, valueKey, textKey, currentValue) => {
        const $el = $(selector);
        $.each(dataArray, function(_, item) {
            const val = item[valueKey];
            const text = item[textKey];
            const selected = (currentValue == val) ? 'selected' : '';
            $el.append(`<option value="${val}" ${selected}>${text}</option>`);
        });
    };
    populateSelect("#E_mode", L_MODE.data, 'mode', 'title', listData['mode']);
    $.each(GLOB_CONF.BUTTON, function(_, btn) {
        const mode = listData['mode'];
        const isSelectedDown = listData['button_down'] == btn.val;
        const isSelectedUp = listData['button_up'] == btn.val;
        if (btn.mod === 'down' && (isSelectedDown || btn.data.includes(mode))) {
            $("#E_button_down").append(`<option value="${btn.val}" ${isSelectedDown ? 'selected' : ''}>${btn.title}</option>`);
        }
        if (btn.mod === 'up' && (isSelectedUp || btn.data.includes(mode))) {
            $("#E_button_up").append(`<option value="${btn.val}" ${isSelectedUp ? 'selected' : ''}>${btn.title}</option>`);
        }
    });
    populateSelect("#E_groups", L_GROUP.data, 'val', 'title', listData['groups']);
    const renderYesNo = (selector, currentVal) => {
        $(selector).append(`
            <option value="y" ${currentVal === 'y' ? 'selected' : ''}>是</option>
            <option value="n" ${currentVal === 'n' ? 'selected' : ''}>否</option>
        `);
    };
    renderYesNo("#E_email", listData['email']);
    renderYesNo("#E_timing", listData['timing']);
    populateSelect("#E_unit", GLOB_CONF.unit, 'unit', 'unit', listData['unit']);
    populateSelect("#E_timemode", GLOB_CONF.timemode, 'mode', 'title', listData['timemode']);
};
function edit_newlist_go(i, ID) {
    var jval = get_db_menu('list', 'E');
    var valArr = [];
    $.each(jval.lie, function(t, x) {
        if (x !== 'ID') {
            var currentVal = jval.val[t - 1] !== undefined ? jval.val[t - 1] : '';
            valArr.push(x + '="' + currentVal + '"');
        }
    });
    var job = valArr.join(',');
    var titleVal = $('#E_title').val();
    var nameVal = $('#E_name').val();
    if (!isEmpty(titleVal) || !isEmpty(nameVal)) {
        var data = {
            'mode': 'edit_db',
            'tablename': 'list',
            'title': ID,
            'keywords': job
        };
        var bak = get_ajax('/API', data);
        if (bak && bak.info == 'y') {
            Refresh_data();
            $('#E_I').html('<span style="color:green">保存完成</span>');
        } else {
            $('#E_I').html('<span style="color:red">保存失败</span>');
        }
    } else {
        info_cmd('danger', '带*填空不能为空', 'edit_info');
    }
};

/**
=================================================添加设备UI
 */
const externalScripts = [
    "../static/js/jquery.actual.min.js",
    "../static/js/multistep.js"
];
function loadDependencies(callback) {
    let loaded = 0;
    $.each(externalScripts, function(i, src) {
        $.getScript(src)
            .done(function() {
                loaded++;
                if (loaded === externalScripts.length) {
                    console.log("依赖项加载完毕");
                    if (callback) callback();
                }
            })
            .fail(function() {
                console.error("加载脚本失败: " + src);
            });
    });
}
function add_newlist_page() {
    // A. 渲染外壳结构
    renderShell('mpage');

    // B. 动态填充第四步的订阅设置 (N_input)
    let dynamicInputs = '';
    let selectControls = {};
    
    $.each(GLOB_CONF['addinput'], function(key, config) {
        const specialFields = ['email', 'timing', 'unit', 'button_down', 'button_up'];
        const rowStart = `<div class="d-flex flex-row mb-2"><div class="col-sm-6 text-right">${config.title}:</div>`;
        const rowEnd = '</div>';
        
        if (specialFields.includes(key)) {
            selectControls[key] = `${rowStart}<div class="col-sm-6 text-left"><select id="A_${key}" class="form-control form-control-sm"></select></div>${rowEnd}`;
        } else if (!['mode', 'groups', 'name', 'title'].includes(key)) {
            dynamicInputs += `${rowStart}<div class="col-sm-6 text-left"><input type="text" id="A_${key}" class="form-control form-control-sm" value=""></div>${rowEnd}`;
        }
    });

    const finalFormHtml = dynamicInputs + 
                         (selectControls['button_up'] || '') + 
                         (selectControls['button_down'] || '') + 
                         (selectControls['email'] || '') + 
                         (selectControls['unit'] || '') + 
                         (selectControls['timing'] || '');

    $("#N_input").html(finalFormHtml);
    $("#A_email, #A_timing").append('<option value="y">是</option><option value="n" selected>否</option>');

    // 填充单位
    $.each(GLOB_CONF.unit, (_, item) => {
        $("#A_unit").append(`<option value="${item.unit}">${item.unit}</option>`);
    });

    // C. 填充第一步：设备类型
    let modeHtml = '';
    $.each(L_MODE.data, (_, item) => {
        modeHtml += `<div class="col-sm-3"><a href="javascript:void(0);" onclick="NA_pre('mode','${item.mode}')"><div id="CS_${item.mode}" class="alert-success my-div p-1 mb-3 mx-1 text-center"><i class="fa ${item.ioc}" style="font-size:48px"></i><p>${item.title}</p></div></a></div>`;
    });
    $("#N_type").html(modeHtml);

    // D. 填充第二步：位置分组
    let groupHtml = '';
    $.each(L_GROUP.data, (_, item) => {
        groupHtml += `<div class="col-sm-3"><a href="javascript:void(0);" onclick="NA_pre('groups','${item.val}')"><div id="CS_${item.val}" class="alert alert-warning my-div p-1 mb-3 mx-1 text-center"><i class="fa ${item.ioc}" style="font-size:48px"></i><p>${item.title}</p></div></a></div>`;
    });
    $("#N_groups").html(groupHtml);

    // E. 核心步骤：加载 JS 并启动 multistep.js 的 step_()
    loadDependencies(function() {
        if (typeof step_ === "function") {
            console.log("启动 multistep 逻辑...");
            step_(); 
        } else {
            // 如果 multistep.js 里没定义 step_，则运行自定义逻辑
            initStepLogic(); 
        }
    });
}

/**
 * 4. 辅助函数：渲染 HTML 骨架
 */
function renderShell(containerId) {
    const multiStepConfig = [
        { title: "选择设备类型", content: '<div style="overflow-x:hidden;overflow-y:auto;width:100%;height:500px;margin:0;"><div id="N_type" class="row"></div></div>' },
        { title: '选择位置<p id="I_mode"></p>', content: '<div style="overflow-x:hidden;overflow-y:auto;width:100%;height:500px;margin:0;"><div id="N_groups" class="row"></div></div>' },
        { title: '设置中英文名称<p id="I_groups"></p>', content: `<div class="d-flex flex-row mb-2"><div class="col-sm-6 text-right">英文名称:</div><div class="col-sm-6 text-left"><input type="text" id="A_name" class="form-control form-control-sm" onKeyUp="value=value.replace(/[\\W]/g,'')"/></div></div><div class="d-flex flex-row"><div class="col-sm-6 text-right">显示名称:</div><div class="col-sm-6 text-left"><input type="text" id="A_title" class="form-control form-control-sm"></div></div><div id="N_name"></div>` },
        { title: "订阅设置", content: '<div id="N_input" style="width:100%;height:600px;"></div><div id="N_othe"></div>' }
    ];

    let dots = multiStepConfig.map(() => `<div class="step"><div class="dot"></div></div>`).join('');
    let slides = multiStepConfig.map(step => `<div class="step-slide"><h5>${step.title}</h5><hr/>${step.content}</div>`).join('');

    $(`#${containerId}`).html(`
        <div class="container2 p-3 card">
            <div class="form-group border-bottom-1"><div class="modal-steps">${dots}</div></div>
            <input type="hidden" id="A_current" value="0">
            <input type="hidden" id="A_mode" value=""><input type="hidden" id="A_groups" value="">
            <div class="form-group"><div id="add_info"></div><div class="step-main">${slides}</div></div>
            <div class="form-group">
                <div class="step-controlbar col-sm-12 d-flex justify-content-between">
                    <button type="button" class="btn btn-secondary btn-sm unVisible" id="pre">上一步</button>
                    <button type="button" class="btn btn-primary btn-sm" id="next">下一步</button>
                </div>
            </div>
        </div>
    `);
}

/**
=================================================添加设备UI
 */

function add_newlist_save() {
    var aTitle = $('#A_title').val();
    var aName = $('#A_name').val();
    var aMode = $('#A_mode').val();
    if (!isEmpty(aTitle) && !isEmpty(aName) && !isEmpty(aMode)) {
        var isDuplicate = false;
        if (L_LIST.info !== 'n' && L_LIST.data) {
            $.each(L_LIST.data, function(t, x) {
                if (x.title === aTitle || x.name === aName) {
                    isDuplicate = true;
                    return false; 
                }
            });
        }
        if (!isDuplicate) {
            var val = get_db_menu('list', 'A');
            var data = {
                'mode': 'add_list_db',
                'tablename': 'list',
                'keywords': JSON.stringify(val)
            };
            var bak = get_ajax('/API', data);
            if (bak && bak.info === 'y') {
                Refresh_data(); 
                plist();        
                $("#mpage").html('<div class="alert alert-success"><strong>添加成功</strong></div>');
            } else {
                info_cmd('danger', '保存失败，请稍后重试', 'add_info');
            }
        } else {
            info_cmd('danger', '中文或者英文名称已存在', 'add_info');
        }
    } else {
        info_cmd('danger', '带*填空不能为空', 'add_info');
    }
};
function Dash_CMD() {
    const $container = $("#Dashboard");
    $container.show();
    if (L_DASH.info !== 'y') {
        $container.html('<div class="text-info" id="top_page2"><a href="javascript:void(0);" style="color:inherit;" onclick="edit_dash_cmd()"><i class="fa fa-line-chart" style="font-size:24px"></i></a></div>');
        return;
    }
    let dashboardHtml = '';
    $.each(L_DASH.data, function(i, item) {
        const btnP = GLOB_CONF.BUTTONP;
        const hostorP1 = SW_replace(btnP.HOSTOR_P, item.listid, 'history_list_page', '', '', item.Subscribe, '', 'CONUT_REC', '', '');
        const hostorP2 = SW_replace(btnP.HOSTOR_P, item.listid, 'history_list_page', '', '', item.Subscribe, '', 'Rec_stat', '', '');
        const gPage1 = SW_replace(btnP.GPAGE, item.listid, i, '', item.title, item.Subscribe, '', item.unit, 'CONUT_REC', '');
        const gPage2 = SW_replace(btnP.GPAGE, item.listid, i, '', item.title, item.Subscribe, '', item.unit, 'Rec_stat', '');
        const valYesterday = Number((item.yestdat || '0').split('|')[0]).toFixed(2);
        const valNow = Number((item.now || '0').split('|')[0]).toFixed(2);
        const valMonth = Number(item.month || 0).toFixed(2);
        const renderMetric = (colorClass, label, clickMain, clickSub, value, unit, idSuffix) => `
            <div class="col-4 p-1" 
     onmouseover="this.style.transform='scale(1.1)'" 
     onmouseout="this.style.transform='translateY(0px)'"
     style="transition: 0.3s;"
>
                <div class="alert alert-${colorClass} m-0 text-center" style="border-radius:8px; position:relative; overflow:hidden;">
                    <a href="javascript:void(0);" class="text-${colorClass}" style="text-decoration:none; font-size:12px;" data-toggle="modal" data-target="#myModal" onclick="${clickMain}">
                        <strong>${label}</strong>
                    </a>
                    <div id="DASH${idSuffix}_${item.ID}" class="mt-1">
                        <a href="javascript:void(0);" class="text-${colorClass}" style="text-decoration:none;" data-toggle="modal" data-target="#myModal" onclick="${clickSub}">
                            <h5 class="mb-0" style="font-weight:bold;">${value}</h5><small>${unit}</small>
                        </a>
                    </div>
                </div>
            </div>`;
        dashboardHtml += `
            <div class="col-sm-4">
               <div class="shadow-sm-soft">
                    <div class="p-2 card-header-clean d-flex justify-content-between align-items-center">
                          <div class="bg-white text-primary text-center rounded-circle shadow-sm mr-2" style="width:30px; height:30px; line-height:30px;">
                            <i class="fa ${item.ioc}" style="font-size:14px;"></i>
                          </div>
                          <h6 class="m-0 font-weight-bold text-dark">${item.title}</h6>
                    </div>
                    <div class="alert p-2">
                        <div class="row no-gutters">
                            ${renderMetric('info', '昨日', hostorP1, gPage1, valYesterday, item.unit, '')}
                            ${renderMetric('primary', '今日', hostorP2, gPage2, valNow, item.unit, '1')}
                            ${renderMetric('danger', '本月', hostorP2, gPage2, valMonth, 'KW', '2')}
                        </div>
                    </div>
                </div>
            </div>`;
    });
    const editIcon = `
        <div class="text-info" id="top_page2">
         <div class="mb-3 d-flex justify-content-end">
            <a href="javascript:void(0);" class="btn btn-light btn-sm text-info rounded-circle shadow-sm" onclick="edit_dash_cmd()">
                <i class="fa fa-line-chart"></i>
            </a>
        </div>
       </div>`;
    $container.html(`${editIcon}<div class="row" style="display: flex; flex-wrap: wrap; margin: 0 -10px;">${dashboardHtml}</div>`);
}
function cal_list_xiao() {
    const $dash = $('#Dashboard');
    $dash.html(LOADING);
    get_ajax('/API', { "mode": "rec_histor_conut" });
    G_DATA_TODAY = get_ajax('/API', { "mode": "find_histor_conut" });
    const dashData = get_ajax('/API', { 
        "mode": "table_to_all", 
        "tablename": "CONUT_LIST" 
    });
    if (dashData) {
        L_DASH = dashData;
        Dash_CMD();
    } else {
        $dash.html('<div class="alert alert-warning">校准完成，但未能获取到最新数据。</div>');
    }
};
function edit_dash_cmd() {
    const rawData = (L_DASH && L_DASH.data && L_DASH.data.length > 0) ? L_DASH.data[0].now : "";
    const dashLabel = rawData ? (rawData.split('|')[5] || '') : '等待数据...';
    const calDashHtml = `
        <a href="javascript:void(0);" style="color:inherit;" onclick="cal_list_xiao()">
            <o id="logo1">
                <i class="fa fa-undo text-info" style="font-size:24px"></i>
            </o>
        </a>`;
    const linfo = `
        <div class="row p-3">
            <div class="col-sm-4">
                <a href="javascript:void(0);" data-toggle="modal" data-target="#myModal" onclick="add_dash_new_page()">
                    <i class="fa fa-plus-circle text-info" style="font-size:24px"></i>
                </a>
            </div>
            <div class="col-sm-4">
                ${calDashHtml} <span class="badge badge-light">${dashLabel}</span>
            </div>
            <div class="col-sm-4">
                <div class="float-md-right">
                    <a href="javascript:void(0);" onclick="Dash_CMD()" class="text-danger">
                        <i class="fa fa-backward" style="font-size:24px"></i>
                    </a>
                </div>
            </div>
        </div>`;
    $('#top_page2').html(linfo);
    if (typeof edit_dash_cmd_start === 'function') {
        edit_dash_cmd_start();
    }
};
function edit_dash_cmd_start() {
    const data = L_DASH?.data;
    if (!Array.isArray(data)) {
        console.warn("L_DASH.data 为空或格式错误");
        return;
    }
    $.each(data, function(i, item) {
        const { ID } = item; 
        const $container = $(`#DASH_${ID}`); 
        if ($container.length === 0) return true;
        const editHtml = `
            <span class="badge" id="E_DASH_${ID}">
                <a href="javascript:void(0);" 
                   onclick="del_new_list('CONUT_LIST', '${ID}', 'Dash_CMD')" 
                   class="text-danger mr-2">
                    <i class="fa fa-times-circle" style="font-size:24px"></i>
                </a>
                <a href="javascript:void(0);" 
                   data-toggle="modal" 
                   data-target="#myModal" 
                   onclick="edit_new_dash('${i}')">
                    <i class="fa fa-edit" style="font-size:24px"></i>
                </a>
            </span>`;
        $container.html(editHtml);
    });
};
var DASH_NAME = ['id', '选择设备', '图标', '单位', '标题', '', '', '主题', '命令', '状态'];
function edit_new_dash(v) {
    $("#history_list_page").empty();
    $("#mpage").empty();
    var G_MU = get_db_menu('CONUT_LIST', 'E');
    var E_P = '';
    var E_P_IOC = '';
    var currentData = L_DASH.data[v];
    $.each(G_MU.lie, function(i, x) {
        if (x !== 'ID' && x !== 'name' && x !== 'now' && x !== 'yestdat') {
            var val = currentData[x] || ''; 
            if (x === 'ioc') {
                var iocv = "ioc_dir" + i;
                E_P_IOC += '<div class="row mb-2">' +
                             '<div class="col-sm-3">' + DASH_NAME[i] + '</div>' +
                             '<div class="col-sm-9">' +
                               '<input type="text" id="DASH_INPUT_' + x + '" value="' + val + '">' +
                               '<i id="' + iocv + '"><i class="fa ' + val + '" style="font-size:24px; margin-left:10px;"></i></i>' +
                               '<a href="javascript:void(0);" data-toggle="modal" data-target="#myModal2" ' +
                               'onclick="to_img(\'DASH_INPUT_' + x + '\', \'\', \'' + iocv + '\', \'\')" ' + 
                               'class="text-white btn btn-info btn-sm ml-2">选择</a>' +
                             '</div>' +
                           '</div>';
            } else {
                E_P += '<div class="row mb-2">' +
                         '<div class="col-sm-3">' + DASH_NAME[i] + '</div>' +
                         '<div class="col-sm-9">' +
                           '<input type="text" id="DASH_INPUT_' + x + '" value="' + val + '">' +
                         '</div>' +
                       '</div>';
            }
        }
    });
    var butt = '<div class="row mt-4">' +
                 '<div class="col-sm-3"></div>' +
                 '<div class="col-sm-9">' +
                   '<a href="javascript:void(0);" onclick="edit_dash_save(\'' + currentData['ID'] + '\')">' +
                     '<i class="fa fa-check-circle" style="font-size:32px; color: #28a745;"></i>' +
                   '</a>' +
                 '</div>' +
               '</div>';
    var page = '<div class="card">' +
                 '<h5 class="p-3">编辑设备</h5><hr>' +
                 '<div class="container m-4">' + E_P_IOC + E_P + butt + '</div>' +
                 '<div id="air_page"></div>' +
                 '<div id="edit_info"></div>' +
               '</div>';
    $("#mpage").html(page);
};
function edit_dash_save(v) {
    var G_MU = get_db_menu('CONUT_LIST', 'E');
    var val_arr = []; 
    $.each(G_MU.lie, function(i, x) {
        if (x !== 'ID' && x !== 'name') {
            var inputVal = $("#DASH_INPUT_" + x).val();
            var safeVal = (inputVal || "").replace(/"/g, '\\"'); 
            val_arr.push(x + '="' + safeVal + '"');
        }
    });
    var job = val_arr.join(','); 
    var titleVal = $('#DASH_INPUT_title').val();
    if (isEmpty(titleVal) === false) {
        var data = {
            'mode': 'edit_db',
            'tablename': 'CONUT_LIST',
            'title': v,
            'keywords': job
        };
        $('#edit_info').html('<span class="text-primary">正在保存...</span>');
        var bak = get_ajax('/API', data);
        if (bak && bak.info === 'y') {
            Refresh_data();
            Dash_CMD();
            $('#edit_info').html('<span class="text-success"><i class="fa fa-check"></i> 保存完成</span>');
            setTimeout(function(){ $('#edit_info').empty(); }, 3000);
        } else {
            info_cmd('danger', '保存失败：' + (bak.msg || '未知错误'), 'edit_info');
        }
    } else {
        info_cmd('danger', '带*填空（标题）不能为空', 'edit_info');
    }
};
function add_dash_new_page() {
    $("#history_list_page, #mpage").empty();
    const rowClass = "row mb-3"; 
    const labelClass = "col-sm-3 col-form-label";
    const inputColClass = "col-sm-9";
    const inputClass = "form-control"; 
    const E_P_NAME = `
        <div class="${rowClass}">
            <div class="${labelClass}">${DASH_NAME[1]}</div>
            <div class="${inputColClass}">
                <select id="DASH_ADD_listid" class="${inputClass}"></select>
            </div>
        </div>`;
    const E_P_IOC = `
        <div class="${rowClass}">
            <div class="${labelClass}">${DASH_NAME[2]}</div>
            <div class="${inputColClass}">
                <input type="text" id="DASH_ADD_ioc" class="${inputClass}" value="fa-user">
            </div>
        </div>`;
    const E_P_UNIT = `
        <div class="${rowClass}">
            <div class="${labelClass}">${DASH_NAME[3]}</div>
            <div class="${inputColClass}">
                <input type="text" id="DASH_ADD_unit" class="${inputClass}" list="T_L_P3" placeholder="选择或输入单位">
                <datalist id="T_L_P3"></datalist>
            </div>
        </div>`;
    const E_P_TITLE = `
        <div class="${rowClass}">
            <div class="${labelClass}">${DASH_NAME[4]}</div>
            <div class="${inputColClass}">
                <input type="text" id="DASH_ADD_title" class="${inputClass}" value="新计量项">
            </div>
        </div>`;
    const E_HIDE = '<input type="hidden" id="DASH_ADD_now" value="0"><input type="hidden" id="DASH_ADD_yestdat" value="0">';
    const butt = `
        <div class="row mt-4">
            <div class="col-sm-3"></div>
            <div class="col-sm-9">
                <button class="btn btn-success btn-lg" onclick="new_dash_save()">
                    <i class="fa fa-check-circle"></i> 确认添加
                </button>
            </div>
        </div>`;
    const page = `
        <div class="container py-3">
            <h4 class="text-white mb-3"><i class="fa fa-plus"></i> 添加计量面板</h4>
            <div class="card shadow-sm">
                <div class="card-body m-2">
                    ${E_HIDE}
                    ${E_P_NAME}
                    ${E_P_IOC}
                    ${E_P_UNIT}
                    ${E_P_TITLE}
                    ${butt}
                </div>
                <div id="air_page"></div>
                <div id="edit_info" class="p-3"></div>
            </div>
        </div>`;
    $("#mpage").html(page);
    if (typeof hand2 === 'function') {
        hand2(); 
    }
};
function new_dash_save() {
    var val = get_db_menu('CONUT_LIST', 'DASH_ADD');
    var $listid = $('#DASH_ADD_listid');
    var $btn = $(event.currentTarget); 
    if (!isEmpty($listid.val())) {
        if ($btn.hasClass('disabled')) return;
        $btn.addClass('disabled').css('pointer-events', 'none');
        $('#edit_info').html('<span class="text-info">正在提交...</span>');
        var data = {
            'mode': 'add_list_db',
            'tablename': 'CONUT_LIST',
            'keywords': JSON.stringify(val)
        };
        var bak = get_ajax('/API', data);
        if (bak && bak.info === 'y') {
            info_cmd('success', '添加成功！页面即将刷新', 'edit_info');
            setTimeout(function() {
                Refresh_data(); 
                Dash_CMD();     
                $('#myModal').modal('hide'); 
            }, 1500);
        } else {
            $btn.removeClass('disabled').css('pointer-events', 'auto');
            info_cmd('danger', '添加失败：' + (bak.msg || '服务器响应异常'), 'edit_info');
        }
    } else {
        info_cmd('danger', '请选择一个有效的设备', 'edit_info');
    }
};
function hand2() {
    const $listid = $("#DASH_ADD_listid");
    $listid.empty(); 
    if (L_LIST && L_LIST.data) {
        $.each(L_LIST.data, function (t, x) {
            if (x.mode === 'sensor') { 
                $listid.append(`<option value="${x.ID}">${x.title}</option>`); 
            }
        });
    }
    const $unitList = $("#T_L_P3");
    $unitList.empty(); 
    if (GLOB_CONF && GLOB_CONF.unit) {
        let unitHtml = '';
        $.each(GLOB_CONF.unit, function (t, x) {
            if (x.unit) {
                unitHtml += `<option value="${x.unit}"></option>`;
            }
        });
        $unitList.append(unitHtml);
    }
}
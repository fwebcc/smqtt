const cardsData = [
    { id: "demo_mqtt", icon: "fa-server", callback: "get_mqtt()", contentId: "smqtt", padding: true },
    { id: "GET_HOMEKIT", icon: "fa-home", callback: "get_H_C()", contentId: "P_HOMEKIT" },
    { id: "demo_conf", icon: "fa-cogs", callback: "get_conf()", customHtml: `
        <p>此处配置完成后需要重启软件才能生效!</p>
        <button type="submit" class="btn btn-warning btn-sm" onclick="auto_x_y_go()">
            <i class="fa fa-map-marker" style="font-size:36px"></i>
        </button>
        <div id="info_conf"></div><hr /><div id="w_conf"></div>` 
    },
    { id: "demo_user", icon: "fa-user-circle-o", callback: "get_login()", isUserPanel: true },
    { id: "demo_group", icon: "fa-arrows-alt", callback: "get_group()", contentId: "group" },
    { id: "demo_list", icon: "fa-snowflake-o", callback: "get_mode()", contentId: "Slist" },
    { id: "demo_token", icon: "fa-handshake-o", callback: "get_token(0,0)", contentId: "Stoken" },
    { id: "demo_bak", icon: "fa-cloud-download", callback: "", isBackupPanel: true }
];
function initAppUI(targetId) {
    const target = document.getElementById(targetId);
    let finalHtml = '<div id="user_info"></div>';

    cardsData.forEach(item => {
        let bodyContent = '';
        if (item.isUserPanel) {
            bodyContent = `
                <div id="w_user">
                    <div class="row">
                        ${[['用户名','X_user','text'], ['密码','X_pass','password'], ['再次密码','X_pass2','password']].map(f => `
                            <div class="col-3">${f[0]}</div>
                            <div class="col-9"><input type="${f[2]}" id="${f[1]}" value="" /></div>
                        `).join('')}
                    </div>
                    <button type="submit" class="btn btn-info btn-sm mt-2" onclick="edit_user_go()">保存</button>
                    <div class="row mt-3">
                        <div class="col-12">
                            <h4>免登录设备列表</h4>[浏览器编号:<x id="msnget"></x>]<hr/>
                            <div id="login_list"></div>
                        </div>
                    </div>
                </div>`;
        } else if (item.isBackupPanel) {
            // 备份下载面板
            bodyContent = `
                <div class="row">
                    ${[['SETUP.json','json','配置文件'], ['data.db','db','数据库']].map(f => `
                        <div class="col-sm-6">
                            <ul class="list-group">
                                <li class="list-group-item"><a href="/API?mode=down&keywords=${f[0]}">下载${f[2]} <i class="fa fa-angle-double-down"></i></a></li>
                                <li class="list-group-item">
                                    <input type="file" id="${f[1]}_file" /> 
                                    <button class="btn btn-sm btn-primary" onclick="up_file('${f[1]}')">提交</button>
                                    <br/>[上传${f[0]}备份]
                                </li>
                            </ul>
                        </div>
                    `).join('')}
                </div>`;
        } else {
            bodyContent = item.customHtml || `<div id="${item.contentId}"></div>`;
        }

        finalHtml += `
            <div class="card">
                <div class="card-header">
                    <a href="javascript:void(0);" data-toggle="collapse" data-target="#${item.id}" onclick="${item.callback}">
                        <i class="fa ${item.icon}" style="font-size:36px"></i>
                    </a>
                </div>
                <div id="${item.id}" class="collapse ${item.isUserPanel ? 'p-4' : ''}">
                    <div class="card-body ${item.padding ? 'p-4' : ''}">
                        ${bodyContent}
                    </div>
                </div>
            </div>`;
    });

    target.innerHTML = finalHtml;
}


function config_get() {
        initAppUI('page_list')
        const uuidList = SETUP_JSON?.key?.uuid || [];
        const match = uuidList.find(item => item.id === b_name2);
        const b_namex = match ? match.browser : (typeof b_name !== 'undefined' ? b_name : '');
        $("#msnget").html(b_namex);
}

const mqttConfigFields = [
    { label: "地址", id: "url", type: "text", value: "" },
    { label: "路径", id: "path", type: "text", value: "/mqtt" },
    { label: "websocket端口", id: "port", type: "text", value: "" },
    { label: "MQTT端口", id: "mtport", type: "text", value: "" },
    { label: "用户名", id: "muser", type: "text", value: "" },
    { label: "SSL/TLS开启", id: "tls", type: "checkbox", value: false },
    { label: "密码", id: "mpass", type: "password", value: "" },
    { label: "客户端ID", id: "mid", type: "text", value: "" },
    { label: "订阅主题", id: "mTopic", type: "text", value: "#" },
    { label: "刷新间隔", id: "reconnectTimeout", type: "text", value: "" },
    { label: "缓存清理", id: "cleansession", type: "checkbox", value: false },
    { label: "QOS", id: "qos", type: "text", value: "0" }
];

// 2. 渲染函数
function renderMqttUI(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("找不到容器: " + containerId);
        return;
    }

    let html = `
        <p class="text-danger">保存设置后请重启软件, 设置才会生效!</p>
        <div id="mosq_stat"></div>`;

    for (let i = 0; i < mqttConfigFields.length; i += 2) {
        html += '<div class="row p-3" style="margin-bottom: 10px;">';
        
        for (let j = 0; j < 2 && (i + j) < mqttConfigFields.length; j++) {
            const field = mqttConfigFields[i + j];
            const isCheck = field.type === 'checkbox';
            
            html += `
                <div class="col-sm-3">${field.label}</div>
                <div class="col-sm-3">
                    <input type="${field.type}" id="${field.id}" 
                           ${isCheck ? (field.value ? 'checked' : '') : `value="${field.value}"`}
                           ${isCheck ? '' : 'class="form-control form-control-sm" style="width:100%"'}>
                </div>`;
        }
        html += '</div>';
    }

    html += `
        <div class="row" >
            <div class="col-sm-2  p-3">
                <button type="button" class="btn btn-success btn-block btn-sm" onclick="mqtt_save()">保存配置</button>
            </div>
            <div class="col-sm-2  p-3">
                <button type="button" class="btn btn-danger btn-block btn-sm" onclick="mqtt_restart()">重启软件</button>
            </div>
        </div>`;

    container.innerHTML = html;
}

function get_mqtt() {
    SETUP_JSON = get_ajax('/API', { "mode": "read_setup" });
    const mqtt = SETUP_JSON?.mqtt || {};
    renderMqttUI("smqtt")

        // 批量填充基础表单字段
        $('#url').val(mqtt.url);
        $('#port').val(mqtt.port);
        $('#path').val(mqtt.path);
        $('#muser').val(mqtt.user);
        $('#mid').val(mqtt.id);
        $('#mtport').val(mqtt.mtport);
        $('#mpass').val(mqtt.pass);
        $('#mTopic').val(mqtt.topic);
        $('#qos').val(mqtt.qos);
        $('#reconnectTimeout').val(mqtt.reconnectTimeout);

        // 处理复选框 (使用 prop 性能更好且更准确)
        $("#tls").prop("checked", mqtt.tls === true);
        $("#cleansession").prop("checked", mqtt.cleansession === true);

        // 获取运行状态
        const bak = get_ajax('/API', { mode: 'get_cmd_sh', keywords: 'mosq_on_off' });
        
        const isRunning = (bak && bak.info === 'y');
        const alertClass = isRunning ? 'success' : 'danger';
        const statusText = isRunning ? 'mosquitto已运行' : 'mosquitto未运行';

        // 使用模板字符串组装
        const mosq_s = `
            <button type="submit" class="btn btn-danger btn-sm" onclick="return restart_mosq_go()">
                <i class="fa fa-refresh"></i>
            </button>`;
        
        const TO_MOS_D = `
            <div class="alert alert-${alertClass}" id="m_info">
                ${statusText} ${mosq_s}
            </div>`;

        $('#mosq_stat').html(TO_MOS_D);

}

//重启
async function restart_mosq_go() {
    if (!confirm('确定要重启 Mosquitto 服务吗？')) return false;
    const requestData = {
        "mode": "get_cmd_sh",
        "keywords": "mosq_restart"
    };
    info_cmd('info', '正在发送重启指令...');

    try {
        $.get("/API", requestData, function(result) {
            if (result && (result.info === 'y' || result.status === 'success')) {          
                if (typeof get_mqtt === 'function') get_mqtt();
                
                info_cmd('info', '重启成功');
            } else {
                info_cmd('error', '重启失败：' + (result.msg || '服务器未响应'));
            }
        }).fail(function() {
            info_cmd('error', '网络请求失败，请检查网络连接');
        });
        
    } catch (error) {
        console.error("Restart Error:", error);
    }
}
function get_group() {
    let gHtml = '';
    const $addGroupSelect = $("#add_group");
    const $groupContainer = $('#group');
    
    $addGroupSelect.empty();
    if (L_GROUP && L_GROUP.info !== 'n' && Array.isArray(L_GROUP.data)) {
        L_GROUP.data.forEach(x => {
            gHtml += `
                <div class="col-sm-4">
                    <ul class="list-group">
                        <li class="list-group-item">
                            名称: <input type="text" id="GROP_${x.val}" value="${x.title}">
                                  <input type="hidden" id="GROP_V${x.val}" value="${x.val}">

                        </li>
                        <li class="list-group-item">
                            <a href="javascript:void(0);" onclick="del_new_list('group','${x.ID}','get_group')" class="text-danger">
                                <i class="fa fa-times-circle" style="font-size:24px"></i>
                            </a>
                            <span class="badge">
                                <a href="javascript:void(0);" onclick="edit_group('${x.val}','${x.ID}')">
                                    <i class="fa fa-check-circle" style="font-size:24px"></i>
                                </a>
                            </span>
                        </li>
                    </ul>
                </div>`;
            $addGroupSelect.append(`<option value="${x.val}">${x.title}</option>`);
        });
    }
    const addG = `
        <div class="col-sm-4">
            <ul class="list-group">
                <li class="list-group-item">名称: <input type="text" id="add_group_title" value=""></li>
                <li class="list-group-item">值:   <input type="text" id="add_group_val" value="" oninput="this.value=this.value.replace(/[^a-zA-Z]/g,'')" placeholder="仅限英文字母"></li>
                <li class="list-group-item">
                    <a href="javascript:void(0);" onclick="add_group()">
                        <i class="fa fa-plus-circle" style="font-size:24px"></i>
                    </a>
                </li>
            </ul>
        </div>`;
    $groupContainer.html(`<div class="row">${gHtml}${addG}</div>`);
}

//组的编辑删除增加
function add_group() {
    const $title = $("#add_group_title");
    const $val = $("#add_group_val");
    const titleVal = $.trim($title.val());
    const dataVal = $.trim($val.val());

    if (!titleVal || !dataVal) {
        info_cmd('danger', '名称和数值不能为空', 'n');
        return; 
    }

    const job = `null,"${titleVal}","${dataVal}"`;
    const requestData = {
        'mode': 'add_db_data',
        'tablename': 'group',
        'keywords': job
    };

    const bak = get_ajax('/API', requestData);

    if (bak && bak.info === 'y') {
        Refresh_data();
        $title.val('');
        $val.val('');
        info_cmd('success', '添加成功', 'n'); 
        get_group();
    } else {
        info_cmd('danger', '添加失败：' + (bak.msg || '未知错误'), 'n');
    }
}
//编辑组
function edit_group(i, ID) {
    const inputValue = $('#GROP_' + i).val().trim(); 
    const inputValue2 = $('#GROP_V' + i).val().trim(); 
    if (inputValue !== "") {
        const job = `val="${inputValue2}",title="${inputValue}"`;
        const data = {
            'mode': 'edit_db',
            'tablename': 'group',
            'keywords': job,
            'title': ID
        };

        const bak = get_ajax('/API', data);

        if (bak && bak.info === 'y') {
            Refresh_data();
            get_group();
            info_cmd('success', '修改成功', 'n'); 
        }
    } else {
        info_cmd('danger', '名称不能为空', 'n');
    }
}
//类型页面
function get_mode() {
    const typeAddMap = {};
    Object.values(GLOB_CONF.type_ADD || {}).forEach(group => {
        group.forEach(item => { typeAddMap[item.val] = item.title; });
    });
    
    const typeMap = {};
    (GLOB_CONF.type || []).forEach(item => { typeMap[item.val] = item.title; });

    let Spage = '';
    const $addList = $("#add_list").empty();
    if (L_MODE.info !== 'n' && Array.isArray(L_MODE.data)) {
        Spage = L_MODE.data.map((x, i) => {
            const group_title = typeAddMap[x.mode] || '';
            const type_title = typeMap[x.type] || '';
            const idimg = `add_mode_ioc${i}`;
            const ioc_dir = `ioc_dir${i}`;
            $addList.append(`<option value="${x.mode}">${x.title}</option>`);

            return `
                <div class="col-sm-4">
                    <ul class="list-group">
                        <li class="list-group-item">图标: 
                            <i id="${ioc_dir}"><i class="fa ${x.ioc}" style="font-size:24px"></i></i>
                            <input type="text" id="${idimg}" value="${x.ioc}">
                            <a href="javascript:void(0);" data-toggle="modal" data-target="#myModal2" 
                               onclick="to_img('${idimg}', 'one', '${ioc_dir}', '${x.ioc}')" 
                               class="text-white btn btn-info btn-sm">选择</a>
                        </li>
                        <li class="list-group-item">模式: ${type_title}</li>
                        <li class="list-group-item">名称: <input type="text" id="add_mode_title${i}" value="${x.title}"></li>
                        <li class="list-group-item">类型: ${group_title}</li>
                        <li class="list-group-item">
                            <a href="javascript:void(0);" onclick="del_new_list('mode','${x.ID}','get_mode')" class="text-danger">
                                <i class="fa fa-times-circle" style="font-size:24px"></i>
                            </a>
                            <span class="badge">
                                <a href="javascript:void(0);" onclick="edit_mode('${i}','${x.mode}','${x.type}','${x.ID}')">
                                    <i class="fa fa-check-circle" style="font-size:24px"></i>
                                </a>
                            </span>
                        </li>
                    </ul>
                </div>`;
        }).join('');
    }

    // 3. 构造添加模式的 HTML
    const addM = `
        <div class="col-sm-4">
            <ul class="list-group">
                <li class="list-group-item">图标: <i id="ioc_dir"><i class="fa fa-user" style="font-size:24px"></i></i>
                    <input type="text" id="add_mode_ioc" value="fa-user">
                    <a href="javascript:void(0);" data-toggle="modal" data-target="#myModal2" 
                       onclick="to_img('add_mode_ioc', 'n', 'ioc_dir', 'fa-user')" 
                       class="text-white btn btn-info btn-sm">选择</a>
                </li>
                <li class="list-group-item">模式: <select id="add_mode_type" onchange="grade_zubie()"></select></li>
                <li class="list-group-item">名称: <input type="text" id="add_mode_title" value=""></li>
                <li class="list-group-item">类型: <select id="add_mode_mode"></select></li>
                <li class="list-group-item">
                    <a href="javascript:void(0);" onclick="add_mode()"><i class="fa fa-plus-circle" style="font-size:24px"></i></a>
                </li>
            </ul>
        </div>`;

    // 4. 一次性渲染 DOM
    $('#Slist').html(`<div class="row">${Spage}${addM}</div>`);

    // 5. 初始化下拉框数据
    const $typeSelect = $("#add_mode_type").empty();
    (GLOB_CONF.type || []).forEach(x => {
        $typeSelect.append(`<option value="${x.val}">${x.title}</option>`);
    });

    const $typeList = $("#type_list").empty();
    (GLOB_CONF.mode || []).forEach(x => {
        $typeList.append(`<option>${x.mod}</option>`);
    });

    // 6. 执行联动逻辑
    grade_zubie();
};
function grade_zubie() {
    // 1. 缓存 jQuery 对象，避免重复查询 DOM
    const $modeType = $("#add_mode_type");
    const $modeTarget = $("#add_mode_mode");
    
    // 2. 获取当前选中的值
    const val = $modeType.val();
    
    // 3. 安全检查：使用可选链或逻辑判断防止 GLOB_CONF 数据缺失导致报错
    const data = GLOB_CONF?.['type_ADD']?.[val] || [];

    // 4. 性能优化：先清空，然后一次性注入 HTML 字符串，而不是在循环里多次 append
    const optionsHtml = data.map(item => 
        `<option value="${item.val}">${item.title}</option>`
    ).join('');

    $modeTarget.html(optionsHtml);
};
//类型的增加删除编辑
function add_mode() {
    job = 'null,"' + $('#add_mode_ioc').val() + '","' + $('#add_mode_title').val() + '","' + $('#add_mode_type').val() + '","' + $('#add_mode_mode').val() + '","0"';
    IFV='';
    Lmode= [];
    $.each(L_MODE.data, function(t, x) {Lmode.push(x.mode)});
    if (Lmode.includes($('#add_mode_mode').val())) {
        info_cmd('danger', '模式存在，添加失败');
    }else{
      if (isEmpty($('#add_mode_title').val())==false) {
        data={'mode':'add_db_data','tablename':'mode','keywords':job}
        bak=get_ajax('/API',data);
        if(bak.info=='y'){
            Refresh_data();
            get_mode();
         };

      } else {
        info_cmd('danger', '名称不能为空');
      }
    }
}
//类的编辑
function edit_mode(i, mode, type, ID) {
    // 1. 获取输入值并去空格
    const iocVal = $('#add_mode_ioc' + i).val()?.trim();
    const titleVal = $('#add_mode_title' + i).val()?.trim();

    // 2. 校验：名称不能为空
    if (!titleVal) {
        info_cmd('danger', '名称不能为空');
        return;
    }

    // 3. 构建参数
    // 建议后端修改为接收 JSON 对象，如果必须传字符串，请务必处理引号转义
    const keywords = `ioc="${iocVal}",title="${titleVal}",type="${type}",mode="${mode}"`;

    const requestData = {
        'mode': 'edit_db',
        'tablename': 'mode',
        'keywords': keywords,
        'title': ID
    };

    const bak = get_ajax('/API', requestData); 

    if (bak && bak.info === 'y') {
        info_cmd('info', '编辑成功','n');
        // 如果需要自动刷新数据，可以取消下面代码的注释
        // if (typeof get_mode === 'function') get_mode();
    } else {
        info_cmd('danger', bak.msg || '保存失败，请重试','n');
    }
};
//设置参数
function get_conf() {
    const $wConf = $("#w_conf");
    const configData = SETUP_JSON?.conf;

    if (!configData) {
        $wConf.html('<div class="alert alert-warning">暂无配置项</div>');
        return;
    }

    // 使用 map 结合模板字符串，性能更好且逻辑清晰
    const confHtml = Object.entries(configData).map(([key, item]) => {
        let controlHtml = '';

        switch (item.mod) {
            case "checkbox":
                const isChecked = item.v === 'y' ? 'checked' : '';
                controlHtml = `<input type="checkbox" id="C_${key}" ${isChecked}>`;
                break;

            case "input":
                controlHtml = `<input type="text" id="C_${key}" value="${item.v}" class="form-control">`;
                break;

            case "select":
                // 优化：尝试解析 JSON，增加错误捕捉，防止数据格式错误导致崩溃
                try {
                    const options = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
                    const optionsHtml = options.map(opt => {
                        const isSelected = item.v === opt.select ? 'selected' : '';
                        return `<option value="${opt.select}" ${isSelected}>${opt.t}</option>`;
                    }).join('');
                    controlHtml = `<select id="C_${key}" class="form-control">${optionsHtml}</select>`;
                } catch (e) {
                    controlHtml = `<span class="text-danger">Select 数据解析失败</span>`;
                }
                break;
        }

        return `<div class="col-3 py-2">${item.t}</div>
                <div class="col-9 py-2">${controlHtml}</div>`;
    }).join('');

    // 拼装整体结构
    const saveBtn = `
        <div class="col-12 mt-3">
            <button type="button" class="btn btn-info btn-sm" onclick="edit_conf_go()">保存配置</button>
        </div>`;

    const finalLayout = `
        <div class="alert border">
            <div class="row m-3">
                <div class="col-md-8">
                    <div class="row align-items-center">${confHtml}${saveBtn}</div>
                </div>
                <div class="col-md-4"></div>
            </div>
        </div>`;

    $wConf.html(finalLayout);
}
//自动生成信息
function auto_x_y_go() {
    info_cmd('info', '正在获取值...', 'n');

    // 1. 使用 const/let 避免全局变量污染，增强安全性
    const conf = SETUP_JSON?.conf;
    if (!conf) {
        info_cmd('danger', '配置项未加载', 'n');
        return;
    }

    // 2. 构建 URL (使用模板字符串更清晰)
    const TURL = `${conf.server.v}/ip?code=${conf.user_id.v}`;

    // 3. 异步/同步数据请求
    const response = get_ajax('/API', { "mode": "get_url", "keywords": TURL });

    if (response && response.info === "y") {
        try {
            // 解析数据并增加容错处理
            const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            
            // 4. 逻辑优先级：优先使用全局变量中的经纬度，否则使用 API 返回的
            // 使用 typeof 检查避免变量未定义的报错
            const finalLat = (typeof latitude !== 'undefined' && !isEmpty(latitude)) ? latitude : data.lat;
            const finalLng = (typeof longitude !== 'undefined' && !isEmpty(longitude)) ? longitude : data.lng;

            // 5. 批量更新 DOM
            $('#C_latitude').val(finalLat);
            $('#C_longitude').val(finalLng);
            $('#C_city').val(data.city || '');
            $('#C_ETC').val(data.timezone || '');
            $('#C_country').val(data.country || '');

            info_cmd('success', '填写完成', 'n');
        } catch (e) {
            console.error("JSON 解析失败:", e);
            info_cmd('danger', '返回数据格式错误', 'n');
        }
    } else {
        // 6. 失败回退逻辑：获取本地时区
        const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        $('#C_ETC').val(localTimeZone);
        info_cmd('danger', '获取失败，已切换至本地时区', 'n');
    }
}
//HOMEKIT
function get_H_C() {
    const $container = $("#P_HOMEKIT");
    const conf = SETUP_JSON?.conf;

    if (!conf || conf.homekit?.v !== 'y') {
        $container.html('<div class="alert alert-warning">HomeKit 功能未开启</div>');
        return;
    }

    const hkStatus = get_ajax('./API', { "mode": "get_cmd_sh", "keywords": "hk_on_off" });
    
    let statusHtml = '';
    let qrcodeUrl = 'n';

    const btnRestart = '<button class="btn btn-danger btn-sm" onclick="return restart_homekit_go()"><i class="fa fa-refresh"></i></button>';
    const btnStop = '<button class="btn btn-danger btn-sm" onclick="return stop_homekit_go()"><i class="fa fa-times"></i></button>';
    const btnStart = '<button class="btn btn-success btn-sm" onclick="start_homekit_go()"><i class="fa fa-arrow-circle-right"></i></button>';
    const btnStartconf = '<button class="btn btn-danger btn-sm" onclick="start_homekit_conf()"><i class="fa fa-history"></i></button>';

    if (hkStatus.info === 'n') {
        statusHtml = `<div class="alert alert-danger text-center">HOMEKIT未启动 ${btnStart}  ${btnStartconf}</div>`;
    } else {
        const valData = hkStatus.data?.val;
        const deviceId = valData?.id || '设备在线';
        // 关键点：只记录 URL，不在这里调用 qrcode()
        qrcodeUrl = valData?.url || 'n';

        statusHtml = `
            <div class="text-center">
                <div class="alert alert-success">
                    <p>${deviceId}</p>
                    HOMEKIT已启动 ${btnStop}
                </div>
            </div>`;
    }

    const controlHtml = `
        <div class="text-center">
            <div class="alert alert-success" id="qrcode_container">
                <p>
                    重新绑定 ${btnRestart}
                    <a href="javascript:void(0);" data-toggle="modal" data-target="#myModal" onclick="cat_log('homekit','#homekit_logo')">
                        <i class="fa fa-search" style="font-size:24px;"></i> 查看日志
                    </a>
                </p>
                <div id="qrcodeID" class="qrcode" style="display: flex; justify-content: center; padding: 10px; background: #fff; margin: 10px auto; width: fit-content;"></div>
            </div>
            <div id="homekit_logo" style="width:100%; height:0; overflow:auto;"></div>
        </div>`;

    // 执行渲染
    $container.html(statusHtml + controlHtml);

    // 6. 统一渲染二维码
    if (qrcodeUrl !== 'n') {
        setTimeout(() => {
            const $qrTarget = $("#qrcodeID");
            $qrTarget.empty(); 
            
            try {
                // 方案 A: 如果使用的是 jquery.qrcode.js (最常见)
                $qrTarget.qrcode({
                    render: "canvas", // 强制使用 canvas 渲染
                    width: 150,
                    height: 150,
                    text: qrcodeUrl,
                    background: "#ffffff", // 确保背景是白的
                    foreground: "#000000"  // 确保前景是黑的
                });
            } catch (e) {
                // 方案 B: 如果是原生的 qrcode.js
                new QRCode(document.getElementById("qrcodeID"), {
                    text: qrcodeUrl,
                    width: 150,
                    height: 150,
                    colorDark : "#000000",
                    colorLight : "#ffffff"
                });
            }
        }, 150);
    }

}
function homekit_code() {
    // 1. 局部变量，防止污染全局
    const requestData = {
        "mode": "get_cmd_sh",
        "keywords": "hk_get"
    };

    // 2. 交互反馈：给用户一个正在处理的状态
    info_cmd('info', '正在获取配对码...', 'n');

    // 3. 使用 $.get 并增加错误处理
    $.get("/API", requestData, function(res) {
        if (res && res.info === 'y') {
            // 成功后刷新面板
            get_H_C();
            info_cmd('success', '配对码已更新', 'n');
        } else {
            // 后端逻辑错误反馈
            info_cmd('danger', '获取失败：' + (res.msg || '未知错误'), 'n');
        }
    }).fail(function() {
        // 网络层错误反馈
        info_cmd('danger', '网络连接异常，请检查服务器状态', 'n');
    });
}
//恢复备份值
function start_homekit_conf() {
    // 1. 使用 const 避免 data 污染全局作用域
    const requestData = {
        "mode": "get_cmd_sh",
        "keywords": "start_rest_conf"
    };

    // 2. 初始提示（保持 'n' 模式，通常代表不自动关闭）
    info_cmd('info', '正在恢复以前配置，请稍候...', 'n');

    // 3. 发送异步请求
    $.get("/API", requestData, function(result) {
        // 4. 增加简单的状态校验，防止后端报错时依然提示“完成”
        if (result && (result.info === 'y')) {
             info_cmd('info', '恢复成功,可以启动了', 'n');
     }
    })
}
//重新绑定
function restart_homekit_go() {
    // 1. 确认操作
    if (!confirm('确定要重置并重新绑定 HomeKit 吗？')) return false;

    // 2. 获取 UI 元素
    const $qrContainer = $("#qrcodeID");
    const $btn = $(event.currentTarget); // 获取当前点击的按钮

    // 3. UI 状态锁定：防止用户在 5 秒等待期内连续点击
    $btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> 重置中...');
    
    // 清空旧二维码，放入加载动画
    // 确保 LOADING 变量已定义，否则直接用字符串
    $qrContainer.empty().html(typeof LOADING !== 'undefined' ? LOADING : '<p>正在重置网关...</p>');

    const requestData = {
        "mode": "get_cmd_sh",
        "keywords": "hk_restart"
    };

    // 4. 发送重启指令
    $.get("/API", requestData, function(result) {
        if (result.info === 'y') {
            info_cmd('info', '重启指令已发送，请等待服务就绪...', 'n');
            
            // 5. 延迟获取新代码
            // HomeKit 重启通常需要时间生成新 ID，5秒是合理的
            setTimeout(function() {
                if (typeof homekit_code === 'function') {
                    homekit_code();
                }
                // 恢复按钮状态
                $btn.prop('disabled', false).html('<i class="fa fa-refresh"></i>');
            }, 5000);
            
        } else {
            info_cmd('danger', '重启失败：' + (result.msg || '服务器未响应'));
            $btn.prop('disabled', false).html('<i class="fa fa-refresh"></i>');
            $qrContainer.empty().text('重置失败');
        }
    }).fail(function() {
        info_cmd('danger', '网络连接错误');
        $btn.prop('disabled', false).html('<i class="fa fa-refresh"></i>');
    });

    return false;
}
//启动homekit
function start_homekit_go() {
    // 1. 使用 const 避免 data 污染全局作用域
    const requestData = {
        "mode": "get_cmd_sh",
        "keywords": "start_hk"
    };

    // 2. 初始提示（保持 'n' 模式，通常代表不自动关闭）
    info_cmd('info', '正在启动服务，请稍候...', 'n');

    // 3. 发送异步请求
    $.get("/API", requestData, function(result) {
        // 4. 增加简单的状态校验，防止后端报错时依然提示“完成”
        if (result && (result.info === 'y' || result.CODE?.info === 'y')) {
            // 5. 渲染页面逻辑
            get_H_C();
            // 6. 成功提示，'info_conf' 模式通常会自动消失或触发后续回调
            info_cmd('success', '启动完成');
        } else {
            info_cmd('danger', '启动失败：' + (result.msg || '服务器无响应'));
        }
    }).fail(function() {
        // 7. 处理网络请求本身的失败（如 404 或 500）
        info_cmd('danger', '请求 API 失败，请检查网络');
    });
}
//关闭homekit
function stop_homekit_go() {
        if (!confirm('确定关闭?')) return false;
        $("#h_info").html(LOADING) 
        data = {
                    "mode": "get_cmd_sh",
                    "keywords": "stop_hk"
        };
       $.get("/API", data, function(result) { 
         get_H_C();
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
// 设置参数保存
function edit_conf_go() {
    // 1. 使用对象处理数据，而不是手动拼接字符串（防止双引号、特殊字符导致报错）
    const newConfig = {};
    const baseConfig = SETUP_JSON?.conf;

    if (!baseConfig) {
        info_cmd('danger', '配置模板缺失');
        return;
    }

    // 2. 遍历原配置并从 DOM 中取最新值
    $.each(baseConfig, function(key, item) {
        let currentVal;
        
        if (item.mod === "checkbox") {
            currentVal = $("#C_" + key).is(":checked") ? 'y' : 'n';
        } else {
            // 处理 input 和 select
            currentVal = $("#C_" + key).val();
        }

        // 构建新的对象结构
        newConfig[key] = {
            "v": currentVal,
            "t": item.t,
            "mod": item.mod,
            "data": item.data // 这里的 data 已经是对象，无需 stringify
        };
    });

    // 3. 构建发送给后端的参数
    const requestData = {
        mode: 'json_edit',
        d1: '',
        title: 'conf',
        keywords: JSON.stringify(newConfig), // 一次性序列化，安全可靠
        tablename: 'SETUP',
        d2: 'edit_json'
    };

    // 4. 发送请求
    const bak = get_ajax('/API', requestData);

    // 5. 反馈结果
    if (bak && bak.info === 'y') {
        info_cmd('info', '保存成功');
    } else {
        info_cmd('danger', '保存失败：' + (bak.msg || '服务器无响应'));
    }
}
// 保存用户名密码
function edit_user_go() {
    // 1. 使用 const/let 避免全局变量污染
    const user = $('#X_user').val()?.trim();
    const pass = $('#X_pass').val();
    const pass2 = $('#X_pass2').val();

    // 2. 前置逻辑校验：非空检查
    if (!user || !pass) {
        info_cmd('danger', '用户名或密码不能为空', 'y');
        return;
    }

    // 3. 密码一致性校验
    if (pass !== pass2) {
        info_cmd('danger', '两次输入的密码不一致', 'y');
        return;
    }

    // 4. 数据完整性检查 (UUID)
    const uuid = SETUP_JSON?.key?.uuid;
    if (!uuid) {
        info_cmd('danger', '配置加载异常，请刷新页面重试', 'y');
        return;
    }

    // 5. 构建提交数据
    const job = {
        'user': md5(user), // 确认后端是否真的需要对用户名进行 md5
        'pass': md5(pass),
        'uuid': uuid
    };

    const requestData = {
        mode: 'json_edit',
        d1: '',
        title: 'key',
        keywords: JSON.stringify(job),
        tablename: 'SETUP',
        d2: 'edit_json'
    };

    // 6. 执行提交并处理交互
    info_cmd('info', '正在保存并退出...', 'n'); // 显示加载状态
    
    // 假设 get_ajax 是同步的
    const bak = get_ajax('/API', requestData);

    if (bak && bak.info === 'y') {
        info_cmd('success', '修改成功，正在跳转...', 'n');
        // 延迟执行退出，让用户看清提示
        setTimeout(() => {
            if (typeof exit === 'function') exit();
        }, 1000);
    } else {
        info_cmd('danger', bak?.msg || '保存失败，请稍后重试', 'n');
    }
}
// 建议：token_table 设置为局部变量或通过函数返回
function get_token(pnumber=0, val=0) {
    const $container = $("#Stoken");
    $container.html('<i class="fa fa-spinner fa-spin"></i> 正在加载数据...');

    const requestData = {
        'mode': 'table_to_all_h',
        'tablename': 'toke',
        'd1': val,
        'd2': typeof Every !== 'undefined' ? Every : 10 // 确保 Every 已定义
    };

    // 建议：将 $.ajax 改为异步模式（删除 async: false）
    $.ajax({
        url: "/API",
        data: requestData,
        type: "GET",
        cache: false,
        success: function(response) {
            const res = typeof response === 'string' ? JSON.parse(response) : response;
            const ndata = res.data;
            const sell = res.count;

            if (ndata && ndata !== 'n' && ndata.length > 0) {
                let tableBody = '';
                let tableHeader = '';

                // 渲染数据行
                $.each(ndata, function(i, row) {
                    let rowHtml = '';
                    let headerHtml = '';

                    $.each(row, function(key, value) {
                        // 只在第一行生成表头
                        if (i === 0) {
                            headerHtml += `<th>${key}</th>`;
                        }

                        if (key === 'title') {
                            const dell = `<a href="javascript:;" onclick="return del_token('${row['ID']}', '${pnumber}', '${val}')">
                                            <i class="fa fa-trash-o" style="color:red"></i>
                                          </a>`;
                            rowHtml += `<td>${value}</td><td>${dell}</td>`;
                            if (i === 0) headerHtml += `<th>操作</th>`;
                        } else {
                            rowHtml += `<td>${value || ''}</td>`;
                        }
                    });

                    if (i === 0) tableHeader = headerHtml;
                    tableBody += `<tr>${rowHtml}</tr>`;
                });

                const pagings = paging(pnumber, sell, 'get_token');

                // 组合完整页面内容
                const fullHtml = `
                    <div id="token_list">
                        <h4><i class="fa fa-th" style="font-size:24px"></i> 记录总数：${sell}</h4>
                        <a href="javascript:void(0);" data-toggle="modal" data-target="#myModal" onclick="add_toke_page()">
                            <i class="fa fa-plus-circle" style="color:blue; font-size:20px;"></i> 添加认证
                        </a>
                        <table class="table table-hover table-sm text-muted mt-2" style="width:100%;">
                            <thead class="thead-light">
                                <tr>${tableHeader}</tr>
                            </thead>
                            <tbody id="thedata">${tableBody}</tbody>
                        </table>
                        <hr>${pagings}
                    </div>
                    <div id="bub_list"></div>`;

                $container.html(fullHtml);
            } else {
                $container.html('<div class="alert alert-info">没有数据</div>');
            }
        },
        error: function() {
            $container.html('<div class="alert alert-danger">数据拉取失败，请重试</div>');
        }
    });
}
function del_token(id, p, v) {
    if (!confirm('确定要删除该认证 Token 吗？此操作不可撤销。')) return false;
    del_new_list('toke', id, 'get_token')

};
function add_toke_page() {
// 建议使用模板字符串 (Backticks) 增加可读性
const titleInput = `
    <div class="card shadow-sm border-0 mb-3">
        <div class="card-body">
            <h5 class="card-title mb-3" style="font-size: 0.9rem; color: #666;">
                <i class="fa fa-tag me-2"></i>配置选项
            </h5>
            <div class="input-group">
                <span class="input-group-text bg-light border-end-0">标题</span>
                <input type="text" 
                       id="token_title" 
                       class="form-control border-start-0" 
                       placeholder="请输入标题..." 
                       value="str">
                <button class="btn btn-primary" 
                        type="button" 
                        data-toggle="modal" 
                        data-target="#myModal" 
                        onclick="add_token()">
                    <i class="fa fa-plus-circle"></i>
                </button>
            </div>
        </div>
    </div>`;

$('#mpage').html(titleInput);}
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
       Refresh_data();
       get_token(0,0)
    })
}
// MQTT 服务器设置保存
function mqtt_save() {
    // 1. 使用 const/let 规范作用域，防止污染全局
    // 2. 简化布尔值获取逻辑：直接使用 .prop('checked')
    const useTLS = $("#tls").prop("checked");
    const cleansession = $("#cleansession").prop("checked");

    // 3. 构建配置对象
    const config = {
        "url": $('#url').val()?.trim(),
        "path": $('#path').val()?.trim(),
        "port": $('#port').val(),
        "user": $('#muser').val(),
        "pass": $('#mpass').val(),
        "tls": useTLS,
        "id": $('#mid').val(),
        "topic": $('#mTopic').val(),
        "mtport": $('#mtport').val(),
        "qos": parseInt($('#qos').val() || 0), // 确保 qos 是数字
        "cleansession": cleansession,
        "reconnectTimeout": parseInt($('#reconnectTimeout').val() || 5000)
    };

    // 4. 前置简单校验：防止保存空地址
    if (!config.url) {
        info_cmd('danger', 'MQTT 服务器地址不能为空');
        return;
    }

    const requestData = {
        mode: 'json_edit',
        d1: '',
        title: 'mqtt',
        keywords: JSON.stringify(config),
        tablename: 'SETUP',
        d2: 'edit_json'
    };

    // 5. 显示加载状态
    info_cmd('info', '正在保存配置...', 'n');

    // 6. 执行提交
    // 假设 get_ajax 是同步返回
    const bak = get_ajax('/API', requestData);

    if (bak && bak.info === 'y') {
        // 保存成功后刷新显示
        if (typeof get_mqtt === 'function') get_mqtt();
        info_cmd('success', '保存成功');
    } else {
        info_cmd('danger', '保存失败：' + (bak?.msg || '服务器拒绝请求'));
    }
};
// MQTT web 重启
function mqtt_restart() {
    // 1. 使用 const 防止变量污染全局作用域
    const requestData = {
        mode: 'get_cmd_sh',
        keywords: 'mqtt_restart'
    };

    // 2. 增加即时反馈，防止用户连续点击
    info_cmd('info', '正在重启 MQTT 服务...', 'n');

    // 3. 执行重启指令
    // 假设 get_ajax 为同步函数
    const bak = get_ajax('/API', requestData);

    // 4. 结果判定与反馈
    if (bak && bak.info === 'y') {
        // 修正提示语，使其符合“重启”操作的语境
        info_cmd('success', '重启指令已发送');
    } else {
        info_cmd('danger', '重启失败：' + (bak?.msg || '服务器无响应'));
    }
}
// 使用常量定义
const API_URL = '/API';

/**
 * 获取并渲染登录列表
 */
function get_login() {
    // 假设 get_ajax 是同步的或返回 Promise (基于原代码逻辑按同步处理)
    const setupJson = get_ajax(API_URL, { mode: "read_setup" });
    
    // 安全检查：确保路径有效
    const uuidList = (setupJson && setupJson.key && setupJson.key.uuid) ? setupJson.key.uuid : [];
    
    let getDList = [];
    let htmlContent = '';
    let isAlreadyInList = false;

    // 渲染已有列表
    uuidList.forEach((item, index) => {
        getDList.push(item.id);
        
        const isIpRecorded = item.RecordIP === 'y';
        const checkedAttr = isIpRecorded ? 'checked' : '';
        const recordValue = isIpRecorded ? 'y' : 'n';
        
        // 样式状态判断
        const isCurrentDevice = (item.id === window.b_name2);
        const alertClass = isCurrentDevice ? 'alert-danger' : 'alert-info';
        if (isCurrentDevice) isAlreadyInList = true;

        // 格式化浏览器名称
        const safeBrowser = (item.browser || '').replace(/ /g, '_');

        // 使用模板字符串提高可读性
        htmlContent += `
            <div class="alert ${alertClass}">
                记录位置: 
                <input type="checkbox" id="G_box_${index}" value="${recordValue}" ${checkedAttr} 
                       oninput="add_locations('${recordValue}', ${index})"/>
                已添加: ${item.topic} / ${safeBrowser} 
                浏览器: ${safeBrowser}
                <a href="javascript:void(0);" onclick="del_login_list('${index}')">
                    <i class="fa fa-times-circle text-danger" style="font-size:24px"></i>
                </a>
            </div>`;
    });

    // 如果当前设备不在列表中，显示添加表单
    let addForm = '';
    if (!isAlreadyInList) {
        addForm = `
            <div class="alert alert-danger">
                记录位置: <input type="checkbox" id="cbox2"/>
                指纹: ${window.b_name2} 
                主题: <input type="text" id="topic" value="loog" />
                浏览器: <input type="text" id="cbox1" value="${window.b_name}" />
                <a href="javascript:void(0);" onclick="add_login_list('${window.b_name}', '${window.b_name2}')">
                    <i class="fa fa-plus-circle" style="font-size:24px"></i>
                </a>
            </div>`;
    }

    // 更新 DOM
    $('#login_list').html('<div id="get_login_info"></div>' + htmlContent + addForm);
    
    // 更新全局变量（如果其他地方需要）
    window.GET_D_LIST = getDList;
}

/**
 * 切换位置记录状态
 */
function add_locations(currentVal, index) {
    // 逻辑取反
    const newVal = (currentVal === 'y') ? 'n' : 'y';
    
    // 立即更新 UI 状态提高响应感
    $(`#G_box_${index}`).prop('checked', newVal === 'y').val(newVal);

    const postData = {
        mode: 'json_edit',
        d1: `["key"]["uuid"][${index}]`,
        title: 'RecordIP',
        keywords: newVal,
        tablename: 'SETUP',
        d2: 'edit_key'
    };

    const response = get_ajax(API_URL, postData);
    if (response && response.info === 'y') {
        get_login(); // 刷新列表
    }
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
         info_cmd('danger', '已存在');
    }
  }else{
         info_cmd('danger', '填写主题');
  }
}
function del_login_list(index) {
    // 1. 增加用户确认，防止误删
    if (!confirm('确定要删除这条记录吗？此操作可恢复。')) {
        return;
    }

    // 2. 使用 const 定义局部变量，避免全局污染
    const requestData = {
        mode: 'json_edit',
        d1: '["key"]',
        title: 'uuid',
        keywords: index,
        tablename: 'SETUP',
        d2: 'del_json'
    };

    // 3. 执行删除操作
    // 假设 get_ajax 是同步函数（基于原代码逻辑）
    try {
        const response = get_ajax('/API', requestData);

        if (response && response.info === 'y') {
            // 4. 成功后给出轻量提示（可选）并刷新列表
            console.log('删除成功');
            get_login(); 
        } else {
            info_cmd('danger', '删除失败：' + (response.message || '服务器返回异常'));
        }
    } catch (error) {
        console.error('网络请求出错:', error);
        info_cmd('danger', '操作失败，请检查网络连接');
    }
}//恢复数据
//汉字符号格式化
function toUtf8(chineseChar) {    
    var str = chineseChar.replace(/\’|\‘/g,"'").replace(/\“|\”/g,"\"");
    str = str.replace(/\【/g,"[").replace(/\】/g,"]").replace(/\｛/g,"{").replace(/\｝/g,"}");
    str = str.replace(/，/g,",").replace(/：/g,":"); 
    return str;
} 

/**
 * 上传文件函数
 * @param {string} m - 元素 ID 的前缀
 */
function up_file(m) {
    // 1. 获取文件并进行非空校验
    const fileInput = $(`#${m}_file`).get(0);
    const file = fileInput ? fileInput.files[0] : null;

    if (!file) {
        info_cmd('danger', '请先选择要上传的文件');
        return;
    }

    // 2. 准备数据
    const formData = new FormData();
    // 注意：通常直接传 file 对象即可，浏览器会自动处理编码
    // 如果后端确实要求手动转码，再保留 toUtf8
    formData.append("file", file);
    formData.append('modes', 'up');
    formData.append('filename', file.name); 

    // 3. 界面反馈：禁用上传按钮防止重复提交
    const $btn = $(`#btn_up_${m}`); // 假设按钮有规律的 ID
    $btn.prop('disabled', true).text('上传中...');

    // 4. 发起请求
    $.ajax({
        url: "/API",
        type: "POST",
        data: formData,
        cache: false,
        contentType: false, // 必须为 false
        processData: false, // 必须为 false
        success: function(res) {
            if (res && res.info === 'y') {
                info_cmd('info', '保存成功');
                // 成功后通常清空文件域
                $(`#${m}_file`).val('');
            } else {
                info_cmd('danger', '上传失败：' + (res.data || '未知错误'));
            }
        },
        error: function(xhr, status, error) {
            console.error('上传出错:', error);
            info_cmd('danger', '网络请求失败，请稍后再试');
        },
        complete: function() {
            // 5. 无论成功失败，恢复按钮状态
            $btn.prop('disabled', false).text('上传');
        }
    });
}
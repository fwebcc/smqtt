L_AUTO='';
/**
 * 更新正在运行的任务列表状态
 */
function auto_task() {
    // 假设 L_AUTO 是在外部获取的全局数据
    if (!L_AUTO || L_AUTO.info === 'n' || !L_AUTO.data) return;

    // 一次性获取所有正在运行的任务 ID 列表
    const taskResponse = get_ajax('/corn',{"mod":"getjobs"});

    L_AUTO.data.forEach(m => {
        const fullID = `ID_Y${m.ID}`;
        const $target = $(`#TS${m.ID}`);
        
        // 只有当任务在运行列表中，才显示查看按钮
        getID=findAndFormatById(fullID, taskResponse.data)
        butt = `<a href="javascript:void(0);" onclick="return A_stop_time('_Y${m.ID}')" style="color:#52c41a; font-size:28px;">${LOADING}</a>`;
        if (getID){$target.html(`<br>执行时间:${getID.next_run}${butt}`)}

    });
}
function A_stop_time(id) {
        if (!confirm('确定要关闭定时服务吗？')) return false;
        bak=get_ajax('/corn', { "id": id, "mod": "remove_task" });
        if(bak.info=='y'){auto_list()}
}
//自动任务列表任务模式识别
function auto_list_name(p, m) {
    const [mode, val, time, secRaw] = p.split("|");
    const dataSource = (m === 'z') ? GLOB_CONF.automode : GLOB_CONF.automode2;
    const suffixInfo = (m === 'z') ? '_延迟' : '';

    let modeTitle = '', valTitle = '', untTitle = '', secTitle = secRaw;

    // 1. 查找配置信息 (使用 find 替代嵌套 each)
    const targetConfig = dataSource.find(x => x.mode === mode);
    if (targetConfig) {
        modeTitle = targetConfig.title || '';
        const subConfig = (targetConfig.val || []).find(v => v.mod === val);
        if (subConfig) {
            valTitle = subConfig.title || '';
            untTitle = subConfig.unt || '';
        }
    }

    // 2. 查找业务名称 (L_LIST)
    if (mode === 'vals' && L_LIST && L_LIST.data) {
        const listMatch = L_LIST.data.find(x => String(x.ID) === String(secRaw));
        if (listMatch) secTitle = listMatch.title;
    }

    // 3. 组装标题
    const parts = [modeTitle, valTitle, time];
    if (!isEmpty(secTitle)) {
        if (suffixInfo) parts.push(suffixInfo);
        parts.push(secTitle);
    }
    parts.push(untTitle);

    // 过滤掉空值并用下划线连接
    return parts.filter(item => !isEmpty(item)).join('_');
}
//自动任务列表
function auto_list() {
    // 1. 获取数据 - 完整保留逻辑
    L_AUTO = get_ajax('/API', { "mode": "table_to_all", "tablename": "auto" });
    
    let page = '';
    const autoData = (L_AUTO && L_AUTO.info !== 'n') ? [...L_AUTO.data].reverse() : [];

    if (autoData.length > 0) {
        $.each(autoData, function (n, m) {
            // --- 核心修复：B_A_E 逻辑保持不变 ---
            let B_A_E = '<a href="javascript:void(0);" data-toggle="modal" data-target="#myModal" onclick="edit_auto(' + n + ')" style="color:#bfbfbf;"><i class="fa fa-pencil-square-o"></i></a>';

            // 2. 解析主题名称 - 逻辑保持不变
            let title = m.discover_topic ? m.discover_topic.split('|')[0] : '';
            let stitle = m.send_topic ? m.send_topic.split('|')[0] : '';

            // 3. 状态按钮逻辑 - 升级为现代开关 UI
            let butt = '';
            if (m.stat === 'y') {
                butt = '<a href="javascript:void(0);" onclick="stop_auto(\'' + m.ID + '\',\'n\')" style="color:#52c41a; font-size:28px;">' + LOADING + '</a>';
            } else {
                butt = '<a href="javascript:void(0);" onclick="stop_auto(\'' + m.ID + '\',\'y\')" style="color:#d9d9d9; font-size:28px;"><i class="fa fa-toggle-off"></i></a>';
            }

            // 4. 背景颜色逻辑 - 保持原索引
            let bgCardIdx = (n < BGCOLOUR.length) ? n : Math.round(n % BGCOLOUR.length);
            let bgClass = BGCOLOUR[bgCardIdx];

            // 5. 条件名称识别
            let SITITLE2 = m.mod && m.mod.includes('|') ? auto_list_name(m.mod, 'z') : '无';
            let SITITLE = m.send_if && m.send_if.includes('|') ? auto_list_name(m.send_if, 'c') : '无';

            // 6. 拼接现代卡片 HTML - 对应 UI 优化
            page += `
<div class="col-12 col-md-4" style="padding: 10px;">
    <div class="modern-card" style="background: #fff; border-radius: 12px; padding: 15px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #f0f0f0; height: 100%; display: flex; flex-direction: column;">
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="flex: 1;">
                <div style="font-weight: 500; color: #262626; font-size: 15px; display: flex; align-items: center;">
                    <i class="fa fa-bolt text-warning" style="margin-right: 8px;"></i> ${m.title} <x id="TS${m.ID}"></x>
                </div>
            </div>
            ${B_A_E}
        </div>
        
        <div style="flex: 1; font-size: 13px; color: #595959; line-height: 1.8;">
            <div style="background: #fafafa; padding: 10px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #f0f0f0;">
                <div style="color: #8c8c8c; font-size: 11px; margin-bottom: 4px; font-weight: 500;">WHEN (触发条件)</div>
                <div style="color: #262626;"><i class="fa fa-rss text-info" style="width:18px"></i> 主题: <span style="font-weight: 600;">${title}</span></div>
                <div style="color: #595959;"><i class="fa fa-terminal" style="width:18px"></i> 命令: <span style="color: #1890ff;">${m.discover_cmd.substring(0, 10)}</span></div>
            </div>
            
            <div style="padding-left: 10px; margin-bottom: 10px; border-left: 2px solid #f0f0f0;">
                <div><i class="fa fa-filter" style="width:18px"></i> 主要: <span style="color: #8c8c8c;">${SITITLE2}</span></div>
                <div><i class="fa fa-filter" style="width:18px"></i> 次要: <span style="color: #8c8c8c;">${SITITLE}</span></div>
            </div>

            <div style="background: #f6ffed; padding: 10px; border-radius: 8px; border: 1px solid #b7eb8f40;">
                <div style="color: #52c41a; font-size: 11px; margin-bottom: 4px; font-weight: 500;">THEN (执行动作)</div>
                <div style="color: #262626;"><i class="fa fa-paper-plane-o text-success" style="width:18px"></i> 主题: <span style="font-weight: 600;">${stitle}</span></div>
                <div style="color: #595959;"><i class="fa fa-code" style="width:18px"></i> 命令: <span style="color: #52c41a;">${m.send_cmd.substring(0, 15)}</span></div>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 12px; border-top: 1px solid #f0f0f0;">
            <a href="javascript:void(0);" onclick="AUTO_stop_time('${m.ID}');del_new_list('auto','${m.ID}','auto_list')" style="color: #ff4d4f; opacity: 0.6; font-size: 16px;">
                <i class="fa fa-trash-o"></i>
            </a>
            ${butt}
        </div>
    </div>
</div>`;
        });
    } else {
        page = '<div class="col-12 text-center p-5 text-muted">没有获取数据</div>';
    }

    // 7. 生成添加项卡片 (page2) - 优化 UI 布局，完整保留 ID 对应
    let CAT_ATO_LOG = '<a href="javascript:void(0);" style="color:inherit;" data-toggle="modal" data-target="#myModal" onclick="cat_log(\'auto\',\'#about_logo\')"><i class="fa fa-file-text-o"></i> 日志查询</a>';
    let page2 = `
        <div class="col-12 col-md-4 mb-4">
            <div class="modern-card shadow-sm" style="background: #fffbe6; border: 2px dashed #ffe58f; border-radius: 20px; padding: 20px; height: 100%;">
                <div style="font-weight: 800; color: #d48806; margin-bottom: 15px;"><i class="fa fa-plus-circle"></i> 新建自动化场景</div>
                
                <div class="form-group mb-2">
                    <input type="text" id="AO_title" class="form-control form-control-sm" placeholder="场景名称">
                </div>
                
                <div style="font-size:12px; color:#8c8c8c; margin: 10px 0 5px;">触发配置</div>
                <div class="input-group input-group-sm mb-2">
                    <select id="AO_discover_topic" class="form-control"></select>
                    <input type="text" id="AO_discover_cmd" class="form-control" style="width:40%;" placeholder="触发命令">
                </div>
                
                <div style="font-size:12px; color:#8c8c8c; margin: 10px 0 5px;">逻辑过滤</div>
                <div class="input-group input-group-sm mb-2">
                    <input type="text" id="AO_mod" class="form-control" value="n" readonly>
                    <div class="input-group-append"><button class="btn btn-outline-warning" onclick="add_mod('y')" data-toggle="modal" data-target="#myModal2"><i class="fa fa-edit"></i></button></div>
                </div>
                <div class="input-group input-group-sm mb-2">
                    <input type="text" id="AO_send_if" class="form-control" value="n" readonly>
                    <div class="input-group-append"><button class="btn btn-outline-warning" onclick="add_send_if('y')" data-toggle="modal" data-target="#myModal2"><i class="fa fa-edit"></i></button></div>
                </div>
                
                <div style="font-size:12px; color:#8c8c8c; margin: 10px 0 5px;">动作执行</div>
                <div class="form-group mb-2">
                    <select id="AO_send_topic" class="form-control form-control-sm"></select>
                </div>
                <div class="form-group mb-3">
                    <input type="text" id="AO_send_cmd" class="form-control form-control-sm" placeholder="执行命令">
                    <input type="hidden" id="AO_stat" value="y">
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <button class="btn btn-warning btn-sm text-white" onclick="add_auto_list()" style="border-radius: 8px; padding: 5px 15px; font-weight:bold;">创建场景</button>
                    <span style="font-size: 12px; color: #d48806; cursor: pointer;">${CAT_ATO_LOG}</span>
                </div>
            </div>
        </div>`;

    // 8. 渲染到页面 - 保持容器一致性
    $('#page_list').html(`
        <div style="width: 100%; box-sizing: border-box;">
            <div id="auto_info"></div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 10px 20px;">
                <h4 style="font-weight: 800; color: #262626; margin:0;"><i class="fa fa-magic text-warning"></i> 场景联动</h4>
                <div class="text-muted" style="font-size: 12px;"><i class="fa fa-info-circle"></i> 基于 MQTT 消息的逻辑触发器</div>
            </div>
            <div class="row">${page2 + page}</div>
        </div>`);

    // 9. 初始化下拉菜单内容 - 完整保留逻辑
    if (L_LIST && L_LIST.data) {
        let $discTopic = $("#AO_discover_topic");
        let $sendTopic = $("#AO_send_topic");
        $discTopic.empty();
        $sendTopic.empty();

        $.each(L_LIST.data, function (t, x) {
            let selv = (x.Subscribe && x.Subscribe.length > 0) ? x.Subscribe : x.JSON;
            if (selv && selv.length > 0) {
                $discTopic.append('<option value="' + selv + '|' + x.ID + '">' + x.title + '</option>');
            }
            if (!'warther|card|sensor|camera'.includes(x.mode)) {
                $sendTopic.append('<option value="' + x.Publish + '|' + x.ID + '">' + x.title + '</option>');
            }
        });
        $sendTopic.append('<option value="TOEMAIL">发送邮件</option>');
    }

    // 10. 执行任务状态更新 - 完整保留逻辑
    auto_task();
}

//编辑执行次要条件
function add_send_if(m='n'){
     $("#history_list_page").empty() 
     $("#mpage2").empty() 
     page_if='<li class="list-group-item d-flex flex-row"><div class="col-sm-4">检测到主题:</div><div class="col-sm-4"><select id="T_send_if_name"></select></div></div></li>'+
             '<li class="list-group-item d-flex flex-row"><div class="col-sm-4">模式</div><div class="col-sm-4"><select id="T_SEL" onchange="if_mod_Change(\'c\')"></select></div></li>'+
             '<li class="list-group-item d-flex flex-row"><div class="col-sm-4">类型</div><div class="col-sm-4"><select id="T_SEL2" onchange="conditionChange(\'c\')"></select></div></div></li>'+
             '<li class="list-group-item d-flex flex-row"><div class="col-sm-4">值</div><div class="col-sm-4"><input type="text" id="T_SEL3" value="200"><io></io></div></li>'+
              '<li class="list-group-item d-flex flex-row"><a href="javascript:void(0);" onclick="add_send_if_to(\''+m+'\')" ><i class="fa fa-plus-circle" style="font-size:24px"></i></a></li>'
     $('#mpage2').html('<li class="list-group-item list-group-item-secondary">添加次要条件'+page_if+'</li>')
     $.each(L_LIST.data, function(i, m) {
         if (isEmpty(m.Subscribe)==false){}
            $("#T_send_if_name").append('<option value="'+m.ID+'">'+m.title+'</option>');
         
     });
     $.each(GLOB_CONF.automode2, function (t, x) {
        $("#T_SEL").append('<option value="'+x.mode+'">'+x.title+'</option>');                                         
     });

     if_mod_Change('c');

}
//填写次要参数到选择框
function add_send_if_to(m='n'){
   TO_VAL=$("#T_SEL").val()+'|'+$("#T_SEL2").val()+'|'+$("#T_SEL3").val()+'|'+$("#T_send_if_name").val();
   if(m=='y'){$("#AO_send_if").val(TO_VAL);$('#myModal2').modal('hide');}else{$("#AX_send_if").val(TO_VAL);$('#myModal2').modal('hide');}

}
//编辑执行主要条件
function add_mod(m = 'n') {
    // 1. 清空旧内容
    $("#history_list_page, #mpage2").empty();

    // 2. 局部变量化：防止 BGCARD 未定义报错
    // 如果全局 BGCARD 不存在，默认使用索引 0
    const colorIndex = (typeof BGCARD !== 'undefined') ? BGCARD : 0;
    const bgClass = (typeof BGCOLOUR !== 'undefined') ? BGCOLOUR[colorIndex] : 'dark';

    // 3. 使用数组或模板字符串构建 HTML (提高可读性)
    const htmlItems = [
        `<li class="list-group-item d-flex flex-row"><div class="col-sm-4">类型</div><div class="col-sm-8"><select id="AO_SEL" class="form-control-sm" onchange="if_mod_Change('z')"></select></div></li>`,
        `<li class="list-group-item d-flex flex-row"><div class="col-sm-4">模式</div><div class="col-sm-8"><select id="AO_SEL2" class="form-control-sm" onchange="conditionChange('z')"></select></div></li>`,
        `<li class="list-group-item d-flex flex-row"><div class="col-sm-4">值</div><div class="col-sm-8"><input type="text" id="AO_SEL3" class="form-control-sm" value=""><io></io></div></li>`,
        `<li class="list-group-item d-flex flex-row"><a href="javascript:void(0);" onclick="add_mod_to('${m}')"><i class="fa fa-plus-circle" style="font-size:24px"></i></a></li>`
    ];

    // 4. 一次性注入容器，减少重绘
    const finalHtml = `<li class="list-group-item list-group-item-${bgClass}">添加主要条件</li>${htmlItems.join('')}`;
    $('#mpage2').html(finalHtml);

    // 5. 填充下拉菜单 (优化性能)
    const $aoSel = $("#AO_SEL");
    if (GLOB_CONF && GLOB_CONF.automode) {
        const options = GLOB_CONF.automode.map(x => 
            `<option value="${x.mode}">${x.title}</option>`
        ).join('');
        $aoSel.append(options);
    }

    // 6. 触发级联更新
    if (typeof if_mod_Change === 'function') {
        if_mod_Change('z');
    }
}
//填写主要参数到选择框
/**
 * 将选择的模式值组合并写入目标输入框
 * @param {string} m - 模式来源标志，'y' 代表来自新增页面，其他代表来自编辑页面
 */
function add_mod_to(m = 'n') {
    // 1. 局部变量化：避免污染全局命名空间
    const sel1 = $("#AO_SEL").val();
    const sel2 = $("#AO_SEL2").val();
    const sel3 = $("#AO_SEL3").val();

    // 2. 组合值
    const combinedVal = `${sel1}|${sel2}|${sel3}`;

    // 3. 逻辑简化：使用三元表达式动态选择目标选择器
    // 'y' 对应新增列表中的 #AO_mod，'n' 对应编辑列表中的 #AX_mod
    const targetSelector = (m === 'y') ? "#AO_mod" : "#AX_mod";
    
    // 4. 执行写入并隐藏模态框
    $(targetSelector).val(combinedVal);
    $('#myModal2').modal('hide');
}
/**
 * 配置映射表：减少重复代码的关键
 */
const MOD_CONFIG = {
    'z': {
        selectId: '#AO_SEL',
        subSelectId: '#AO_SEL2',
        valueInputId: '#AO_SEL3',
        defaultMod: 'times',
        dataSource: () => GLOB_CONF.automode
    },
    'c': {
        selectId: '#T_SEL',
        subSelectId: '#T_SEL2',
        valueInputId: '#T_SEL3',
        defaultMod: 'vals',
        dataSource: () => GLOB_CONF.automode2
    }
};

/**
 * 切换条件类型
 * @param {string} m - 'z' (主要) 或 'c' (次要)
 */
function if_mod_Change(m) {
    const cfg = MOD_CONFIG[m];
    if (!cfg) return;

    // 1. 动态生成第一级下拉框
    const mto_page = `<select id="${cfg.selectId.replace('#', '')}" onchange="conditionChange('${m}')" class="form-control"></select>`;
    $('#mod_page').html(mto_page);

    // 2. 获取当前选中的 mode，并容错处理
    const currentMod = $(cfg.selectId).val() || cfg.defaultMod;
    
    // 3. 清空并填充第二级下拉框 (AO_SEL2 / T_SEL2)
    const $subSelect = $(cfg.subSelectId).empty();
    const data = cfg.dataSource();

    if (data) {
        $.each(data, (t, item) => {
            if (item.mode === currentMod) {
                const options = item.val.map(c => `<option value="${c.mod}">${c.title}</option>`).join('');
                $subSelect.append(options);
            }
        });
    }

    // 4. 级联更新第三级
    conditionChange(m);
}

/**
 * 当第二级下拉框改变时，更新单位和默认值
 * @param {string} m - 'z' 或 'c'
 */
function conditionChange(m) {
    const cfg = MOD_CONFIG[m];
    if (!cfg) return;

    const $valueInput = $(cfg.valueInputId).empty();
    
    // 获取当前选中的子 mode
    let subMod = $(cfg.subSelectId).val();
    if (isEmpty(subMod)) subMod = cfg.defaultMod;

    // 获取转换后的数据 (单位和值)
    const gj = GET_Change(m, subMod);

    if (gj) {
        $('io').html(gj.unt || ''); // 更新单位显示
        $valueInput.val(gj.val || ''); // 更新数值
    }
}
//获取单位和默认值
function GET_Change(m, d) {
    // 1. 定义映射配置，消除硬编码和重复逻辑
    const configMap = {
        'z': { selector: "#AO_SEL", defaultMod: 'times', dataSource: GLOB_CONF.automode },
        'c': { selector: "#T_SEL", defaultMod: 'vals', dataSource: GLOB_CONF.automode2 }
    };

    const cfg = configMap[m];
    if (!cfg) return { unt: '', val: '' }; // 如果 m 不匹配，返回默认空值

    // 2. 获取当前的 mode 值
    let mod = $(cfg.selector).val();
    if (isEmpty(mod)) mod = cfg.defaultMod;

    let result = { unt: '', val: '' };

    // 3. 使用更现代的数组方法 find 替代嵌套的 $.each，提高性能
    const targetMode = cfg.dataSource.find(x => x.mode === mod);
    
    if (targetMode && targetMode.val) {
        const targetVal = targetMode.val.find(c => c.mod === d);
        if (targetVal) {
            result = { unt: targetVal.unt, val: targetVal.val };
        }
    }

    return result;
}
A_lan={
    "ID": "ID",
    "discover_cmd": "检测到命令",
    "discover_topic": "检测到主题",
    "mod": "主要条件",
    "send_cmd": "执行命令",
    "send_if": "执行条件",
    "send_topic": "执行主题",
    "stat": "状态",
    "time": "时间延迟[秒]|对比值|范围",
    "title": "标题",
    "val": "值|模式"
};
//编辑自动列表
function edit_auto(n) {
    // 1. 清空页面容器
    $("#history_list_page, #mpage").empty();

    // 2. 获取并校验数据
    if (typeof L_AUTO === 'undefined' || !L_AUTO.data) {
        console.error("L_AUTO 数据未初始化");
        return;
    }

    // 保持和 auto_list 一致的反转逻辑
    const data = [...L_AUTO.data].reverse();
    const m = data[n];
    if (!m) return;

    // --- 修复 ReferenceError: BGCARD ---
    // 根据索引 n 计算背景色索引，确保颜色和列表一致
    let bgCardIdx = (n < BGCOLOUR.length) ? n : Math.round(n % BGCOLOUR.length);
    let currentBgColor = BGCOLOUR[bgCardIdx]; 

    let E_P = '';
    let E_P2 = '';
    let E_P3 = '';
    
    // 排除列表：不需要生成通用输入框的字段
    const excludeKeys = ['ID', 'stat', 'time_list_id', 'time_list_title', 'mod', 'send_if', 'time', 'val'];

    for (let key in m) {
        if (Object.prototype.hasOwnProperty.call(m, key)) {
            let value = m[key];
            let label = A_lan[key] || key; // 获取翻译

            if (!excludeKeys.includes(key)) {
                E_P += '<li class="list-group-item d-flex flex-row"><div class="col-sm-4">' + label + ':</div><div class="col-sm-8"><input type="text" id="AX_' + key + '" value="' + value + '"></div></li>';
            }
            if (key == 'send_if') {
                E_P2 += '<li class="list-group-item d-flex flex-row"><div class="col-sm-4">' + label + ':</div><div class="col-sm-8"><input type="text" id="AX_' + key + '" value="' + value + '"><a href="javascript:void(0);" data-toggle="modal" data-target="#myModal2" onclick="add_send_if(\'n\')"><i class="fa fa-edit" style="font-size:24px"></i></a></div></li>';
            }
            if (key == 'mod') {
                E_P3 += '<li class="list-group-item d-flex flex-row"><div class="col-sm-4">' + label + ':</div><div class="col-sm-8"><input type="text" id="AX_' + key + '" value="' + value + '"><a href="javascript:void(0);" data-toggle="modal" data-target="#myModal2" onclick="add_mod(\'n\')"><i class="fa fa-edit" style="font-size:24px"></i></a></div></li>';
            }
        }
    }

    // 使用计算出的 currentBgColor
    let B_TITLE = '<li class="list-group-item list-group-item-' + currentBgColor + '">' + m.title + '</li>';
    let B_SAVE = '<div id="tmpinfo"></div><li class="list-group-item"><a href="javascript:void(0);" onclick="edit_auto_save(' + m.ID + ')" ><i class="fa fa-check-circle" style="font-size:24px"></i></a></li>';

    $('#mpage').html('<ul class="list-group">' + B_TITLE + E_P + E_P3 + E_P2 + B_SAVE + '</ul>');
}
function edit_auto_save(m){
	val='';
	$.each(A_lan, function (t, x) {
            if(t!='ID'  && t!='stat'&& t!='time_list_id'&& t!='time_list_title'){
             val+=t+'="'+$('#AX_'+t).val()+'",';
            }
        });

        E_VUL=val.substr(0, val.length - 1)
        Tdata={'mode':'edit_db','tablename':'auto','title':m,'keywords':E_VUL}
        bak=get_ajax('/API',Tdata);
        if(bak.info=='y'){info_cmd('info','保存成功','tmpinfo');Refresh_data();auto_list()}   
}


//获取单位和默认值2
function GET_Change2(m, d, v) {
    // 1. 使用 find 替代 $.each，找到目标后立即停止查找
    const targetMode = GLOB_CONF.automode.find(x => x.mode === m);
    
    // 如果没找到 mode，提前返回或设置默认提示
    if (!targetMode) return `未知模式:<h class="text-primary">${v}</h>`;

    const Gname = targetMode.title || '';
    
    // 2. 在找到的 mode 下继续查找对应的子项 d
    const targetVal = (targetMode.val || []).find(c => c.mod === d);

    // 3. 提取变量，使用解构赋值或逻辑空值处理
    const Vname = targetVal ? targetVal.title : '';
    const unt = targetVal ? targetVal.unt : '';

    // 4. 使用模板字符串构建 HTML，逻辑更清晰
    return `${Gname}${Vname}:<h class="text-primary">${v}</h>${unt}`;
}
//添加任务
/**
 * 添加自动化配置列表
 */
function add_auto_list() {
    // 1. 获取输入并去除首尾空格
    const title = $('#AO_title').val()?.trim();
    const $infoContainer = 'auto_info'; // 统一反馈容器名称

    // 2. 验证必填项
    if (isEmpty(title)) {
        return info_cmd('danger', '名称不能为空', $infoContainer);
    }

    // 3. 构造请求数据
    // 建议：如果 get_db_menu 内部没有 let/const，请确保其内部也已优化
    const dbValues = get_db_menu('auto', 'AO');
    
    const requestData = {
        mode: 'add_list_db',
        tablename: 'auto',
        keywords: JSON.stringify(dbValues)
    };

    // 4. 发送请求并处理响应
    // 假设 get_ajax 是同步的（基于你之前的代码逻辑）
    try {
        const response = get_ajax('/API', requestData);

        if (response && response.info === 'y') {
            info_cmd('success', '添加成功', $infoContainer);
            // 延迟一小段时间刷新列表，让用户看清提示
            setTimeout(() => {
                if (typeof auto_list === 'function') auto_list();
                $('#AO_title').val(''); // 成功后清空输入框
            }, 500);
        } else {
            info_cmd('danger', `添加失败: ${response.msg || '未知错误'}`, $infoContainer);
        }
    } catch (error) {
        console.error("API Error:", error);
        info_cmd('danger', '系统通信故障', $infoContainer);
    }
}
//暂停任务
/**
 * 停止/切换自动化状态
 * @param {string|number} ID - 任务ID
 * @param {string} s - 状态值 ('y' 为运行, 'n' 为停止)
 */
function stop_auto(ID, s) {
    const statusData = {
        'mode': 'edit_db',
        'tablename': 'auto',
        'title': ID,
        'keywords': `stat="${s}"`
    };

    // 1. 更新数据库状态
    const statusBak = get_ajax('/API', statusData);

    if (statusBak && statusBak.info === 'y') {
        // 2. 如果状态是停止 ('n')，则额外清理定时任务
        if (s === 'n') {
            AUTO_stop_time(ID);
        }
        
        // 3. 统一刷新列表，避免多次刷新
        if (typeof auto_list === 'function') {
            auto_list();
        }
    }
}

/**
 * 从定时任务中移除特定任务
 * @param {string|number} id - 任务ID
 */
function AUTO_stop_time(id) {
    const taskData = {
        "id": `ID_Y${id}`,
        "mod": "remove_task"
    };
    
    // 返回结果以便外部判断是否需要处理
    return get_ajax('/corn', taskData);
}
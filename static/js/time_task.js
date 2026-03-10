//tzlocal=$.ajax({url:'/API',data:{"mode":"tzlocal"},cache:false,async: false});
//tzlocal=JSON.parse(tzlocal.responseText);
SYS_T='';
L_TIME ='';


// 定时任务列表
function times_list() {
    // 1. 数据初始化与获取 - 完整保留
    var gettask2 = get_ajax('/corn', { "mod": "gettask" });
    var L_TIME = get_ajax('/API', { "mode": "table_to_all", "tablename": "time" });
    SYS_T = get_ajax('/API', { "mode": "Query_sunrise_and_sunset", "keywords": "n" });
    responseID = get_ajax('/corn', { "mod": "getjobs" });
    var page = '';
    var page2 = '';

    // 2. 处理定时任务列表逻辑
    if (L_TIME.info !== 'n' && L_TIME.data) {
        var taskData = L_TIME.data.reverse();

        $.each(taskData, function (n, m) {
            var mode_text = '', dir_time = '', butt = '', mode_text_colour = '';
            
            // --- 模式解析逻辑 ---
            switch(m.mode) {
                case 'interval':
                    mode_text = '循环';
                    dir_time = m.second + '秒';
                    mode_text_colour = '#ff4d4f'; 
                    break;
                case 'cron':
                    mode_text = '定时';
                    dir_time = m.week + ' | ' + m.hour + ':' + m.minute + ':' + m.second;
                    mode_text_colour = '#52c41a';
                    break;
                case 'sun':
                    mode_text = '天文';
                    dir_time = (m.second === 'sunset' ? '日落:' + SYS_T.data.sunset : '日出:' + SYS_T.data.sunrise) + ' + ' + m.minute + 'm';
                    mode_text_colour = '#faad14';
                    break;
            }

            var NEWID = 'ID' + m.ID;
            var getID = findAndFormatById(NEWID, responseID.data);
            var T_NET_TIME = getID ? getID.next_run : "未开启";
            var gettask = responseID.data.some(item => item.id === NEWID);

            // 状态与按钮逻辑
            if (gettask) {
                L_TIME.data[n]['stat'] = 'n'; 
                butt = `<a href="javascript:void(0);" onclick="stop_time('${m.ID}','y','n')" style="color:#52c41a; font-size:28px;">${LOADING}</a>`;
            } else {
                L_TIME.data[n]['stat'] = 'y';
                butt = `<a href="javascript:void(0);" onclick="stop_time('${m.ID}','n','n')" style="color:#d9d9d9; font-size:28px;"><i class="fa fa-toggle-off"></i></a>`;
            }
            L_TIME.data[n]['stat'] = 'n'; // 强制重置状态标记

            var card_data = JSON.stringify(L_TIME.data[n]).replace(/'/g, "&apos;");

            // UI 拼接 - 现代卡片风格
            page += `
                <div class="col-12 col-md-4 p-2">
                    <div class="modern-card" style="background: #fff; border-radius: 18px; padding: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; height: 100%; display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <div style="font-weight: 800; color: #262626; font-size: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                <i class="fa fa-tasks text-primary"></i> ${m.title}
                            </div>
                            <a href="javascript:void(0);" onclick='edit_time(${card_data})' data-toggle="modal" data-target="#myModal" style="color:#bfbfbf;"><i class="fa fa-pencil-square-o"></i></a>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <span style="font-size: 11px; padding: 3px 10px; border-radius: 8px; background: ${mode_text_colour}15; color: ${mode_text_colour}; font-weight: bold; border: 1px solid ${mode_text_colour}30;">${mode_text}模式</span>
                        </div>
                        <div style="flex: 1; font-size: 13px; color: #595959; line-height: 1.8;">
                            <div><i class="fa fa-microchip" style="width:18px"></i> 设备: <span class="text-primary">${m.time_list_title}</span></div>
                            <div><i class="fa fa-terminal" style="width:18px"></i> 命令: <span class="text-info">${m.cmd.substring(0, 15)}</span></div>
                            <div><i class="fa fa-calendar-check-o" style="width:18px"></i> 时间: <span class="text-dark font-weight-bold">${dir_time}</span></div>
                            <div style="margin-top: 8px; background: #fff1f0; padding: 6px 10px; border-radius: 8px; border: 1px solid #ffa39e60;">
                                <i class="fa fa-clock-o text-danger"></i> 下次: <span class="text-danger font-weight-bold">${T_NET_TIME}</span>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 12px; border-top: 1px solid #f5f5f5;">
                            <a href="javascript:void(0);" onclick="stop_time('${m.ID}','y','n');del_new_list('time','${m.ID}','times_list');" style="color:#ffccc7; font-size:18px;"><i class="fa fa-trash-o"></i></a>
                            ${butt}
                        </div>
                    </div>
                </div>`;
        });
    } else {
        page = '<div class="col-12 text-center p-5 text-muted">没有获取数据</div>';
    }

    // 3. 构建添加任务卡片 (保留所有隐藏域、日志按钮和原逻辑)
    var DEL_TIME_ALL = '<a href="javascript:void(0);" style="color:inherit;" onclick="del_all_time()"><i class="fa fa-pause-circle text-danger" style="font-size:20px; vertical-align:middle;"></i></a>';
    var CAT_TIME_LOG = '<a href="javascript:void(0);" style="color:inherit;" data-toggle="modal" data-target="#myModal" onclick="cat_log(\'apscheduler\',\'#about_logo\')"><i class="fa fa-file-text-o"></i> 日志查询</a>';

    page2 = `
        <div class="col-12 col-md-4">
            <div class="modern-card shadow-sm" style="background: #f0f5ff; border: 2px dashed #adc6ff; border-radius: 18px; padding: 20px; height: 100%;">
                <div style="font-weight: 800; color: #1d39c4; margin-bottom: 15px;"><i class="fa fa-plus-circle"></i> 新建自动化任务</div>
                <div class="form-group mb-2">
                    <input type="text" id="T_title" class="form-control form-control-sm" placeholder="任务名称">
                </div>
                <div class="form-group mb-2">
                    <select id="T_mode" onchange="addtime_input()" class="form-control form-control-sm"></select>
                </div>
                <div class="form-group mb-2">
                    <input id="T_time_list_id" type="hidden">
                    <input id="T_time_list_title" type="text" list="T_L_P" onchange="handleOnChange(this)" class="form-control form-control-sm" placeholder="输入或选择设备"/>
                    <input type="hidden" id="T_time_list_Publish">
                    <datalist id="T_L_P"></datalist>
                </div>
                <div class="form-group mb-2">
                    <input type="text" id="T_cmd" class="form-control form-control-sm" placeholder="命令 [on|off]">
                </div>
                <div class="form-group mb-3">
                    <div id="mode_t_time" style="background:#fff; padding:5px; border-radius:5px; border:1px solid #d9d9d9;">
                        <input type="text" id="T_second" class="border-0" style="width:100%; outline:none;" inputmode="numeric" oninput="this.value=this.value.replace(/\\D/g,'')" placeholder="间隔秒数(默认30)">
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <button class="btn btn-primary btn-sm" onclick="add_time_save()" style="border-radius: 8px; padding: 5px 15px;">立即创建</button>
                    <span style="font-size: 12px; color: #597ef7; cursor: pointer;">${CAT_TIME_LOG}</span>
                </div>
            </div>
        </div>`;


// 4. 渲染到页面 - 采用绝对对齐布局
    var containerHtml = `
        <div style="width: 100%; box-sizing: border-box;">
            <div id="time_info"></div>
            
            <div style="background: #fff; border-radius: 12px; padding: 15px 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; border: 1px solid #f0f0f0;">
                <div style="font-size: 14px; color: #262626; font-weight: 500; display: flex; align-items: center;">
                    <span style="display: flex; align-items: center;">${DEL_TIME_ALL}</span>
                    <span style="margin-left:12px; color: #8c8c8c;">服务器系统时间:</span>
                    <span id="showDate" class="text-danger font-weight-bold" style="margin-left:8px; font-size: 16px;"></span>
                    <span id="showDate2" class="text-muted small" style="margin-left:8px;"></span>
                </div>
                <div style="color: #bfbfbf; font-size: 12px; display: flex; align-items: center;">
                    <i class="fa fa-info-circle" style="margin-right: 5px;"></i> 自动运行状态监控中
                </div>
            </div>
            
            <div style="display: flex; flex-wrap: wrap; margin: 0 -10px;">
                ${page2 + page}
            </div>
        </div>`;
    
    $('#page_list').html(containerHtml);

    // 5. 初始化插件与下拉框 - 完整保留，不作改动
    if (typeof GLOB_CONF !== 'undefined' && GLOB_CONF.timemode) {
        var modeOptions = GLOB_CONF.timemode.map(function(x) {
            return '<option value="' + x.mode + '">' + x.title + '</option>';
        }).join('');
        $("#T_mode").html(modeOptions);
    }

    addtime_id();
    getTime_dir();
    TIME_MOD_C_L = $('#T_mode').val();
}
T_lan={
    "ID": "ID",
    "cmd": "命令",
    "hour": "小时",
    "minute": "分钟",
    "mode": "模式",
    "second": "秒",
    "stat": "状态",
    "time_list_Publish": "主题",
    "time_list_id": "TIMEID",
    "time_list_title": "标题",
    "title": "名称",
    "week": "周"
}
function edit_time(n1) {
    // 1. 解析数据并进行容错处理
    let data;
    try {
        data = typeof n1 === 'string' ? JSON.parse(n1) : n1;
    } catch (e) {
        console.error("数据解析失败", e);
        return;
    }

    // 2. 清空页面容器 (使用 jQuery 的 empty)
    $("#history_list_page, #mpage").empty();

    // 3. 定义需要排除的键名 (Blacklist)
    const excludeKeys = ['ID', 'stat', 'time_list_id', 'time_list_title', 'mode'];

    // 4. 构建列表项 (使用数组 map/reduce 提高效率)
    const listItems = Object.entries(data)
        .filter(([key]) => !excludeKeys.includes(key))
        .map(([key, value]) => {
            // 获取翻译标签，如果不存在则显示 key
            const label = (typeof T_lan !== 'undefined' && T_lan[key]) ? T_lan[key] : key;
            
            return `
                <li class="list-group-item d-flex flex-row">
                    <div class="col-sm-4">${label}:</div>
                    <div class="col-sm-8">
                        <input type="text" class="form-control" id="X_${key}" value="${value}">
                    </div>
                </li>`;
        }).join('');

    // 5. 构建整体结构
    // 这里的 BGCOLOUR[BGCARD] 建议确保有默认值
    const cardClass = (typeof BGCOLOUR !== 'undefined' && typeof BGCARD !== 'undefined') 
                      ? `list-group-item-${BGCOLOUR[BGCARD]}` 
                      : '';

    const htmlContent = `
        <ul class="list-group">
            <li class="list-group-item ${cardClass}">${data.title || '编辑详情'}</li>
            ${listItems}
            <div id="tmpinfo"></div>
            <li class="list-group-item text-center">
                <a href="javascript:void(0);" onclick="edit_time_save(${data.ID})">
                    <i class="fa fa-check-circle" style="font-size:24px; color: #28a745;"></i>
                </a>
            </li>
        </ul>`;

    // 6. 一次性注入 DOM
    $('#mpage').html(htmlContent);
}

//保存编辑后值
function edit_time_save(id) {
    // 1. 定义需要排除的字段名
    const excludedFields = ['ID', 'stat', 'time_list_id', 'time_list_title', 'mode'];

    // 2. 使用数组 map 和 filter 替代字符串拼接，更优雅且易于维护
    const updates = Object.keys(T_lan)
        .filter(key => !excludedFields.includes(key))
        .map(key => {
            const val = $(`#X_${key}`).val() || '';
            return `${key}="${val}"`;
        });

    if (updates.length === 0) return; // 没数据则不执行

    const keywords = updates.join(',');

    // 3. 构建请求对象
    const Tdata = {
        mode: 'edit_db',
        tablename: 'time',
        title: id,
        keywords: keywords
    };

    // 4. 发送请求并处理回调
    const bak = get_ajax('/API', Tdata);

    if (bak && bak.info === 'y') {
        info_cmd('info', '保存成功', 'tmpinfo');
        
        // 5. 链式操作或刷新逻辑
        Refresh_data();
        times_list();
        
        // 修改后重启任务 (之前定义的 stop_time)
        stop_time(id, 'r', 'r');
    }
};
function addtime_id() {
    const $tMode = $('#T_mode');
    const tModeValue = $tMode.val();
    const fragment = document.createDocumentFragment();

    // 1. 定义需要排除的模式类型 (增加可维护性)
    const EXCLUDED_MODES = ['lock', 'card', 'iframe', 'camera', 'warther', 'sensor'];

    // 2. 处理设备列表数据
    if (window.L_LIST && Array.isArray(L_LIST.data)) {
        L_LIST.data.forEach(item => {
            const hasPublish = item.Publish && item.Publish.length !== 0;
            const isValidMode = !EXCLUDED_MODES.includes(item.mode);

            if (hasPublish && isValidMode) {
                fragment.appendChild(new Option(item.title, item.title));
            }
        });
    }

    // 3. 根据任务模式添加特定的功能选项
    const extraOptions = {
        'interval': ['循环计算使用量', '循环检测程序'],
        'cron': ['定时清理历史记录', '定时计算历史功耗']
    };

    if (extraOptions[tModeValue]) {
        extraOptions[tModeValue].forEach(text => {
            fragment.appendChild(new Option(text, text));
        });
    }

    // 4. 一次性清空并挂载 (假设 T_L_P 是全局变量或已定义)
    T_L_P.innerHTML = ''; 
    T_L_P.appendChild(fragment);
}


function handleOnChange(input) {
    const inputValue = input.value;
    const mode = $('#T_mode').val();
    let selectedValue = '';
    let selectedId = '';

    // 1. 优先处理特殊模式的固定映射 (Lookup Table)
    const specialMaps = {
        'interval': {
            '循环检测程序': 'ID_count_app',
            '循环计算使用量': 'ID_count_histor'
        },
        'cron': {
            '定时清理历史记录': 'ID_clean_day',
            '定时计算历史功耗': 'ID_count_day'
        }
    };

    // 检查当前模式下是否有匹配的特殊值
    if (specialMaps[mode] && specialMaps[mode][inputValue]) {
        selectedId = specialMaps[mode][inputValue];
        selectedValue = selectedId; // 或者是你定义的特定 Publish 值
    } else {
        // 2. 如果不是特殊固定项，则遍历数据列表查找
        // 使用 find 替代 each，找到匹配项后立即停止，性能更好
        const match = L_LIST.data.find(x => x.title === inputValue);
        if (match) {
            selectedValue = match.Publish;
            selectedId = match.ID;
        }
    }

    // 3. 统一更新 DOM
    $("#T_time_list_id").val(selectedId);
    $('#T_time_list_Publish').val(selectedValue);
};
$(document).ready(function(){

	$("#T_time_list_title").change(function(){
		var vue = $(this).val();
                if($('#T_time_list_title').val().includes('/')){
		    $("#T_time_list_Publish").val(vue);
                 }
	})

})
function addtime_input() {
    addtime_id();
    const $container = $('#mode_t_time');
    const mode = $('#T_mode').val();

    // 辅助工具：数字补零
    const pad = (n) => n < 10 ? '0' + n : n;

    // 1. 日出日落模式
    if (mode === 'sun') {
        const { sunrise, sunset } = SYS_T.data;
        const sunPage = `
            <select id="sel_sun">
                <option value="sunrise">日出: ${sunrise}</option>
                <option value="sunset">日落: ${sunset}</option>
            </select>
            <hr>提前输入-x分钟，推迟+x分钟<hr>
            <input id="sun_mut" type="text" inputmode="numeric" 
                   oninput="this.value=this.value.replace(/[^\\d+-]/g,'')" placeholder="+1"/>`;
        $container.html(sunPage);
    }

    // 2. 间隔模式
    if (mode === 'interval') {
        $container.html('<input type="text" id="T_second" value="30" inputmode="numeric" oninput="this.value=this.value.replace(/\\D/g,\'\')" placeholder=">30">');
    }

    // 3. 定时(Cron)模式
    if (mode === 'cron') {
        const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        
        // 生成星期选择
        let weekHtml = days.map((day, i) => 
            `<input name="TS_WEEK" type="checkbox" value="${day}" />${i}`
        ).join('');

        let page = `
            <ul class="list-group">
                <li class="list-group-item">星期: ${weekHtml}</li>
                <li class="list-group-item">
                    时:<select id="T_hour"></select>
                    分:<select id="T_minute"></select>
                    秒:<select id="T_second"></select>
                </li>
            </ul>`;
        
        $container.html(page);

        // 批量生成下拉选项
        const generateOptions = (max) => {
            let options = '';
            for (let i = 0; i <= max; i++) {
                const val = pad(i);
                options += `<option value="${val}">${val}</option>`;
            }
            return options;
        };

        $("#T_hour").append(generateOptions(23));
        $("#T_minute").append(generateOptions(59));
        $("#T_second").append(generateOptions(59));
    }
}	 
//定时任务保存
function add_time_save() {
    // 1. 获取基本表单值并去空格
    const mode = $('#T_mode').val();
    const title = $('#T_title').val().trim();
    const deviceTitle = $('#T_time_list_title').val().trim();
    const publishId = $('#T_time_list_Publish').val(); // 对应上面新增的隐藏域
    
    // 调试：如果还是报错，请打开 F12 查看控制台输出
    console.log("Submit Data:", { title, deviceTitle, publishId, mode });

    let ts = {
        week: '', hour: '', minute: '', second: '', isError: false
    };

    // 2. 根据模式提取时间参数
    switch (mode) {
        case 'cron':
            const selectedWeeks = $("[name=TS_WEEK]:checked").map(function() { return $(this).val(); }).get();
            ts.week = selectedWeeks.join(",");
            ts.hour = $('#T_hour').val() || '0';
            ts.minute = $('#T_minute').val() || '0';
            ts.second = $('#T_second').val() || '0';
            if (selectedWeeks.length === 0) ts.isError = true;
            break;

        case 'interval':
            const sec = parseInt($('#T_second').val()) || 0;
            ts.second = sec < 5 ? 5 : sec; // 建议放宽到5秒，30秒可能太长
            break;

        case 'sun':
            ts.minute = $('#sun_mut').val() || '0';
            ts.second = $('#sel_sun').val() || 'sunset';
            break;
    }

    // 3. 基础逻辑验证
    if (!title) {
        info_cmd('danger', '请输入任务名称', 'time_info');
        return;
    }
    if (!deviceTitle) {
        info_cmd('danger', '请选择有效设备', 'time_info');
        return;
    }
    if (ts.isError && mode === 'cron') {
        info_cmd('danger', '定时模式请至少选择一个执行周期（星期）', 'time_info');
        return;
    }

    // 4. 构造提交对象
    const jobData = {
        time_list_id: $('#T_time_list_id').val() || '0',
        stat: 'y',
        hour: ts.hour,
        cmd: $('#T_cmd').val() || 'on',
        time_list_title: deviceTitle,
        second: ts.second,
        minute: ts.minute,
        title: title,
        week: ts.week,
        time_list_Publish: publishId || 'default', // 防止为空
        mode: mode
    };

    // 5. 提交数据
    const valString = Object.values(jobData).map(v => `"${v}"`).join(",");
    const finalJob = `null,${valString}`;

    const res = get_ajax('/API', {
        mode: 'add_db_data',
        tablename: 'time',
        keywords: finalJob
    });

    if (res && (res.info === 'y' || res.status === 200)) {
        // 成功后的处理
        if(typeof Refresh_data === 'function') Refresh_data();
        times_list(); // 刷新列表
        info_cmd('success', '任务创建成功！', 'time_info');
    } else {
        info_cmd('danger', '保存失败：' + (res.msg || '服务器错误'), 'time_info');
    }
}
//启动定时任务暂停定时任务eval(refun)
function stop_time(id, STAT, mod = 'n') {
    let action;

    if (mod === 'n') {
        action = (STAT === 'y') ? 'remove_task' : 'addjob';
    } else {
        get_ajax('/corn', { "id": id, "mod": "remove_task" });
        action = 'addjob';
    }

    const params = {
        "mod": action,
        [action === 'addjob' ? 'keywords' : 'id']: id
    };

    const response = get_ajax('/corn', params);
    
    if (response && response.info === 'y') {
        times_list();
    }
}	  
function T_T_TYPE(date) {
   var date = date;
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
   return t;
  } 
/**
 * 获取并显示设备时差及动态时间
 */
function getTime_dir() {
    // 1. 确保数据存在
    if (!window.SYS_T || !window.SYS_T.data) return;

    // 2. 使用 const/let 避免全局污染，兼容不同浏览器的日期格式
    const deviceTimeStr = SYS_T.data.now_time.replace(/-/g, "/");
    const devTimeMs = new Date(deviceTimeStr).getTime();
    const pcTimeMs = Date.now();
    const diffMs = pcTimeMs - devTimeMs;
    const diffSec = (diffMs / 1000).toFixed(1); // 保留一位小数

    const $showDate2 = $("#showDate2");

    // 3. 逻辑优化：时差绝对值大于 3 秒（即 3000ms）时显示提示
    if (Math.abs(diffMs) > 3000) {
      //if (0==0) {
        const calibrationBtn = `
            <a href="javascript:void(0);" 
               class="btn btn-info btn-sm" 
               style="color:inherit; margin-left:10px;" 
               onclick="open_Calibration()">
               校准
            </a>`;
        
        const infoHtml = `时差: ${diffSec} 秒 ${calibrationBtn} <span class="text-muted">${SYS_T.data.now_time}</span>`;
        $showDate2.html(infoHtml);
    } else {
        $showDate2.empty();
    }

    // 4. 定时器优化：确保全局只有一个定时器在运行
    if (window.timeUpdateTimer) {
        clearInterval(window.timeUpdateTimer);
    }

    const $showDate = $("#showDate");
    window.timeUpdateTimer = setInterval(() => {
        const now = new Date();
        // 假设 T_T_TYPE 是格式化时间的函数
        if (typeof T_T_TYPE === 'function') {
            $showDate.html(T_T_TYPE(now));
        } else {
            $showDate.html(now.toLocaleString());
        }
    }, 1000);
}

//清除所有定时任务
function del_all_time(){
   if (!confirm('清除所有定时任务?')) return false;
       del_time=get_ajax('/corn',{"mod":"del_all_time"});
       if(del_time.info=='y'){times_list()}
}
/**
 * 校正系统时间
 */
async function open_Calibration() {
    // 1. 使用常量管理提示信息，提高可维护性
    info_cmd('danger', '正在校正时间...');
    setTimeout(function(){
        const data = {"keywords":'systime',"mode":"get_cmd_sh"};
        // 建议这里检查 get_ajax 是否为异步
    try {
        get_ajax('/API', data, function(bak){
             if(bak.info=='y'){ 
                  getTime_dir();
                  info_cmd('success', '时间校正成功！');
             }
        });
    } catch (error) {
        // 4. 网络异常处理
        info_cmd('danger', '网络请求失败，请检查网络连接');
        console.error("Calibration Error:", error);
    }


    }, 1000);
}

var everyCount = parseInt(typeof Every !== 'undefined' ? Every : 10);
function history(pnumber = 0, val = 0) {
       $("#page_list").empty();
        const _p = parseInt(pnumber) || 0;
    const _v = parseInt(val) || 0; 
    const _every = typeof Every !== 'undefined' ? parseInt(Every) : 10;

    const requestData = {
        'mode': 'table_to_all_h',
        'tablename': 'Rec_stat',
        'd1': _v,
        'd2': _every
    };
    const response = get_ajax('/API', requestData);
    const ndata = response.data;
    const totalCount = response.count;

    if (!ndata || ndata === 'n' || ndata.length === 0) {
        $("#page_list").html(`
            <div class="text-center" style="padding: 50px; color: #bfbfbf;">
                <i class="fa fa-folder-open-o" style="font-size: 48px; margin-bottom: 10px;"></i>
                <p>${typeof GET_DATA_INFO !== 'undefined' ? GET_DATA_INFO : "暂无历史记录"}</p>
            </div>
        `);
        return;
    }

    // 2. 生成分页组件
    const pagings = paging(pnumber, totalCount,'history');

    let tableRows = '';
    let tableHeader = '';
    let isHeaderGenerated = false;

    // 3. 遍历数据行
    $.each(ndata, function(index, row) {
        let rowCells = '';
        let headerCells = '';

        $.each(row, function(key, value) {
            if (key === 'listid' || key === 'ID') return;

            // 处理表头 (样式增强)
            if (!isHeaderGenerated) {
                headerCells += `<th style="border-top:none; font-weight:700; color:#8c8c8c; text-transform:uppercase; font-size:12px;">${key}</th>`;
            }

            let displayValue = value;
            if (key === 'time') {
                displayValue = `<span style="color:#bfbfbf; font-size:12px;">${timestampToTime(value)}</span>`;
            }

            if (key === 'title') {
                const safeListId = row["listid"];
                const safeIp = find_ip(value);
                rowCells += `<td>
                    <a href="javascript:void(0);" style="font-weight:600; color:#1890ff;" onclick="get_history('0','0','${safeListId}','history_list','${safeIp}','','','','Rec_stat');">
                        ${value}
                    </a>
                </td>`;
            } else if (key === 'stat' || key === 'value') {
                // 对状态值进行着色处理（可选）
                rowCells += `<td><span class="badge badge-light" style="font-weight:500; color:#595959;">${displayValue}</span></td>`;
            } else {
                rowCells += `<td style="vertical-align: middle;">${displayValue}</td>`;
            }
        });

        if (!isHeaderGenerated) {
            tableHeader = `<tr>${headerCells}</tr>`;
            isHeaderGenerated = true;
        }
        tableRows += `<tr style="transition:0.3s;">${rowCells}</tr>`;
    });

    // 4. 组装最终 HTML (大卡片风格)
    const finalHtml = `
        <div class="container-fluid" style="padding: 10px;">
            <div id="history_list" class="modern-card" style="background: #fff; border-radius: 22px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h4 style="font-weight: 800; color: #262626; margin:0;">
                            <i class="fa fa-history text-primary" style="margin-right:8px;"></i>历史日志
                        </h4>
                        <small style="color:#bfbfbf;">共计 ${totalCount} 条记录</small>
                    </div>
                    
                    <a href="javascript:void(0);" data-toggle="modal" data-target="#myModal" onclick="del_history_page('${totalCount}')" 
                       class="btn btn-outline-danger btn-sm" style="border-radius: 10px; padding: 5px 15px; font-weight: 600;">
                        <i class="fa fa-trash-o"></i> 清空历史数据
                    </a>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover" style="table-layout:fixed; word-wrap:break-word; margin-bottom:0;">
                        <thead>
                            ${tableHeader}
                        </thead>
                        <tbody id="thedata" style="color:#434343; font-size:13px;">
                            ${tableRows}
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #f0f0f0; display: flex; justify-content: center;">
                    ${pagings}
                </div>
            </div>
            <div id="bub_list" class="mt-4"></div>
        </div>`;

    $("#page_list").html(finalHtml);
};

function del_history_page(totalCount) {
    // 1. 清空旧内容
    const $mPage = $("#mpage");
    const $historyPage = $("#history_list_page");
    
    $historyPage.empty();
    $mPage.empty();

    // 2. 使用模板字符串构建更整洁的 UI (基于 Bootstrap 4/5 风格)
    const htmlTemplate = `
        <div class="alert"><div class="container-fluid p-3">
            <h5 class="mb-4 text-primary"><i class="fa fa-history"></i> 数据清理选项</h5>
            
            <div class="card border-warning shadow-sm mb-4">
                <div class="card-body">
                    <h6 class="card-title font-weight-bold">按时间段删除</h6>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text">删除前</span>
                        </div>
                        <input type="number" id="DEL_2" class="form-control" value="15" min="1">
                        <div class="input-group-append">
                            <span class="input-group-text">天记录</span>
                        </div>
                        <button class="btn btn-warning ml-2" onclick="del_history_cmd()" title="执行删除">
                            <i class="fa fa-trash-o text-danger"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="card border-danger shadow-sm">
                <div class="card-body">
                    <h6 class="card-title font-weight-bold text-danger">危险操作</h6>
                    <p class="card-text">
                        当前累计共有 <span class="badge badge-danger">${totalCount}</span> 条历史记录。
                    </p>
                    <button class="btn btn-outline-danger btn-block" onclick="handleCleanAll()">
                        <i class="fa fa-exclamation-triangle"></i> 清空所有历史记录
                    </button>
                </div>
            </div>
        </div></div>`;

    // 3. 渲染到页面
    $mPage.html(htmlTemplate);
}

/**
 * 封装清空数据库的二次确认逻辑
 */
function handleCleanAll() {
    if (confirm("⚠️ 警告：此操作将永久删除 Rec_stat 表中的所有历史记录，且无法撤销！\n\n您确定要继续吗？")) {
        clean_db('Rec_stat');
    }
};
/**
 * 按天清理历史记录
 */
function del_history_cmd() {
    const $statusIcon = $('#del_history_i');
    const $displayArea = $("#history_list_page");
    
    // 1. 获取清理天数
    const delDayValue = $("#DEL_2").val();
    
    // 2. 安全拦截：批量删除必须确认
    if (!confirm(`确定要清理 ${delDayValue || ''} 天前的所有历史记录吗？此操作无法恢复！`)) {
        return;
    }

    // 3. 初始化 UI 状态
    $displayArea.empty();
    $statusIcon.html(typeof LOADING !== 'undefined' ? LOADING : '正在清理...');

    // 4. 构建数据
    const requestData = {
        'mode': 'table_clean_day',
        'tablename': 'Rec_stat',
        'd1': delDayValue
    };

    try {
        // 5. 执行请求
        const response = get_ajax('/API', requestData);

        // 6. 结果反馈
        if (response && response.info === 'y') {
            // 使用通用的信息提示函数
            if (typeof info_cmd === 'function') {
                info_cmd('info', '历史数据清理成功', 'del_history_i');
            } else {
                $statusIcon.html('<span style="color:green;">清理成功</span>');
            }
        } else {
            // 细化错误提示
            const errorMsg = (response && response.info) ? response.info : '超过最长时间或权限不足';
            $statusIcon.html(`<span style="color:orange;">${errorMsg}</span>`);
        }
    } catch (error) {
        console.error("Cleanup Error:", error);
        $statusIcon.html('<span style="color:red;">网络请求失败</span>');
    }
};
/**
 * 清空指定的数据表
 * @param {string} tableName - 要清空的数据表名称
 */
function clean_db(tableName) {
    // 1. 强化确认逻辑
    const warningMsg = `⚠️ 极其危险的操作！\n\n确定要清空数据表 [ ${tableName} ] 吗？\n此操作将删除所有记录且无法恢复！`;
    if (!confirm(warningMsg)) return false;

    // 2. 局部变量声明
    const requestData = {
        'mode': 'clean_db',
        'tablename': tableName // 使用传入的参数，不再硬编码
    };

    // 3. UI 状态反馈（可选：防止重复点击）
    // console.log("正在清空数据表...");

    try {
        const response = get_ajax('/API', requestData);

        if (response && response.info === 'y') {
            // 4. 成功处理
            if (typeof info_cmd === 'function') {
                info_cmd('info', `表 ${tableName} 已成功清空`);
            }

            // 刷新列表并关闭模态框
            if (typeof history === 'function') history(0, 0);
            $("#myModal").modal('hide');
            
        } else {
            // 5. 错误处理
            const errorMsg = response.data || '服务器拒绝了清空请求';
            //alert('操作失败：' + errorMsg);
             info_cmd('danger', '操作失败：' + errorMsg);
            // 注意：不再调用错误的 $("#myModal").modal('失败')
        }
    } catch (error) {
        console.error('清空数据库出错:', error);
             info_cmd('danger', '清空数据库出错:' + error);
       // alert('系统错误，无法完成清空操作');
    }
};
//搜索页面
function get_history(pnumber = 0, p = 0, key, tpage, inub, Publish, Subscribe, mode = '', tablename) {
    const $targetPage = $("#" + tpage);
    $("#mpage").empty();
    // 1. 权限/模式检查
    let displayMode = '';
    const typeConfig = GLOB_CONF['type'] || [];
    const matchedType = typeConfig.find(t => t.val === mode);
    if (matchedType) displayMode = matchedType.stat;

    if (displayMode === 'Publish') {
        $targetPage.html(`
            <div class="alert shadow-sm" style="border-radius:15px; background:#fff1f0; border:1px solid #ffa39e; color:#cf1322;">
                <i class="fa fa-exclamation-circle"></i> ${Publish}
            </div>`);
        return;
    }

    // 2. 获取数据
    const requestData = {
        'mode': 'table_to_sec',
        'tablename': tablename,
        'd1': p,
        'd2': typeof Every !== 'undefined' ? Every : 10,
        'title': 'listid',
        'keywords': key
    };

    const conf = get_ajax('/API', requestData);

    if (conf.info !== 'y') {
        const ipAddr = find_ip(key);
        const errorInfo = typeof GET_DATA_INFO !== 'undefined' ? GET_DATA_INFO : 'No Data';
        $targetPage.html(`
            <div class="modern-card p-4 text-center" style="background:#fff; border-radius:22px;">
                <div class="mb-3"><i class="fa fa-folder-open text-muted" style="font-size:40px;"></i></div>
                <p class="text-secondary">${errorInfo}</p>
                <a href="http://${ipAddr}" target="_blank" class="badge badge-light p-2">访问设备 IP: ${ipAddr}</a>
            </div>`);
        return;
    }

    // 3. 数据处理
    const ndata = conf.data;
    const totalCount = conf.count;
    const pagings = paging(pnumber, totalCount, 'get_history', key, tpage, tablename);
    
    let tableRows = '';
    let tableHeader = '';
    let titleName = '';

    $.each(ndata, function(index, row) {
        let rowHtml = '';
        let headerHtml = '';

        $.each(row, function(keyName, value) {
            if (['pass', 'ID', 'listid'].includes(keyName)) return;

            if (keyName === 'time') value = timestampToTime(value);
            if (keyName === 'page') value = '';
            if (value === null || value === undefined) value = '';
            if (keyName === 'title') titleName = value;

            if (index === 0) {
                headerHtml += `<th style="border-top:none; font-weight:700; color:#8c8c8c; font-size:12px; text-transform:uppercase;">${keyName}</th>`;
            }
            
            const safeValue = String(value).replace(/</g, "&lt;").replace(/>/g, "&gt;");
            rowHtml += `<td style="vertical-align: middle;">${safeValue}</td>`;
        });

        if (index === 0) tableHeader = headerHtml;
        tableRows += `<tr style="transition:0.3s;">${rowHtml}</tr>`;
    });

    // 4. UI 组装
    const backBtn = (tpage === 'history_list_page') ? 
        '' : `<a href="javascript:void(0);" onclick="history(0,0)" class="btn btn-light btn-sm mr-2" style="border-radius:10px; color:#595959;"><i class="fa fa-chevron-left"></i> 返回</a>`;
    
    const ipLink = find_ip(key);

    const finalHtml = `
        <div class="modern-card" style="background: #fff; border-radius: 22px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap;">
                <div>
                    <div style="display: flex; align-items: center; margin-bottom: 5px;">
                        ${backBtn}
                        <h4 style="font-weight: 800; color: #262626; margin:0;">
                            <i class="fa fa-database text-info" style="margin-right:8px;"></i>${titleName || '详情记录'}
                        </h4>
                    </div>
                    <a href="http://${ipLink}" target="_blank" style="font-size:12px; color:#bfbfbf; margin-left: ${tpage === 'history_list_page' ? '0' : '65px'};">
                        <i class="fa fa-link"></i> 设备 IP: ${ipLink}
                    </a>
                </div>

                <div class="text-right">
                    <a href="javascript:void(0);" data-toggle="modal" data-target="#myModal2" 
                       onclick="del_history_one_page('${key}','${pnumber}','${tpage}','${totalCount}','${titleName}')"
                       class="btn btn-outline-danger btn-sm" style="border-radius: 12px; font-weight: 600; padding: 5px 15px;">
                        <i class="fa fa-trash-o"></i> 清除此条目 (${totalCount})
                    </a>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-hover" style="table-layout:fixed; word-wrap:break-word; margin-bottom:0;">
                    <thead style="background: #fafafa;">
                        <tr>${tableHeader}</tr>
                    </thead>
                    <tbody id="thedata" style="font-size:13px; color:#595959;">
                        ${tableRows}
                    </tbody>
                </table>
            </div>

            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #f0f0f0; display: flex; justify-content: center;">
                ${pagings}
            </div>
        </div>`;

    $targetPage.html(finalHtml);
}

/**
 * 删除历史记录界面函数
 */
function del_history_one_page(key, pnumber, tpage, sell, titlename) {
    const $container = $("#mpage2");
    $container.empty();

    // 使用模板字符串提高可读性
    const htmlContent = `
        <div class="container py-3">
            <h4 class="text-white mb-3">
                <i class="fa fa-history mr-2"></i>清理记录：<span class="text-warning">${titlename}</span>
            </h4>
            
            <div class="card border-0 shadow-sm" id="del_history_box">
                <div class="card-body p-4">
                    <div class="form-inline mb-4">
                        <label class="mr-2">删除前</label>
                        <input type="number" id="DEL_DAYS" class="form-control form-control-sm w-25 mr-2" 
                               value="15" min="1" placeholder="天数">
                        <span class="mr-3">天的记录</span>
                        <button type="button" class="btn btn-warning btn-sm" 
                                onclick="handleDelHistoryCmd('${key}')">
                            <i class="fa fa-trash-o text-danger"></i> 执行清理
                        </button>
                    </div>

                    <hr>

                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            全部记录：<strong class="text-danger">${sell}</strong> 条
                            <small class="text-muted d-block mt-1">[注意：此操作不可逆]</small>
                        </div>
                        <button type="button" class="btn btn-outline-danger" 
                                onclick="del_tlebe_data_mod('Rec_stat', '${key}', 'y', '${pnumber}', 'listid', '${tpage}')">
                            <i class="fa fa-bomb"></i> 清空所有
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    $container.html(htmlContent);
}

/**
 * 辅助函数：处理按天数删除的指令
 * 增加基础校验
 */
function handleDelHistoryCmd(key) {
    const days = $("#DEL_DAYS").val();
    if (!days || days <= 0) {
        alert("请输入有效的天数");
        return;
    }
    // 调用原始的命令执行函数
    if (confirm(`确定要删除 ${days} 天前的记录吗？`)) {
        del_history_one_cmd(key, 'mpage2');
    }
};
/**
 * 删除历史记录
 * @param {string} id - 记录唯一标识
 * @param {string} tpage - 页面参数（预留）
 */
function del_history_one_cmd(id, tpage) {
    // 1. 获取输入并预处理
    const $display = $('#del_history_i');
    const deleteVal = $("#DEL_DAYS").val();

    // 2. 界面反馈：清空列表并显示加载中
    $("#history_list_page").empty();
    $display.html(LOADING); 

    // 3. 构建请求参数
    const requestData = {
        'mode': 'del_table_time',
        'tablename': 'Rec_stat',
        'keywords': id,
        'title': 'listid',
        'd1': deleteVal
    };

    // 4. 执行请求 (保持你的 get_ajax 调用习惯)
    // 注意：如果 get_ajax 内部是同步的，浏览器可能会在请求期间“假死”
    try {
        const bak = get_ajax('/API', requestData);

        // 5. 结果处理
        if (bak && bak.info === 'y') {
            // 成功：调用现有的 info_cmd 组件
            info_cmd('info', '删除成功', 'del_history_i');
            
            /* 进阶建议：
               与其清空整个列表，不如只删除对应的那一行，用户体验更好：
               $(`#row_${id}`).remove(); 
            */
        } else {
            // 失败：显示具体原因或默认错误
            const errorMsg = (bak && bak.msg) ? bak.msg : '超过最长时间';
            $display.html(`<span style="color: #ff4d4f;">${errorMsg}</span>`);
        }
    } catch (e) {
        // 增加异常捕获，防止 JS 报错中断后续逻辑
        console.error("AJAX Error:", e);
        $display.html('系统请求异常');
    }
};
//删除数据表中数据
function del_tlebe_data_mod(name,id,m,pnumber,path,tpage){
    if(confirm("确定删除?")){
       data={'mode':'del_table_user_data','tablename':'Rec_stat','title':'listid','keywords':id}	
       confip=get_ajax('/API',data); 
 
       if(tpage=='history_list_page'){
                     //get_history(0,0,id,tpage)
                    info_cmd('info', '删除成功','del_history_i');
                    //location.replace(location);
       }else{
	             if (m=='y'){history(0,0)}else{get_history(0,0,id,tpage)}
       } 
    }
}

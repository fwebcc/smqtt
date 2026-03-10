/* =================================================屏端遥控器核心逻辑================================================= */

async function ir(id, mode, title, Publish, Subscribe, serial) {
    // 1. 获取数据
    const requestData = {
        'mode': 'table_to_one',
        'tablename': 'IRDATA',
        'title': 'listid',
        'keywords': id
    };

    const irResponse = get_ajax('/API', requestData);
    if (!irResponse || !irResponse.data) {
        console.error("未能获取到红外数据");
        return;
    }

    const irDataMap = irResponse.data;
    const isNewInfo = irResponse.info === 'n';
    const safeName = (typeof name !== 'undefined') ? name : '';

    // 2. 生成按钮 HTML
    const buttonsHtml = Object.entries(GLOB_CONF.addir).map(([idName, label], index) => {
        const payload = irDataMap[idName] || '';
        const hasPayload = (typeof isEmpty === 'function' ? !isEmpty(payload) : payload !== '');
        
        // 样式逻辑：开关红，有码蓝，无码灰
        let btnTheme = 'background: linear-gradient(145deg, #e6e6e6, #ffffff); color: #333;'; 
        if (idName === 'cmdoff') {
            btnTheme = 'background: linear-gradient(145deg, #ff5252, #d32f2f); color: #fff;'; 
        } else if (hasPayload) {
            btnTheme = 'background: linear-gradient(145deg, #2196f3, #1976d2); color: #fff;'; 
        }

        const clickFunc = hasPayload ? 'TO_IR_CMD' : 'TO_IR_INFO';
        const safePayload = String(payload).replace(/'/g, "\\'");
        const safePublish = String(Publish).replace(/'/g, "\\'");
        const onclickAttr = `${clickFunc}('${safePublish}', '${safePayload}')`;

        return `
            <div class="col-6 d-flex justify-content-center align-items-center" style="margin-bottom: 20px;">
                <div class="ir-btn-wrapper text-center">
                    <button type="button" 
                            class="btn custom-ir-btn" 
                            style="${btnTheme} width: 75px; height: 75px; border-radius: 50%; border: none; box-shadow: 5px 5px 10px #bebebe, -5px -5px 10px #ffffff; transition: all 0.1s ease; font-weight: bold; font-size: 14px;" 
                            onclick="${onclickAttr}"
                            onmousedown="this.style.transform='scale(0.92)'; this.style.boxShadow='inset 2px 2px 5px #bebebe'"
                            onmouseup="this.style.transform='scale(1)'; this.style.boxShadow='5px 5px 10px #bebebe, -5px -5px 10px #ffffff'">
                        ${label}
                    </button>
                    <div id="D_${idName}" style="display:none; margin-top:5px;">
                        <input type="text" id="B_${idName}" value="${payload}" class="form-control form-control-sm" style="font-size:10px; text-align:center; background: rgba(255,255,255,0.5);">
                    </div>
                </div>
            </div>`;
    }).join('');

    // 3. 准备编辑所需的参数
    const paramList = [irDataMap.ID, id, mode, title, Publish, Subscribe, serial, safeName, irResponse.info];
    const editParams = paramList.map(p => `'${String(p || '').replace(/'/g, "\\'")}'`).join(',');
    const timestamp = Date.now();

    // 4. 构建主布局
    const pageLayout = `
        <style>
            .remote-container { background: #f0f0f0; border-radius: 40px; padding: 25px 15px; box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff; max-width: 350px; margin: 15px auto; position: relative; }
            .remote-header { background: #222; border-radius: 20px; padding: 12px; margin-bottom: 25px; box-shadow: inset 2px 2px 5px #000; }
            .custom-ir-btn:focus { outline: none !important; box-shadow: none !important; }
        </style>
        <div class="remote-container">
            <div class="remote-header text-center" id="ir_nav_bar">
                <h4 style="color: #00d1ff; margin: 0; font-family: sans-serif; display: flex; justify-content: center; align-items: center; font-size: 18px;">
                    <span id="ir_title_text">${title}</span>
                    <a href="javascript:void(0);" style="color: #00d1ff; margin-left: 15px;" 
                       onclick="edit_ir_list(${editParams})" id="ir_edit_toggle">
                        <i class="fa fa-cog" style="font-size:20px"></i>
                    </a>
                </h4>
            </div>
            <div class="row no-gutters">${buttonsHtml}</div>
            <div id="ir_info" class="mt-2 text-center" style="min-height: 24px;"></div>
            <div id="sub_info" class="text-center"></div>
        </div>
        <input type="hidden" id="B_name" value="${safeName}">
        <input type="hidden" id="B_listid" value="${id}">
        <input type="hidden" id="B_time" value="${timestamp}">`;

    $('#mpage').html(pageLayout);

    // 5. 初始自动进入编辑逻辑（如果是新创建的设备）
    if (isNewInfo) {
        edit_ir_list(irDataMap.ID, id, mode, title, Publish, Subscribe, serial, safeName, irResponse.info);
    }
}

/* ---------------- 基础指令下发 ---------------- */
function TO_IR_CMD(topic, payload) {
    mqtt_Publish_Message(payload, topic);
}

function TO_IR_INFO(topic, payload) {
    info_cmd('danger', '该按键尚未学习码值！', 'ir_info');
}

/* ---------------- 模式切换：进入编辑模式 ---------------- */
function edit_ir_list(MID, id, mode, title, Publish, Subscribe, serial, name, info) {
    // 1. 显示所有的输入框
    Object.keys(GLOB_CONF.addir).forEach(key => {
        $(`#D_${key}`).fadeIn(300);
    });

    // 2. 将“设置”图标替换为“返回”图标
    const backParams = `'${id}','${mode}','${title}','${Publish}','${Subscribe}','${serial}'`;
    const backHeaderHtml = `
        <h4 style="color: #ffc107; margin: 0; font-family: sans-serif; display: flex; justify-content: center; align-items: center; font-size: 18px;">
            <a href="javascript:void(0);" style="color: #ffc107; margin-right: 15px;" 
               onclick="ir(${backParams})" title="返回遥控器">
                <i class="fa fa-arrow-left" style="font-size:20px"></i>
            </a>
            编辑模式
        </h4>`;
    $("#ir_nav_bar").html(backHeaderHtml);

    // 3. 构建安全的保存按钮参数
    const args = [MID, id, mode, title, Publish, Subscribe, serial, name, info].map(arg => {
        return `'${String(arg || '').replace(/'/g, "\\'")}'`;
    });

    const saveButtonHtml = `
        <p class="text-center mt-3">
            <a href="javascript:void(0);" 
               onclick="edit_ir_save(${args.join(',')})" 
               style="text-decoration: none;">
                <i class="fa fa-check-circle text-warning" style="font-size:52px; text-shadow: 2px 2px 5px rgba(0,0,0,0.2);"></i>
                <div style="color:#e67e22; font-weight:bold; font-size:12px; margin-top:5px;">保存配置</div>
            </a>
        </p>`;

    $("#sub_info").html(saveButtonHtml);
}

/* ---------------- 数据持久化：保存设置 ---------------- */
function edit_ir_save(MID, id, mode, title, Publish, Subscribe, serial, name, info) {
    // 1. 提取所有输入框的值
    const E_VUL = Object.keys(GLOB_CONF.addir)
        .map(lie => {
            const currentVal = $(`#B_${lie}`).val() || '';
            return `${lie}="${currentVal.replace(/"/g, '\\"')}"`;
        })
        .join(',');

    // 2. 区分新增或更新
    let postData;
    if (info === 'y') {
        postData = {
            'mode': 'edit_db',
            'tablename': 'IRDATA',
            'title': MID,
            'keywords': E_VUL
        };
    } else {
        const NEWLIST = get_db_menu('IRDATA', 'B');
        postData = {
            'mode': 'add_list_db',
            'tablename': 'IRDATA',
            'keywords': JSON.stringify(NEWLIST)
        };
    }

    // 3. 发送请求并刷新
    const bak = get_ajax('/API', postData);
    if (bak && bak.info === 'y') {
        info_cmd('info', '保存成功！', 'ir_info');
        // 成功后自动回跳到正常模式
        setTimeout(() => {
            ir(id, mode, title, Publish, Subscribe, serial);
        }, 800);
    } else {
        info_cmd('danger', '保存失败，请检查网络', 'ir_info');
    }
}
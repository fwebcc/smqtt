function about_get() {
    // 1. 初始数据获取：包含版本、OS详情、以及初始的 uptime
    const free_info = get_ajax('/API', { "mode": "get_cmd_sh", "keywords": "u_name" });
    if (!free_info) return;

    const btnStyle = `border-radius:12px; padding: 10px 20px; font-weight: 700; background: #1890ff !important; border:none; box-shadow: 0 4px 10px rgba(24,144,255,0.3); color: #ffffff !important; display: flex; align-items: center; gap: 8px;`;

    const aboutListHtml = Object.keys(GLOB_CONF.about || {}).map(key => 
        `<button class="btn btn-primary" style="${btnStyle}">
            <span style="color: #ffffff !important;">${key} ${GLOB_CONF.about[key]}</span>
        </button>`
    ).join('');

    const renderGauge = (id, label, color) => `
        <div style="text-align: center; flex: 1;">
            <div style="position: relative; width: 100px; height: 100px; margin: 0 auto;">
                <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f0f2f5" stroke-width="3" />
                    <path id="${id}_path" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="0, 100" stroke-linecap="round" style="transition: stroke-dasharray 0.6s ease;" />
                </svg>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                    <b id="${id}_text" style="font-size: 16px; color: #262626;">0%</b>
                </div>
            </div>
            <div style="margin-top: 10px; font-size: 13px; font-weight: 700; color: #595959;">${label}</div>
            <small id="${id}_sub" style="color: #8c8c8c; font-size: 11px;"></small>
        </div>
    `;

    // 处理初始 uptime 和 load 文本
    const uptimeStr = free_info.uptime || "";
    const initialUptime = uptimeStr.split('up')[1]?.split(',')[0]?.trim() || "Running";
    const loadMatch = uptimeStr.match(/load average:\s+([\d.]+),\s+([\d.]+),\s+([\d.]+)/);
    const initialLoadHtml = loadMatch ? [1, 2, 3].map(i => 
        `<span style="background:#fff; border:1px solid #eee; padding:2px 6px; border-radius:6px; font-family:monospace; font-weight:700;">${loadMatch[i]}</span>`
    ).join('') : "";

    const about_page = `
        <div style="width: 100%; box-sizing: border-box;">
            <div class="modern-card" style="background: #fff; border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                    <div style="display: flex; align-items: center;">
                        <div style="background: #1890ff; width: 50px; height: 50px; border-radius: 15px; display: flex; align-items: center; justify-content: center; margin-right: 20px; box-shadow: 0 6px 16px rgba(24,144,255,0.3);">
                            <i class="fa fa-dashboard" style="color:#fff; font-size:24px;"></i>
                        </div>
                        <div>
                            <h4 style="font-weight: 800; color: #262626; margin:0; font-size: 22px;">系统状态</h4>
                            <div style="color: #8c8c8c; font-size: 14px; font-weight: 600; margin-top: 4px;">Build Version: ${free_info.version}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
                        ${aboutListHtml}
                        <button onclick="cat_log('mqtt','#about_logo')" class="btn btn-primary" style="${btnStyle}" data-toggle="modal" data-target="#myModal">
                            <i class="fa fa-file-text-o" style='font-size:24px;'></i> 查看日志
                        </button>
                    </div>
                </div>
            </div>

            <div style="display: flex; flex-wrap: wrap; margin: 0 -10px;">
                <div style="flex: 1; min-width: 320px; padding: 10px;">
                    <div class="modern-card" style="background: #fff; border-radius: 20px; padding: 25px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; height: 100%;">
                        <div style="font-size: 17px; font-weight: 800; color: #262626; margin-bottom: 25px;">
                            <i class="fa fa-area-chart text-primary" style="margin-right: 15px;"></i> 实时负载监控
                        </div>
                        <div style="display: flex; justify-content: space-around; align-items: flex-start; gap: 10px; margin-bottom: 20px;">
                            ${renderGauge('cpu', 'CPU使用', '#52c41a')}
                            ${renderGauge('mem', '物理内存', '#1890ff')}
                            ${renderGauge('swap', 'Swap分区', '#faad14')}
                        </div>
                        <div style="background: #fafafa; border-radius: 16px; padding: 15px; border: 1px solid #f0f0f0; display: flex; flex-direction: column; gap: 12px;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span style="color: #595959; font-weight: 600; font-size: 13px;"><i class="fa fa-clock-o"></i> 已运行时间</span>
                                <span id="uptime_text" class="text-success" style="font-weight: 800;">${initialUptime}</span>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span style="color: #595959; font-weight: 600; font-size: 13px;"><i class="fa fa-tasks"></i> 平均负载</span>
                                <div id="load_container" style="display: flex; gap: 6px;">${initialLoadHtml}</div>
                            </div>
                        </div>
                        <div id="about_logo" style="width:100%; max-height: 200px; overflow:auto; border-radius:12px; background:#f9f9f9; margin-top:20px;"></div>
                    </div>
                </div>
                <div style="flex: 1; min-width: 320px; padding: 10px;">
                    <div class="modern-card" style="background: #fff; border-radius: 20px; padding: 25px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; height: 100%;">
                        <div style="font-size: 17px; font-weight: 800; color: #262626; margin-bottom: 20px;">OS 环境详情</div>
                        <div style="background: #fafafa; border-radius: 10px; padding: 15px; font-family: monospace; font-size: 12px; white-space: pre-wrap; word-break: break-all; overflow-wrap: break-word; overflow: hidden;">${free_info.date}\n${free_info.entware}</div>
                    </div>
                </div>
            </div>
        </div>`;

    $("#page_list").html(about_page);

    // 确定架构并启动定时刷新（仅刷新负载）
    const isX86 = free_info.date.indexOf('x86') > -1;
    if (window.sysTimer) clearInterval(window.sysTimer);
    update_system_stats(isX86); 
    window.sysTimer = setInterval(() => update_system_stats(isX86), 5000);
}

function update_system_stats(isX86) {
    if ($("#cpu_path").length === 0) {
        clearInterval(window.sysTimer);
        return;
    }

    const stats = get_ajax('/API', { "mode": "get_cmd_sh", "keywords": "cpu_usage" });
    if (!stats) return;

    const factor = isX86 ? 1 : 1024;
    const setCircle = (id, pct, color = null) => {
        $(`#${id}_path`).attr("stroke-dasharray", `${pct}, 100`);
        $(`#${id}_text`).text(`${pct}%`);
        if (color) $(`#${id}_path`).attr("stroke", color);
    };

    // 刷新仪表盘
    const cpu_val = parseFloat(stats.cpu_usage) || 0;
    setCircle('cpu', cpu_val, cpu_val > 80 ? '#ff4d4f' : (cpu_val > 50 ? '#faad14' : '#52c41a'));

    const memTotal = stats.free.total * factor;
    const memPct = !memTotal ? 0 : Math.round((parseFloat(stats.free.used) / stats.free.total) * 100);
    setCircle('mem', memPct);
    $(`#mem_sub`).text(bytesToSize(memTotal));

    const swpTotal = stats.Swap.Swap_total * factor;
    const swpPct = !swpTotal ? 0 : Math.round((parseFloat(stats.Swap.Swap_used) / stats.Swap.Swap_total) * 100);
    setCircle('swap', swpPct);
    $(`#swap_sub`).text(bytesToSize(swpTotal));

    // 如果 cpu_usage 接口也能带上 uptime，则可以在这里实时更新
    // 如果不能，它将保持 about_get 初始化的那个静态值
    if (stats.uptime) {
        const uptimeStr = stats.uptime;
        $("#uptime_text").text(uptimeStr.split('up')[1]?.split(',')[0]?.trim() || "Running");
        const loadMatch = uptimeStr.match(/load average:\s+([\d.]+),\s+([\d.]+),\s+([\d.]+)/);
        if (loadMatch) {
            $("#load_container").html([1, 2, 3].map(i => 
                `<span style="background:#fff; border:1px solid #eee; padding:2px 6px; border-radius:6px; font-family:monospace; font-weight:700;">${loadMatch[i]}</span>`
            ).join(''));
        }
    }
}
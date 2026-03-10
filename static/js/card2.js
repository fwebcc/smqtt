/**
 * 优化后的主调度函数
 */
function card2(id, mode, title, Publish, Subscribe, value, serial, unit, name) {
    // 1. 统一获取基础配置
    var GET_LIST = get_ajax('/API', { "mode": "table_to_one", "tablename": "list", "title": "ID", "keywords": id });
    if (!GET_LIST || !GET_LIST.data) return;
    
    var config = GET_LIST.data;
    card_hj_by_optimized(config, title, Publish, Subscribe, name,config.stat)
}

/**
 * 通用配置项
 */
const COMMON_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
    "Referer": "https://quote.cngold.org/",
    "Accept": "*/*"
};

/**
 * 1. 黄金/白银卡片优化
 */
function card_hj_by_optimized(config, title, Publish, Subscribe, name,stat) {
    if (config.stat=='y'){
        var params = {"isCalc": "true"};
    }else{
        var params = {};
    }
    // 历史数据
    var histData = get_ajax('/API', { "mode": "get_url", "keywords": Publish, "d1": JSON.stringify(COMMON_HEADERS), "d2": JSON.stringify(params) });
//console.log(histData)
    var GOLD = [];
    try { 
        eval(histData.data); 
        if (typeof KLC_KL !== 'undefined' && KLC_KL.data?.[0]) {
            GOLD = KLC_KL.data[0].map(x => [parseFloat(x.date), parseFloat(x.open)]);
        }
    } catch (e) { console.error("历史解析失败"); }

    // 实时数据
    var realData = get_ajax('/API', { "mode": "get_url", "keywords": Subscribe, "d1": JSON.stringify(COMMON_HEADERS), "d2": JSON.stringify(params) });
    try { eval(realData.data); } catch (e) { console.error("实时解析失败"); }
//console.log(realData)
    var hq = (typeof hq_str !== 'undefined') ? hq_str.split(',') : [];
    var cur = parseFloat(hq[3]), open = parseFloat(hq[2]);
    var isUp = cur >= open;
    var rate = open ? ((cur - open) / open * 100).toFixed(2) : "--";
    var badgeClass = isUp ? "danger" : "success";

    var PAGE = `
    <div class="card border-0 shadow-lg" style="border-radius: 20px; overflow: hidden;">
        <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-4 p-3" style="background: #f8f9fa; border-radius: 15px;">
                <div>
                    <small class="text-uppercase text-muted font-weight-bold" style="font-size: 10px; letter-spacing: 1px;"><i class="fa fa-line-chart"></i> ${hq[0] || '实时行情'}</small>
                    <div class="h2 mb-0 font-weight-bold text-${badgeClass}" style="margin-top: -5px;">￥${isNaN(cur) ? '--' : cur.toFixed(2)}</div>
                </div>
                <div class="text-right d-flex flex-column align-items-end">
                    <span class="badge bg-${badgeClass} text-white px-3 py-2 mb-1" style="border-radius: 8px; font-size: 14px; min-width: 80px;">${isUp ? '+' : ''}${rate}%</span>
                    <small class="text-muted" style="font-size: 11px; font-family: monospace;"><i class="fa fa-clock-o"></i> ${hq[30] || ''} ${hq[31] || ''}</small>
                </div>
            </div>
            <div id="hjjg_p" style="height:350px; width:100%;"></div>
            <div id="BAKLIST"></div>
            <div class="text-center mt-3 pt-3 border-top"><p class="mb-0 text-muted small" style="opacity: 0.6;">数据来源：金投网 | 仅供参考</p></div>
        </div>
    </div>`;
    
    $('#mpage').html(PAGE);
    if (typeof bozhexian === "function") setTimeout(() => bozhexian("hjjg_p", title, '￥', GOLD), 100);
    //render_gold_bak_list();
}

/**
 * 2. 汇率卡片优化
 */
function card_huilurm_by_optimized(config, title, Publish, Subscribe) {
    var subRes = get_ajax('/API', { "mode": "get_url", "keywords": Subscribe, "d1": JSON.stringify(COMMON_HEADERS), "d2": ""});
    try { eval(subRes.data); } catch (e) {}
    
    var pubRes = get_ajax('/API', { "mode": "get_url", "keywords": Publish, "d1": JSON.stringify(COMMON_HEADERS), "d2": "" });
    var histData = [];
    try { 
        eval(pubRes.data); 
        if (typeof KLC_KL !== 'undefined' && KLC_KL.data?.[0]) {
            histData = KLC_KL.data[0].map(x => [parseFloat(x.date), parseFloat(x.open)]);
        }
    } catch (e) {}

    var hq = (typeof hq_str !== 'undefined') ? hq_str.split(',') : [];
    if (hq.length < 4) return;

    var jthl = parseFloat(hq[3]), rate = hq[35];
    var badgeClass = rate >= 0 ? "danger" : "success";

    var PAGE = `
    <div class="card border-0 shadow-lg" style="border-radius: 20px; overflow: hidden;">
        <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-4 p-3" style="background: #f8f9fa; border-radius: 15px;">
                <div>
                    <small class="text-uppercase text-muted font-weight-bold" style="font-size: 10px; letter-spacing: 1px;"><i class="fa fa-exchange"></i> ${title || '参考汇率'}[1美元兑换人民币]</small>
                    <div class="h2 mb-0 font-weight-bold text-${badgeClass}" style="margin-top: -5px;"><span style="font-size: 18px; margin-right: 4px;">￥</span>${jthl.toFixed(4)}</div>
                </div>
                <div class="text-right d-flex flex-column align-items-end">
                    <span class="badge bg-${badgeClass} text-white px-3 py-2 mb-1" style="border-radius: 8px; font-size: 14px; min-width: 80px;">${rate >= 0 ? '+' : ''}${rate}%</span>
                    <small class="text-muted" style="font-size: 11px;"><i class="fa fa-clock-o"></i>${hq[40]} ${hq[41]}</small>
                </div>
            </div>
            <div class="position-relative">
                <div class="d-flex align-items-center mb-2" style="font-size: 13px; color: #6610f2; font-weight: 700;"><i class="fa fa-area-chart mr-2"></i> 汇率走势分析</div>
                <div id="hl_p" style="height:350px; width:100%;"></div>
            </div>
            <div class="text-center mt-3 pt-3 border-top" style="opacity: 0.5;"><small class="text-muted">数据来源：金投网 | 仅供参考</small></div>
        </div>
    </div>`;
    
    $('#mpage').html(PAGE);
    if (typeof bozhexian === "function") setTimeout(() => bozhexian("hl_p", title, '￥', histData), 150);
}

/**
 * 3. 金属卡片优化
 */
function card_tong_by_optimized(config, title, Publish, Subscribe) {
    var headers = { ...COMMON_HEADERS, "Referer": "https://jiage.cngold.org/metall/copper.html" };
    
    // 获取辅助行情
    var subData = get_ajax('/API', { "mode": "get_url", "keywords": Subscribe, "d1": JSON.stringify(headers), "d2": JSON.stringify({ "code": "", "pageSize": "100" }) });
    var otherHtml = '';
    try {
        JSON.parse(subData.data).data.forEach(x => {
            otherHtml += `<div class="col-6 col-md-4 mb-2"><div class="p-2 text-center" style="background: rgba(24, 144, 255, 0.05); border-radius: 12px; border: 1px solid rgba(24, 144, 255, 0.1);"><small class="text-muted d-block" style="font-size:11px;">${x.name}</small><strong class="text-dark" style="font-size:15px;">￥${x.price}</strong><small class="text-muted" style="font-size:10px;">/${x.unit}</small></div></div>`;
        });
    } catch (e) {}

    // 历史走势
    var pubData = get_ajax('/API', { "mode": "get_url", "keywords": Publish, "d1": JSON.stringify(headers), "d2": JSON.stringify({ "code": "", "pageSize": "100" }) });
    var histPoints = [];
    try {
        JSON.parse(pubData.data).data.forEach(x => histPoints.push([parseFloat(x.createdAt), parseFloat(x.price)]));
    } catch (e) {}

    var PAGE = `
    <div class="card border-0 shadow-lg" style="border-radius: 20px; overflow: hidden;">
        <div class="card-body p-4">
            <div class="mb-4">
                <div class="d-flex align-items-center mb-3"><div style="width:4px; height:16px; background:#1890ff; border-radius:2px; margin-right:8px;"></div><h6 class="mb-0 font-weight-bold text-dark">相关金属实时行情</h6></div>
                <div class="row no-gutters mx-n1">${otherHtml}</div>
            </div>
            <hr style="border-top: 1px dashed #eee; margin: 25px 0;">
            <div class="mt-2">
                <div class="d-flex align-items-center mb-3"><div style="width:4px; height:16px; background:#faad14; border-radius:2px; margin-right:8px;"></div><h6 class="mb-0 font-weight-bold text-dark">${title || '金属'} 价格趋势分析</h6></div>
                <div id="ht_p" style="height:320px; width:100%;"></div>
            </div>
            <div class="text-center mt-3 pt-3 border-top" style="opacity: 0.5;"><small class="text-muted"><i class="fa fa-info-circle"></i> 数据来源：金投网 | 仅供参考</small></div>
        </div>
    </div>`;
    
    $('#mpage').html(PAGE);
    if (typeof bozhexian === "function") setTimeout(() => bozhexian("ht_p", title, '￥', histPoints), 100);
}

/**
 * 辅助：渲染银行/回收/品牌列表
 */
function render_tong_bak_list() {
    url='https://api.quheqihuo.com/api/v2/futures/dz/ajax/js_data_history.html?id=741&size=360'
    var headers = { ...COMMON_HEADERS, "Referer": "https://jiage.cngold.org/metall/copper.html" };
    
    // 获取辅助行情
    var subData = get_ajax('/API', { "mode": "get_url", "keywords": url, "d1": JSON.stringify(headers), "d2": JSON.stringify({ "code": "", "pageSize": "100" }) });
    var otherHtml = '';
    try {
        JSON.parse(subData.data).data.forEach(x => {
            otherHtml += `<div class="col-6 col-md-4 mb-2"><div class="p-2 text-center" style="background: rgba(24, 144, 255, 0.05); border-radius: 12px; border: 1px solid rgba(24, 144, 255, 0.1);"><small class="text-muted d-block" style="font-size:11px;">${x.name}</small><strong class="text-dark" style="font-size:15px;">￥${x.price}</strong><small class="text-muted" style="font-size:10px;">/${x.unit}</small></div></div>`;
        });
    } catch (e) {}
    $('#BAKLIST').html(otherHtml);

}
function render_gold_bak_list() {
    $.getJSON('https://v2.xxapi.cn/api/goldprice', function(res) {
        if (!res || !res.data) return;
        const d = res.data;
        
        const buildList = (data, template) => (data || []).map(template).join('');

        const t1 = buildList(d.bank_gold_bar_price, x => `<li class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-1" style="background:transparent;"><span class="text-muted font-weight-normal">${x.bank}</span><b class="text-primary">${x.price}</b></li>`);
        const t2 = buildList(d.gold_recycle_price, x => `<li class="list-group-item border-0 px-0 py-1" style="background:transparent; font-size:12px;"><div class="d-flex justify-content-between"><span class="text-muted">${x.gold_type}</span><span class="text-warning font-weight-bold">${x.recycle_price}</span></div></li>`);
        const t3 = buildList(d.precious_metal_price, x => `<li class="list-group-item border-0 px-0 py-1 d-flex justify-content-between align-items-center" style="background:transparent; font-size:11px;"><span class="font-weight-bold text-dark">${x.brand}</span><span class="text-success font-weight-bold">金:${x.gold_price} <span class="text-muted mx-1">|</span> 铂:${x.platinum_price}</span></li>`);

        const html = `
        <div class="row mt-4 no-gutters">
            ${createColumn('银行金条', 'primary', 'bank', t1)}
            ${createColumn('黄金回收', 'warning', 'recycle', t2)}
            ${createColumn('珠宝品牌', 'success', 'diamond', t3)}
        </div>`;
        $('#BAKLIST').html(html);
    });
}

function createColumn(title, color, icon, content) {
    return `<div class="col-md-4 px-2 mb-3"><div class="p-3 h-100" style="background:rgba(var(--${color}-rgb), 0.05); border-radius:12px;"><h6 class="small font-weight-bold text-${color} text-center mb-2"><i class="fa fa-${icon}"></i> ${title}</h6><ul class="list-group list-group-flush">${content}</ul></div></div>`;
}
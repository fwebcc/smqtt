// 全局变量保持不变
LURL = '';
oilpet = '';

/**
 * 1. 数据解析逻辑 (保持原始逻辑，仅优化 UI 字符串)
 */
function gjyj_cmd() {
    if (!oilpet || !oilpet.data) return;

    try {
        const oilpet0 = oilpet.data.split("data:");
        if (oilpet0.length < 5) throw new Error("Data format error");

        const NYMEX_RAW = oilpet0[4].split("tooltip:")[0].trimEnd().slice(0, -1);
        const spline = oilpet0[3].split("step: false,")[0].trimEnd().slice(0, -1);
        
        const SCRQ = oilpet0[0].split('\u4e0a\u6b21\u8c03\u4ef7\uff1a')[1]?.split('</h5>')[0] || "未知";
        const XCRQ = oilpet0[0].split('\u4e0b\u6b21\u8c03\u4ef7\uff1a')[1]?.split('</h5>')[0] || "未知";
        // 关键点：保持 YJLT 的原始 HTML 注入方式
        const YJLT = oilpet0[0].split('95#')[1]?.split('</table>')[0] || "";

        // --- 本地油价区域：适配移动端的高密度布局 ---
        const BDYJPE = `
            <div style="margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; font-size:12px; color:#888; margin-bottom:10px; padding:0 4px;">
                    <span><i class="fa fa-clock-o"></i> 上次: ${SCRQ}</span>
                    <span><i class="fa fa-calendar"></i> 下次: ${XCRQ}</span>
                </div>
                <div style="background:#fff; border-radius:12px; border:1px solid #f0f0f0; overflow:hidden;">
                    <table class="table table-sm" style="margin:0; width:100%; text-align:center;">
                        <thead style="background:#f8f9fa; font-size:12px; color:#666;">
                            <tr>
                                <th style="border:none; padding:8px 0;">型号</th>
                                <th style="border:none; padding:8px 0;">最高价</th>
                                <th style="border:none; padding:8px 0;">优惠价</th>
                            </tr>
                        </thead>
                        <tbody style="font-size:14px; font-weight:600;">
                            <tr style="border-bottom: 1px solid #f9f9f9;">
                                <td style="color:#2a5298; padding:10px 0;">95#</td>
                                ${YJLT} 
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>`;
        
        $('#BDYJ').html(BDYJPE);

        if (typeof petroleum_T === 'function') {
            petroleum_T(NYMEX_RAW, spline, 'LSYJ');
        }

        const NYMEX_ARR = JSON.parse(NYMEX_RAW);
        const dataLen = NYMEX_ARR.length;
        const latest = NYMEX_ARR[dataLen - 1];
        const T1 = latest[0];
        const N1 = latest[1];
        const valueToFind = tostamp(SCRQ);
        let foundPrice = null;
        let foundTime = null;

        for (let i = dataLen - 1; i >= 0; i--) {
            if (NYMEX_ARR[i][0] === valueToFind) {
                foundPrice = NYMEX_ARR[i][1];
                foundTime = NYMEX_ARR[i][0];
                break;
            }
        }

        if (foundPrice !== null) {
            GJYJGET2(T1, N1, foundPrice, foundTime);
        } else if (dataLen >= 2) {
            const prev = NYMEX_ARR[dataLen - 2];
            GJYJGET2(T1, N1, prev[1], prev[0]);
        }
    } catch (e) {
        console.error("解析失败:", e);
    }
}

/**
 * 2. 国际油价 UI (修复变形：改用弹性盒子，防止文字堆叠)
 */
function GJYJGET2(T1, N1, N2, T2) {
    const diff = parseFloat(N1 - N2);
    const NBFB = ((diff / N2) * 100).toFixed(2);
    const isUp = N1 > N2;
    const trendColor = isUp ? '#ff4d4f' : '#52c41a';

    const nymexHtml = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="text-align:left;">
                <div style="font-size:11px; color:#999;">${timestampToTime(T2/1000)}</div>
                <div style="font-size:16px; font-weight:700; color:#666;">$${N2}</div>
            </div>
            <div style="text-align:center; color:${trendColor};">
                <div style="font-size:18px;"><i class="fa ${isUp ? 'fa-caret-up' : 'fa-caret-down'}"></i></div>
                <div style="font-weight:bold; font-size:14px;">${isUp ? '+' : ''}${NBFB}%</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:11px; color:#999;">${timestampToTime(T1/1000)}</div>
                <div style="font-size:20px; font-weight:900; color:#1e3c72;">$${N1}</div>
            </div>
        </div>
        <div style="width:100%; height:3px; background:#eee; margin-top:8px; border-radius:2px; overflow:hidden;">
            <div style="width:100%; height:100%; background:${trendColor}; opacity:0.3;"></div>
        </div>`;
    
    $('#GJYJ').html(nymexHtml);
}

/**
 * 3. 主入口函数 (修复结构：采用纵向单列卡片，确保手机端不挤压)
 */
function card(id, mode, title, Publish, Subscribe, value, serial, unit, name) {
    LURL = 'https://www.xiaoxiongyouhao.com/fprice/cityprice.php?city=' + encodeURIComponent(Publish);
    oilpet = get_ajax('/API', { "mode": "get_url", "keywords": LURL });
    
    if (oilpet && oilpet.info == 'y') {
        const pto1 = `
        <div style="width: 100%; box-sizing: border-box; ">
            <div style="background:linear-gradient(135deg,#1e3c72 0%,#2a5298 100%); padding:20px 15px; border-radius:15px 15px 0 0; color:white;">
                <div style="display:flex; align-items:center;">
                    <i class="fa fa-map-marker" style="font-size:20px; margin-right:10px;"></i>
                    <h5 style="margin:0; font-size:18px; font-weight:bold;">${Publish}油价详情</h5>
                </div>
                <div style="font-size:12px; opacity:0.7; margin-top:5px; margin-left:25px;">实时同步最新油价变动</div>
            </div>

            <div style="background:#fff; padding:15px; border-radius:0 0 15px 15px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                <div style="background:#f8faff; border-radius:12px; padding:15px; border:1px solid #edf2f9; margin-bottom:15px;">
                    <div style="font-size:13px; font-weight:bold; color:#1e3c72; margin-bottom:12px; border-left:3px solid #1e3c72; padding-left:8px;">
                        国际原油 (USD)
                    </div>
                    <div id="GJYJ"></div>
                </div>

                <div style="background:#f8faff; border-radius:12px; padding:15px; border:1px solid #edf2f9; margin-bottom:15px;">
                    <div style="font-size:13px; font-weight:bold; color:#1e3c72; margin-bottom:12px; border-left:3px solid #1e3c72; padding-left:8px;">
                        本地价格 (CNY)
                    </div>
                    <div id="BDYJ"></div>
                </div>

                <div style="margin-top:10px;">
                    <div style="font-size:13px; font-weight:bold; color:#333; margin-bottom:10px;">
                        <i class="fa fa-line-chart" style="color:#2a5298;"></i> 历史价格趋势
                    </div>
                    <div id="LSYJ" style="width:100%; min-height:300px;"></div>
                </div>

                <div style="text-align:center; border-top:1px solid #eee; margin-top:15px; padding-top:10px;">
                    <a href="${LURL}" target="_blank" style="font-size:11px; color:#bbb; text-decoration:none;">
                        数据来源：小熊油耗
                    </a>
                </div>
            </div>
        </div>`;

        $('#mpage').html(pto1);
gjyj_cmd()
        //setTimeout(gjyj_cmd, 100);
    }
}
async function warther(id, mode, title, Publish, Subscribe, value, serial, unit, name) {
    $('#mpage').html(LOADING); // 确保 LOADING 变量已定义
    //const cssId = 'warther-style';
    //if (!$(`#${cssId}`).length) {
        //$('<link>', { id: cssId, rel: 'stylesheet', href: '../static/css/warther.css' }).appendTo('head');
    //}

    try {
        // 1. 获取城市 ID 映射表
        const D_warther_id = await $.getJSON('../static/txt/warther_id.json');
        const found = D_warther_id.find(x => x.NAMECN === Publish);
        const areaId = found ? found.AREAID : null;

        if (!areaId) {
            $('#mpage').html(`<div class="alert alert-warning">未找到城市: ${Publish}</div>`);
            return;
        }

        // 2. 核心修改：通过后端代理请求天气数据，绕过 CORS
        const targetUrl = `https://zhwnlapi.etouch.cn/Ecalender/api/v2/weather?citykey=${areaId}`;
        
        // 使用你之前代码中出现的 get_ajax 逻辑（假设它调用 /API 并返回数据）
        const response = await $.ajax({
            url: '/API',
            type: 'GET', // 或 GET，取决于你的后端配置
            data: {
                "mode": "get_url",
                "keywords": targetUrl
            }
        });

        // 解析返回的数据（取决于后端返回的是字符串还是对象）
        let weatherRes = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        let forecastData = weatherRes.forecast40;

        if (!forecastData || forecastData.length === 0) {
            $('#mpage').html('<div class="error alert">暂无预报数据</div>');
            return;
        }

        // 3. 补全日历逻辑
        const regDate = /^(\d{4})(\d{2})(\d{2})$/;
        const firstDateStr = forecastData[0].date.replace(regDate, "$1-$2-$3");
        const paddingCount = new Date(firstDateStr).getDay();

        let calendarCells = [];
        // 前置空白格
        for (let i = 0; i < paddingCount; i++) { 
            calendarCells.push('<div class="w_day_cell empty"></div>'); 
        }

        // 4. 生成天气格子${day.day.type}
        const today = new Date();
        const tMonth = today.getMonth() + 1;
        const tDate = today.getDate();

        forecastData.forEach(day => {
            const month = parseInt(day.date.substring(4, 6));
            const dateShort = parseInt(day.date.substring(6));
            const isToday = (tMonth === month && tDate === dateShort);
            
            const iconUrl = getIconUrl(day.day.type);    
            
            calendarCells.push(`
                <div class="w_day_cell ${isToday ? 'is-today' : ''}">
                    <span class="cell-date">${month}-${dateShort}</span>
                    <div class="icon-box">
                        <div class="icon-wrapper">
                            <img src="${iconUrl}" onerror="this.src='../static/img/icons/${day.day.type}.png'" 
                                 class="sky-icon-img">
                            <p>${day.day.wthr}</p>
                        </div>
                    </div>       
                    <div class="cell-temp">
                        <span class="h">${day.high}°</span>
                        <span class="l">${day.low}°</span>
                    </div>
                </div>`);
        });

        const weekHeaders = ['日', '一', '二', '三', '四', '五', '六']
                            .map(d => `<div class="w_header_cell">${d}</div>`).join('');

// 在你的 finalHtml 生成逻辑前，根据第一个天气数据动态决定背景主题
const firstDayType = String(forecastData[0].day.type);
let themeClass = 'theme-clear'; // 默认晴天/万能蓝
if (["3", "4", "6", "7", "8", "9"].includes(firstDayType)) themeClass = 'theme-rain'; // 雨
if (["2", "18", "19"].includes(firstDayType)) themeClass = 'theme-cloudy'; // 阴/雾/霾

const finalHtml = `
    <style>
        /* 1. 背景容器：保持浅蓝色，但优化对比度 */
        .weather-container {
            border-radius: 25px;
            transition: all 0.5s ease;
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;

            padding: 20px 15px;
            background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); /* 极其清爽的浅蓝 */
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            color: #1e3c72; /* 基础文字改为深蓝，保证清晰 */
        }
        
        .theme-rain { background: linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%); }
        .theme-cloudy { background: linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%); }

        /* 2. 标题区：加大加粗 */
        .weather-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding: 0 10px;
        }
        .header-left h3 { 
            margin: 0; 
            font-weight: 900; 
            font-size: 26px; /* 加大 */
            color: #1e3c72; 
            letter-spacing: 1px;
        }
        .header-left span { 
            font-size: 14px; /* 加大 */
            font-weight: 700;
            color: #2a5298;
            opacity: 0.9;
        }
        
        .header-right .today-temp { 
            font-size: 38px; /* 加大 */
            font-weight: 800; 
            color: #1e3c72;
            line-height: 1; 
        }
        .header-right .today-label { 
            font-size: 12px; 
            font-weight: 900;
            color: #2a5298;
        }

        /* 3. 日历卡片：降低透明度，让底色更白，衬托深色文字 */
        .modern-weather-card {
            background: rgba(255, 255, 255, 0.4); 
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            border-radius: 20px;
            padding: 12px;
        }

        /* 4. 网格与格子 */
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 8px; /* 间距拉开一点，防止挤在一起 */
        }
        .w_header_cell {
            text-align: center;
            color: #1e3c72;
            font-size: 13px; /* 加大 */
            font-weight: 900; /* 加粗 */
            padding-bottom: 10px;
        }
        .w_day_cell {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            padding: 10px 2px;
            text-align: center;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 1px solid rgba(255, 255, 255, 0.5);
            cursor: pointer;
        }
        
        .w_day_cell:hover {
            transform: translateY(-8px) scale(1.2); /* 悬浮动作更明显 */
            background: #fff;
            z-index: 10;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .w_day_cell.is-today {
            background: #1e3c72; /* 今日改为深色底 */
            border: 2px solid #1e3c72;
        }
        .w_day_cell.is-today .cell-date, 
        .w_day_cell.is-today .icon-box p,
        .w_day_cell.is-today .cell-temp .h,
        .w_day_cell.is-today .cell-temp .l {
            color: #fff !important; /* 今日格子的文字反白 */
        }
        
        /* 文字细节优化 */
        .cell-date { 
            color: #1e3c72; 
            font-size: 12px; 
            font-weight: 800; /* 极粗 */
        }
        .sky-icon-img { 
            width: 32px; /* 图标加大 */
            height: 32px; 
            margin: 5px 0; 
        }
        .icon-box p { 
            font-size: 11px; 
            margin: 0; 
            color: #2a5298; 
            font-weight: 800;
        }
        .cell-temp { margin-top: 6px; }
        .cell-temp .h { 
            color: #d44000; /* 最高温用深橙色，保证清晰 */
            font-size: 13px; 
            font-weight: 900; 
        }
        .cell-temp .l { 
            color: #2a5298; 
            font-size: 11px; 
            font-weight: 700;
        }
    </style>

    <div class="weather-container ${themeClass}">
        <div class="weather-header">
            <div class="header-left">
                <h3>${Publish}</h3>
                <span>40日天气预报</span>
            </div>
            <div class="header-right">
                <div class="today-temp">${forecastData[0].high}°</div>
                <div class="today-label">TODAY</div>
            </div>
        </div>
        <div class="modern-weather-card">
            <div class="calendar-grid">
                ${weekHeaders}
                ${calendarCells.join('')}
            </div>
        </div>
    </div>`;

$('#mpage').html(finalHtml);
    } catch (error) {
        console.error("Weather Error:", error);
        $('#mpage').html('<div class="error">获取天气数据失败，请检查网络或后端代理</div>');
    }
}const getIconUrl = (type) => {
const typeStr = String(type);
    const map = {
        "0": "100", // 晴
        "1": "100", // 多云
        "2": "104", // 阴
        "3": "300", // 阵雨
        "4": "302", // 雷阵雨
        "5": "304", // 雷阵雨伴有冰雹
        "6": "305", // 小雨
        "7": "306", // 中雨
        "8": "307", // 大雨
        "9": "310", // 暴雨
        "10": "311", // 大暴雨
        "11": "312", // 特大暴雨
        "12": "313", // 冻雨
        "13": "400", // 小雪
        "14": "401", // 中雪
        "15": "402", // 大雪
        "16": "403", // 暴雪
        "17": "407", // 阵雪
        "18": "501", // 雾
        "19": "502", // 霾
        "20": "503", // 扬沙
        "21": "504", // 浮尘
        "22": "507", // 沙尘暴
        "23": "508", // 强沙尘暴
        "30": "150", // 晴 (夜)
        "31": "151", // 多云 (夜)
        "34": "101", // 阴

    };
    
    // 如果没有匹配到，默认返回“多云” (101) 保证界面不崩
    const iconCode = map[typeStr] || "101";    return `../static/img/icons/${iconCode}.svg`;
};
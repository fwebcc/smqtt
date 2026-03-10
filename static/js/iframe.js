function iframe(id, mode, title, Publish, Subscribe, value, serial, unit, name) {
    // 1. 查找图标：使用 find 提高效率，找到即停
    var modeItem = L_MODE.data.find(function(l) {
        return mode == l.mode;
    });
    var plight = modeItem ? modeItem.ioc : '';

    var ipAddr = find_ip(id);

    // 2. 构造 HTML：使用模板字符串，结构清晰且自动处理换行
    var page = `
<div class="bg-light device-detail">
            <h4 class="p-4 border-bottom">${title}</h4>
            
            <div class="media p-3">
                <div class="d-flex align-items-center justify-content-center mr-3 mt-1 bg-white rounded-circle" style="width:80px; height:80px;">
                    <i class="fa ${plight} text-primary" style="font-size:45px"></i>
                </div>
                
                <div class="media-body">
                    <p class="mb-1">
                        <strong>IP:</strong> 
                        <a href="http://${ipAddr}" target="_blank" class="text-info">${ipAddr}</a>
                    </p>
                    <p class="mb-1 text-truncate" title="${Publish}">
                        <strong>订阅主题:</strong> ${Publish}
                    </p>
                    ${serial ? `<p class="mb-1"><strong>序列号:</strong> ${serial}</p>` : ''}
                </div>
            </div>
            
            ${value ? `<div class="p-3 bg-white mx-3 mb-3 border rounded">当前数值: ${value} ${unit || ''}</div>` : ''}
        </div>
    `;     // ${serial ? `<p>序列号: ${serial}</p>` : ''}
    // 渲染页面
    $('#mpage').html(page);
}

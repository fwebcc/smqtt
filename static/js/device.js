// 创建随机数 - 优化：使用 string.charAt 简化数组操作
function randomCoding() {
    var arr = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'; // 移除了容易混淆的 I 和 O
    var idvalue = '';
    for (var i = 0; i < 6; i++) {
        idvalue += arr.charAt(Math.floor(Math.random() * arr.length));
    }
    return idvalue;
}

// 设备类型判断
var uinfo = navigator.userAgent;
models = 'Unknown_device';
b_name = 'Unknown_device';

function iPhoneModel() {
    var isIphone = /iphone/gi.test(uinfo);
    if (isIphone) {
        var dpr = window.devicePixelRatio,
            screenWidth = window.screen.width,
            screenHeight = window.screen.height,
            // 优化：合并分辨率逻辑并补充较新机型
            key = screenWidth + '*' + screenHeight + '*' + dpr,
            modelList = {
                '375*667*2': '6/7/8/SE2',
                '414*736*3': 'Plus_Series',
                '375*812*3': 'X/XS/11Pro/12mini/13mini',
                '414*896*2': '11/XR',
                '414*896*3': 'Max_Series',
                '390*844*3': '12/13/14/Pro',
                '428*926*3': '12/13/14_Plus_Max',
                '393*852*3': '14Pro/15/16',
                '430*932*3': '14/15/16_Plus_Max'
            };
        return modelList[key] || 'iPhone';
    }
    return 'n';
}

// 逻辑分支优化
if (/Android|Adr/i.test(uinfo)) {
    b_name = 'android_' + randomCoding();
} else if (/iPhone/i.test(uinfo)) {
    var modelResult = iPhoneModel();
    models = (modelResult === 'n' ? "iPhone_Unknown" : "iPhone") + '_' + randomCoding();
    b_name = models;
} else if (uinfo.indexOf('Mac') > -1) {
    b_name = 'Mac_' + randomCoding();
} else if (uinfo.indexOf('Windows') > -1) {
    b_name = 'Win_' + randomCoding();
} else if (uinfo.indexOf('X11') > -1) {
    b_name = 'Linux_' + randomCoding();
} else {
    b_name = models;
}

// 指纹识别优化
function finger() {
    var excludes = {
        audio: true,
        fontsFlash: true,
        webgl: true,
        canvas: true,
        enumerateDevices: true
    };

    // 增加判断：如果 Fingerprint2 未加载则不执行
    if (typeof Fingerprint2 !== 'undefined') {
        Fingerprint2.get({ excludes: excludes }, function (components) {
            var values = components.map(function (component) { return component.value });
            var murmur = Fingerprint2.x64hash128(values.join(''), 31);
            localStorage.setItem('browserId', murmur);
            
            // 重要：由于是异步，b_name2 的赋值应当在回调内或通过 Promise 处理
            if (typeof md5 === 'function') {
                window.b_name2 = md5(murmur);
            }
        });
    }
}

finger();
// 注意：由于 finger 是异步的，此时 localStorage 可能还没拿到值
// 建议在后续业务逻辑中使用 b_name2 时增加非空校验
b_name2 = localStorage.getItem('browserId') ? md5(localStorage.getItem('browserId')) : '';
//创建随机数
function randomCoding(){
 	var arr = ['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'];
 	var idvalue ='';
 	for(var i=0;i<6;i++){
    	idvalue+=arr[Math.floor(Math.random()*34)];
 	}
	 return idvalue;
 }
//浏览器指纹
function getCanvasFingerprint () {        
    var canvas = document.createElement('canvas');        
    var context = canvas.getContext("2d");        
    context.font = "18pt Arial";        
    context.textBaseline = "top";        
    context.fillText("FWEB.CC, 20231001.", 2, 2);       
    return canvas.toDataURL("image/jpeg");
}

//设备类型判断
var uinfo = navigator.userAgent; 
models='Unknown_device';
b_name='Unknown_device';
b_name2 = md5(getCanvasFingerprint());
function iPhoneModel() {
            var isIphone = /iphone/gi.test(navigator.userAgent);
            if (isIphone) {
                var dpr = window.devicePixelRatio,
                    screenWidth = window.screen.width,
                    screenHeight = window.screen.height,
                    modelList = {
                        '375*667*2': '6/6S/7/8/SE2',
                        '414*736*3': '6Plus/6S Plus/7Plus/8Plus',
                        '375*812*3': 'X/XS/11 Pro',
                        '414*896*2': '11/XR',
                        '414*896*3': 'XS_Max/11_Pro_Max',
                        '360*780*3': '12_Mini/13_Mini',
                        '390*844*3': '12/12_Pro/13/13_Pro',
                        '428*926*3': '12_Pro_Max/13_Pro_Max'
                    }

                return modelList[screenWidth + '*' + screenHeight + '*' + dpr] || 'iPhone';
            } else {
                return 'n';
            }
}
if (uinfo.indexOf('Android') > -1 || uinfo.indexOf('Adr') > -1) {
                    b_name='android_'+randomCoding();
} else if (uinfo.indexOf('iPhone') > -1) {

                    if (iPhoneModel() == 'n') {
                        
                        models = "iPhone_Unknown";
                    }else{
                        models = 'iPhone_'+randomCoding();
                    }        
                     b_name=models;
} else if (uinfo.indexOf('Mac') > -1) {
                     b_name='Mac_'+randomCoding(); 
} else if (uinfo.indexOf('Windows') > -1) {
                     b_name='Win_'+randomCoding();
} else if (uinfo.indexOf('X11') > -1) {
                     b_name='Linux_'+randomCoding();
}else{
                     b_name=models;           
}



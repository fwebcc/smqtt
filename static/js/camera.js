const CONFIG = {
    HLS_JS_URL: '../static/js/hls.js',
    FFMPEG_DELAY: 6000,
};

let LIVE_STAT = 's';
let LIVE_STAT_ID = '';
let hlsInstance = null;

function camera(id, mode, title, Publish) {
    const layout = `
        <div class="d-flex flex-column">
            <div class="p-2 text-white">
                <h4>${title.toUpperCase()} <span id="live_close"></span></h4>
            </div>
            <div id="d_Time_page"></div>
            <div id="live_video_dir"></div>
            <div id="live_log_dir" style="width:720px; height:0; overflow:auto; overflow-x:hidden;" class="text-white"></div>
        </div>`;
    
    $("#mpage").html(layout);

    if (Publish.startsWith("http")) {
        // 对于直接的 http 视频流，直接进入播放逻辑
        tomovie(Publish);
    } else {
        const nID = `live_${id}`;
        LIVE_STAT_ID = nID;
        LIVE_STAT = 'y';

        stat_movie('live_ffmpeg_start', Publish, nID);
        renderCountdown(CONFIG.FFMPEG_DELAY / 1000);

        const cat_log_but = `
            <a href="javascript:void(0);" onclick="cat_log('${nID}', '#live_log_dir')" class="text-white">
                <i class="fa fa-search text-info"></i>
            </a>`;
        $("#live_close").html(cat_log_but);

        // 这里的路径是相对于当前页面的相对路径
        const hlsUrl = `../${nID}.m3u8`;
        setTimeout(() => tomovie(hlsUrl), CONFIG.FFMPEG_DELAY);
    }
}

function tomovie(path) {
    const videoContainer = `
        <div class="d-flex justify-content-center bg-black" style="width: 100%; overflow: hidden;">
            <video id="video" 
                   style="width: 100%; height: auto; object-fit: contain; display: block;" 
                   controls autoplay playsinline>
            </video>
        </div>`;
    $("#live_video_dir").html(videoContainer);
    const video = document.getElementById("video");

    // 释放旧实例
    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }

    // 加载 hls.js
    $.getScript(CONFIG.HLS_JS_URL, () => {
        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            hlsInstance = new Hls({
                xhrSetup: function (xhr, url) {
                    // 只有外部 http 链接且未被代理时，才走代理接口
                    if (video.dataset.useProxy === "true" && 
                        url.startsWith('http') && 
                        !url.includes('/stream?url=')) {
                        xhr.open('GET', `/stream?url=${encodeURIComponent(url)}`, true);
                    }
                }
            });

            hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    // 如果直接播放失败（通常是 CORS 问题），尝试切换到代理模式
                    if (path.startsWith('http') && video.dataset.useProxy !== "true") {
                        console.warn("CORS 失败，切换代理...");
                        video.dataset.useProxy = "true";
                        hlsInstance.loadSource(`/stream?url=${encodeURIComponent(path)}`);
                        hlsInstance.startLoad();
                    } else if (data.fatal) {
                        hlsInstance.startLoad(); // 其他致命错误尝试重启加载
                    }
                }
            });

            hlsInstance.loadSource(path);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(e => console.log("Auto-play blocked")));

        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // iOS Safari 逻辑
            // 如果是外部 http 链接，直接走代理（iOS 对跨域 HTTP M3U8 限制极多）
            if (path.startsWith('http') && !path.includes('/stream?url=')) {
                video.src = `/stream?url=${encodeURIComponent(path)}`;
            } else {
                video.src = path;
            }
            video.addEventListener('loadedmetadata', () => video.play());
        }
    });
}

function renderCountdown(seconds) {
    let count = Math.ceil(seconds);
    const $container = $("#d_Time_page");
    const timer = setInterval(() => {
        $container.html(`<div class='alert alert-info text-center py-1'>正在初始化视频流 (${count}s)</div>`);
        if (count-- <= 0) {
            clearInterval(timer);
            $container.empty();
        }
    }, 1000);
}

// 修正后的 stat_movie
function stat_movie(stat, url = null, id = '') {
    if (url) {
        const data = { "mode": "get_cmd_sh", "keywords": `${stat} ${url} ${id}` };
        get_ajax('/API', data);
        if (url === 'y') {
            $("#mpage").html('后台视频已关闭!');
            $('#myModal').modal('hide');
        }
    }
}

function stopVideo() {
    const video = document.getElementById("video");
    if (video) {
        video.pause();
        video.src = "";
        video.load();
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    }
    $("#live_video_dir").empty();
}

$(function() {
    $('#myModal').on('hide.bs.modal', function() {
        if (LIVE_STAT === 'y') {
            LIVE_STAT = 's';
            stat_movie('live_ffmpeg_stop', 'y', LIVE_STAT_ID);
        }
        stopVideo();
    });
});
//mqtt链接
$(document).ready(function() {
    $('#subscribe').click(function(event) {
        var topic = $('#subscribe_topic').val();
        var qos = $('#subscribe_qos').val();
        var data = '{"topic": "' + topic + '", "qos": ' + qos + '}';
        T_socket.emit('subscribe', data = data);
        $('#subscribe').hide();
        $('#unsubscribe').show();
        $('#subscribe_topic').prop('readonly', true);
    });

    $('#unsubscribe').click(function(event) {
        T_socket.emit('unsubscribe_all');
        $('#subscribe').show();
        $('#unsubscribe').hide();
        $('#subscribe_topic').prop('readonly', false);
    });
});
function ws_start() {
    T_socket.on('message', function(data) {
        if (data['topic'] == 'web_connect') {
            // location.reload();
        } else {
            subscribe(data['topic'], data['payload']);

            // 获取时间 (例如 14:30:05)
            const fullTime = timestampToTime(new Date().getTime() / 1000);

            // --- 微信群聊风格：时间与主题同行 ---
            var logItem = `
            <div class="wechat-item" style="margin-bottom: 16px; display: flex; align-items: flex-start; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div style="width: 38px; height: 38px; background: #5c7c99; color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; flex-shrink: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                   <i class="fa fa-envelope-open-o"></i>
                </div>

                <div style="margin-left: 10px; max-width: 85%;">
                    <div style="display: flex; align-items: baseline; margin-bottom: 4px;">
                        <span style="font-size: 12px; color: #888; font-weight: 500; margin-right: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">
                            ${data['topic']}
                        </span>
                        <span style="font-size: 11px; color: #bbb; font-family: 'Helvetica Neue', sans-serif;">
                            ${fullTime}
                        </span>
                    </div>

                    <div style="position: relative; background: #fff; border-radius: 6px; padding: 8px 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e0e0e0;">
                        <div style="position: absolute; width: 0; height: 0; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-right: 7px solid #fff; left: -7px; top: 10px;"></div>
                        <div style="position: absolute; width: 0; height: 0; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-right: 8px solid #e0e0e0; left: -8px; top: 9px; z-index: -1;"></div>
                        
                        <div style="font-size: 14px; color: #1a1a1a; line-height: 1.5; word-break: break-all;">
                            ${data['payload']}
                        </div>
                        
                        <div style="font-size: 9px; color: #eee; position: absolute; bottom: 2px; right: 5px;">
                            Q:${data['qos']}
                        </div>
                    </div>
                </div>
            </div>`;

            // --- 渲染与容器控制 ---
            if ($("ols").find('.log-scroll-area').length === 0) {
                $("ols").html('<div class="log-scroll-area" ></div>');
            }

            const $newItem = $(logItem).hide();
            $(".log-scroll-area").prepend($newItem);
            $newItem.fadeIn(300); // 微信风格更适合淡入效果

            // 性能限制
            var items = $(".log-scroll-area").children();
            if (items.length > 150) {
                items.last().remove();
            }
        }
    });
}

ws_start();
//subscribe()
function subscribe_cs() {
        var data = {"topic": "#", "qos":0};
        T_socket.emit('subscribe', data = data);
        $('#subscribe_topic').prop('readonly', true);
    }
//手动发送命令
function mqtt_Publish() {
        var data = {"topic": $('#to_Publish').val(), "message":$('#to_cmd').val(), "qos": 0};
        T_socket.emit('publish', data = data);
    }
//页面触发命令 
function mqtt_Publish_Message(message, topic) {
        var data = {"topic": topic , "message": message , "qos": 0};
        T_socket.emit('publish', data = data);
        //console.log('发送的命令=======》',message, topic)
}
//检测MQTT值过滤
function subscribe(Topic, ms) {
    // 1. 过滤无效 Topic
    if (Topic.includes("LWT")) return;
    // 2. 防御性检查：确保数据已存在且是数组
    if (!window.L_LIST?.data || !Array.isArray(L_LIST.data)) return;

    // 3. 快速筛选：一次性找出所有匹配的条目
    // filter 会返回一个包含所有匹配对象的数组，保留了所有 ID、JSON 等信息
    const matches = L_LIST.data.map((item, index) => ({ ...item, _idx: index })) // 附加原始索引
                               .filter(x => x.Subscribe === Topic || x.JSON === Topic);

    // 4. 执行逻辑
    if (matches.length > 0) {
        matches.forEach(item => {
            // 处理消息逻辑
            if_json(item._idx, Topic, ms);

            // 5. 刷新用量逻辑 (只在 title 匹配时执行)
            if (item.title && window.L_DASH_name?.includes(item.title)) {
                cal_list();
            }
        });
    }
}
function if_json2(x,Topic, ms){
      if(ms.indexOf("{") != -1){
                        //是json
                        //处理json
                         ms=JSON.parse(ms);
                         if (!isNaN(L_LIST.data[x]['key1'])) {
                               NEW_ms=ms;
                         }else{
                               NEW_ms='ms'+L_LIST.data[x]['key1'];
                               try {
                                   NEW_ms=eval(NEW_ms);
                               } catch (error) {
                                   console.error("Error in eval:", error.message);
                                   NEW_ms='nostr';
                               };
                         }
                       //处理完json
                       if(NEW_ms.indexOf("{") != -1 && NEW_ms!='nostr'){
                          //还是json抛弃
                          console.log('填写的key1值不对，或者获取json格式不对',NEW_ms);
                       }else{
                          subcmd(x,Topic, NEW_ms);
                       }
      }else{
          //不是json直接处理
          subcmd(x,Topic, ms);
      }
}
function if_json(x, Topic, ms) {
    // 1. 初步判断是否为 JSON 字符串
    if (typeof ms === 'string' && ms.includes("{")) {
        try {
            const jsonObj = JSON.parse(ms);
            let finalValue;

            // 获取 key1 配置
            const keyConfig = L_LIST.data[x]['key1'];

            // 2. 根据 key1 提取数据
            // 如果 key1 是数字或为空，直接使用整个 json 对象（或者根据你的业务调整）
            if (!isNaN(keyConfig) || !keyConfig) {
                finalValue = jsonObj;
            } else {
                // 推荐：安全地获取 JSON 属性，替代 eval
                // 比如 key1 是 ".temp"，则获取 jsonObj.temp
                try {
                    // 处理 ".data.value" 这种格式
                    const path = keyConfig.startsWith('.') ? keyConfig.substring(1) : keyConfig;
                    finalValue = path.split('.').reduce((obj, key) => obj?.[key], jsonObj);
                    
                    // 如果 reduce 没拿到值，回退到 eval (仅在路径复杂且受信任时使用)
                    if (finalValue === undefined) {
                        finalValue = eval('jsonObj' + keyConfig);
                    }
                } catch (e) {
                    console.error("解析 JSON 路径出错:", e);
                    finalValue = 'nostr';
                }
            }

            // 3. 结果校验与分发
            // 将结果统一转字符串判断是否依然包含 JSON 特征
            const valueStr = String(finalValue);
            
            if (finalValue !== 'nostr' && valueStr.includes("{")) {
                console.warn('提取的值仍包含 JSON 结构，请检查 key1 配置:', finalValue);
            } else {
                subcmd(x, Topic, finalValue);
            }

        } catch (error) {
            console.error("JSON 解析失败:", error);
            // 解析失败则当做普通字符串处理
            subcmd(x, Topic, ms);
        }
    } else {
        // 4. 不是 JSON，直接处理
        subcmd(x, Topic, ms);
    }
}
function subcmd(x,Topic, ms) {
        Pstat_2(L_LIST.data[x]['ID'],L_LIST.data[x]['mode'],L_LIST.data[x]['title'],L_LIST.data[x]['Publish'],L_LIST.data[x]['Subscribe'],ms,x,L_LIST.data[x]['unit'],L_LIST.data[x]['ip'],L_LIST.data[x]['button_down'],L_LIST.data[x]['stat'])
        list={'button_down':L_LIST.data[x]['button_down'],'mode':L_LIST.data[x]['mode'],'title':L_LIST.data[x]['title'],'groups':L_LIST.data[x]['groups'],'stat':ms}
        if (['light','switch'].includes(L_LIST.data[x]['mode'])){
             if(["BUTTON5","BUTTON6"].includes(L_LIST.data[x]['button_down']))
                    GET_S(list)
        }  
}
//mqtt链接
var T_socket =io();// //;io.connect()
function ws_start() {
          console.log('start');
        T_socket.on('server_response', function(data) {
          subscribe(data['topic'], data['payload'])
          console.log(data);
          var text = '<li class="list-group-item">'+timestampToTime(new Date().getTime()).toString()+'<i class="fa fa-user-circle-o"></i>  <o class="text-danger">' + data['topic'] + '</o>  <i class="fa fa-envelope-open-o"></i> <o class="text-info"> ' + data['payload'] + '</o>  qos: ' + data['qos'] + '</li>';
          $("ols").append('<ul class="list-group list-group-flush">'+ text + '</ul>');
          $('#DTinfo')[0].scrollTop = $('#DTinfo')[0].scrollHeight;
        });
    };
ws_start();

//subscribe()
function subscribe_cs() {
        var data = {"topic": "#", "qos":2};
        T_socket.emit('subscribe', data = data);
        $('#subscribe_topic').prop('readonly', true);
    }
//手动发送命令
function mqtt_Publish() {console.log($('#to_Publish').val(), $('#to_cmd').val());
        var data = {"topic": $('#to_Publish').val(), "message":$('#to_cmd').val(), "qos": 0};
        T_socket.emit('publish', data = data);
    }
//页面触发命令 
function mqtt_Publish_Message(message, topic) {console.log(message, topic);
        var data = {"topic": topic , "message": message , "qos": 0};
        T_socket.emit('publish', data = data);
    }
//检测MQTT值过滤
function subscribe(Topic, ms) {
        //检测包含
        if (Topic.indexOf("LWT") != -1) {
            console.log(Topic + '_屁用没有的消息');
        } else {
            
            $.each(L_LIST.data, function(i, x) {
                if (Topic == x.Subscribe) {
                    if(isJson(ms)==true){
                         ms=JSON.parse(ms);
                         msjson='ms'+x.key1;
                         new_ms=eval(msjson);
                         Pstat_2(x.ID,x.mode,x.title,x.Publish,new_ms,i,x.unit)
                    }else{       
                         if(Object.getPrototypeOf(ms) === Object.prototype){
                             msjson='ms'+x.key1;
                             new_ms=eval(msjson);
                             Pstat_2(x.ID,x.mode,x.title,x.Publish,new_ms,i,x.unit)
                         }else{
                             Pstat_2(x.ID,x.mode,x.title,x.Publish,ms,i,x.unit)
                         }

                    }
                }    
            });
        }
}

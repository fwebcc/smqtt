#!/bin/sh

# --- 变量初始化 (保留原变量名) ---
paths="$(cd "$(dirname "$0")"; pwd)"
# 自动推导 paths2 (用于某些命令)
paths2=$(dirname "$paths")
NAME="mqtt"
NAME2="homekit"
local=''
uname='root'

# 判断设备 (保留 Merlin 判断逻辑)
MODE=$(uname -a | grep Merlin)
if [ "$MODE" != "" ]; then 
    local='/opt/bin/'
    export TMPDIR=/opt/tmp
else
    local=''
fi

# 确保 PID 目录存在
[ ! -d "$paths/pid" ] && mkdir -p "$paths/pid"

# 读取配置 (保留 jq 逻辑)
homekit=$(${local}jq .conf.homekit.v "$paths/cmdapi/SETUP.json" | ${local}sed 's/\"//g')
port=$(${local}jq .conf.port.v "$paths/cmdapi/SETUP.json" | ${local}sed 's/\"//g')
RETVAL=0

# --- 内部辅助函数 ---
# 检查进程是否运行
_is_running() {
    ${local}ps aux | ${local}grep "$1" | ${local}grep -v grep | ${local}grep -q -v 'cmd'
    return $?
}

# 杀死进程逻辑
_kill_proc() {
    local target=$1
    ${local}ps aux | ${local}grep "$target" | ${local}grep -v grep | ${local}awk '{print $2}' | while read -r pid_val; do
        kill -9 "$pid_val" 2>/dev/null
    done
}

# --- 逻辑分支 ---
case "$1" in
    on)
        if _is_running "$NAME"; then 
            echo "yes"
        else
            echo "no"
        fi
        RETVAL=$?
        ;;

    off)
        echo "True"
        RETVAL=$?
        ;;

    kill_all)
        # 兼容 paths2 写法并保存 PID
        ${local}ps aux | ${local}grep "$2" | ${local}grep -v grep | ${local}grep -v 'cmdarm.sh' | ${local}awk '{print $2}' > "$paths/pid/$2.pid"
        if [ -s "$paths/pid/$2.pid" ]; then
            _kill_proc "$2"
            echo '{"info":"y","pid":"y"}'            
        else
            echo '{"info":"n","pid":"n"}'
        fi
        RETVAL=$?
        ;;

    start)    
        if _is_running "$NAME"; then 
            echo "$NAME IS RUN"
        else
            echo "$NAME STARTING"
            # 清理缓存与临时文件
            [ -d "/opt/tmp" ] && rm -r /opt/tmp/_M* 2>/dev/null
            [ -f "$paths/pid/$NAME.log" ] && rm "$paths/pid/$NAME.log"
            
            export PYTHONMALLOC=malloc
            sync && echo 3 > /proc/sys/vm/drop_caches
            
            cd "$paths" || exit
            #echo '' > "$paths/pid/${NAME}.log"
            nohup "$paths/$NAME" >> "$paths/pid/${NAME}.log" 2>&1 &
            #nohup "$paths/$NAME" &
            echo $! > "$paths/pid/$NAME.pid"
            echo "$NAME START RUN..."
        fi
        if _is_running "$NAME2"; then 
            echo "$NAME2 IS RUN"
        else
            echo "正在启动程序: $NAME2"
            cd "$paths" || exit
            # 确保 pid 目录存在
            mkdir -p "$paths/pid"
            nohup "$paths/$NAME2" > "$paths/pid/$NAME2.log" 2>&1 &
            echo $! > "$paths/pid/$NAME2.pid"
            echo "$NAME2 START"
        fi
        RETVAL=$?
        ;;

homekit_wan) 
    if _is_running "$NAME2"; then 
        echo "$NAME2 RUN..."
    else
        # 建议换一个更常用的 DNS 或大厂网址
        CHECK_URL="http://www.baidu.com" 

        echo "开始网络监测..."

        while true; do
            # 方法 A: 使用 curl 检测 (推荐，因为即便 ping 不通，网页通常能通)
            # --connect-timeout 3: 连接超时3秒
            # -s: 静默模式, -I: 只抓取头部
            curl --connect-timeout 3 -sI "$CHECK_URL" > /dev/null
            
            # 或者保留 ping，但增加 -I 指定网卡（如果是多网卡环境）
            # ping -c 1 -W 3 114.114.114.114 > /dev/null 2>&1
            
            if [ $? -eq 0 ]; then
                echo "[$(date +%T)] 网络已连接！"
                break
            else
                echo "[$(date +%T)] 暂无外网，5秒后重试..."
                sleep 5
            fi
        done

        echo "等待 2 秒以确保连接稳定..."
        sleep 2

        echo "正在启动程序: $NAME2"
        cd "$paths" || exit
        # 确保 pid 目录存在
        mkdir -p "$paths/pid"
        nohup "$paths/$NAME2" > "$paths/pid/$NAME2.log" 2>&1 &
        echo $! > "$paths/pid/$NAME2.pid"
        echo "$NAME2 START"
    fi

    RETVAL=$?
    ;;

    cron)
        # 清理 crontab
        ${local}sed -i '/cron/d' "/var/spool/cron/crontabs/$uname" 2>/dev/null
        ${local}sed -i '/cron/d' /var/spool/cron/crontabs/bak 2>/dev/null
        ${local}cp /var/spool/cron/crontabs/bak "/var/spool/cron/crontabs/$uname" 2>/dev/null
        killall crond 2>/dev/null
        /usr/bin/crontab -l
        /usr/sbin/crond
        echo "RESTARTING VIA CRON"
        "$0" stop
        sleep 1
        "$0" start
        sleep 1

        RETVAL=$?
        ;;

    stop)
        _kill_proc "$NAME"
        _kill_proc "$NAME2"
        RETVAL=$?
        ;;

    homekit_stop)
        # 兼容 grep/sed 逻辑
        homekit_val=$(${local}grep -Po 'homekit[" :]+\K[^"]+' "$paths/cmdapi/SETUP.json" | sed 's:\\\/:\/:g')
        if [ "$homekit_val" = "y" ]; then 
            if _is_running "$NAME2"; then 
                _kill_proc "$NAME2"
                echo "${NAME2}_stop"
            else
                echo "${NAME2}_no run"
            fi
        else
            echo "${NAME2}_config_no"
        fi    
        RETVAL=$?
        ;;

    homekit_restart)
        "$0" homekit_stop
        sleep 2
        "$0" homekit_wan
        RETVAL=$?
        ;;

    restart)
        echo "RESTART"
        "$0" stop
        sleep 2
        "$0" start
        RETVAL=$?
        ;;

# 建议修改后的 Testing 逻辑片段
Testing2)
    if _is_running "$NAME"; then
        # 1. 先记录状态
        echo "$(TZ=UTC-8 date "+%Y-%m-%d %H:%M:%S") $NAME 进程存在，开始 Web 探测..." >> "$paths/pid/cmdrun.txt"
        
        # 2. 增加重试机制或延长超时 (从 5s 改为 15s)
        response=$(${local}curl -o /dev/null --connect-timeout 15 -k -s -w "%{http_code}\n" "${host_name}")
        
        if [ "$response" -eq 200 ] || [ "$response" -eq 302 ]; then
            echo "$(TZ=UTC-8 date "+%Y-%m-%d %H:%M:%S") 正常: code:${response}" >> "$paths/pid/cmdrun.txt"
        else
            # 3. 关键：不要立即 restart！先检查是否只是瞬时压力
            sleep 5
            recheck=$(${local}curl -o /dev/null --connect-timeout 10 -k -s -w "%{http_code}\n" "${host_name}")
            if [ "$recheck" -ne 200 ]; then
                echo "$(TZ=UTC-8 date "+%Y-%m-%d %H:%M:%S") 确实没响应，正在执行重启..." >> "$paths/pid/cmdrun.txt"
                "$0" restart
            fi
        fi
    else
        "$0" start
    fi
    ;;


CLEANLOG)
        now_sec=$(${local}date +%s)
        target_sec=$((now_sec - 172800))

        target_val=$(TZ=UTC-8 ${local}date -d "@$target_sec" "+%Y-%m-%d")
        log_file="$2"

        # 3. 执行清理
        if [ -f "$log_file" ]; then
            # awk 这里的 $1 是指日志文件内部的第一列数据
            ${local}awk -v target="$target_val" '$1 >= target' "$log_file" > "${log_file}.tmp" && \
            ${local}mv "${log_file}.tmp" "$log_file"
            
            echo "{\"info\":\"y\",\"msg\":\"已清理${target_val}之前的数据\",\"file\":\"$log_file\"}"
        else
            echo "{\"info\":\"n\",\"msg\":\"文件不存在\"}"
        fi
        
        RETVAL=$?
        echo
        ;;

    homekit_test)
        # 检查日志中的 OSError (保留原逻辑)
        if [ -f "$paths/pid/${NAME2}.log" ]; then
            result=$(${local}grep 'OSError' "$paths/pid/${NAME2}.log" | ${local}grep -v grep)
            if [ "$result" != "" ]; then
                 echo "${NAME2} RESTART START"
                 "$0" homekit_restart 
                 echo "$(TZ=UTC-8 date "+%Y-%m-%d %H:%M:%S ") ${NAME2} RESTART START" >> "$paths/pid/cmdrun_erro.txt"
                 echo '____________________________' >> "$paths/pid/cmdrun_erro.txt"
            else
                 echo "${NAME2} STATR RUN"
                 echo "$(TZ=UTC-8 date "+%Y-%m-%d %H:%M:%S ") ${NAME2} STATR RUN..." >> "$paths/pid/cmdrun.txt"
                 echo '____________________________' >> "$paths/pid/cmdrun.txt"
            fi
        fi
        RETVAL=$?
        ;;

    *)
        echo "Usage: $0 {start|stop|restart|on|Testing|homekit_wanS|...}"
        RETVAL=1
        ;;
esac

exit $RETVAL
#!/bin/bash
local='/bin/'
local2='/sbin/'
# 获取脚本所在目录的绝对路径
paths="$(cd "$(${local}dirname "$0")"; pwd)"
paths2=$(${local}dirname "$paths")
NAME2='homekit'
uname='admin'
RETVAL=0

# --- 初始化：清理缓存 ---
# 注意：原脚本启动即清理，这里保留逻辑
sync && echo 1 > /proc/sys/vm/drop_caches
sync && echo 2 > /proc/sys/vm/drop_caches
sync && echo 3 > /proc/sys/vm/drop_caches

# --- 内部函数库 ---

# 检查进程是否存在 (1为运行, 0为未运行)
_is_running() {
    ${local}ps aux | ${local}grep -v 'grep' | ${local}grep -v 'cmdarm.sh' | ${local}grep -q "$1"
    return $?
}

_parseAndPrint() {
    while read -r data; do
        echo -n "$data" | ${local}sed -r 's/\\//g' | ${local}tr -d "\n"
    done
}

# --- 主逻辑 ---

case "$1" in
    on)
        if _is_running "$2"; then
            pid_content=$(${local}cat "$paths2/pid/$2.pid" 2>/dev/null)
            # 移除尾部逗号并包装为JSON
            echo "{\"info\":\"y\",\"pid\":\"${pid_content%?}\"}"
        else
            echo '{"info":"n","pid":"n"}'
        fi
        RETVAL=$?
        echo
        ;;

    clean_free|freecler)
        echo 100 > /proc/sys/vm/swappiness
        ${local}sync && echo 3 > /proc/sys/vm/drop_caches
        [ "$1" == "freecler" ] && echo "Not required" > /var/log/mem.log
        echo '{"info":"y"}'
        RETVAL=$?
        ;;

    kill_all)
        # 获取PID列表并保存
        ${local}ps aux | ${local}grep "$2" | ${local}grep -v 'grep' | ${local}grep -v 'cmdarm.sh' | ${local}awk '{print $2}' > "$paths2/pid/$2.pid"
        if [ -s "$paths2/pid/$2.pid" ]; then
            while read -r LINE; do
                ${local}kill -9 "$LINE" 2>/dev/null
            done < "$paths2/pid/$2.pid"
            echo '{"info":"y","pid":"y"}'
        else
            echo '{"info":"n","pid":"n"}'
        fi
        RETVAL=$?
        echo
        ;;

    mqtt_restart)
        ${local}cp "/var/spool/cron/crontabs/$uname" "/var/spool/cron/crontabs/bak"
        echo "* * * * * $paths2/cmd cron" >> "/var/spool/cron/crontabs/$uname"
        ${local}killall crond 2>/dev/null
        /usr/bin/crontab -l
        /usr/sbin/crond
        RETVAL=$?
        echo
        ;;

    hk_on_off)
        if _is_running 'homekit'; then
            CODE=$("$0" hk_get)
            echo "{\"info\":\"y\",\"data\":$CODE}"
        else
            echo '{"info":"n","data":"n"}'
        fi
        RETVAL=$?
        echo
        ;;

    mosq_on_off)
        if _is_running 'mosquitto'; then
            echo '{"info":"y","data":"y"}'
        else
            echo '{"info":"y","data":"n"}'
        fi
        RETVAL=$?
        echo
        ;;

    mosq_restart)
        _is_running 'mosquitto' && echo '{"info":"y","data":"y"}' || echo '{"info":"n","data":"n"}'
        /jffs/scripts/mosquitto/cmd restart
        RETVAL=$?
        echo
        ;;

    hk_get)
        stat_file="$paths/busy_home.state"
        # 使用 jq 提取配对客户端，若无 jq 则维持原逻辑
        clients=$(${local}jq -r .paired_clients "$stat_file" 2>/dev/null | ${local}sed 's/\"//g')
        stat=$("$0" on "$NAME2")
        
        if [ "${#clients}" -eq 2 ]; then
            code=$(${local}cat "$paths/homekit.json" 2>/dev/null)
            echo "{\"info\":\"y\",\"data\":$stat,\"val\":$code}"
        else
            echo "{\"info\":\"n\",\"data\":$stat,\"val\":\"n\"}"
        fi
        RETVAL=$?
        echo
        ;;

    start_hk)
        homekit_cfg=$(${local}jq -r .conf.homekit.v "$paths/SETUP.json" 2>/dev/null)
        if [ "$homekit_cfg" == "y" ]; then
            CODE=$("$0" hk_get)
            if _is_running "$NAME2"; then
                echo "{\"info\":\"y\",\"data\":\"start...\",\"CODE\":$CODE}"
            else
                cd "$paths2" || exit
                ./cmd homekit_wan
                echo "{\"info\":\"y\",\"data\":\"start\",\"CODE\":$CODE}"
            fi
        else
            echo '{"info":"n","data":"no_conf"}'
        fi
        RETVAL=$?
        echo
        ;;
    start_rest_conf)
        cp $paths/busy_home.statebak $paths/busy_home.state
        chmod 0600 $paths/busy_home.state
        echo '{"info":"y","data":"y"}'
        RETVAL=$?
        echo
        ;;

    hk_restart)
       "$0" kill_all "$NAME2"
        sleep 1
        cd "$paths2" || exit
        ./cmd homekit_wan
        
        if _is_running "$NAME2"; then
            echo '{"info":"y","data":"y"}'
        else
            echo '{"info":"n","data":"n"}'
        fi
        RETVAL=$?
        echo
        ;;

    stop_hk)
        if _is_running "$NAME2"; then
            "$0" kill_all "$NAME2"
            echo '{"info":"n","data":"killall"}'
        else
            echo '{"info":"n","data":"norun"}'
        fi
        RETVAL=$?
        echo
        ;;

    get_time)
        echo "{\"date\":\"$(${local}date "+%G-%m-%d %H:%M:%S")\"}"
        RETVAL=$?
        echo
        ;;

    systime)
        ${local2}ntpdate cn.pool.ntp.org
        #${local}ntp  cn.pool.ntp.org
        echo '{"info":"y","data":"systime"}'
        RETVAL=$?
        echo
        ;;

    u_name)
        ${local}sync && for i in 1 2 3 4; do echo $i > /proc/sys/vm/drop_caches; done
        echo 100 > /proc/sys/vm/swappiness
        toname=$(${local}uname -a)
        version=$(${local}cat $paths2/static/txt/version)
        runtime=$(${local}uptime)
        entware_release=$(${local}cat /etc/os-release| sed ':a;N;$!ba;s/\n/\r/g'| sed 's/\"//g')
        
        echo "{\"date\":\"$toname\",\"version\":\"$version\",\"entware\":\"$entware_release\",\"uptime\":\"$runtime\"}"
        RETVAL=$?
        echo
        ;;
cpu_usage)
    # 1. 获取第一次 CPU 统计原始数据
    read -r line < /proc/stat
    prev_user=$(echo "$line" | ${local}awk '{print $2}')
    prev_nice=$(echo "$line" | ${local}awk '{print $3}')
    prev_system=$(echo "$line" | ${local}awk '{print $4}')
    prev_idle=$(echo "$line" | ${local}awk '{print $5}')
    prev_iowait=$(echo "$line" | ${local}awk '{print $6}')
    prev_irq=$(echo "$line" | ${local}awk '{print $7}')
    prev_softirq=$(echo "$line" | ${local}awk '{print $8}')

    # 计算初始总时间和空闲时间
    prev_idle_sum=$((prev_idle + prev_iowait))
    prev_total=$((prev_user + prev_nice + prev_system + prev_idle_sum + prev_irq + prev_softirq))

    # 采样间隔：5000 微秒 (0.005秒) 略短，建议设为 100000 (0.1秒) 或更高以提高精度
    sleep 0.1

    # 2. 获取第二次 CPU 统计原始数据
    read -r line < /proc/stat
    curr_user=$(echo "$line" | ${local}awk '{print $2}')
    curr_nice=$(echo "$line" | ${local}awk '{print $3}')
    curr_system=$(echo "$line" | ${local}awk '{print $4}')
    curr_idle=$(echo "$line" | ${local}awk '{print $5}')
    curr_iowait=$(echo "$line" | ${local}awk '{print $6}')
    curr_irq=$(echo "$line" | ${local}awk '{print $7}')
    curr_softirq=$(echo "$line" | ${local}awk '{print $8}')

    # 计算当前的数值
    curr_idle_sum=$((curr_idle + curr_iowait))
    curr_total=$((curr_user + curr_nice + curr_system + curr_idle_sum + curr_irq + curr_softirq))

    # 3. 计算差值与百分比
    total_diff=$((curr_total - prev_total))
    idle_diff=$((curr_idle_sum - prev_idle_sum))

    # 防止分母为 0 的异常处理
    if [ "$total_diff" -gt 0 ]; then
        cpu_usage=$(( (total_diff - idle_diff) * 100 / total_diff ))
    else
        cpu_usage=0
    fi

        # 获取内存信息
        free=$(${local}free -b | ${local}grep "Mem:" | ${local}awk '{printf "\"free\":{\"total\":\"%s\",\"used\":\"%s\",\"free\":\"%s\"}", $2, $3, $4}')
        swap=$(${local}free -b | ${local}grep "Swap:" | ${local}awk '{printf "\"Swap\":{\"Swap_total\":\"%s\",\"Swap_used\":\"%s\",\"Swap_free\":\"%s\"}", $2, $3, $4}')
        [ -z "$swap" ] && swap='"Swap":{"Swap_total":0,"Swap_used":0,"Swap_free":0}'
        
        # 输出 JSON
        echo "{\"cpu_usage\":\"$cpu_usage\",$free,$swap}"
        
        RETVAL=$?
        ;;
    up_version)
        echo "$2" > "$paths2/static/txt/version"
        RETVAL=$?
        echo
        ;;

    live_ffmpeg_start)
        if _is_running "$2"; then
            echo '{"info":"y","data":"run..."}'
        else
            echo '{"info":"y","data":"y"}'
            nohup ffmpeg -timeout 600 -i "$2" -c copy -codec:a mp3 -map 0 \
                -f ssegment -segment_format mpegts \
                -segment_list "$paths2/live/$3.m3u8" \
                -segment_list_flags +live -segment_list_size 6 -segment_time 3 \
                "$paths2/live/$3_%03d.ts" > "$paths2/pid/$3.log" 2>&1 &
            echo $! > "$paths2/pid/$3.pid"
        fi
        RETVAL=$?
        echo
        ;;

    live_ffmpeg_stop)
        pid_file="$paths2/pid/$3.pid"
        if [ -f "$pid_file" ]; then
            ${local}kill -9 "$(${local}cat "$pid_file")" 2>/dev/null
            ${local}rm -rf "${paths2}/live/${3:?}"*
            echo '{"info":"y","data":"y"}'
        else
            echo '{"info":"n","data":"not_found"}'
        fi
        RETVAL=$?
        echo
        ;;

    cat_log|cat_log_mos)
        [ "$1" == "cat_log_mos" ] && logpath="/tmp/mosquitto.log" || logpath="$paths2/pid/$2.log"
        # 转义双引号以保证合法的JSON字符串 | ${local}tr -d '\n\r'
        data=$(${local}cat "$logpath" 2>/dev/null | ${local}sed 's/"/\\"/g')
        echo "{\"info\":\"y\",\"data\":\"$data\"}"
        RETVAL=$?
        echo
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

    *)
        echo "Usage: $0 {start|stop|on|off|hk_restart|u_name|cat_log|...}"
        RETVAL=1
        ;;
esac

exit $RETVAL
#!/bin/bash
local='/bin/'
paths="$(cd "$(${local}dirname "$0")"; pwd)"
paths2=$(${local}dirname "$paths")
NAME2='homekit'
RETVAL=0
echo 1 > /proc/sys/vm/drop_caches
echo 2 > /proc/sys/vm/drop_caches
echo 3 > /proc/sys/vm/drop_caches
_parseAndPrint() {
	while read data; do
		echo -n "$data" | sed -r 's/\\//g' | tr -d "\n"
	done
}

case "$1" in
        on)
                result=$(${local}ps aux|${local}grep -v 'grep'|${local}grep -v 'cmdarm.sh'|${local}grep $2)
                if [ "$result" != "" ]; then 
                     pid=$(${local}ps aux|${local}grep -v 'grep'|${local}grep -v 'cmdarm.sh'|${local}grep $2|awk '{print "{\"id\":\""$2"\"},"}')
                     echo '{"info":"y","pid":'[${pid%?}]'}'
                else
                      echo '{"info":"n","pid":"n"}'
                fi
                RETVAL=$?
                echo
                ;;
        mqtt_restart)
                bak=$($paths2/cmd restart)
                echo '{"info":"n","data":$bak}'

                RETVAL=$?
                echo
                ;;

        freecler)
                sync && echo 1 > /proc/sys/vm/drop_caches
                sync && echo 2 > /proc/sys/vm/drop_caches
                sync && echo 3 > /proc/sys/vm/drop_caches
                echo "OK" > /var/log/mem.log
                echo "Not required" > /var/log/mem.log
                echo '{"info":"y"}'
                RETVAL=$?
                ;;
        hk_get) 
                  stat_file=$paths/busy_home.state
                  result=$(${local}ps aux| ${local}grep 'homekit'| ${local}grep -v grep|${local}grep -v 'cmdarm.sh')
                  clients=$(${local}grep -Po 'paired_clients[" :]+\K[^"]+' $stat_file|  ${local}sed 's:\\\/:\/:g')
                  if [ "$clients" = "{}, " ]; then 
                         code=$(${local}cat $paths/homekit.json)
                         stat=$("$0" on $NAME2)
                         echo '{"info":"n","data":'$stat',"val":'$code'}'
                  else
                         stat=$("$0" on $NAME2)
                         echo '{"info":"y","data":'$stat'}'
                  fi

                RETVAL=$?
                echo
                ;;

         hk_restart)
               result=$(${local}ps aux|${local}grep 'homekit'|${local}grep -v grep|${local}grep -v 'cmdarm.sh')
               if [ "$result" != ""  ]; then 
                        ${local}killall $NAME2
               else
                         echo ""
               fi
               stat_file=$paths/busy_home.state
               if [ ! -f "$stat_file" ];then
                  echo '' 
               else
                  ${local}rm $stat_file
               fi

               if [ "$result" != ""  ]; then 
                       ${local}killall $NAME2
                       ${local}sleep 1
                       ${local}nohup $paths2/$NAME2 > $paths2/$NAME2.log 2>&1 & 
                       echo '{"info":"y","data":"s"}'  
               else
                        ${local}nohup $paths2/$NAME2 > $paths2/$NAME2.log 2>&1 &   
                        echo '{"info":"y","data":"t"}'
               fi
                 
                RETVAL=$?
                echo
                ;;
           stop_hk)
                    result=$(${local}ps aux|${local}grep $NAME2|${local}grep -v grep|${local}grep -v 'cmdarm.sh')
                    if [ "$result" != ""  ]; then 
                      ${local}ps aux|${local}grep  $NAME2| ${local}grep -v grep|${local}awk '{print $2}' |${local}sed -e "s/^/kill -9 /g" | sh
                        ps aux|grep  homekit| grep -v grep|awk '{print $2}' |sed -e "s/^/kill -9 /g" | sh
                         bak2=$(${local}killall $NAME2)
                        #bak2=''

                        echo '{"info":"n","data":"'$bak2'"}'
                    else
                        echo '{"info":"n","data":"norun"}'
                    fi
                
                RETVAL=$?
                echo
                ;;
           get_time)
                echo '{"date":"'$(${local}date "+%G-%m-%d %H:%M:%S")'"}'
                RETVAL=$?
                echo
                ;;
        systime)
                ${local}ntpdate cn.pool.ntp.org
                ${local}ntp  cn.pool.ntp.org
                RETVAL=$?
                echo
                ;;
           u_name)
               toname=$(${local}uname -a)
	            free=$(${local}free -b | ${local}grep "Mem:" | ${local}awk '{print "\"free\":{\"total\":\"" $2 "\"," "\"used\":\"" $3 "\"," "\"free\":\"" $4 "\"}"}')
	             Swap=$(${local}free -b | ${local}grep "Swap:" | ${local}awk '{print "\"Swap\":{\"Swap_total\":\"" $2 "\"," "\"Swap_used\":\"" $3 "\"," "\"Swap_free\":\"" $4 "\"}"}')
	             version=$(${local}cat $paths2/static/txt/version)
               if [ "$Swap" != ""  ]; then 
                        Swap=$Swap
               else
                        Swap='"Swap": {"Swap_total":0,"Swap_used":0,"Swap_free":0}'
               fi

                echo '{"date":"'$toname'",'$free','$Swap',"version":"'$version'"}'
                RETVAL=$?
                echo
                ;;
           up_version)
                #echo "<a href='http://fweb.cc/?m=Other&i=58&p=1' target='_blank'>8.0_20231001</a>"  >  $path/static/txt/version
                echo $2>  $paths2/static/txt/version
                RETVAL=$?
                echo
                ;;

       start_hk)
                homekit=$(${local}jq .conf.homekit.v $paths/SETUP.json|${local}sed 's/\"//g')
                #homekit=$(${local}grep -Po 'homekit[" :]+\K[^"]+' $paths/SETUP.json| ${local}sed 's:\\\/:\/:g')
                #grep -Po 'homekit[" :]+\K[^"]+' /opt/home/smqtt/cmdapi/SETUP.json| ${local}sed 's:\\\/:\/:g'
                if [ "$homekit" = "y" ]; then 
                         result=$(${local}ps aux|grep $NAME2|${local}grep -v grep)
                         if [ "$result" != ""  ]; then 
                             echo '{"info":"y","data":"start..."}'
                         else
                             cd $paths2
                             nohup ./$NAME2 > ./pid/$NAME2.log 2>&1 &echo $!> ./pid/$NAME2.pid
                             echo '{"info":"y","data":"start"}'
                         fi
                else
                         echo '{"info":"n","data":"no_conf"}'
                fi 
         
                RETVAL=$?
                echo
                ;;
       live_ffmpeg_start)
                result=$(${local}ps aux |${local}grep "$2"|${local}grep -v grep|${local}grep -v 'cmdarm.sh')
                if [ "$result" != "" ]; then 
                        echo '{"info":"y","data":"run..."}'
                else
                         echo '{"info":"y","data":"y"}'
                         nohup ffmpeg  -timeout 600 -i $2 -c copy -codec:a mp3 -map 0 -f ssegment -segment_format mpegts -segment_list $paths2/live/$3.m3u8 -segment_list_flags +live -segment_list_size 6 -segment_time 3 $paths2/live/$3_%03d.ts > $paths2/pid/$3.log 2>&1 &echo $!> $paths2/pid/$3.pid
                fi           
                RETVAL=$?
                echo
                ;;

       live_ffmpeg_stop)
                ${local}kill -9 $(${local}cat $paths2/pid/$3.pid)
                #${local}kill ffmpeg       
                ${local}rm -rf  $paths2/live/$3*      
                echo '{"info":"y","data":"y"}'   

                RETVAL=$?
                echo
                ;;
       cat_log)
     
                data=$(${local}cat $paths2/pid/"$2".log| /bin/sed -n '1,+38p'| ${local}sed 's/"/\*/g')
                echo '{"info":"y","data":"'${data}'"}'
                RETVAL=$?
                echo
                ;;

        *)
                echo $"Usage: $0 {start|stop|on|off}"
                RETVAL=1
esac 
exit $RETVAL

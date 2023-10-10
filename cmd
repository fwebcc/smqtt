#!/bin/sh
paths="$(cd "$(dirname "$0")"; pwd)"
NAME="mqtt.py"
NAME2="homekit"
#判断设备
MODE=$(uname -a|grep Merlin)
if [ "$MODE" != "" ]; then 
       local='/opt/bin/'
       export TMPDIR=/opt/tmp
else
       local=''
fi
#homekit=$(${local}grep -Po 'homekit[" :]+\K[^"]+' $paths/cmdapi/SETUP.json| sed 's:\\\/:\/:g')
homekit=$(${local}jq .conf.homekit.v $paths/cmdapi/SETUP.json|${local}sed 's/\"//g')

RETVAL=0

case "$1" in
        on)
                result=$(${local}ps aux  |${local}grep $NAME|${local}grep -v grep|${local}grep -v 'cmd')
                if [ "$result" != "" ]; then 
                 echo "yes"
                else
                 echo "no"
                fi
                RETVAL=$?
                echo
                ;;
        off)
                echo "True"
                RETVAL=$?
                echo
                ;;
        start)    
                
                result=$(${local}ps aux |${local}grep $NAME|${local}grep -v grep|${local}grep -v 'cmd')
                if [ "$result" != "" ]; then 
                    echo $NAME" IS RUN"
                else
                    rm -r /opt/tmp/_M*
                    rm $paths/pid/$NAME.log
	      #ETC=$(${local}grep -Po 'ETC[" :]+\K[^"]+' $paths/cmdapi/SETUP.json| sed 's:\\\/:\/:g')
	      ETC=$(${local}jq .conf.ETC.v $paths/cmdapi/SETUP.json|${local}sed 's/\"//g')
                    MODE=$(uname -a|${local}grep Merlin)
                    if [ "$MODE" != "" ]; then 
                        export TZ=$ETC

                    else
                       export TZ=Asia/Shanghai
                    fi
                       echo $ETC > /etc/timezone
                    cd $paths
                    result=$(${local}ps aux  |${local}grep $NAME|${local}grep -v grep|${local}grep -v 'cmd')
                    if [ "$result" != "" ]; then 
                           kill -9 $(cat $paths/pid/$NAME.pid)
                           echo $NAME"_stop"

                    else
                           nohup ./$NAME > ./pid/$NAME.log 2>&1 &echo $!> ./pid/$NAME.pid
                           echo $NAME" STATR RUN..."
                    fi

                    
                    #nohup ./mqtt.py > mqtt.py.log 2>&1 &

                fi
                sleep 1
		#判断设备
                MODE=$(uname -a|${local}grep Merlin)
                if [ "$MODE" != "" ]; then 
                    WAN=$(nvram get wan0_ipaddr)
                else
                    WAN=$(curl --connect-timeout 2 -s ip.sb)
                fi
                #判断外网是否链接                 
                
                if [ "$WAN" != "" ]; then 
                     if [ "$homekit" = "y" ]; then 
                         result=$(${local}ps aux|grep $NAME2|${local}grep -v grep|${local}grep -v 'cmd')
                         if [ "$result" != ""  ]; then 
                             echo $NAME2" IS RUN "
                             echo $(TZ=UTC-8 date "+%Y-%m-%d %H-%M-%S ")" IS RUN "  >>./pid/$NAME2.txt
                         else
                             cd $paths
                             nohup ./$NAME2 > ./pid/$NAME2.log 2>&1 &echo $!> ./pid/$NAME2.pid
                             echo $NAME2" STATR RUN..."
                             echo $(TZ=UTC-8 date "+%Y-%m-%d %H-%M-%S ")" STATR RUN..." >./pid/$NAME2.txt
                         fi
                     else
                         echo "CONF NO START"
                             echo $(TZ=UTC-8 date "+%Y-%m-%d %H-%M-%S ")"CONF NO START"  >./pid/$NAME2.txt

                     fi 
         
                else
                    echo $NAME2" WAN NO CONNET..."
                    echo $(TZ=UTC-8 date "+%Y-%m-%d %H-%M-%S ")" WAN NO CONNET..."  >./pid/$NAME2.txt
                fi
                RETVAL=$?
                echo
                ;;
        homekit_start)    
                if [ "$homekit" = "y" ]; then 
                    result=$(${local}ps aux|grep $NAME2|${local}grep -v grep|${local}grep -v 'cmd')
                    if [ "$result" != ""  ]; then 
                        echo $NAME2"_yes"
                    else
                        cd $paths
                        nohup $paths/$NAME2 > $paths/pid/$NAME2.log 2>&1 &echo $!> $paths/pid/$NAME2.pid
                        #nohup $paths/$NAME2 > $paths/pid/$NAME2.log 2>&1 &  
                        echo $NAME2" _start"
                    fi
                else
                   echo "homekit_no_run"

                fi            

                RETVAL=$?
                echo
                ;;
        stop)
                result=$(${local}ps aux  |${local}grep $NAME|${local}grep -v grep|${local}grep -v 'cmd')
                if [ "$result" != "" ]; then 
                    ${local}ps aux|${local}grep  $NAME| ${local}grep -v grep|awk '{print $2}' |sed -e "s/^/kill -9 /g" | sh
                    #ps aux|grep  app| grep -v grep|awk '{print $2}' |sed -e "s/^/kill -9 /g" | sh
                    kill -9 $(cat $paths/pid/$NAME.pid)
                    echo $NAME"_stop"
                else
                    echo $NAME"_no run"
                fi
                sleep 1
                if [ "$homekit" = "y" ]; then 
                    result=$(${local}ps  aux|${local}grep $NAME2|${local}grep -v grep|${local}grep -v 'cmd')
                    if [ "$result" != ""  ]; then 
                       #${local}ps aux|${local}grep  $NAME2| ${local}grep -v grep|awk '{print $2}' |sed -e "s/^/kill -9 /g" | sh
                       kill -9 $(cat $paths/pid/$NAME2.pid)
                        echo $NAME2"_stop"
                    else
                        echo $NAME2"_no run"
                    fi
                else
                   echo $NAME2"_config_no"

                fi 

   
	         RETVAL=$?
		 echo 
                 ;;
homekit_stop)
                homekit=$(${local}grep -Po 'homekit[" :]+\K[^"]+' $paths/cmdapi/SETUP.json| sed 's:\\\/:\/:g')
                if [ "$homekit" = "y" ]; then 
                    result=$(${local}ps  aux|${local}grep $NAME2|grep -v grep|${local}grep -v 'cmd')
                    if [ "$result" != ""  ]; then 
                       #${local}ps aux|${local}grep  $NAME2| ${local}grep -v grep|awk '{print $2}' |sed -e "s/^/kill -9 /g" | sh
                       kill -9 $(cat $paths/$NAME2.pid)
                        echo $NAME2"_stop"
                    else
                        echo $NAME2"_no run"
                    fi
                else
                   echo $NAME2"_config_no"

                fi    
	         RETVAL=$?
		 echo 
                 ;;
homekit_restart)
                NAME2="homekit"
                #${local}ps aux|${local}grep homekit| ${local}grep -v grep|awk '{print $2}' |sed -e "s/^/kill -9 /g" | sh
                kill -9 $(${local}cat $paths/pid/$NAME2.pid)
                stat_file=$paths/cmdapi/busy_home.state
                if [ ! -f "$stat_file" ];
                then
                  rm $stat_file
                else
                  echo 'ok' 
                fi
                cd $paths
                 nohup ./$NAME2 >> ./pid/$NAME2.log 2>&1 & 

                RETVAL=$?
                echo
                ;;
        restart)
                echo "restart"
                "$0" stop
                 sleep 1
                "$0" start
                RETVAL=$?
                echo
                ;;
        Testing)
                result=$(${local}ps aux  |${local}grep $NAME|${local}grep -v grep|${local}grep -v 'cmd')
                if [ "$result" != "" ]; then 
                 echo "yes"
                 echo $(TZ=UTC-8 date "+%Y-%m-%d %H-%M-%S ")" $NAME STATR RUN..." >$paths/pid/cmdrun.txt
                else
                 "$0" start
                fi
                RETVAL=$?
                echo
                ;;

        *)
                echo $"Usage: $0 {start|stop|on|off}"
                RETVAL=1
esac

exit $RETVAL
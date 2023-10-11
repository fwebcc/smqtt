# smqtt
mqtt web 操作页面<br>
SQLITE数据库记录<br>
自动触发 定时功能<br>
http://fweb.cc:8123<br>
演示<br>
用户名admin<br>
密码pass<br>

安装debian或者ubuntu X86<br>
apt install jq ffmpeg<br>
git clone https://github.com/fwebcc/smqtt.git<br>
cd /mqtt/app<br>
mkdir pid live https<br>
./cmd start<br>
http://IP:8123<br>
默认用户名密码 admin pass<br>

如果需要HTTPS把key crt证书放到https目录，设置里勾选https即可
使用python3.5 Html js ws编写，引用以下开源项目：<br>
https://github.com/ikalchev/HAP-python<br>
https://github.com/pallets/flask<br>
https://github.com/viniciuschiele/flask-apscheduler<br>
https://github.com/miguelgrinberg/Flask-SocketIO <br>
https://github.com/eclipse/paho.mqtt.python<br>

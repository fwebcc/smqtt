# smqtt

<img width="743" height="868" alt="2026-03-10 154735" src="https://github.com/user-attachments/assets/b3ce07ce-6b01-4e22-8fa8-b00b0cac20d4" />

SMQTT - Mosquitto MQTT Web UI & Automation
基于 Mosquitto 的 MQTT Web 管理后台与自动化触发系统
🌟 项目简介 | Introduction
SMQTT 是一款轻量级的 Mosquitto MQTT 可视化管理工具。它不仅提供了直观的 Web 操作界面，还集成了 SQLite 数据库记录、自动触发器及定时任务功能，旨在简化物联网（IoT）系统的管理与自动化。

SMQTT is a lightweight Web UI for Mosquitto MQTT management. It provides a visual dashboard, SQLite data logging, automatic triggers, and scheduling, designed to simplify IoT system management and automation.

🚀 在线演示 | Live Demo
URL: http://g.fweb.cc:8123

Username: admin

Password: pass

✨ 核心特性 | Features
Web UI: 轻松管理 MQTT 消息与主题。 / Intuitive dashboard for MQTT topics and messages.

Database: 使用 SQLite 记录历史数据。 / SQLite integration for data logging and history.

Automation: 自动触发与定时功能。 / Automated triggers and scheduled task support.

Security: 支持 HTTPS 证书配置。 / Easy HTTPS/SSL certificate configuration.

🛠️ 快速安装 | Quick Start
环境要求 | Platform: Debian / Ubuntu (x86)

安装依赖 | Install Dependencies:

Bash
apt update && apt install jq ffmpeg -y
克隆代码 | Clone Repository:

Bash
git clone https://github.com/fwebcc/smqtt.git
cd smqtt/app
创建必要目录 | Initialize Directories:

Bash
mkdir pid live https
启动程序 | Start Service:

Bash
./cmd start
访问页面 | Access UI:
http://YOUR_IP:8123 (Default: admin / pass)

🔒 安全配置 | HTTPS
如果需要启用 HTTPS，请将您的 .key 和 .crt 证书文件放入 https 目录，并在 Web 设置页面中勾选 HTTPS 选项。

To enable HTTPS, place your .key and .crt files into the https folder and enable the "HTTPS" option in the system settings.

📚 技术栈 | Tech Stack
项目基于 Python 3.5, HTML, JS, WebSockets 构建，感谢以下开源项目：
Developed with Python 3.5, utilizing these excellent libraries:

HAP-python (HomeKit Support)

Flask (Web Framework)

Flask-APScheduler (Task Scheduling)

Flask-SocketIO (Real-time Communication)

Paho-MQTT (MQTT Client)

# smqtt

<img width="743" height="868" alt="2026-03-10 154735" src="https://github.com/user-attachments/assets/b3ce07ce-6b01-4e22-8fa8-b00b0cac20d4" />

# SMQTT - Mosquitto MQTT Web Interface & Automation System

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.5+-green.svg)](https://www.python.org/)
[![Platform](https://img.shields.io/badge/platform-Debian%20|%20Ubuntu-orange.svg)](https://www.debian.org/)

**SMQTT** 是一款为 Mosquitto 设计的轻量级可视化管理后台，集成了数据持久化、自动触发器和定时任务功能。
**SMQTT** is a lightweight Web UI for Mosquitto MQTT, featuring SQLite logging, automated triggers, and task scheduling.

---

## 🚀 演示信息 | Live Demo
* **演示地址 (URL)**: [http://g.fweb.cc](http://g.fweb.cc)
* **默认账号 (User)**: `admin`
* **默认密码 (Pass)**: `pass`

---

## ✨ 核心功能 | Key Features

### 1. 可视化管理 (Web Dashboard)
* **实时监控**：通过 Web 页面实时查看 MQTT 消息流动。
* **双语支持**：界面简洁，支持中英文双语逻辑。
* * HomeKit桥接**：支持HomeKit桥接。
* **Real-time Monitoring**: Track MQTT messages directly via WebSockets.

### 2. 数据持久化 (SQLite Logging)
* **历史回溯**：所有 MQTT 消息自动存入 SQLite 数据库，方便查阅历史记录。
* **Data Logging**: All messages are stored in SQLite for historical analysis.

### 3. 自动化与定时 (Automation & Scheduler)
* **自动触发**：支持基于消息内容的自动响应逻辑。
* **定时任务**：内置 Cron 式定时功能，自动执行 MQTT 发布动作。
* **Triggers & Scheduling**: Support for event-driven actions and cron-based tasks.

### 4. 安全增强 (Security)
* **HTTPS 支持**：支持自定义 SSL 证书。
* **HTTPS Ready**: Easy SSL certificate configuration for secure access.

---

## 🛠️ 安装指南 | Installation

### 环境要求 (Prerequisites)
* **OS**: Debian / Ubuntu (x86 架构)
* **Dependencies**: `jq`, `ffmpeg`

### 部署步骤 (Steps)
1.下源码
```bash
# 1. 安装系统依赖
apt update && apt install jq ffmpeg -y

# 2. 克隆仓库
git clone [https://github.com/fwebcc/smqtt.git](https://github.com/fwebcc/smqtt.git)
cd smqtt/app

# 3. 初始化必要目录
mkdir pid live https

# 4. 启动程序
./cmd start
```
2.docker
```bash
docker run -d \
  --name smqtt\
  --privileged \
  -p 1883:1883 -p 8123:8123 -p 51826:51826 \
  --restart always \
  crpi-14b1su7dluf9zqso.cn-hangzhou.personal.cr.aliyuncs.com/fwebcc/smqtt:v1
```

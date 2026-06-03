#!/bin/bash

cd "$(dirname "$0")"

echo "正在停止 8888 端口的进程..."
pid=$(lsof -t -i:8888 2>/dev/null)
if [ -n "$pid" ]; then
  kill -9 $pid
  echo "已停止进程 PID: $pid"
else
  echo "8888 端口无进程"
fi

echo "正在启动后端服务..."
nohup npx tsx src/app.ts > server.log 2>&1 &
echo "后端已启动，PID: $!"
echo "日志文件: $(pwd)/server.log"

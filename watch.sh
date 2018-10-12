#!/bin/bash
# Runs server. Recompiles server and frontend on code change.
set -e

while true; do
  make public/index.html &
  make public/app.js &
  wait
  echo 'ready'
  inotifywait -e close_write public/*.pug public/*.ts >/dev/null 2>/dev/null
done &

while true; do
  make index.js
  node index.js &
  PID=$!
  echo 'ready'
  inotifywait -e close_write *.ts >/dev/null 2>/dev/null
  kill $PID
done

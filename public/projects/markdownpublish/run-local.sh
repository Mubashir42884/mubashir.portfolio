#!/usr/bin/env sh
cd "$(dirname "$0")"
echo "Starting MarkDownPublish at http://localhost:8080"
python3 -m http.server 8080 >/tmp/markdownpublish-http.log 2>&1 &
server_pid=$!
sleep 1
if command -v open >/dev/null 2>&1; then
  open http://localhost:8080
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open http://localhost:8080 >/dev/null 2>&1 &
else
  echo "Open http://localhost:8080 in your browser."
fi
wait "$server_pid"

#!/bin/bash

# Start both services in parallel. Ctrl+C stops all of them.
trap 'kill 0' EXIT

echo "Starting backend API + WebSocket server (port 3000)..."
(cd backend && npm run dev) &

echo "Starting frontend dev server (port 5173)..."
(cd web-dev-project && npm run dev) &

wait

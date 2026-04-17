#!/bin/bash

# Start all 3 services in parallel. Ctrl+C stops all of them.
trap 'kill 0' EXIT

echo "Starting backend API (port 3000)..."
(cd backend && npm run dev) &

echo "Starting Yjs WebSocket server (port 1234)..."
(cd backend && npm run yjs:dev) &

echo "Starting frontend dev server (port 5173)..."
(cd web-dev-project && npm run dev) &

wait

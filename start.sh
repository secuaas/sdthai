#!/bin/sh
# SD Thai Food - Multi-process starter
# Runs both NestJS API and Next.js frontend

echo "=========================================="
echo "Starting SD Thai Food Platform..."
echo "=========================================="

# Trap signals to properly shutdown both processes
cleanup() {
    echo "Shutting down services..."
    kill $FRONTEND_PID $API_PID 2>/dev/null
    exit 0
}
trap cleanup SIGTERM SIGINT

# Start Next.js frontend on port 3001 in background
echo "[Frontend] Starting Next.js on port 3001..."
cd /app/apps/web
HOSTNAME="0.0.0.0" PORT=3001 node server.js &
FRONTEND_PID=$!

# Wait a moment for frontend to initialize
sleep 2

# Start NestJS API on port 3000 in background
echo "[API] Starting NestJS on port 3000..."
cd /app/apps/api
node dist/main.js &
API_PID=$!

echo "=========================================="
echo "Services started:"
echo "  - API (NestJS): http://localhost:3000"
echo "  - Frontend (Next.js): http://localhost:3001"
echo "=========================================="

# Wait for both processes
wait $FRONTEND_PID $API_PID

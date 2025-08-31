#!/bin/bash

echo "🚀 Starting SDR Grok Demo..."

# Start database
echo "📊 Starting database..."
docker compose up -d db

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker compose exec -T db pg_isready -U postgres; do
    echo "   Database not ready, waiting..."
    sleep 2
done

echo "✅ Database is ready!"

# Setup database
echo "🔧 Setting up database..."
./scripts/setup-db.sh

# Install dependencies
echo "📦 Installing dependencies..."
echo "   Installing backend dependencies..."
cd backend && npm install && cd ..
echo "   Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Start both applications
echo "🌐 Starting applications..."
echo "   Backend will run on http://localhost:8080"
echo "   Frontend will run on http://localhost:3000"
echo ""

# Start backend in background
echo "🚀 Starting backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ SDR Grok Demo is starting up!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8080"
echo "📊 Database: localhost:5432"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT

# Wait for background processes
wait

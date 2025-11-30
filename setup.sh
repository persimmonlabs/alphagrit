#!/bin/bash
# Alpha Grit - One Command Setup

echo "🚀 Starting Alpha Grit..."

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Install Docker Desktop first."
    exit 1
fi

# Start everything
docker-compose up -d --build

echo ""
echo "✅ Alpha Grit is running!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:8000"
echo "📍 API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Create admin account:"
echo "   curl -X POST http://localhost:8000/api/v1/auth/register \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"admin@test.com\",\"password\":\"admin123\",\"full_name\":\"Admin\"}'"
echo ""
echo "🛑 To stop: docker-compose down"

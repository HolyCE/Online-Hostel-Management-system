#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:5000/api"

echo -e "${YELLOW}🔧 Testing Hostel Management API${NC}\n"

# Login to get token
echo -e "${YELLOW}📝 Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo -e "Token: ${TOKEN:0:20}...\n"

# Test 1: Get Profile
echo -e "${YELLOW}📝 Test 1: Get Profile${NC}"
curl -s -X GET $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""

# Test 2: Get Available Rooms
echo -e "${YELLOW}📝 Test 2: Get Available Rooms${NC}"
curl -s -X GET $BASE_URL/rooms/available \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""

# Test 3: Create Ticket
echo -e "${YELLOW}📝 Test 3: Create Ticket${NC}"
curl -s -X POST $BASE_URL/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Ticket",
    "description": "Testing from command line",
    "category": "other",
    "priority": "low"
  }' | json_pp
echo ""

echo -e "${GREEN}✅ Testing complete!${NC}"

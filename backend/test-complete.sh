#!/bin/bash

echo "🔧 Testing Complete Hostel Management API"
echo "========================================"

BASE_URL="http://localhost:5000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Health Check
echo -e "\n${YELLOW}Test 1: Health Check${NC}"
curl -s http://localhost:5000/health | json_pp || echo "Failed"

# Test 2: Register User
echo -e "\n${YELLOW}Test 2: Register User${NC}"
REGISTER=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Integration Test",
    "email": "integration@test.com",
    "matricNumber": "INT2024001",
    "password": "TestPass123",
    "phoneNumber": "+1234567890",
    "gender": "male"
  }')
echo $REGISTER | json_pp

# Extract token
TOKEN=$(echo $REGISTER | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
  echo -e "\n${GREEN}✅ Registration successful${NC}"
  
  # Test 3: Get Profile
  echo -e "\n${YELLOW}Test 3: Get Profile${NC}"
  curl -s -X GET $BASE_URL/auth/me \
    -H "Authorization: Bearer $TOKEN" | json_pp
  
  # Test 4: Get Available Rooms
  echo -e "\n${YELLOW}Test 4: Get Available Rooms${NC}"
  curl -s -X GET $BASE_URL/rooms/available \
    -H "Authorization: Bearer $TOKEN" | json_pp
  
  # Test 5: Create Ticket
  echo -e "\n${YELLOW}Test 5: Create Ticket${NC}"
  TICKET=$(curl -s -X POST $BASE_URL/tickets \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Test Issue",
      "description": "This is a test ticket from integration testing",
      "category": "other",
      "priority": "low"
    }')
  echo $TICKET | json_pp
  
  # Test 6: Get My Tickets
  echo -e "\n${YELLOW}Test 6: Get My Tickets${NC}"
  curl -s -X GET $BASE_URL/tickets/my-tickets \
    -H "Authorization: Bearer $TOKEN" | json_pp
  
  # Test 7: Initialize Payment (will likely fail without room, but tests endpoint)
  echo -e "\n${YELLOW}Test 7: Initialize Payment${NC}"
  curl -s -X POST $BASE_URL/payments/initialize \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"paymentMethod": "card"}' | json_pp
  
else
  echo -e "\n${RED}❌ Registration failed, trying login...${NC}"
  
  # Try login
  LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "integration@test.com",
      "password": "TestPass123"
    }')
  echo $LOGIN | json_pp
  
  TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  
  if [ ! -z "$TOKEN" ]; then
    echo -e "\n${GREEN}✅ Login successful${NC}"
  fi
fi

echo -e "\n${GREEN}✅ API Testing Complete${NC}"

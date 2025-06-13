#!/bin/bash

# Test script to register a user with the authentication server
echo "Testing user registration with FA Axis authentication..."

# User information
EMAIL="test.user@example.com"
PASSWORD="test123456"
FIRST_NAME="Test"
LAST_NAME="User"

# Test registration with curl
echo ""
echo "Sending registration request for $EMAIL..."
curl -v -X POST \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"firstName\":\"$FIRST_NAME\",\"lastName\":\"$LAST_NAME\"}" \
  http://localhost:3000/register

echo ""
echo "Registration test complete!"
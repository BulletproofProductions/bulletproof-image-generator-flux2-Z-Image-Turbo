#!/bin/bash

# Test generation flow with detailed logging

BASE_URL="http://localhost:3000"

echo "Starting generation test..."
echo "=============================="

# 1. Create a generation request
echo ""
echo "1. Posting generation request..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful landscape with mountains",
    "settings": {
      "width": 512,
      "height": 512,
      "steps": 10,
      "guidance": 7.5,
      "imageCount": 1
    }
  }')

echo "Response: $RESPONSE"

# Extract generation ID from response
GEN_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Generation ID: $GEN_ID"

if [ -z "$GEN_ID" ]; then
  echo "Failed to extract generation ID. Response was:"
  echo "$RESPONSE"
  exit 1
fi

echo ""
echo "2. Opening progress stream for generation $GEN_ID..."
echo "This will stream real-time progress updates..."
echo ""

# 2. Connect to progress stream
timeout 300 curl -N "$BASE_URL/api/generate/progress?promptId=$GEN_ID&imageIndex=1&totalImages=1" 2>&1

echo ""
echo "=============================="
echo "Test complete"

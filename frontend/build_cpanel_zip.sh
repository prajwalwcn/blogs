#!/bin/bash
set -e

# Make sure we are in the frontend directory
cd "$(dirname "$0")"

echo "🧹 Cleaning previous build and archives..."
rm -rf .next
rm -f standalone.zip

echo "🚀 Step 1: Building Next.js production standalone package..."
npm run build

echo "📦 Step 2: Copying public/ and static/ assets to standalone directory..."
# Copy the public folder to standalone
cp -R public .next/standalone/public

# Copy the static folder to standalone/.next/static
mkdir -p .next/standalone/.next/static
cp -R .next/static/* .next/standalone/.next/static/

echo "🤐 Step 3: Packaging standalone contents into standalone.zip..."
cd .next/standalone
zip -q -r ../../standalone.zip .

echo "✅ Success! Standalone ZIP file is ready: frontend/standalone.zip"

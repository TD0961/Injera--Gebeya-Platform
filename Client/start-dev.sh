#!/bin/bash

# Injera Gebeya Platform - Development Server
# This script starts the frontend development server with polling mode
# to avoid ENOSPC errors on Linux systems

echo "🚀 Starting Injera Gebeya Frontend Development Server..."
echo "📁 Working directory: $(pwd)"
echo "🔧 Using polling mode to avoid ENOSPC errors"

# Set environment variables for polling mode
export VITE_FORCE_POLLING=true
export CHOKIDAR_USEPOLLING=true
export WATCHPACK_POLLING=true

# Start the development server
npm run dev:normal

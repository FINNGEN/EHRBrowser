#!/bin/bash
set -e

# Start R API in the background
echo "Starting R API service..."
Rscript -e "source('/romopapi/runOmopApi.R')" &
R_PID=$!

# Wait for R API to be ready
echo "Waiting for R API to be ready on port 8564..."
timeout=120
counter=0
until curl -s -f http://localhost:8564/__docs__/ > /dev/null 2>&1; do
    # Check if R process is still running
    if ! kill -0 $R_PID 2>/dev/null; then
        echo "ERROR: R API process died unexpectedly"
        exit 1
    fi
    
    if [ $counter -ge $timeout ]; then
        echo "ERROR: R API failed to start within ${timeout} seconds"
        echo "Checking R API logs..."
        kill $R_PID 2>/dev/null || true
        exit 1
    fi
    sleep 2
    ((counter+=2))
    echo "Waiting for R API... (${counter}s)"
done

echo "R API is ready!"

# Start nginx in foreground
echo "Starting nginx..."
exec nginx -g 'daemon off;'

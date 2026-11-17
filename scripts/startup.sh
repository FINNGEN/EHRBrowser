#!/bin/bash
set -e

# Start R API in the background
echo "Starting R API service..."
Rscript -e "source('/romopapi/runOmopApi.R')" &
R_PID=$!

# Wait for R API to be ready
echo "Waiting for R API to be ready on port 8564..."
# No timeout while the counts table is being rebuilt: the API only starts after the build ends
timeout=120
if [ "${REBUILD_COUNTS_TABLE^^}" = "TRUE" ]; then
    timeout=0
    echo "REBUILD_COUNTS_TABLE=TRUE: building tables, no startup timeout. The R API starts after the build ends; progress is printed by R below"
fi
counter=0
until curl -s -f http://localhost:8564/__docs__/ > /dev/null 2>&1; do
    # Check if R process is still running
    if ! kill -0 $R_PID 2>/dev/null; then
        echo "ERROR: R API process died unexpectedly"
        exit 1
    fi
    
    if [ $timeout -gt 0 ] && [ $counter -ge $timeout ]; then
        echo "ERROR: R API failed to start within ${timeout} seconds"
        echo "Checking R API logs..."
        kill $R_PID 2>/dev/null || true
        exit 1
    fi
    sleep 2
    ((counter+=2))
    # While tables are being rebuilt R prints its own progress, so stay quiet to avoid interleaved output
    if [ "${REBUILD_COUNTS_TABLE^^}" != "TRUE" ]; then
        echo "Waiting for R API... (${counter}s)"
    fi
done

echo "R API is ready!"

# Start nginx in foreground
echo "Starting nginx..."
exec nginx -g 'daemon off;'

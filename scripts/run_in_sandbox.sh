#!/bin/bash

#
# Get envars safely 
#
if [ -z "$SANDBOX_PROJECT" ]; then
    echo "Error: environment variable SANDBOX_PROJECT is not set"
    exit 1
fi
if [ -z "$SESSION_MANAGER" ]; then
    echo "Error: environment variable SESSION_MANAGER is not set"
    exit 1
fi

#
# Get CLI parameters
#

TAG="latest"
REBUILD_COUNTS_TABLE="FALSE"
DATABASE="Sandbox-DF13"

while [[ $# -gt 0 ]]; do
    case $1 in
        --tag)
            TAG="$2"
            shift 2
            ;;
        --rebuild_count_table)
            if [[ "$2" != "TRUE" && "$2" != "FALSE" ]]; then
                echo "Error: --rebuild_count_table must be TRUE or FALSE"
                exit 1
            fi
            REBUILD_COUNTS_TABLE="$2"
            shift 2
            ;;
        --database)
            DATABASE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--tag TAG] [--rebuild_count_table TRUE|FALSE]"
            exit 1
            ;;
    esac
done

#
# Clean previous containers if running
# 
if [ "$(docker ps -f name=ehr_browser | grep -v 'CONTAINER' | wc -l)" != "0" ]; then
    echo "Stopping previous EHR Browser container"
    docker stop ehr_browser
    sleep 3s
fi

#
# Run the Docker container
#
docker pull eu.gcr.io/finngen-sandbox-v3-containers/ehr_browser:${TAG}

docker run --rm -d -p 8563:8563 -p 8564:8564 \
    --name ehr_browser \
    -e ROMOPAPI_DATABASE="$DATABASE" \
    -e SANDBOX_PROJECT="$SANDBOX_PROJECT" \
    -e SESSION_MANAGER="$SESSION_MANAGER" \
    -e REBUILD_COUNTS_TABLE="$REBUILD_COUNTS_TABLE" \
    eu.gcr.io/finngen-sandbox-v3-containers/ehr_browser:${TAG} 

#
# Open the browser
#
echo "Waiting for EHR Browser to be ready, may take few seconds"
counter=0
until [ "$(curl -s -o /dev/null -I -w '%{http_code}' "http://localhost:8564/__docs__/")" -eq 200 ] && [ "$(curl -s -o /dev/null -I -w '%{http_code}' "http://localhost:8563")" -eq 200 ]
do
    sleep 1
    ((counter++))
    echo -ne "Waiting for EHR Browser to be ready (${counter}s) \r"
done

# open the cohort operations in the browser
echo "Opening EHR Browser in the browser"
firefox --new-tab 'http://localhost:8563'
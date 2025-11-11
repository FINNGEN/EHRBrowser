#!/bin/bash

# Default values
TAG="latest"
REBUILD_COUNTS_TABLE="FALSE"

# Parse command-line arguments
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
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--tag TAG] [--rebuild_count_table TRUE|FALSE]"
            exit 1
            ;;
    esac
done

docker pull eu.gcr.io/finngen-sandbox-v3-containers/ehr_browser:${TAG}

docker run --rm -p 8080:8080 -p 8585:8585 \
    -e ROMOPAPI_DATABASE=Sandbox-DF13 \
    -e SANDBOX_PROJECT="$SANDBOX_PROJECT" \
    -e SESSION_MANAGER="$SESSION_MANAGER" \
    -e REBUILD_COUNTS_TABLE="$REBUILD_COUNTS_TABLE" \
    eu.gcr.io/finngen-sandbox-v3-containers/ehr_browser:${TAG} 

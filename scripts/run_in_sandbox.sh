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

TAG=""
REBUILD_COUNTS_TABLE="FALSE"
DATABASE=""
ENVIRONMENT="production"

while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -r|--rebuild_count_table)
            if [[ "$2" != "TRUE" && "$2" != "FALSE" ]]; then
                echo "Error: --rebuild_count_table must be TRUE or FALSE"
                exit 1
            fi
            REBUILD_COUNTS_TABLE="$2"
            shift 2
            ;;
        -d|--database)
            DATABASE="$2"
            shift 2
            ;;
        -e|--environment)
            if [[ "$2" != "preview" && "$2" != "production" ]]; then
                echo "Error: --environment must be preview or production"
                exit 1
            fi
            ENVIRONMENT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [-t|--tag TAG] [-r|--rebuild_count_table TRUE|FALSE] [-d|--database DATABASE] [-e|--environment preview|production]"
            exit 1
            ;;
    esac
done

#
# Set environment-specific settings
#
if [ "$ENVIRONMENT" = "preview" ]; then
    # Set default tag to 'dev' for preview if not explicitly provided
    if [ -z "$TAG" ]; then
        TAG="dev"
    fi
    # Set default database to 'DEV' for preview if not explicitly provided
    if [ -z "$DATABASE" ]; then
        DATABASE="Sandbox-DEV"
    fi
    EXTERNAL_PORT_UI=18563
    EXTERNAL_PORT_API=18564
    CONTAINER_NAME="ehr_browser_preview"
else
    # Set default tag to 'latest' for production if not explicitly provided
    if [ -z "$TAG" ]; then
        TAG="latest"
    fi
    # Set default database to 'LATEST' for production if not explicitly provided
    if [ -z "$DATABASE" ]; then
        DATABASE="Sandbox-LATEST"
    fi
    EXTERNAL_PORT_UI=8563
    EXTERNAL_PORT_API=8564
    CONTAINER_NAME="ehr_browser"
fi

#
# Clean previous containers if running
# 
if [ "$(docker ps -f name=$CONTAINER_NAME | grep -v 'CONTAINER' | wc -l)" != "0" ]; then
    echo "Stopping previous EHR Browser container ($CONTAINER_NAME)"
    docker stop $CONTAINER_NAME
    sleep 3s
fi

#
# Run the Docker container
#
docker pull eu.gcr.io/finngen-sandbox-v3-containers/ehr_browser:${TAG}

# Run detached for production, foreground for preview
DETACHED_FLAG=""
if [ "$ENVIRONMENT" = "production" ]; then
    DETACHED_FLAG="-d"
fi

docker run --rm $DETACHED_FLAG -p ${EXTERNAL_PORT_UI}:8563 \
    --name $CONTAINER_NAME \
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
until [ "$(curl -s -o /dev/null -I -w '%{http_code}' "http://localhost:${EXTERNAL_PORT_UI}")" -eq 200 ]
do
    sleep 1
    ((counter++))
    echo -ne "Waiting for EHR Browser to be ready (${counter}s) \r"
done

# open the cohort operations in the browser
echo "Opening EHR Browser in the browser"
firefox --new-tab "http://localhost:${EXTERNAL_PORT_UI}"
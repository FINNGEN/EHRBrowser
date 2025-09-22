#!/bin/bash

docker pull eu.gcr.io/finngen-sandbox-v3-containers/ehr_browser

docker run --rm -p 8080:8080 -p 8585:8585 -e ROMOPAPI_DATABASE=Sandbox-DF13 -e SANDBOX_PROJECT="$SANDBOX_PROJECT" -e SESSION_MANAGER="$SESSION_MANAGER" eu.gcr.io/finngen-sandbox-v3-containers/ehr_browser 

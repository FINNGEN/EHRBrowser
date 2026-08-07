#!/usr/bin/env bash
# App-dependent controls for the AUTODOCU test harness.
#
# This is the ONLY app-specific piece — run_test.sh (the generic runner that
# sources this file) is identical for every app. `build` generates this file
# from the Outline `# Run` section; edit the Outline and re-run build to refresh
# it, or tweak the commands below by hand.
#
# It must define:
#   APP_URL        the URL run_test.sh polls until the app answers (the tests' baseURL)
#   start_app()    launch the app in the background and return immediately
#   stop_app()     stop exactly what start_app launched (idempotent)

# URL to poll / tests' baseURL (from Outline # Run).
APP_URL="http://localhost:8563/"

# Fixed container name so stop_app tears down exactly what start_app launched.
APP_CONTAINER="autodocu_app"

# Launch the app. Derived from Outline # Run:
#   docker run --rm -p 8563:8563 ehr_browser
# Run detached (-d) with a fixed --name so the script can continue and later stop it.
start_app() {
  docker rm -f "$APP_CONTAINER" >/dev/null 2>&1 || true
  docker run --rm -d --name "$APP_CONTAINER" -p 8563:8563 ehr_browser >/dev/null
}

# Stop exactly what start_app launched (its --rm removes the container).
stop_app() {
  docker stop "$APP_CONTAINER" >/dev/null 2>&1 || true
}

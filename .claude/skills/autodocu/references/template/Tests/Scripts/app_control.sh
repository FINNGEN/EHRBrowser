#!/usr/bin/env bash
# App-dependent controls for the AUTODOCU test harness.
#
# PLACEHOLDER — `build` overwrites this file with real values derived from the
# Outline `# Run` section (run command, URL, port). run_test.sh (the generic
# runner that sources this file) is identical for every app; this is the only
# app-specific piece.
#
# It must define:
#   APP_URL        the URL run_test.sh polls until the app answers (the tests' baseURL)
#   start_app()    launch the app in the background and return immediately
#   stop_app()     stop exactly what start_app launched (idempotent)

# URL to poll / tests' baseURL (build sets this from Outline # Run).
APP_URL="http://localhost:PORT/"

# Fixed name/handle so stop_app tears down exactly what start_app launched.
APP_CONTAINER="autodocu_app"

# Launch the app in the background. build fills this in from the Outline # Run
# command. For a `docker run`, inject `-d --name "$APP_CONTAINER"` (keep --rm).
# For a plain process, start it with `&` and capture its PID for stop_app.
start_app() {
  echo "app_control.sh is a placeholder — run 'autodocu build' to generate it." >&2
  return 1
}

# Stop exactly what start_app launched (idempotent).
stop_app() {
  :
}

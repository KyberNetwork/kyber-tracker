#!/bin/bash

set -euo pipefail

readonly app=${1:-}

declare -A scripts=([web]=server.js
		    [burn]=burn.js
		    [trade]=trade.js
		    [rate]=rate.js
		    [schedule]=schedule.js)

usage(){
    cat <<EOF
./entrypoint.sh <application-name>

application names: web, burn, trade, rate, schedule
EOF
}

start_application() {
    local app_name="$1"
    printf 'Starting Kyber Tracker application %s...\n' "$app_name"
    node "${scripts[$app_name]}"
}

if [[ -z ${scripts[$app]+ABC} ]]; then
    usage
    exit
fi

start_application "$app"

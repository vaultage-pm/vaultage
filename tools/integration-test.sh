#!/bin/bash

SERVER_LOGFILE="$(pwd)/server.log"
EXPECTED_LAST_LINE="Server is listening on port 3000"
ERROR_LINE="failed"

rm -rf "$SERVER_LOGFILE"

# compile all
echo "Making build all"
make build 1>/dev/null 2>&1

# deploying back-end
echo "Starting server on localhost:3000"
make serve 1>"$SERVER_LOGFILE" 2>&1 &
serverPid="$!"

echo "Waiting for the server..."
tail -f "$SERVER_LOGFILE" | grep -m 1 "$EXPECTED_LAST_LINE\|$ERROR_LINE"

grep -q "$EXPECTED_LAST_LINE" "$SERVER_LOGFILE"
if [ "$?" -ne 0 ]; then
    echo "Could not boot server. Trace:"
    cat "$SERVER_LOGFILE"
    echo ""
    echo "Cleaning up server..."
    kill "$serverPid"
    rm -rf "$SERVER_LOGFILE"

    exit 1
fi

# try running it
make -C packages/vaultage-client integration-test
res=$?

echo "Cleaning up server..."
kill "$serverPid"
rm -rf "$SERVER_LOGFILE"

exit "$res"

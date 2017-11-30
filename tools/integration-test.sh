#!/bin/bash

SERVER_LOGFILE="server.log"
EXPECTED_LAST_LINE="Server is listening on port 3000"

rm -rf "$SERVER_LOGFILE"

# compile all
echo "Making build all"
make build 1>/dev/null 2>&1

# deploying back-end
echo "Starting server on localhost:3000"
make serve 1>"$SERVER_LOGFILE" 2>&1 &
serverPid="$!"

echo "Sleeping for a while (30 sec)..."
sleep 30

lastLine=$(cat "$SERVER_LOGFILE" | tail -n 1)
if [ "$lastLine" != "$EXPECTED_LAST_LINE" ]; then
    echo "Could not boot server. Trace:"
    cat "$SERVER_LOGFILE"
    echo ""
    echo "Cleaning up server..."
    kill "$serverPid"
    rm -rf "$SERVER_LOGFILE"

    exit 1
fi

# try running it
res=$(make integration-test-client)

echo "Cleaning up server..."
kill "$serverPid"
rm -rf "$SERVER_LOGFILE"

exit "$res"

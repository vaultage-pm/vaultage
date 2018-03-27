#!/bin/bash
SERVER_PORT=3000
SERVER_LOGFILE="$(pwd)/server.log"
EXPECTED_LAST_LINE="Server is listening on port $SERVER_PORT"
ERROR_LINE="failed"

rm -rf "$SERVER_LOGFILE"

# compile all
echo "Making build all"
make build 1>/dev/null 2>&1

# deploying back-end
echo "Starting server on localhost:$SERVER_PORT"
make serve 1>"$SERVER_LOGFILE" 2>&1 &

echo "Waiting for the server..."
until grep -q "$EXPECTED_LAST_LINE\|$ERROR_LINE" "$SERVER_LOGFILE"; do
    sleep 1
done

grep -q "$EXPECTED_LAST_LINE" "$SERVER_LOGFILE"
if [ "$?" -ne 0 ]; then
    echo "Could not boot server. Trace:"
    cat "$SERVER_LOGFILE"
    echo ""
    echo "Cleaning up server..."
    rm -rf "$SERVER_LOGFILE"
    exit 1
fi

# try running it
make -C packages/vaultage-client integration-test
res=$?

echo "Cleaning up server..."
rm -rf "$SERVER_LOGFILE"
# Kill our process based on port usage (proved to be more reliable than a pid based solution)
lsof -ti tcp:$SERVER_PORT | xargs kill

exit "$res"

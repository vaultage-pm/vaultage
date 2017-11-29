# compilation

MAKE="make -C .."

echo "Making all"
$MAKE 1>/dev/null 2>&1

# deploying back-end

echo "Starting server on localhost:3000"
$MAKE serve 1>/dev/null 2>&1 &
serverPid="$!"

echo "Sleeping for a while..."
sleep 20

# try running it
$MAKE integration-test

# cleanup
echo "Killing $serverPid"
kill "$serverPid"

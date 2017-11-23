# compilation

echo "Making all"
make 1>/dev/null 2>&1

# deploying back-end

echo "Starting server on localhost:3000"
make serve 1>/dev/null 2>&1 &
serverPid="$!"

echo "Sleeping for a while..."
sleep 20

# try running it
make integration-test

# cleanup
echo "Killing $serverPid"
kill "$serverPid"

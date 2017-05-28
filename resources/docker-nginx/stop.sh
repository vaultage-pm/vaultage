#!/bin/sh

# pretty colored message
colors="true"
okMsg="\033[32m[ok]${highlightOff}"
if [ "$colors" = "false" ]; then
    okMsg="[ok]"
fi

# Prevents wrong pwd when calling this script from another dir
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH"

. ./env

docker-compose down

echo "${okMsg} Vaultage docker stopped."
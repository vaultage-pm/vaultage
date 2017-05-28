#!/bin/sh

# pretty colored message
colors="true"
highlightOff="\033[0m"
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

echo -e "${okMsg} Vaultage docker stopped."
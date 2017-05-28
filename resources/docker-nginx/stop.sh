#!/bin/sh

# Prevents wrong pwd when calling this script from another dir
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH"

. ./env

docker-compose down

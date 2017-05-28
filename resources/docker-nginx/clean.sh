#!/bin/sh

# pretty colored message
colors="true"
bold="\033[1m"
red="\033[31m"
blackNoBold="\033[0m"
okMsg="\033[32m[ok]${blackNoBold}"
if [ "$colors" = "false" ]; then
    bold=""
    red=""
    blackNoBold=""
    okMsg="[ok]"
fi
redBold="${red}${bold}"

# Prevents wrong pwd when calling this script from another dir
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH"

REPO_ROOT="`pwd`/../.."

echo -e "${redBold}                          _             "
echo -e "${redBold}                         (_)            "
echo -e "${redBold}__      ____ _ _ __ _ __  _ _ __   __ _ "
echo -e "${redBold}\ \ /\ / / _\` | '__| '_ \\| | '_ \ / _\` |"
echo -e "${redBold} \ V  V / (_| | |  | | | | | | | | (_| |"
echo -e "${redBold}  \_/\_/ \__,_|_|  |_| |_|_|_| |_|\__, |"
echo -e "${redBold}                                   __/ |"
echo -e "${redBold}                                  |___/ ${blackNoBold}"

echo ""
echo -e "This command will ${redBold}DESTROY${blackNoBold} all config ${redBold}AND${blackNoBold} data in docker, ${redBold}AND${blackNoBold} config.php."

f1=$(readlink -f "$REPO_ROOT/config.php")
f2="$SCRIPTPATH/env"
d="$SCRIPTPATH/mysql/data"

echo ""
echo "Files/Directories to be removed:"
echo "  $f1"
echo "  $f2"
echo "  $d"

while true; do
    read -p "Do you wish to continue? [y/N] " yn
    case $yn in
        [Yy]* ) 
            echo -n "Removing Vaultage config...  "
            rm -f "$f1"
            echo -e "${okMsg}"
            echo -n "Removing the DB config...    "
            rm -f "$f2"
            echo -e "${okMsg}"
            echo -n "Removing docker's DB data... "
            sudo rm -rf "$d"
            echo -e "${okMsg}"
            exit
            ;;
        [Nn]* ) 
            echo "Cancelled."
            exit
            ;;
        * ) echo "Please answer yes or no.";;
    esac
done
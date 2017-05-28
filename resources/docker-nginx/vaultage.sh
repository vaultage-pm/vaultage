#!/bin/sh

# pretty colored message
colors="true"
highlightOn="\033[33m"
highlightOff="\033[0m"
shell="\033[35m[script]${highlightOff}"
bold="\033[1m"
red="\033[31m"
blackNoBold="\033[0m"
okMsg="\033[32m[ok]${blackNoBold}"
errorMsg="\033[31m\033[1m[error]${highlightOff}"
warningMsg="${highlightOn}[warning]${highlightOff}"
if [ "$colors" = "false" ]; then
    bold=""
    red=""
    blackNoBold=""
    highlightOn=""
    highlightOff=""
    shell="[script]"
    warningMsg="[warning]"
    errorMsg="[error]"
    okMsg="[ok]"
fi
redBold="${red}${bold}"

# Prevents wrong pwd when calling this script from another dir
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH"

REPO_ROOT="`pwd`/../.."
REPO_ROOT=$(readlink -f "$REPO_ROOT")

ENV_FILE="$SCRIPTPATH/env"
VAULTAGE_CFG_FILE=$(readlink -f "$REPO_ROOT/config.php")

###
# Helpers
###


strContains() {
    string="$1"
    substring="$2"
    if test "${string#*$substring}" != "$string"
    then
        return 0    # $substring is in $string
    else
        return 1    # $substring is not in $string
    fi
}

randomAlphaNumString32() {
    cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
}

db_setup() {
    echo -e "\n======\n"
    echo "Generating the Database config ..."

    SALT=`randomAlphaNumString32`
    
    echo ""
    echo "You will be prompted for a username. This will be the username used to login in the web client (and the chrome extension, etc)"

    USERNAME=""
    while [ -z "$USERNAME" ]; do
        echo -n "Please chose a username: "
        read USERNAME
    done

    echo -e "${warningMsg} The password will be set the first time you login using this username in the web interface."
    echo -en "Please acknowledge by pressing Enter..."
    read tmp

    # replaces the variables in db_setup.default.sql with the env ones
    env USERNAME="$USERNAME" \
        SALT="$SALT" \
        envsubst < "$REPO_ROOT/resources/db_setup.default.sql" | docker-compose exec mysql mysql -p${MYSQL_ROOT_PASSWORD} 2>/dev/null >/dev/null

    echo -e "${okMsg} The DB setup is finished."
}

vaultage_setup() {
    echo -e "\n======\n"
    echo -e "Generating the Vaultage config...\n"

    # Vaultage config settings
    DEFAULT_DB_HOST="db"
    DEFAULT_DB_USER="root"
    DEFAULT_DB_USER_PASSWORD="$MYSQL_ROOT_PASSWORD"
    DEFAULT_DB_SELECTED="vaultage"
    USERNAME_SALT=`randomAlphaNumString32`

    env DEFAULT_DB_HOST="$DEFAULT_DB_HOST" \
        DEFAULT_DB_USER="$DEFAULT_DB_USER" \
        DEFAULT_DB_SELECTED="$DEFAULT_DB_SELECTED" \
        DEFAULT_DB_USER_PASSWORD="$DEFAULT_DB_USER_PASSWORD" \
        USERNAME_SALT="$USERNAME_SALT" \
        envsubst < "$REPO_ROOT/config.default.php" > "$REPO_ROOT/config.php"

    echo -e "${okMsg} The Vaultage setup is finished."
}

env_setup() {
    echo -e "\n======\n"
    echo -e "Generating Docker-specific setup...\n"

    echo -n "Mysql root password (leave empty to generate a random password): "
    read MYSQL_ROOT_PASSWORD
    if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
        MYSQL_ROOT_PASSWORD=`randomAlphaNumString32`
    fi

    VAULTAGE_PORT=8080
    echo -n "Web server port ($VAULTAGE_PORT): "
    read tmp
    if [ ! -z "$tmp" ]; then
        VAULTAGE_PORT="$tmp"
    fi

    VAULTAGE_DIR="$REPO_ROOT"
    echo -n "Vaultage root directory ($VAULTAGE_DIR): "
    read tmp
    if [ ! -z "$tmp" ]; then
        VAULTAGE_DIR="$tmp"
    fi

    MYSQL_DATA_DIR="./mysql/data"
    echo -n "Mysql storage directory ($MYSQL_DATA_DIR): "
    read tmp
    if [ ! -z "$tmp"]; then
        MYSQL_DATA_DIR="$tmp"
    fi


    cat - > $ENV_FILE <<EOF
export MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD"
export VAULTAGE_PORT="$VAULTAGE_PORT"
export VAULTAGE_DIR="$VAULTAGE_DIR"
export MYSQL_DATA_DIR="$MYSQL_DATA_DIR"
EOF
    echo ""
    echo -e "${okMsg} The Docker setup is done."
}

require_env() {
    if [ ! -f "$ENV_FILE" ]; then
        echo "Setup is required before running this command!"
        exit 1
    fi
}

exec_mysql_cmd() {
    docker-compose exec mysql mysql --database=vaultage -p${MYSQL_ROOT_PASSWORD} -e "$1"
}


###
# Commands
###


do_help() {
    echo "Available commands:"
    echo "start          Starts the docker containers and launches the configuration wizard if necessary."
    echo "stop           Stops the docker containers."
    echo "clean          Removes all data and configuration (Warning: may result in the loss of your vault!)."
    echo "reset-2fa      Removes the 2-factor auth security (use if you lost your token)."
    echo "help           Prints this help message."
}

do_clean () {
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

    # Get MYSQL_DATA_DIR from env file and ignore errors
    MYSQL_DATA_DIR=""
    . "$ENV_FILE" >/dev/null 2>/dev/null

    echo ""
    echo "Files/Directories to be removed:"
    echo "  $VAULTAGE_CFG_FILE"
    echo "  $ENV_FILE"
    echo "  $MYSQL_DATA_DIR"

    while true; do
        read -p "Do you wish to continue? [y/N] " yn
        case $yn in
            [Yy]* ) 
                echo -n "Removing Vaultage config...  "
                rm -f "$VAULTAGE_CFG_FILE"
                echo -e "${okMsg}"
                echo -n "Removing the DB config...    "
                rm -f "$ENV_FILE"
                echo -e "${okMsg}"
                echo -n "Removing docker's DB data... "
                sudo rm -rf "$MYSQL_DATA_DIR"
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
}

do_start() {
    echo ''
    echo '                   _ _                            '
    echo '                  | | |                           '
    echo ' __   ____ _ _   _| | |_ __ _  __ _  ___          '
    echo ' \ \ / / _` | | | | | __/ _` |/ _` |/ _ \         '
    echo '  \ V / (_| | |_| | | || (_| | (_| |  __/         '
    echo '   \_/ \__,_|\__,_|_|\__\__,_|\__, |\___|         '
    echo '                               __/ |              '
    echo '                              |___/               '
    echo ''
    echo "Welcome to the Vaultage docker deployment utility!"
    echo ""

    # load the MYSQL config (MYSQL access for Vaultage)
    if [ ! -f $ENV_FILE ]; then
        env_setup
    else
        echo -e "MYSQL configuration file (./resources/docker-nginx/env) found, using it..."
    fi
    . $ENV_FILE

    # load the Vaultage config (Credentials for Vaultage clients)
    if [ ! -f "$REPO_ROOT/config.php" ]; then
        vaultage_setup
    else
        echo -e "Vaultage configuration file (./config.php) found, using it..." 
        echo -e "(to clear config, use \"make docker-clean\")"
    fi

    # start docker via docker-compose
    echo -e "\n======\n"
    echo "Starting the container via docker-compose..."
    echo -e "(this requires docker and docker-py)\n"

    docker-compose up -d

    echo -n "Trying to connect to mysql (this may take a minute)"
    while [ -z "$connected" ]; do
        sql_result=`docker-compose exec mysql mysql --database=vaultage -p${MYSQL_ROOT_PASSWORD} -e "SELECT count(*) FROM vaultage_users;"`

        # wait for the docker to be up and running
        if strContains "$sql_result" "ERROR 2002"; then
            sleep 1
            echo -n "."

        # wait for the DB to be up (we can connect)
        elif strContains "$sql_result" "ERROR 1045"; then
            sleep 1
            echo -n "."

        # we can fill the DB
        else
            echo "Success!"
            connected="true"
            if strContains "$sql_result" "ERROR 1049"; then
                db_setup
            fi
        fi
    done

    echo ""
    echo -e "${okMsg} Vaultage is up and running on port ${VAULTAGE_PORT}!"
}

do_stop() {
    require_env
    . "$ENV_FILE"
    docker-compose down
    echo -e "${okMsg} Vaultage docker stopped."
}

switch_ssl() {
    if [ "$1" == 1 ]; then
        echo -n "Switching on SSL... "
        rm -f "$SCRIPTPATH/nginx/vaultage.conf"
        cp "$SCRIPTPATH/nginx/vaultage.conf.ssl" "$SCRIPTPATH/nginx/vaultage.conf"
        echo -e "${okMsg}"

        crt="$SCRIPTPATH/ssl/nginx.crt"
        key="$SCRIPTPATH/ssl/nginx.key"
        if [ ! -f "$crt" ] || [ ! -f "$key" ]; then
            echo -e "${warningMsg} Certificate files not found. You should have the two following certificate files :"
            echo "  $crt"
            echo "  $key"
            echo ""
            echo "You can either generate those yourself, or use a service like LetsEncrypt/Certbot. In the first case, this script can generate the certificates for you (but they will not be recognized by your browser, which will display a red warning)."

            while true; do
                read -p "Would you like this script to generate those certificates? [y/n] " yn
                case $yn in
                    [Yy]* ) 
                        echo -e "Please follow the procedure (you can press Enter every time, just put ${highlightOn}localhost${highlightOff} when asked for ${highlightOn}Common/Server Name${highlightOff}):"
                        openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout "$key" -out "$crt"

                        echo -e "${okMsg} Done generating the certificates."
                        echo -e "You should probably ${highlightOn}make docker stop${highlightOff} and ${highlightOn}make docker start${highlightOff} now."
                        break
                        ;;
                    * ) 
                        echo "Doing nothing."
                        echo -e "${warningMsg} you have to manually create the cerificates above, otherwise Vaultage will not work !"
                        echo -e "${warningMsg} you will also have to update resources/docker-nginx/nginx/vaultage.ssl.conf and set ${highlightOn}server_name${highlightOff} to the correct value."
                        exit
                        ;;
                esac
            done
        else
            echo -e "You should probably ${highlightOn}make docker stop${highlightOff} and ${highlightOn}make docker start${highlightOff} now."
        fi
    else
        echo -n "Switching off SSL... "
        rm -f "$SCRIPTPATH/nginx/vaultage.conf"
        cp "$SCRIPTPATH/nginx/vaultage.conf.nossl" "$SCRIPTPATH/nginx/vaultage.conf"
        echo -e "${okMsg}"

        echo -e "You should probably ${highlightOn}make docker stop${highlightOff} and ${highlightOn}make docker start${highlightOff} now."
    fi
}

do_reset_2fa() {
    require_env
    . "$ENV_FILE"
    if exec_mysql_cmd 'UPDATE vaultage_users SET `tfa_secret`=NULL WHERE id=1;'; then
        echo "${okMsg} Successfully disabled 2FA"
    else
        echo "${errorMsg} An error occured while trying to reset 2FA"
    fi
}

do_user_info() {
    require_env
    . "$ENV_FILE"
    exec_mysql_cmd 'SELECT username, remote_key, tfa_secret FROM vaultage_users WHERE id=1;'
}

if [ $# -lt 1 ]; then
   do_help
   exit 1
fi

case "$1" in
    "start")
        do_start
    ;;
    "stop")
        do_stop
    ;;
    "clean")
        do_clean
    ;;
    "ssl_on")
        switch_ssl 1
    ;;
    "ssl_off")
        switch_ssl 0
    ;;
    "reset-2fa")
        do_reset_2fa
    ;;
    "user-info")
        do_user_info
    ;;
    "help"|*)
        do_help
        exit 1
    ;;
esac
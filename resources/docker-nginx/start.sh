#!/bin/sh

REPO_ROOT="`pwd`/../.."

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH"

# Utilities

contains() {
    string="$1"
    substring="$2"
    if test "${string#*$substring}" != "$string"
    then
        return 0    # $substring is in $string
    else
        return 1    # $substring is not in $string
    fi
}


echo ''
echo '                   _ _                            '
echo '                  | | |                           '
echo ' __   ____ _ _   _| | |_ __ _  __ _  ___          '
echo ' \\ \\ / / _` | | | | | __/ _` |/ _` |/ _ \\      '
echo '  \\ V / (_| | |_| | | || (_| | (_| |  __/        '
echo '   \\_/ \\__,_|\\__,_|_|\\__\\__,_|\\__, |\\___|  '
echo '                               __/ |              '
echo '                              |___/               '
echo ''
echo "Welcome to the Vaultage docker deployment utility!"
echo ""

random_32() {
    cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
}

db_setup() {
    echo "\n\n ======\n"
    echo "Setting up the database"

    SALT=`random_32`

    echo "\nPlease chose a username."
    
    echo -n "Username: "
    read USERNAME

    echo "\nYou will not be prompted for a password right now."
    echo "Your password will be set the first time you log in."
    echo -n "Press return to acknowledge..."
    read tmp

    env USERNAME=$USERNAME \
        SALT=$SALT \
        envsubst < "$REPO_ROOT/resources/db_setup.default.sql" | docker-compose exec mysql mysql -p${MYSQL_ROOT_PASSWORD} 2>/dev/null >/dev/null
}

vaultage_setup() {
echo "\n\n ======\n"
echo "Generating the Vaultage config...\n"

# Vaultage config settings
DEFAULT_DB_HOST="db"
DEFAULT_DB_USER="root"
DEFAULT_DB_USER_PASSWORD="$MYSQL_ROOT_PASSWORD"
DEFAULT_DB_SELECTED="vaultage"
USERNAME_SALT=`random_32`

env DEFAULT_DB_HOST=$DEFAULT_DB_HOST \
    DEFAULT_DB_USER=$DEFAULT_DB_USER \
    DEFAULT_DB_SELECTED=$DEFAULT_DB_SELECTED \
    DEFAULT_DB_USER_PASSWORD=$DEFAULT_DB_USER_PASSWORD \
    USERNAME_SALT=$USERNAME_SALT \
    envsubst < "$REPO_ROOT/config.default.php" > "$REPO_ROOT/config.php"

}

env_setup() {
echo "\n\n ======\n"
echo "Docker-specific setup\nPlease fill in the following variables:\n"

echo -n "Mysql root password (leave empty to generate a random password): "
read MYSQL_ROOT_PASSWORD
if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    MYSQL_ROOT_PASSWORD=`random_32`
fi

VAULTAGE_PORT=8080
echo -n "Web server port ($VAULTAGE_PORT): "
read tmp
if [ ! -z "$tmp" ]; then
    VAULTAGE_PORT = "$tmp"
fi

VAULTAGE_DIR="$REPO_ROOT"
echo -n "Vaultage code directory ($VAULTAGE_DIR): "
read tmp
if [ ! -z "$tmp" ]; then
    VAULTAGE_DIR = "$tmp"
fi

MYSQL_DATA_DIR="./mysql/data"
echo -n "Mysql storage directory ($MYSQL_DATA_DIR): "
read tmp
if [ ! -z "$tmp"]; then
    MYSQL_DATA_DIR = "$tmp"
fi


cat - > ./env <<EOF
export MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD"
export VAULTAGE_PORT="$VAULTAGE_PORT"
export VAULTAGE_DIR="$VAULTAGE_DIR"
export MYSQL_DATA_DIR="$MYSQL_DATA_DIR"
EOF
}

if [ ! -f ./env ]; then
    env_setup
fi
. ./env

if [ ! -f "$REPO_ROOT/config.php" ]; then
    vaultage_setup
fi

echo "\n\n ======\n"
echo "Starting the containers"

docker-compose up -d

echo -n "Trying to connect to mysql (this may take a minute)"
while [ -z "$connected" ]; do
    sql_result=`docker-compose exec mysql mysql --database=vaultage -p${MYSQL_ROOT_PASSWORD} -e "SELECT count(*) FROM vaultage_users;"`

    if contains "$sql_result" "ERROR 2002"; then
        sleep 1
        echo -n "."
    elif contains "$sql_result" "ERROR 1045"; then
        sleep 1
        echo -n "+"
    else
        echo "Success!"
        connected="true"
        if contains "$sql_result" "ERROR 1049"; then
            db_setup
        fi
    fi
done

echo "Vaultage is up and running on port ${VAULTAGE_PORT}!"
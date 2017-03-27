# Docker-based deployment

Turnkey solution to deploy Vaultage with Docker.

## Usage

Quickly test this setup locally with:

```
cd the/directory/containing/this/README.md
source ./env
docker-compose up # Append -d to this command to run in background
cat ../db_setup.sql | docker-compose exec mysql mysql -p${MYSQL_ROOT_PASSWORD}
```

Then navigate to http://localhost:8080

## Real-world usage

In reality, you want to copy this whole directory somewhere else, change the
values and the access rights of the **very sensitive** `env` file and run the
above commands.

You'll also probably want to hide this service behind a firewall and route web-born
requests through an SSL endpoint.
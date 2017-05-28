# Docker-based deployment

Turnkey solution to deploy Vaultage with Docker.

## Prerequisite

All you need is `sh`, `docker` and `docker-compose`.

## Usage

Run `./start.sh` to start the container.

The first time you run `start.sh`, the script will guide you through
the setup process.

Once everything is running, navigate to http://localhost:8080 (or whichever port
you set during the setup).

You can stop the containers with the script `stop.sh`.

## Security tips

TODO
- firewall
- anti brute-force
- protect env file
# Docker-based deployment

Turnkey solution to deploy Vaultage with Docker.

## Prerequisite

All you need is `sh`, `docker` and `docker-compose`.

## Usage

See `./vaultage.sh`

## Security tips

Make sure other users can't read the files containing your secrets:
```
chown :www-data vaultage/config.php
chmod 660 vaultage/config.php
chmod 600 vaultage/resources/docker-nginx/env
```

TODO
- firewall
- anti brute-force
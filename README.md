[![Build Status](https://travis-ci.org/lbarman/vaultage.svg)](https://travis-ci.org/lbarman/vaultage) 
[![Dependency Status](https://david-dm.org/lbarman/vaultage.svg)](https://david-dm.org/lbarman/vaultage) 

# Vaultage

A web-based, self-hosted password manager with client-side encryption.

Authors: [Ludovic Barman](https://github.com/lbarman/), [Hadrien Milano](https://github.com/hmil/)

## Description

Vaultage is a **password manager**.

- The password are encrypted/decrypted in your browser: no plaintext goes through the network; **your passwords never leave your computer's memory**.
- It is in-browser, and can be accessed from **all your devices**.
- It is self-hosted: install it easily on your own server. **Everything is under your control**.
- It is open-source: please feel to audit the code, and please report any bugs.

How does it work ? Please check our document [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) for the assumptions, the adversary model and the system design.

## Screenshots

![Vaultage demo 1](https://raw.githubusercontent.com/lbarman/vaultage/master/resources/screenshot1.png "Vaultage demo 1")

![Vaultage demo 2](https://raw.githubusercontent.com/lbarman/vaultage/master/resources/screenshot2.png "Vaultage demo 2")

## Installing Vaultage locally or on your server*

```
# Install vaultage
npm install -g vaultage

# Start the vaultage server
vaultage-server

# then browse to http://localhost:3000/
```

*NOTE: If deployed remotely, please deploy it behind a *reverse-proxy* with TLS; contacting Vaultage remotely over HTTP is very insecure.

### _Alternative_ run in docker

We provide a prebuilt docker image you can use to run vaultage:

Defined the two variables `$LOCAL_PORT` and `$DATA_FOLDER` to be the port where you will expose vaultage and the directory containing the encrypted vault on the server, respectively.
Then running docker is just a one-liner:
`sudo docker run -d --init --name vaultage -p $LOCAL_PORT:3000 -v $DATA_FOLDER:/home/node/.vaultage hmil/vaultage`

## Config

When starting, `vaultage-server` will look for config settings in `~/.vaultage/config.json`. If this file does not exist it will be automatically generated. This file should be included in any backup as instructed in the backup section below.

Configuration settings are enumerated below:

- **default_user**  
Value used by the web UI to prefill the username field during authentication. Use this setting if you don't want to type your username every time you log in.

- **salts**  
Cryptographic salts used for authentication and encryption. **Losing these will make you unable to decipher your vault, make sure to always have a backup of the salts along with the backup of your vault**.

## Backup instructions

Your configuration and encrypted vault are both stored in `~/.vaultage`. You **must** keep an up-to-date copy of this folder somewhere [safe](https://en.wikipedia.org/wiki/Information_security#Key_concepts) in case you lose the original.  
To restore your vault from a backup, simply copy the files back to `~/.vaultage` and restart `vaultage-server`.

## Contributing

Please check [CONTRIBUTING.md](CONTRIBUTING.md)

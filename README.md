[![Build Status](https://travis-ci.org/lbarman/vaultage.svg)](https://travis-ci.org/lbarman/vaultage) 
[![Dependency Status](https://david-dm.org/lbarman/vaultage.svg)](https://david-dm.org/lbarman/vaultage) 

# Vaultage

A web-based, self-hosted password manager with client-side encryption.

Authors: ![Ludovic Barman](https://github.com/lbarman/), ![Hadrien Milano](https://github.com/hmil/)

## Description

Vaultage is a **password manager**.

- The password are encrypted/decrypted in your browser: no plaintext goes through the network; **your passwords never leave your computer's memory**.
- It is in-browser, and can be accessed from **all your devices**.
- It is self-hosted: install it easily on your own server. **Everything is under your control**.
- It is open-source: please feel to audit the code, and please report any bugs.

How does it work ? Please check our document [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) for the assumptions, the adversary model and the system design.

## Screenshots

TODO: New screenshots

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

*NOTE: If deployed remotely, please deploy it behind a *reverse-proxy* with TLS for additional security. The security implications of both variants are explicited in [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md).

## Config

The config is auto-generated in `~/.vaultage/config.json`.

It looks like this:

```
{
    "default_user": "",
    "salts": {
        "local_key_salt":  "SOME_SALT",
        "remote_key_salt": "SOME_SALT"
    },
    "version": 1
}
```

There's nothing to change there, except filling `default_user` with the username you intend to use, so `auth` asks you one less question.

## Backup instructions

Your configuration and encrypted database are both stored in `~/.vaultage`. Just zip that folder.

## Contributing

Please check [CONTRIBUTING.md](CONTRIBUTING.md)

[![Build Status](https://travis-ci.org/lbarman/vaultage.svg)](https://travis-ci.org/lbarman/vaultage) 
[![Dependency Status](https://david-dm.org/lbarman/vaultage.svg)](https://david-dm.org/lbarman/vaultage) 

# Vaultage

A web-based, self-hosted password manager with client-side encryption.

### Description

Authors : Ludovic Barman, Hadrien Milano

Vaultage is a password manager.

- The password are encrypted/decrypted in your browser: no plaintext goes through the network; your passwords never leave your computer's memory.
- It is in-browser, and can be accessed from all your devices.
- It is self-hosted: install it easily on your own server. Everything is under your control.
- It is open-source: please feel to audit the code, and please report any bugs.

Security technologies used : the <a href="https://bitwiseshiftleft.github.io/">Stanford Javascript Crypto Library</a>, using SHA256 as a hash function, PBKDF2 as a key derivation function, and AES (256bits). Please check our document ![DESIGN.md]("DESIGN.md") for the adversary model and the system design.

## Live demo

 [-> access the live demo](https://demo.lbarman.ch/vaultage/)

- username : __demo__
- remote password : __demo1__
- local password : __demo2__

Trouble beginning? First `auth`, then `ls`. Try to `get Github`, then `gen` a new password, and `get` it.

Database is reset at 00:00 CET

## Examples

![Vaultage demo 1](https://raw.githubusercontent.com/lbarman/vaultage/master/resources/screenshot1.png "Vaultage demo 1")

![Vaultage demo 2](https://raw.githubusercontent.com/lbarman/vaultage/master/resources/screenshot2.png "Vaultage demo 2")


## Installing Vaultage locally or on your server*

    # Install dependencies and build all:
    npm install -g vaultage
    # Start the vaultage server
    vaultage-server
    # then browse to
    http://localhost:3000/

* If deployed remotely, please deploy it behind a *reverse-proxy* with TLS for additional security.

## Contributing

Please check ![CONTRIBUTING.md](CONTRIBUTING.md)

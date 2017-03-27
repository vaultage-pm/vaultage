# Vaultage
A web-based, self-hosted password manager with client-side encryption. (previously inspired from trello, and [clearwater](https://github.com/lbarman/clearwater), now build in console for speed).

### Description

Author : Ludovic Barman

Vaultage is a password manager.

It is in-browser, and can be accessed from all your devices; the password are encrypted/decrypted in your browser : no plaintext goes through the network. It is self-hosted : install it securely on your own server, and it is open-source : please report any bugs on here; I'll do my best to fix them.

Security technologies used : <a href="https://code.google.com/archive/p/crypto-js/">CryptoJS</a>, and the <a href="https://bitwiseshiftleft.github.io/">Stanford Javascript Crypto Library</a>, using SHA256 as a hash function, and AES (256bits).
Plaintext passwords never leave your computer's memory. 

## Live demo

 [-> access the live demo](https://demo.lbarman.ch/vaultage/)

- username : __demo__
- remote password : __demo1__
- local password : __demo2__

Trouble beginning? First *auth*, then *ls*. Try to *get Github*, then *gen* a new password, and *get* it.

Database is reset at 00:00 CET

## Examples

![Vaultage demo 1](https://raw.githubusercontent.com/lbarman/vaultage/master/resources/screenshot1.png "Vaultage demo 1")

![Vaultage demo 2](https://raw.githubusercontent.com/lbarman/vaultage/master/resources/screenshot2.png "Vaultage demo 2")

## Requirements

1. (HTTPS) web server with javascript and php
2. mysql

## Setup

1. create the database, using `resources/db_setup.sql`
2. move `config.default.php` to `config.php`, edit the contents accordingly
3. upload all contents to your web server, serve `clients/web-cli`

## Docker setup

Or, instead of the above setup, you can directly spawn a docker container. See [https://github.com/lbarman/vaultage/tree/master/resources/docker-nginx]

## Possible commands

- *auth* : authenticate to the mysql server, and *pull*s the entries

common :

- *get TERM* : filter the results, and display the matching password entry (supports multi-terms; find all entries matching all terms. use *get -or TERM1 TERM2" to get every entry matching any terms
- *new* : creates a new password entry, then *push*es the changes
- *gen* : creates a new password entry with a random password, and *push*es the changes
- *edit ID* : edits the entry ID (ID is the number in parenthesis). Use KEY_UP to display the previous content.
- *rm ID* : removes the entry ID

less common :

- *push* : pushes the current entries to the database. Check that no overwrite is done; use *push --force* with caution.
- *pull* : pulls the entries from the database
- *clear* : clear the screen
- *logout* : clear all the in-memory authentication information
- *pwd* : to change your local password. Once done, the next *push* will use the next password.

cookies: 

- *saveauth* : saves the username and the remote password in a cookie. _does not save the local password_ by design.
- *loadauth* : loads the username and the remote password from the cookie, and asks for the local password. Use as quicker an alternative to *auth*. Also *pull*s the entries
- *clearauth* : removes all authentication cookies

## Email backups

If you server supports it, you can enable email backup; every time a change is made, the database content (it's a ciphertext) is sent to your email. This way, if something goes wrong, you always have intermediate version of your password database. You can either plug it back in the database, or you can decrypt it with a little javascript (my own ["urgence decryptor" script](https://lbarman.ch/server/aes.html) ).

To enable it, fill in the information in *ajax/config.php*

## Contributors

Thanks to [hmil](github.com/hmil) for his security audit, PR for structure + Docker setup

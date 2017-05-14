# Vaultage
A self-hosted password manager with client-side encryption.

### Description

Vaultage is a password manager.

It is **in-browser**, and can be accessed from **all your devices**.
The password are encrypted/decrypted **locally** : the server only stores a ciphertext.
It is **self-hosted** : install it securely on your own server.

There's a **web-interface**, a **chrome extension**, and even a **docker image** to get started quickly.

Authors : Ludovic Barman, Hadrien Milano

## What's in the box ?

Read the [Technical document](TECHNICAL_DOC.md)

## Getting Started

Read the [Install document](INSTALL.md)

## Live Demo (of the web interface)

 [-> access the live demo](https://demo.lbarman.ch/vaultage/)

- username : __demo__
- remote password : __demo1__
- local password : __demo2__

Trouble beginning? First `auth`, then `ls`. Try to `get Github`, then `gen` a new password, and `get` it.

Database is reset at 00:00 CET

## Web Interface

![Vaultage demo 1](https://raw.githubusercontent.com/lbarman/vaultage/master/resources/screenshot1.png "Vaultage demo 1")

![Vaultage demo 2](https://raw.githubusercontent.com/lbarman/vaultage/master/resources/screenshot2.png "Vaultage demo 2")

## Web Interface Commands

- `auth` : authenticate to the mysql server, and `pull`s the entries
- `la` : alias for `loadauth`, the one I use everyday to login

common :

- `get TERM` : filter the results, and display the matching password entry (supports multi-terms; find all entries matching all terms. use `get -or TERM1 TERM2` to get every entry matching any terms
- `new` : creates a new password entry, then `push`es the changes
- `gen` : creates a new password entry with a random password, and `push`es the changes
- `edit ID` : edits the entry ID (ID is the number in parenthesis). Use KEY_UP to display the previous content.
- `rm ID` : removes the entry ID
- `rotate ID` : re-generates a new password for entry ID, keeping all other fields the same

less common :

- `push` : pushes the current entries to the database. Check that no overwrite is done; use `push --force` with caution.
- `pull` : pulls the entries from the database
- `clear` : clear the screen
- `logout` : clear all the in-memory authentication information
- `pwd` : to change your local password. Once done, the next `push` will use the new password.

cookies: 

- `saveauth` : saves the username and the remote password in a cookie. _does not save the local password_ by design.
- `loadauth` : loads the username and the remote password from the cookie, and asks for the local password. Use as quicker an alternative to `auth`. Also `pull`s the entries
- `clearauth` : removes all authentication cookies

## Chrome Extension

![Vaultage demo 1](https://raw.githubusercontent.com/lbarman/vaultage/master/resources/screenshot1.png "Vaultage demo 1")

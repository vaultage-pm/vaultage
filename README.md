# Vaultage
A password manager with client-side encryption. (previously inspired from trello, and [clearwater](https://github.com/lbarman/clearwater), now build in console for speed).

![Vaultage demo](https://raw.githubusercontent.com/lbarman/vaultage/master/demo.png "Vaultage demo")

## requirements

1. (HTTPS) web server with javascript and php
2. mysql

## setup

1. create the database, using ajax/db_setup.sql
2. update ajax/config.php
3. upload all contents to your web server

## possible commands

- *auth* : authenticate to the mysql server, and *pull*s the entries

common :

- *get TERM* : filter the results, and display the matching password entry
- *new* : creates a new password entry, then *push*es the changes
- *gen* : creates a new password entry with a random password, and *push*es the changes
- *edit ID* : edits the entry ID (ID is the number in parenthesis). Use KEY_UP to display the previous content.
- *rm ID* : removes the entry ID

less common :

- *push* : pushes the current entries to the database
- *pull* : pulls the entries from the database
- *clear* : clear the screen
- *logout* : clear all the in-memory authentication information

cookies: 

- *saveauth* : saves the username and the remote password in a cookie. _does not save the local password_ by design.
- *loadauth* : loads the username and the remote password from the cookie, and asks for the local password. Use as quicker an alternative to *auth*. Also *pull*s the entries
- *clearauth* : removes all authentication cookies

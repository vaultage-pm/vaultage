# vaultage
A password manager with client-side encryption. (previously inspired from trello, and [clearwater](https://github.com/lbarman/clearwater), now build in console for speed).

## requirements

1. (HTTPS) web server with javascript and php
2. mysql

## setup

1. create the database, using ajax/db_setup.sql
2. update ajax/config.php
3. upload all contents to your web server

## possible commands

- *auth* : authenticate to the mysql server, and *pull*s the information
- *get* : filter the results, and display the matching password entry
- *gen* : creates a new password entry with a random password, and *push*es the changes
- *rm* : removes the entry ID (which is the number in parenthesis)
- *push* : pushes the current entries to the database
- *pull* : pulls the entries from the database
- *clear* : clear the screen
- *logout* : clear all the in-memory authentication information

cookies: 
- *saveauth* : saves the username and the remote password in a cookie. _does not save the local password_ by design.
- *loadauth* : loads the username and the remote password from the cookie, and asks for the local password. Use as quicker an alternative to *auth*
- *clearauth* : removes all authentication cookies

# Vaultage : Installation

## Server Requirements

1. HTTPS web server with PHP
2. MySQL

## Server Setup

(see below for the docker setup)
The cloned repo contains the source to create both the **web-cli**, console-like web interface, and the **chrome-ext**, the chrome extension.

1. Run `make` in the root directory (this requires nodeJS). This will install all dependencies, and move things around correctly.
2. Create the database, using `resources/db_setup.sql`
3. Move `config.default.php` to `config.php`, edit the contents accordingly
4. Upload all contents to your web server, serve `public/` (this contains both the server part and the **web-cli**)

## Server Docker Setup

Or, instead of the above setup, you can directly spawn a docker container. See the [Docker README](https://github.com/lbarman/vaultage/tree/master/resources/docker-nginx).

## Chrome Extension

Once the server is setup, you can install the **chrome-ext**, so you don't need to keep a tab open on the **web interface**.

Browse to `packages/chrome-ext`, run `make`. 
Go to `chrome://extensions`, make sure "developer mode" is enabled and click on "load unpacked extension". 
Then, select `packages/chrome-ext/dist`

### Debugging

*Pro tip*: It is easier to debug the extension in its own window. Locate the extension ID on the page `chrome://extensions` and then navigate to `chrome-extension://_ID_/popup.html`

Everytime you change something, run `make` and refresh the page in chrome.

## Email Backups

If you server supports it, you can enable email backups; every time a change is made, the database content (it's a ciphertext) is sent to your email. This way, if something goes wrong, you always have intermediate version of your password database. You can either plug it back in the database, or you can decrypt it with a little javascript (my own ["urgence decryptor" script](https://lbarman.ch/server/aes.html) ).

To enable it, fill in the information in `config.php`
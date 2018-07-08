[![Build Status](https://travis-ci.org/vaultage-pm/vaultage.svg?branch=master)](https://travis-ci.org/vaultage-pm/vaultage) 
[![Dependency Status](https://david-dm.org/vaultage-pm/vaultage.svg)](https://david-dm.org/vaultage-pm/vaultage) 

# Vaultage

An open-source, web-based, self-hosted password manager with client-side encryption.

Authors: [Ludovic Barman](https://github.com/vaultage-pm/), [Hadrien Milano](https://github.com/hmil/)

## Description

Vaultage is a **password manager**.

- The password are encrypted/decrypted in your browser: no plaintext goes through the network; **your passwords never leave your computer's memory**.
- It is in-browser, and can be accessed from **all your devices**.
- It is self-hosted: install it easily on your own server. **Everything is under your control**.
- It is open-source: please feel to audit the code, and please report any bugs.

How is it secured? Please check our document [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) for the assumptions, the adversary model and the system design.

## Screenshots

![Vaultage demo 1](https://raw.githubusercontent.com/vaultage-pm/vaultage/master/resources/screenshot1.png "Vaultage demo 1")

## Quick start

To take Vaultage for a test drive, run:

```
npm install -g vaultage
vaultage-server
```

Then browse to [localhost:3000](http://localhost:3000/). Check out the wiki for [usage instructions](https://github.com/vaultage-pm/vaultage/wiki/Using-the-web-CLI).

_Please note that, while this setup allows you to play around with Vaultage, a real deployment involves a little bit more pieces._

## Complete setup

Ready to use Vaultage to its full potential? Check out [our guides](https://github.com/vaultage-pm/vaultage/wiki#guides) to learn how to set up Vaultage in a secure and durable way.

## Usage Documentation

Vaultage exposes a command line interface which you can keep open in a pinned tab in your browser. Whenever you need a password, switch to that tab and copy-paste it where needed.

The command line asks you to authenticate first (type `auth`). Then get a password by typing `get` followed by some search keywords.

[Read the full usage documentation.](https://github.com/vaultage-pm/vaultage/wiki/Using-the-web-CLI)

## Contributing

We welcome any contribution, whether it's a bug report, a feature request or a full-blown code contribution.
Please check [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

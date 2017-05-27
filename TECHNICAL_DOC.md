# Vaultage : Technical Document

The purpose of this document is to precisely enumerate the assumptions, the encryption primitives and the keys used.

## Threat model

1) Your computer is assumed to be **trusted**. Vaultage's passwords are decrypted locally, hence any malware on your computer could steal the passwords, as it is the case for any password manager, or without password manager. The only conclusion to take from this is : **Do not log in on Vaultage from a cybercafe, or any untrusted computer**.

2) The server storing the passwords is **untrusted**. Vaultage's database is encrypted before being sent, hence only a ciphertext is stored in the server. Yet, the server authenticates users: a compromised server might learn the **remote key**, but not the content of the database. In addition, the remote key cannot possibly give away the local key.

3) We assume there is an authenticated, encrypted channel between you and the server. This is the case if the server uses HTTPS, and certificates are correctly generated. An untrusted channel might allow an attacker to tamper the data but the passwords are still safe from theft in that scenario.

## Key derivation procedure

The user own a **master password**. Locally, he inputs it to the javascript client, which derives two passwords : the **remote key** and the **local key**.

1) the **remote key** is used to authenticate the client to the server. The server will not send the ciphertext to an unauthenticated client, nor accept updates from an unauthenticated client.

2) the **local key** is used to decrypt **locally** the database. It never leaves the client computer's memory.

```
                                           Remote Password Salt
                                             |
                                             v
                                         _________
                                    /--> | PBKDF2 |  -------> Remote Key
                           32 MSB--/     |________|
                                  /   
                   _________     /    
Master Password -->| SHA512 | --x         Local Password Salt
                   |________|    \           |
                                  \          v
                           32 LSB--\     _________
                                    \--> | PBKDF2 |  -------> Local Key
                                         |________|
       

```

The master password is never stored.

## Authentication with the server

The first step is the establishement of the TLS connection. With HSTS and key pinning, this could authenticate the server to the client. In any case, this creates a confidential channel.

On this channel, the client sends its *username* and *remote password* to the server, which checks the credentials. If correct, it answers with the *database ciphertext*.


```
CLIENT                                         WEBSERVER
                    TLS HANDSHAKE
    <------------------------------------------>

            Username, Remote Password
    -------------------------------------------> Credential validation
                                                IF failure : answer 401 Unauthorized

                Database Ciphertext
    <-------------------------------------------

```

## Decryption

The client decrypts the *database ciphertext* using AES-CCM and the *local password*.

```
CLIENT                                         WEBSERVER

Database Ciphertext                            (does nothing, decryption is local)
        |
        |      Local Password
        v           |
    ___________     |
    | AES-CCM | <---|
    |_________|
        |
        |
        V
    Database

```

## Local Update, then Push

The decrypted database is just an javascript object with all the information. It is possibly modified by the client, then the new version is pushed to the server.

To avoid unwanted deletions, the client sends along the hash of the previously-received decrypted database. If this hash does not match what is stored on the server, the server refuses the update. This prevents sending an empty ciphertext (in case there the previous pulling of ciphertext failed, for some reason), and prevents an attacker who learnt **remote key** but not **local key** (e.g. by performing a MitM), from pushing updates to the real server.

```
CLIENT                                         WEBSERVER

                                                Stores Ciphertext, Hash
                     Ciphertext
    <-------------------------------------------
Decrypts to D

  ...

Updates D -> D'

  ...

 Username, Remote Password, Encryption(D'), Hash(D), Hash(D')
    ------------------------------------------->

                                            Checks Username, Remote Password
                                            If invalid, return 401

                                            Checks if Hash(D) != Hash
                                            If not, refuse update, return 401

                                            Stores Encryption(D') as the new Ciphertext
                                            Stores Hash(D') as the new Hash

```

Effectively, this creates a chain like this:


```
DATABASE INITAL STATE          PUSHES D                   PUSHES D'
____________________          _________________          __________________
| Id:0             | <------- | Id:1          | <------- | Id:2           |
| Hash("[]")       |          | Hash(D)       |          | Hash(D')       |
| Encryption("[]") |          | Encryption(D) |          | Encryption(D') |
|__________________|          |_______________|          |________________|

```

This also prevents deleting changes in the case where two Vaultage clients are open on the same account (e.g, a mobile phone and a computer), and those two clients perform a push (not necessarily at the same time). With this technique, the second client will receive an alert "Cannot push, please pull the new database first".

## Passwords, Keys and Salts


```
CLIENT                                          WEBSERVER
knows...                                        knows....

Master Key (secret, not stored)
Remote Password Salt (public, stored)
Local  Password Salt (public, stored)
Username (public, stored in memory)             Username (public, stored)
Remote Key (secret, stored in memory)      Remote Key (secret, stored)
Local  Key (secret, stored in memory)
```

In particular, the client only stores the two salts, and the server only stores the authentication credentials.

The master key is never stored. The remote and local keys on the client side are only stored in memory.

The only exception is when the client uses cookies to make the authentication faster; in that case, the Username is also stored client-side in a cookie. No password is stored in the cookie.

## Primitives and keysizes

Encryption : AES-CCM, 256 bits

Key Derivation: SHA512 + PBKDF2, with HMAC-SHA256, and 32768 Iterations

Hash function : SHA256

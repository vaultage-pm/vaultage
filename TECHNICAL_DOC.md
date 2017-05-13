# Vaultage : Technical Document

The purpose of this document is to show to precisely enumerate the assumptions, the encryption primitives and keys used.

## Thread model

1) Your computer is assumed to be *trusted*. Vaultage's passwords are decrypted locally, hence any malware on your computer could steal the passwords, as it is the case for any password manager, or without password manager. The only conclusion to take from this is : *Do not log in on Vaultage from a cybercafe, or any untrusted computer*.

2) The server storing the passwords is *untrusted*. Vaultage's database is encrypted before being sent, hence only a ciphertext is stored in the server. Yet, the server does the authentication: a compromised server might learnt the **remote password**, but not the content of the database. Hence, pick a unique remote password.

3) We assume there is an authenticated, encrypted channel between you and the server. This is the case if the server uses HTTPS, and certificates are correctly generated.

## Key derivation procedure

The user own a **master password**. Locally, he inputs it to the javascript client, which derives two passwords : **remote password** and **local password**.

1) the **remote password** is used to authenticate the client to the server. The server will not serve the ciphertext to an unauthenticated client.

2) the **local password** is used to decrypt *locally* the database. It never leaves your computer's memory.

```
Master Password
        |
        |     Remote Password Salt
        |       |
        |       v
        |    _________
        |--> | PBKDF2 |  -------> Remote Password
        |    |________|
        |
        |
        |     Local Password Salt
        |       |
        |       v
        |    _________
        |--> | PBKDF2 |  -------> Local Password
             |________|

```

## Authentication with the server

The first step is the establishement of the TLS connection. With HSTS and key pinning, this could authenticate the server to the client. In any case, this creates a confidential channel.

On this channel, the client sends its *username* and *remote password* to the server, which checks the credentials. If correct, it answers with the *database ciphertext*.


```
CLIENT                                         WEBSERVER
                    TLS HANDSHAKE
    <------------------------------------------>

            (Username, Remote Password)
    -------------------------------------------> Credential validation

                                                IF failure : answer 400 Unauthorized

                (Database Ciphertext)
    <-------------------------------------------

```

## Decryption

The client decrypts the *database ciphertext* using AES-CCM and the *local password*.

```
CLIENT                                         WEBSERVER

Database Ciphertext
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

The decrypted database is just an javascript object with all the information. It is possibly modified by the client, then the new version is *push*'ed to the server.

To avoid unwanted deletions, the client sends along the hash of the previously-received decrypted database. If this hash does not match what is stored on the server, the server refuses the update. This prevents sending an empty ciphertext (in case there the previous *pull* failed), and prevents an attacker who learnt **remote password**, but not **local password**, from *push*ing updates.

```
CLIENT                                         WEBSERVER

                                                Stores Ciphertext, Hash
                    PULL( Ciphertext )
    <-------------------------------------------
Decrypts to D

  ...

Updates D -> D'

  ...

  PUSH( Username, Remote Password, Encryption(D'), Hash(D), Hash(D') )
    ------------------------------------------->

                                            Checks Username, Remote Password
                                            If invalid, return 400

                                            Checks if Hash(D) != Hash
                                            If not, refuse update, return 400

                                            Stores Encryption(D') as the new 
                                                                    Ciphertext
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

## Passwords, Keys and Salts


```
CLIENT                                          WEBSERVER
knows...                                        knows....

Master Key (secret, not stored)
Remote Password Salt (public, stored)
Local  Password Salt (public, stored)
Username (public, stored in memory)             Username (public, stored)
Remote Password (secret, stored in memory)      Remote Key (secret, stored)
Local  Password (secret, stored in memory)
```

In particular, the client only stores the two salts, and the server only stores the authentication credentials.

The master key is never stored. The remote and local passwords on the client side are only stored in memory.
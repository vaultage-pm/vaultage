# Vaultage System Design

## System

Entities:

- Let `{P}` be a plaintext collection of passwords.
- Let `S` be a server, `U` be a user device (e.g. computer, smartphone).
- Let `A` be the adversary (i.e., anyone that might try to steal your passwords `{P}`).

Crypto primitives:
- Let `H` be a hash function; we use `H = SHA256`
- Let `PBKDF2` be a key derivation function; we use `PBKDF2` instantiated as `PBKDF2-HMAC-SHA256`
- Let `ENC`/`DEC` be an encryption/decryption function; we use `ENC = AES_CCM`. We write `ENC_key` to indicate that the encryption/decryption is under key `key`.

## Threat model

The user device `U` is **trusted** (or **honest**): we assume that it is controlled by a honest user, and that the adversary `A` has no access to it. For instance, we assume that `U` has no virus, malware, and is not under the control of `A`.

The server `S` is **semi-honest**: it will not run active attacks against the system, but might be curious and try to *passively* learn `{P}`.

## System properties

1) **Confidentiality at rest**: No 3rd parties, including `A`, can retrieve `{P}` from data at rest.

2) **Confidentiality in transit**: No 3rd parties, including `A`, can retrieve `{P}` from data at in transit.

3) **Integrity protection**: No 3rd parties, including `A`, can alter or delete `{P}`.

4) **Consistency**: `{P}` is protected against concurrent writes.

## Assumptions

1) **Sound encryption**: we assume that the encryption used (`ENC`/`DEC`) is sound and does not leak information without the appropriate key.

2) **Sound hash functions**: we assume that the hash function used (`H` and `PBKDF2`) are sound, and have the usual properties of a cryptographic hash functions (deterministic, cannot be inverted, collision resistant, etc).

2) **Authenticated and confidential communications**: we assume the communication between `U` and `S` is encrypted (e.g., via TLS), and that `U` knows the public key of `S` (e.g., `S`'s public key is incorporated in the certificate signed by a valid Certificate Authority).

## Overview

The server `S` offers the "Vaultage" service to the user device/user `U`. The server `S` stores the code necessary to run Vaultage, and `U` is stateless.

On a high level, `U` connects to `S`, retrieves the code for running Vaultage and an encrypted version of `{P}`. `U` will locally decrypt (and possibly update) `{P}`, then send an encrypted version of `{P}` to `S`.

### Keys

Vaultage uses 3 keys:

- the **master key** `MP`, corresponding to the user password
- the **remote key** `RK`, derived from `MP`, and used to *authenticate* `U` to `S`
- the **local key** `LK`, derived from `MP`, and used to locally *encrypt* or *decrypt* the password database

### Messages between `U` and `S`

The protocol uses three messages:

- a message `GET` from `U` to `S`, requesting for the encrypted database
- a message `CIPHER`from `S` to `U`, containing the encrypted database
- a message `UPDATE`from `U` to `S`, containing an encrypted database, and requesting the server to store the new one.

## Strawman protocol

This is a simplified version of the protocol. The real protocol is described below.

Install phase:
1) The vaultage server is installed on `S`.
2) Two salts, the **remote salt** `RS` and the **local salt** `LS`, are computed as follow:
```
RS <-R {0,1}^{32}
LS <-R {0,1}^{32}
```
where `<-R` means "picks at random".

First connection:
1) `U` connects to `S`. 
2) `S` sends the latest Vaultage client to `U`.
3) `U` runs the vaultage client.
4) `U` prompts the end-user its **master password** `MP`.
5) From `MP`, `U` derivates the **remote key** `RK` and **local key** `LK` as follow :
```
RK <- PBKDF2(MP, RS)
LK <- PBKDF2(MP, LS)
```
6) `U` sends a request `GET(RK)` to the server `S`.
7) `S` stores `RK` and answers `CIPHER()`, the empty ciphertext.
8) `U` sees that there is nothing to decrypt, and initializes an empty local database `DB`.
10) `U` sends `UPDATE(RK, ENC_LK(DB))`, where `ENC_LK(DB)` is the encryption under `LK` of the database `DB`.
11) After verifying `RK`, `S` stores `ENC_LK(DB)`

Normal usage phase:
1) `U` connects to `S`.
2) `S` sends the latest Vaultage client to `U`. 
3) `U` runs the vaultage client.
4) The user is prompted for its **master password** `MP`.
5) From `MP`, `U` derivates the **remote key** `RK` and **local key** `LK` as follow :
```
RK <- PBKDF2(MP, RS)
LK <- PBKDF2(MP, LS)
```
6) `U` sends a request `GET(RK)` to the server `S`.
7) `S` checks the provided `RK` against the stored one, and answers with `CIPHER(ENC_LK(DB))`
8) `U` locally decrypts `CIPHER(ENC_LK(DB))` to `DB` as follow :
```
DB <- DEC_LK(ENC_LK(DB))
```
9) `U` interacts with `DB` (adds, edit passwords)
10) `U` sends `UPDATE(RK, ENC_LK(DB))`, where `ENC_LK(DB)` is the encryption under `LK` of the database `DB`.
11) After verifying `RK`, `S` stores `ENC_LK(DB)`

## Serializable protocol

We slightly complexify the above protocol to add *serializability* to the updates.

### Motivations

Intuitively, we want to avoid a user with two devices `U1`, `U2` to lose data by doing:

```
U1 <- GET()
U2 <- GET()
U1 locally changes DB to DB'
U2 locally changes DB to DB''
U1 -> UPDATE(..., DB')
U2 -> UPDATE(..., DB'') # DB' is lost
```

### Protocol overview

- Let `DB` be the database stored by `S` (of course, `S` stores `ENC(DB)` not `DB`).
- Let `DB_NEW` be the altered database, part of an `UPDATE` message, e.g. `UPDATE(RK, ENC_LK(DB_NEW))`.
- We change the `UPDATE(RK, ENC_LK(DB_NEW))` message to `UPDATE(RK, ENC_LK(DB_NEW), H(DB), H(DB_NEW))`, i.e. we include the hash of the *old* database in the `UPDATE` message.
- `S` stores `ENC(DB)` **and** `H(DB)`.
- `S` accept an `UPDATE` message *iff* the provided `H(DB)` matches the stored one.

This ensure all updates are sequential, to the cost of possibly denying an update to the user `U`. 

### Protocol

Install phase:
1) The vaultage server is installed on `S`.
2) Two salts, the **remote salt** `RS` and the **local salt** `LS`, are computed as follow:
```
RS <-R {0,1}^{32}
LS <-R {0,1}^{32}
```
where `<-R` means "picks at random".

First connection:
1) `U` connects to `S`. 
2) `S` sends the latest Vaultage client to `U`.
3) `U` runs the vaultage client.
4) `U` prompts the end-user its **master password** `MP`.
5) From `MP`, `U` derivates the **remote key** `RK` and **local key** `LK` as follow :
```
RK <- PBKDF2(MP, RS)
LK <- PBKDF2(MP, LS)
```
6) `U` sends a request `GET(RK)` to the server `S`.
7) `S` stores `RK` and answers `CIPHER()`, the empty ciphertext.
8) `U` sees that there is nothing to decrypt, and initializes an empty local database `DB`.
10) `U` sends `UPDATE(RK, ENC_LK(DB), H(""), H(DB))`, where `H("")` is the hash of an empty database.
11) After verifying `RK`, `S` stores `ENC_LK(DB)` and `H(DB)`

Normal usage phase:
1) `U` connects to `S`.
2) `S` sends the latest Vaultage client to `U`. 
3) `U` runs the vaultage client.
4) The user is prompted for its **master password** `MP`.
5) From `MP`, `U` derivates the **remote key** `RK` and **local key** `LK` as follow :
```
RK <- PBKDF2(MP, RS)
LK <- PBKDF2(MP, LS)
```
6) `U` sends a request `GET(RK)` to the server `S`.
7) `S` checks the provided `RK` against the stored one, and answers with `CIPHER(ENC_LK(DB))`
8) `U` locally decrypts `CIPHER(ENC_LK(DB))` to `DB` as follow :
```
DB <- DEC_LK(ENC_LK(DB))
```
9) `U` changes `DB` to `DB_NEW` (by adding or editing passwords)
10) `U` sends `UPDATE(RK, ENC_LK(DB_NEW), H(DB), H(DB_NEW))`.
11) After verifying `RK`, and that `H(DB)` is indeed equal to the stored `H(DB)`, `S` stores `ENC_LK(DB)` and `H(DB_NEW)`

## Security discussion

We treat our system properties one by one:

1) **Confidentiality at rest**: No 3rd parties, including `A`, can retrieve `{P}` from data at rest.

`S` only delivers `ENC({P})` upon proof-of-knowledge of `RK`, known only by the legitimate user. Should the adversary `A` still learn `RK`, it only allows him to get `ENC_LK({P})`. By assumption of sound encryption (Assumption 1), it leaks no information without `LK`, only known by the legitimate user.

2) **Confidentiality in transit**: No 3rd parties, including `A`, can retrieve `{P}` from data in transit.

All communications are integrity-protected (Assumption 3).

3) **Integrity protection**: No 3rd parties, including `A`, can alter or delete `{P}`.

`S` only accept an `UPDATE` containing the correct `RK`, known only by the legitimate user. Should the adversary `A` still learn `RK`, the server `S` only accepts an `UPDATE` containing the correct `H(DB)`, the hash of the old database. By Assumption 2, it is hard to produce `H(DB)` without the full knowledge of `DB`, known only by the legitimate user.

4) **Consistency**: `{P}` is protected concurrent writes.

`S` only accepts an `UPDATE` containing the correct `H(DB)`, the hash of the old database. This prevents all dirty writes.
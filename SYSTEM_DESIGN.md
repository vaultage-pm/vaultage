# Vaultage System Design

## Entities

Let `{P}` be a plaintext collection of passwords.
Let `S` be a server, `U` be a user device (e.g. computer, smartphone).
Let `A` be the adversary (i.e., anyone that might try to steal your passwords `{P}`).

## Threat model

The user device `U` is **trusted** (or **honest**): we assume that it is controlled by a honest user, and that the adversary `A` has no access to it. For instance, we assume that `U` has no virus, malware, and is not under the control of `A`.

The server `S` is **semi-honest**: it will not run active attacks against the system, but might be curious and try to *passively* learn `{P}`.

## System

The server `S` offers a service to the user device `U`, namely Vaultage. `S` stores the code necessary to run Vaultage. On a high level, `U` connects to `S`, retrieves the code for running Vaultage and an encrypted version of `{P}`. `U` will locally decrypt (and possibly update) `{P}`, then send an encrypted version of `{P}` to `S`.

We assume the communication between `U` and `S` is encrypted (e.g., via TLS), and that `U` knows the public key of `S` (e.g., `S`'s public key is incorporated in the certificate signed by a Certificate Authority).

## Strawman protocol

(Install phase)
1) The vaultage server is installed on `S`
2) Two salts, the **remote salt** `RS` and the **local salt** `LS`, are computed as follow:
```
RS <-R {0,1}^{32}
LS <-R {0,1}^{32}
```
where `<-R` means "picks at random"

(First connection)
1) `U` connects to `S`. He eventually authenticates (e.g., via .htaccess)
2) `S` sends the latest Vaultage client to `U`, as long as 
3) `U` runs the vaultage client.
4) The user is prompter for its **master password** `MP`.
5) From `MP`, `U` derivates the **remote key** `RK` and **local key** `LK` as follow :
```
RK <- PBKDF2(MP, RS)
LK <- PBKDF2(MP, LS)
```
6) `U` sends a request `GET(RK)` to the server `S`.
7) `S` stores `RK` and answers `CIPHER()`, the empty ciphertext.
8) `U` sees that there is nothing to decrypt, and initialize an empty local database `DB`.
10) `U` sends `UPDATE(RK, ENC_LK(DB))`, where `ENC_LK(DB)` is the encryption under `LK` of the database `DB`.
11) After verifying `RK`, `S` stores `ENC_LK(DB)`

(Normal usage phase)
1) `U` connects to `S`. He eventually authenticates (e.g., via .htaccess)
2) `S` sends the latest Vaultage client to `U`, as long as 
3) `U` runs the vaultage client.
4) The user is prompter for its **master password** `MP`.
5) From `MP`, `U` derivates the **remote key** `RK` and **local key** `LK` as follow :
```
RK <- PBKDF2(MP, RS)
LK <- PBKDF2(MP, LS)
```
6) `U` sends a request `GET(RK)` to the server `S`.
7) `S` checks the provided `RK` against the stored one, and answers with `CIPHER(ENC_LK(DB))`
8) `U` locally decrypts `CIPHER(ENC_LK(DB))` to `DB`
9) `U` interacts with `DB` (adds, edit passwords)
10) `U` sends `UPDATE(RK, ENC_LK(DB))`, where `ENC_LK(DB)` is the encryption under `LK` of the database `DB`.
11) After verifying `RK`, `S` stores `ENC_LK(DB)`

## What if

- `U` is under the control of an adversary (e.g. `U` has a virus): TODO

- `S` is under the control of an adversary (e.g. `U` has a virus): TODO
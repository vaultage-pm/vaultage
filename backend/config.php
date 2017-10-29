<?php

define('LAST_HASH_INITIAL_VALUE', 'INIT');

# Database credentials
define('DEFAULT_DB_HOST', 'localhost');
define('DEFAULT_DB_USER', 'vaultage');
define('DEFAULT_DB_USER_PASSWORD', 'vaultage');
define('DEFAULT_DB_SELECTED', 'vaultage');

# Used for access control
define("AUTH_ENABLED", false);
define("AUTH_USER", "demo");
define("AUTH_PWD_SHA256", "61ea51136a1eb39db39c889c9c53ebd21e5ce9e78721a6c2c40f8e16b782a879"); #sha256(demo1)

# Vaultage's automatic mail backup feature. Requires mail() in PHP
define('MAIL_BACKUP_ENABLED', false);
define('BACKUP_EMAIL_FROM', 'vaultage@vaultage.com');
define('BACKUP_EMAIL_TO', 'john.ryan@yourprovider.com');
define('BACKUP_SUBJECT', '[VAULTAGE] Backup');

# Error messages
define("ERROR_AUTH_FAILED", "Error, authentication failed.");
define("ERROR_NOT_FAST_FORWARD", "Error, cannot write; not fast_foward.");
define("ERROR_NOT_WONT_ERASE", "Error, cannot write; new content empty.");
?>
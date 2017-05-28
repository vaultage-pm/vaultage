<?php

# Database credentials
define('DEFAULT_DB_HOST', '${DEFAULT_DB_HOST}');
define('DEFAULT_DB_USER', '${DEFAULT_DB_USER}');
define('DEFAULT_DB_USER_PASSWORD', '${DEFAULT_DB_USER_PASSWORD}');
define('DEFAULT_DB_SELECTED', '${DEFAULT_DB_SELECTED}');

# Vaultage's automatic mail backup feature. Requires mail() in PHP
define('MAIL_BACKUP_ENABLED', false);
define('BACKUP_EMAIL', 'demo@provider.com');
define('BACKUP_SUBJECT', '[VAULTAGE] Backup');

# Client-side salt
define('USERNAME_SALT', '${USERNAME_SALT}');

?>

<?php

define("ACTION_PATTERN", "[a-z0-9_]+");
define("USERNAME_PATTERN", "[a-z0-9_-]+");
define("ALPHANUM", "[0-9a-z]+");
define("URL_PATTERN", "#/(".USERNAME_PATTERN.")/(".ALPHANUM.")/(".ACTION_PATTERN.")#i");
define("APP_NAME", "Vaultage");

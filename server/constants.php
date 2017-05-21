<?php

define("ACTION_PATTERN", "[a-z]+");
define("USERNAME_PATTERN", "[a-zA-Z0-9_-]+");
define("HEX_DIGIT", "[0-9a-fA-F]+");
define("URL_PATTERN", "#/(".USERNAME_PATTERN.")/(".HEX_DIGIT.")/(".ACTION_PATTERN.")#");

<?php

require_once(__DIR__ . "/totp.php");

$TFA_METHODS = array(
    "totp" => new TOTP_TFA()
);

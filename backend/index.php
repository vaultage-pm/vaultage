<?php

/*
 * This class is a very simple REST endpoint supporting authentication.
 * Supported methods:
 * - GET, which returns the latest database content
 * - POST (new_data, old_hash, new_hash) which updates the database content to (new_data, new_hash) iff old_hash matches the hash of the database before this update. This prevents overwriting the database, and serialize the update sequence.
 *
 * The authentication is hard-coded in config.php. The way to authenticate is to contact this endpoint and add the parameters to the query :
 * index.php/USERNAME/SHA256_OF_PASSWORD/vaultage_api
 *
 * Note: the "vaultage_api" suffix only exists because browsers log in the history the last part of the URL, which would contain SHA256_OF_PASSWORD without this suffix. This would pose no security threat, but would be less user friendly
 */

// By convention, force the system timezone to Swiss time
date_default_timezone_set('Europe/Zurich');

// Disable caching
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, must-revalidate, no-store, private');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');

// Output is JSON encoded
header('Content-Type: application/json; charset=utf-8');

// Load helpers
require_once(__DIR__ . '/config.php');
require_once(__DIR__ . '/helpers.php');

// Load classes
require_once(__DIR__ . '/Storage.php');
require_once(__DIR__ . '/Vaultage.php');


$credentials = @$_SERVER['PATH_INFO'];
$db = new MemoryStorage();

$vaultage = new Vaultage($credentials, $db);
echo $vaultage->start();

?>to
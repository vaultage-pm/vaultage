<?php

require_once('io.php');
require_once('../../config.php');

/*
 * Sets up the connection to the database through PDO, and sets the encoding to UTF-8
 * EXCEPTION : May die() with the JSON {'error' : true, 'desc' : 'cannot connect to the BDD'} if something goes wrong.
 */

if (isset($db)) {
    echo("db.php included multiple times");
    die;
}

$db = null;
try
{
    $pdo_options[PDO::ATTR_ERRMODE] = PDO::ERRMODE_EXCEPTION;
    $pdo_options[PDO::MYSQL_ATTR_INIT_COMMAND] = "SET CHARACTER SET utf8";
    $db = new PDO('mysql:host=' . DEFAULT_DB_HOST . ';dbname=' . DEFAULT_DB_SELECTED, DEFAULT_DB_USER, DEFAULT_DB_USER_PASSWORD, $pdo_options);
}
catch (Exception $e) {
    end_with_json(array('error' => true, 'desc' => 'cannot connect to the DB'));
}
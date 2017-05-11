<?php

// By convention, force the system timezone to Swiss time
date_default_timezone_set('Europe/Zurich');

require("../../config.php");

// Regexp defining a legal username
define("USERNAME_PATTERN", "[a-zA-Z0-9_-]+");

header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, must-revalidate, no-store, private');

function hash_remote_key($pwd, $salt)
{
	return hash('sha256', $salt.$pwd);
}

/*
 * Sets the correct headers, and outputs the JSON {'error' : false, 'data' => $data}
 */
function outputToJSON($data)
{
	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
	header('Content-Type: application/json; charset=utf-8');
	die(json_encode($data));
}

/*
 * Checks that the url contains really the chain /user/password/do
 * To be used on top of SSL of course.
 */
function auth($db)
{
	$requestParams = @$_SERVER['PATH_INFO'];
	if (preg_match('#/('.USERNAME_PATTERN.')/([0-9a-fA-F]+)/do#', $requestParams, $matches)) {
		$username = $matches[1];
		$remote_key = $matches[2];
		$query = "SELECT id, remote_key, salt FROM vaultage_users WHERE username=:username";
		$params = array(
			':username' => $username
		);
		$req = $db->prepare($query);
		$queryResult = $req->execute($params);
		$data = $req->fetchAll();
		if (count($data) == 1) {
			$user = $data[0];
			$hashed = hash_remote_key($remote_key, $user['salt']);
			if ($hashed == $user['remote_key']) {
				return $user;
			}
		}
		outputToJSON(array('error' => true, 'desc' => 'auth failed'));
	} else {
		outputToJSON(array('error' => true, 'desc' => 'auth failed'));
	}
}

/*
 * Sets up the connection to the database through PDO, and sets the encoding to UTF-8
 * EXCEPTION : May die() with the JSON {'error' : true, 'desc' : 'cannot connect to the BDD'} if something goes wrong.
 */
function dbSetup()
{
	$db = null;
	try
	{
		$pdo_options[PDO::ATTR_ERRMODE] = PDO::ERRMODE_EXCEPTION;
		$pdo_options[PDO::MYSQL_ATTR_INIT_COMMAND] = "SET CHARACTER SET utf8";
		$db = new PDO('mysql:host=' . DEFAULT_DB_HOST . ';dbname=' . DEFAULT_DB_SELECTED, DEFAULT_DB_USER, DEFAULT_DB_USER_PASSWORD, $pdo_options);
	}
	catch (Exception $e) {
		outputToJSON(array('error' => true, 'desc' => 'cannot connect to the DB'));
	}
	return $db;
}

/*
 * Fetches the latest cipher text from the DB
 * EXCEPTION : may die() with the JSON {'error' : true, 'desc' : 'cannot fetch cipher'} if something goes wrong
 */
function getLastCipher($db, $user_id)
{
	$query = "SELECT data, last_hash FROM vaultage_data WHERE user_id=:user_id ORDER BY last_update DESC LIMIT 1";
	$params = array(
		':user_id' => $user_id
	);
	$req = $db->prepare($query);
	$queryResult = $req->execute($params);
	$data = $req->fetchAll();
	if(!$queryResult)
	{
		outputToJSON(array('error' => true, 'desc' => 'cannot fetch cipher'));
	}
	return $data;
}

/*
 * saves the new cipher in the database
 * Will NOT save if the cipher is the empty string "" or empty array "[]". rather, will die with the
 * JSON {'error' : true, 'desc' : 'will not erase'}
 */
function writeNewCipher($db, $newData, $last_hash, $new_hash, $user_id, $last)
{
	//filters
	if(empty($newData) || $newData == '[]')
	{
		outputToJSON(array('error' => true, 'desc' => 'will not erase'));
	}

	//check last hash
	if(isset($last[0]) && $last_hash != $last[0]['last_hash'])
	{
		outputToJSON(array('error' => true, 'not_fast_forward' => true));
	}

	//actual query
	$params = array(
		':data' => $newData,
		':hash' => $new_hash,
		':user_id' => $user_id
	);

	$query = "INSERT INTO vaultage_data (`user_id`, `last_update`, `data`, `last_hash`) VALUES
							(:user_id, NULL, :data, :hash)";

	$req = $db->prepare($query);
	$res = $req->execute($params);
}

/*
 * Updates that user's remote key.
 * TODO: This should be combined in an SQL transaction with the cipher update
 * to avoid leaving the DB in an inconsistent state in case only one of the
 * queries worked.
 */
function updateKey($db, $new_key, $user)
{
	$params = array(
		':user_id' => $user['id'],
		':remote_key' => hash_remote_key($new_key, $user['salt'])
	);
	$query = "UPDATE vaultage_users SET remote_key=:remote_key WHERE id=:user_id";

	$req = $db->prepare($query);
	$res = $req->execute($params);
}

/*
 * This will send a backup by mail if the option is enabled
 */
function backup($data)
{
	if(MAIL_BACKUP_ENABLED)
	{
		$header = "From: \"JWHITE-SERVER\"<jwhite@jwhitech.homeip.net>\n";
		$header .= "MIME-Version: 1.0\n";
		$corpus = "" . $data . "\n\n[EOF]\n";
		$res = mail(BACKUP_EMAIL, BACKUP_SUBJECT, $corpus, $header);
	}
}

//main
$db = dbSetup();
$user = auth($db);
$data = getLastCipher($db, $user['id']);

if(isset($_POST['data']) && isset($_POST['new_hash']))
{
	writeNewCipher($db, $_POST['data'], $_POST['last_hash'], $_POST['new_hash'], $user['id'], $data);
	if (isset($_POST['update_key']) && $_POST['update_key'] != null) {
		updateKey($db, $_POST['update_key'], $user);
	}
	$data = getLastCipher($db, $user['id']);
	backup($data[0][0]);
}
outputToJSON(array('error' => false, 'data' => $data[0][0]));

?>
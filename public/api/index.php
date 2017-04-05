<?php

// By convention, force the system timezone to Swiss time
date_default_timezone_set('Europe/Zurich');

require("../../config.php");

// Regexp defining a legal username
define("USERNAME_PATTERN", "[a-zA-Z0-9_-]+");

/*
 * Sets the correct headers, and outputs the JSON {'error' : false, 'data' => $data}
 */
function outputToJSON($data)
{
	header('Cache-Control: no-cache, must-revalidate');
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
		// TODO: hash the remote key
		$query = "SELECT id FROM vaultage_users WHERE remote_key=:remote_key AND username=:username";
		$params = array(
			':remote_key' => $remote_key,
			':username' => $username
		);
		$req = $db->prepare($query);
		$queryResult = $req->execute($params);
		$data = $req->fetchAll();
		if (count($data) != 1) {
			outputToJSON(array('error' => true, 'desc' => 'auth failed'));
		}
		return $data[0]['id'];
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
$user_id = auth($db);
$data = getLastCipher($db, $user_id);

if(isset($_POST['data']) && isset($_POST['last_hash']) && isset($_POST['new_hash']))
{
	writeNewCipher($db, $_POST['data'], $_POST['last_hash'], $_POST['new_hash'], $user_id, $data);
	$data = getLastCipher($db, $user_id);
	backup($data[0][0]);
}
outputToJSON(array('error' => false, 'data' => $data[0][0]));

?>
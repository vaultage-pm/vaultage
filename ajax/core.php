<?php

require("config.php");

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
function auth()
{
	$requestParams = @$_SERVER['PATH_INFO'];
	if(strcmp($requestParams,"/".AUTH_USER."/".AUTH_PWD_SHA1."/do") !== 0)
	{
		outputToJSON(array('error' => true, 'desc' => 'auth failed')); //leaks info but it should be OK in this setting
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
		outputToJSON(array('error' => true, 'desc' => 'cannot connect to the BDD'));
	}
	return $db;
}

/*
 * Fetches the latest cipher text from the BDD
 * EXCEPTION : may die() with the JSON {'error' : true, 'desc' : 'cannot fetch cipher'} if something goes wrong
 */
function getLastCipher($db)
{
	$query = "SELECT data FROM vaultage_data ORDER BY last_update DESC LIMIT 1";
	$req = $db->prepare($query);
	$queryResult = $req->execute();
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
function writeNewCipher($db, $newData)
{
	//filters
	if(empty($newData) || $newData == '[]')
	{
		outputToJSON(array('error' => true, 'desc' => 'will not erase'));
	}

	//actual query
	$params = array(
		':data' => $newData,
		':datetime' => date("Y-m-d H:i:s")
	);

	$query = "UPDATE vaultage_data SET
							`last_update` =:datetime,
							`data`       =:data";

	$req = $db->prepare($query);
	$res = $req->execute($params);
}

function backup($data)
{
	$res = mail(BACKUP_EMAIL, BACKUP_SUBJECT, $corpus);
}

//main
auth();
$db = dbSetup();
$data = getLastCipher($db);

if(isset($_POST['data']))
{
	writeNewCipher($db, $_POST['data']);
	$data = getLastCipher($db);
	backup($data[0][0]);
}
outputToJSON(array('error' => false, 'data' => $data[0][0]));

?>
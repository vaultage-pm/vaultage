<?php

require("config.php");

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

$db = dbSetup();

//drop table
$query = "TRUNCATE vaultage_data";
$req = $db->prepare($query);
$res = $req->execute();

//insert default table
$query = "INSERT INTO `vaultage_data` (`id`, `last_update`, `data`, `last_hash`) VALUES
(3, '2016-03-02 11:58:54', '{\"ct\":\"DxhB/2E+zOwRfS17qcdFZls0Um5qHokUcL/x2a7vEx5p6ibqIeczPG7ROSQXsFk6YKP1uPJe9C4KhvDT3ykHmmzTs26fIUCkT9e5jBhhYk56g4ZvodMhvoayjh5SAGcsqhptJR7LpHrByGM3GoWVtmyto8cwpeOIpzI2NQvVuGYyWylZC4U0kX4J3mqLd0XN7jdIGq3dF3cHmMePQI5vhN5th3W4C7jipAsDBPonSjBamv2yTmXsKDxra4+Pzks49VWWcrwuYcC6S6rJGiznOlzX2WcMSjBOUnzGZK8282QymH+gObfMFE3F+V8ADemWPtXt+M4MVe9Nn/P8zkvMjoLYbjhIs7ZAJpjF4JLPS4FbBD+1ga7nZvnIAsWWgnokKtgVhsasm2eC4H2PnJ+Fc4BNDoy0W3G9PuJ2xevxbSCTFk4y7B98lLEAQMcYTbapLS//HtgCb+j7kkZGxO9CeocvBWTKU62bf5WzzhbLtK96FaWyRxsdynGF0hz7rHm15XeflSHrPsPdLTlM+pTKwN7N4KLvxUPa585RAHDZ5IrRt172RNFXubcFVZnQocwQhg5lAs/9Cyo28bkyL9dwjSXlPBok+vnvJhYWOwRsD36q0sjbXEfZQV/RvLlexeC8FbNugGuRylj2ioRelZ9FOQm8Z/5wpHEbLMgAT8PZtdUoFJMWcFb/DIfQv1zOkbYOa3rQzupGQPWcJhJPgaC+T/rBrtjLkGGYyrsy1PsSnVE=\",\"iv\":\"4086d516e71dad3dd5150f91f0a1b15c\",\"s\":\"825fade10f3a7405\"}', 'vprgEYqun4BHKsW7QXkeRkb+IFs=');
";
$req = $db->prepare($query);
$res = $req->execute();

?>
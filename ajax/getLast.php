<?php


require("db.config.php");

//connection
$db = null;
try
{
	$pdo_options[PDO::ATTR_ERRMODE] = PDO::ERRMODE_EXCEPTION;
	$pdo_options[PDO::MYSQL_ATTR_INIT_COMMAND] = "SET CHARACTER SET utf8";
	$db = new PDO('mysql:host=' . DEFAULT_DB_HOST . ';dbname=' . DEFAULT_DB_SELECTED, DEFAULT_DB_USER, DEFAULT_DB_USER_PASSWORD, $pdo_options);

	$db->exec("SET CHARACTER SET utf8");
}
 catch (Exception $e) {
	die('Login to BDD failed : ' . $e->getMessage());
}

//filters
$query = "SELECT data FROM vaultage_data ORDER BY last_update DESC LIMIT 1";

$req = $db->prepare($query);
$res = $req->execute();
$result = $req->fetchAll();

if ($res) {
	die(json_encode(array('error' => false, 'data' => $result[0][0])));
} else {
	sleep(1);
	die(json_encode(array('error' => true)));
}

?>
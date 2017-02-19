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
(3, '2016-03-02 11:58:54', '{\"ct\":\"NpYJNVwZmyIO8aVpAV6Md04MgppeKa4K16MlupLBR4lM2rrLYM4yZ0l8njnzW5Urv/CkkDcEECvRVCWoN6dCMWle33gEE6VLly8Cm21RgPdyDpEO3QMsDTmqdmny3YCm8kl61WieAJSBCcUXC6/WFqm6+XPUb9P4ylYPMPAgi9FDc0b5LceqwdudFDZspHrCvtfALodjz5ylVYLTlXWLcb6hOJrslCSvIUAaE8nanUg=\",\"iv\":\"74b120326ff858a862d062c7443b29c0\",\"s\":\"9373095f6c028e27\"}', '06d5569c96f8cd648948ab54412a0fb6');
";
$req = $db->prepare($query);
$res = $req->execute();

?>
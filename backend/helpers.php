<?php

require_once(__DIR__ . '/config.php');
 
/*
 * Checks that the url contains really the chain /user/password/do
 * To be used on top of SSL of course.
 */
function tryAuth($authString = '')
{
    // use the full path to the document to get the authorization
    if(empty($authString)){
        $requestParams = @$_SERVER['PATH_INFO'];
    }

    $referenceString = "/".AUTH_USER."/".AUTH_PWD_SHA256."/vaultage_api";
    $authValid = (strcmp($authString,$referenceString) !== 0);
    return $authValid;
}

/*
 * This will send a backup by mail if the option is enabled
 */
function emailBackup($data)
{
    $header = "From: \"Vaultage\"<".BACKUP_EMAIL_FROM.">\n";
    $header .= "MIME-Version: 1.0\n";
    $corpus = "" . $data . "\n\n[EOF]\n";
    $res = mail(BACKUP_EMAIL_TO, BACKUP_SUBJECT, $corpus, $header);
}

/*
 * Returns an active PDO link to the MySQL Vaultage DB (as specified in config) or dies
 */
function getVaultageDB(){
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
    return $db;
}

/*
 * Fetches the latest cipher text from the DB
 * EXCEPTION : may die() with the JSON {'error' : true, 'desc' : 'cannot fetch cipher'} if something goes wrong
 */
function pullCipher($db)
{
    $query = "SELECT data, last_hash FROM vaultage_data ORDER BY last_update DESC LIMIT 1";
    $req = $db->prepare($query);
    $queryResult = $req->execute();
    $data = $req->fetchAll();
    if(!$queryResult)
    {
        outputToJSON(array('error' => true, 'desc' => 'cannot fetch cipher'));
    }
    return $data[0][0];
}

/*
 * saves the new cipher in the database
 * Will NOT save if the cipher is the empty string "" or empty array "[]". rather, will die with the
 * JSON {'error' : true, 'desc' : 'will not erase'}
 */
function pushCipher($db, $new_data, $last_hash, $new_hash, $force)
{
    //filters
    if(empty($new_data) || $new_data == '[]')
    {
        outputToJSON(array('error' => true, 'desc' => 'will not erase'));
    }

    //check last hash
    $last = getLastCipher($db);
    if(!$force && $last_hash != $last[0]['last_hash'] && $last[0]['last_hash'] != "INIT")
    {
        outputToJSON(array('error' => true, 'non_fast_forward' => true, 'desc' => 'last hash given '.$last_hash.' not matching actual last hash '.$last[0]['last_hash']));
    }

    $params = array(
        ':data' => $new_data,
        ':hash' => $new_hash,
        ':datetime' => date("Y-m-d H:i:s")
    );
    $query = "UPDATE vaultage_data SET
                            `last_update` =:datetime,
                            `data`       =:data, 
                            `last_hash`       =:hash";
    $req = $db->prepare($query);
    $res = $req->execute($params);
}
?>
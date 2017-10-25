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
?>
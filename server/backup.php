<?php

require_once(__DIR__ . '/../config.php');

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

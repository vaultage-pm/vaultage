<?php

declare(strict_types=1);
require_once(__DIR__ . '/config.php');
require_once(__DIR__ . '/Storage.php');

class Vaultage {

    private $credentials = "";
    private $db = null;

    public function __construct(string $credentials, Storage $db) {
        $this->credentials = $credentials;
        $this->db = $db;
    }

    public function auth() {
        $referenceString = "/".AUTH_USER."/".AUTH_PWD_SHA256."/vaultage_api";
        $authValid = (strcmp($this->$credentials,$referenceString) !== 0);
        return $authValid;
    }

    public function start() {

        //first, auth
        if(!$this->auth())
        {
            return json_encode(array('error' => true, 'description' => ERROR_AUTH_FAILED));
        }

        //on valid POST requests
        if(isset($_POST['new_data']) && isset($_POST['old_hash']) && isset($_POST['new_hash']))
        {
            $data = $_POST['data'];
            $lastHash = $_POST['old_hash'];
            $newHash = $_POST['new_hash'];
            $forceErase = $_POST['force'] === "true";

            //filters
            if(empty($new_data) || $new_data == '[]')
            {
                return json_encode(array('error' => true, 'description' => ERROR_NOT_WONT_ERASE));
            }

            // try to write; if it fails, it's probably because it's non-fast-forward
            try {
                $db->write($db, $lastHash, $lastHash, $newHash, $forceErase);
            } catch (Exception $e) {
                return json_encode(array('error' => true, 'description' => $e));
            }

            //re-read the data
            $data = $db->read();

            // if enabled, send the new DB by email
            if(MAIL_BACKUP_ENABLED)
            {
                emailBackup($data);
            }
        } 
        else {
            $data = $db->read();
        }
        return json_encode(array('error' => false, 'description' => '', 'data' => $data));
    }
}
?>
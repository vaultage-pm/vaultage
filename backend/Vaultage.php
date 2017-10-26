<?php

declare(strict_types=1);
require_once(__DIR__ . '/config.php');
require_once(__DIR__ . '/Storage.php');

/*
 * Main class. Will check for authentication, handle update requests, and answer with the database contents.
 */
class Vaultage {

    private $credentials = "";
    private $db = null;

    public function __construct(string $credentials, Storage $db) {
        $this->credentials = $credentials;
        $this->db = $db;
    }

    public function setCredentials(string $username, string $password){
        $this->credentials = "/".$username."/".$password."/vaultage_api";
    }

    public function auth() {
        $referenceString = "/".AUTH_USER."/".AUTH_PWD_SHA256."/vaultage_api";
        $authValid = false;
        if (strcmp($this->credentials,$referenceString) === 0) {
            $authValid = true;
        }
        return $authValid;
    }

    public function start() {

        //first, auth
        if(AUTH_ENABLED && !$this->auth())
        {
            return json_encode(array('error' => true, 'description' => ERROR_AUTH_FAILED));
        }

        //on valid POST requests
        if(isset($_POST['new_data']) && isset($_POST['old_hash']) && isset($_POST['new_hash']))
        {
            $new_data = $_POST['new_data'];
            $old_hash = $_POST['old_hash'];
            $new_hash = $_POST['new_hash'];
            $force_erase = ($_POST['force'] === true);

            //filters
            if(empty($new_data) || $new_data == '[]')
            {
                return json_encode(array('error' => true, 'description' => ERROR_NOT_WONT_ERASE));
            }

            // try to write; if it fails, it's probably because it's non-fast-forward
            try {
                $this->db->write($new_data, $old_hash, $new_hash, $force_erase);
            } catch (Exception $e) {
                return json_encode(array('error' => true, 'description' => $e->getMessage()));
            }

            //re-read the data
            $data = $this->db->read();

            // if enabled, send the new DB by email
            if(MAIL_BACKUP_ENABLED)
            {
                emailBackup($data);
            }
        } 
        else {
            $data = $this->db->read();
        }
        return json_encode(array('error' => false, 'description' => '', 'data' => $data));
    }
}
?>
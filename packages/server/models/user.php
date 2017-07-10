<?php

require_once(__DIR__ . '/../db.php');
require_once(__DIR__ . '/../crypto.php');

class User {

    static function get_by_name($username) {
        global $db;
        $query = "SELECT * FROM vaultage_users WHERE username=:username";
        $params = array(
            ':username' => $username
        );
        $req = $db->prepare($query);
        $queryResult = $req->execute($params);
        $data = $req->fetchAll();
        if (count($data) == 1) {
            return $data[0];
        }
        return null;
    }

    
    /*
    * Updates that user's remote key.
    * TODO: This should be combined in an SQL transaction with the cipher update
    * to avoid leaving the DB in an inconsistent state in case only one of the
    * queries worked.
    */
    static function update_key($user, $new_key) {
        global $db;
        $params = array(
            ':user_id' => $user['id'],
            ':remote_key' => hash_remote_key($new_key, $user['salt'])
        );
        $query = "UPDATE vaultage_users SET remote_key=:remote_key WHERE id=:user_id";

        $req = $db->prepare($query);
        $res = $req->execute($params);
    }

    static function set_tfa_secret($user, $secret) {
        global $db;
        $params = array(
            ':user_id' => $user['id'],
            ':tfa_secret' => $secret
        );
        $query = "UPDATE vaultage_users SET tfa_secret=:tfa_secret WHERE id=:user_id";

        $req = $db->prepare($query);
        $res = $req->execute($params);
    }
}
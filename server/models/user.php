<?php

require_once(__DIR__ . '/../db.php');
require_once(__DIR__ . '/../crypto.php');

class User {

    static function get_by_name($username) {
        global $db;
        $query = "SELECT id, remote_key, salt FROM vaultage_users WHERE username=:username";
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
    static function update_key($new_key, $user)
    {
        global $db;
        $params = array(
            ':user_id' => $user['id'],
            ':remote_key' => hash_remote_key($new_key, $user['salt'])
        );
        $query = "UPDATE vaultage_users SET remote_key=:remote_key WHERE id=:user_id";

        $req = $db->prepare($query);
        $res = $req->execute($params);
    }
}
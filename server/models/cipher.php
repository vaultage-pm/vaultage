<?php

require_once(__DIR__ . '/../db.php');
require_once(__DIR__ . '/../io.php');

class Cipher {

    /*
    * Fetches the latest cipher text from the DB
    * EXCEPTION : may die() with the JSON {'error' : true, 'desc' : 'cannot fetch cipher'} if something goes wrong
    */
    static function get_last($user_id)
    {
        global $db;
        $query = "SELECT id, data, last_hash FROM vaultage_data WHERE user_id=:user_id ORDER BY last_update DESC LIMIT 1";
        $params = array(
            ':user_id' => $user_id
        );
        $req = $db->prepare($query);
        $queryResult = $req->execute($params);
        $data = $req->fetchAll();
        if(!$queryResult || count(data) != 1)
        {
            return null;
        }
        return $data[0];
    } 

    /*
    * saves the new cipher in the database
    * Will NOT save if the cipher is the empty string "" or empty array "[]". rather, will die with the
    * JSON {'error' : true, 'desc' : 'will not erase'}
    */
    static function update($user_id, $newData, $new_hash, $last_hash)
    {
        global $db;

        //filters
        if(empty($newData) || $newData == '[]')
        {
            end_with_json(array('error' => true, 'desc' => 'will not erase'));
        }

        $cipher = self::get_last($user_id);

        //check last hash
        if($cipher['last_hash'] != NULL && $last_hash != $cipher['last_hash'])
        {
            end_with_json(array('error' => true, 'not_fast_forward' => true));
        }

        //actual query
        $params = array(
            ':data' => $newData,
            ':hash' => $new_hash,
            ':user_id' => $user_id
        );

        $to_delete = Cipher::get_last($user_id);

        $query = "INSERT INTO vaultage_data (`user_id`, `last_update`, `data`, `last_hash`) VALUES
                                (:user_id, NULL, :data, :hash)";

        $req = $db->prepare($query);
        $res = $req->execute($params);

        // Remove previous cipher
        // We might want to keep an history but for now we don't to avoid overloading
        // the DB with useless data
        if ($to_delete != null) {
            $query = "DELETE FROM vaultage_data WHERE id=:id";
            $params = array(
                ':id' => $to_delete['id']
            );
            $req = $db->prepare($query);
            $res = $req->execute($params);
        }
    }

}
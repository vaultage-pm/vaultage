<?php

declare(strict_types=1);
require_once(__DIR__ . '/config.php');

/*
 * A simple database where you must prove knowledge of the old content to update the content.
 * write (new_data, old_hash, new_hash) updates the database content to (new_data, new_hash) iff old_hash matches the hash of the database before this update. This prevents overwriting the database, and does serialize the update sequence.
 * This database has two implementation: MemoryStorage (non-persistent, used for tests), and the real DBStorage which uses a PDO driver to contact, e.g., a MySQL instance.
 * The DBStorage is *not* tested; it should be simple enough to verify that MemoryStorage and DBStorage perform the same actions.
 */
interface Storage {
    function read();
    function write(string $data, string $old_hash, string $new_hash, bool $force) ;
    function isConnected();
}

class MemoryStorage implements Storage {

    public $last_update = 0;
    public $data = "";
    public $last_hash = LAST_HASH_INITIAL_VALUE;


    function read() {
        return array($this->data, $this->last_hash);
    }

    function write(string $data, string $old_hash, string $new_hash, bool $force) {
        if(!$force && $old_hash != $this->last_hash && $this->last_hash != LAST_HASH_INITIAL_VALUE)
        {
            //return 'last hash given '.$old_hash.' not matching actual last hash '.$this->last_hash;
            throw new Exception(ERROR_NOT_FAST_FORWARD);
        }

        $this->last_update = time();
        $this->data = $data;
        $this->last_hash = $new_hash;
    }

    public function isConnected() {
        return true;
    }
}

class DBStorage implements Storage {
    public $db = null;

    /*
     * Directly tries to connect to the DB
     */
    public function __construct(string $host, string $defaultdb, string $username, string $password) {
        try
        {
            $pdo_options[PDO::ATTR_ERRMODE] = PDO::ERRMODE_EXCEPTION;
            $pdo_options[PDO::MYSQL_ATTR_INIT_COMMAND] = "SET CHARACTER SET utf8";
            $this->db = new PDO('mysql:host=' . $host . ';dbname=' . $defaultdb, $username, $password, $pdo_options);
        }
        catch (Exception $e) {
            throw $e;
            $this->db = null;
        }
    }

    public function isConnected() {
        return ($this->db != null);
    }

    public function read() {
        if(!$this->isConnected()){
            return array();
        }

        $query = "SELECT data, hash FROM vaultage_data ORDER BY last_update DESC LIMIT 1";
        $req = $this->db->prepare($query);
        $queryResult = $req->execute();
        $data = $req->fetchAll();
        if(!$queryResult)
        {
            return array();
        }
        return $data[0][0];
    }

    public function write(string $data, string $old_hash, string $new_hash, bool $force) {
        //as a first step, get the actual content to check the last hash
        $dbContents = $this->read();
        
        // if forced, never fail. 
        // if not, if hash differ, check if the old hash is has the initial value (i.e., the db is empty), if not, fail.
        if(!$force && $old_hash != $dbContents[0]['last_hash'] && $dbContents[0]['last_hash'] != LAST_HASH_INITIAL_VALUE)
        {
            //return 'last hash given '.$old_hash.' not matching actual last hash '.$this->last_hash;
            throw new Exception(ERROR_NOT_FAST_FORWARD);
        }

        $params = array(
            ':data' => $new_data,
            ':hash' => $new_hash,
            ':datetime' => date("Y-m-d H:i:s")
        );
        $query = "UPDATE vaultage_data SET
                                `last_update` =:datetime,
                                `data`       =:data, 
                                `hash`       =:hash";
        $req = $db->prepare($query);
        $res = $req->execute($params);
    }
}

?>
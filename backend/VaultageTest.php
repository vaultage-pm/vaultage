<?php
declare(strict_types=1);
require_once(__DIR__ . '/config.php');

use PHPUnit\Framework\TestCase;

/**
 * @covers Email
 */
final class VaultageTest extends TestCase
{
    public function testMemoryCanBeCreated()
    {
        $credentials = "";
        $db = new MemoryStorage();

        $vaultage = new Vaultage($credentials, $db);
        $this->assertInstanceOf(
            Vaultage::class,
            $vaultage
        );
    }

    public function testAuth()
    {
        // with empty credentials, it should fail
        $credentials = "";
        $db = new MemoryStorage();
        $vaultage = new Vaultage($credentials, $db);

        $this->assertEquals($vaultage->auth(), false); 

        // with right credentials, should succeed
        $vaultage->setCredentials(AUTH_USER, AUTH_PWD_SHA256);
        $this->assertEquals($vaultage->auth(), true); 

        // with wrong credentials, should not succeed
        $vaultage->setCredentials(AUTH_USER."2", AUTH_PWD_SHA256);
        $this->assertEquals($vaultage->auth(), false); 

        // with wrong credentials, should not succeed
        $vaultage->setCredentials(AUTH_USER, AUTH_PWD_SHA256."2");
        $this->assertEquals($vaultage->auth(), false); 

        // with wrong credentials, should not succeed
        $vaultage->setCredentials(AUTH_USER."2", AUTH_PWD_SHA256."2");
        $this->assertEquals($vaultage->auth(), false); 
    }

    public function testRunNoAuth(){

        // with empty credentials, it should fail
        $credentials = "";
        $db = new MemoryStorage();
        $vaultage = new Vaultage($credentials, $db);
        $res = $vaultage->start();

        if (AUTH_ENABLED) {
            $this->assertEquals($res, '{"error":true,"description":"'.ERROR_AUTH_FAILED.'"}'); 
        } else {
            $this->assertEquals($res, '{"error":false,"description":"","data":["","INIT"]}'); 
        }
    }

    public function testRunAuth(){

        // with empty credentials, it should fail
        $credentials = "";
        $db = new MemoryStorage();
        $vaultage = new Vaultage($credentials, $db);
        $vaultage->setCredentials(AUTH_USER, AUTH_PWD_SHA256);
        $res = $vaultage->start();

        $this->assertEquals($res, '{"error":false,"description":"","data":["","INIT"]}'); 

        //try pushing some data
        $_POST['new_data'] = "NEW_DATA";
        $_POST['old_hash'] = "???"; # OK since DB is on state "init"
        $_POST['new_hash'] = "HASH(NEW_DATA)";
        $_POST['force'] = false;
        $res = $vaultage->start();
        $this->assertEquals($res, '{"error":false,"description":"","data":["NEW_DATA","HASH(NEW_DATA)"]}');

        // Now pushing some newer data
        $_POST['new_data'] = "NEW_DATA_2";
        $_POST['old_hash'] = "HASH(NEW_DATA)";
        $_POST['new_hash'] = "HASH(NEW_DATA_2)";
        $_POST['force'] = false;
        $res = $vaultage->start();
        $this->assertEquals($res, '{"error":false,"description":"","data":["NEW_DATA_2","HASH(NEW_DATA_2)"]}');

        // Now pushing some concurrent, non-sequential data - should fail
        $_POST['new_data'] = "NEW_DATA_3";
        $_POST['old_hash'] = "HASH(NEW_DATA)";
        $_POST['new_hash'] = "HASH(NEW_DATA_3)";
        $_POST['force'] = false;
        $res = $vaultage->start();
        $this->assertEquals($res, '{"error":true,"description":"Error, cannot write; not fast_foward."}');

        // Now pushing some concurrent, non-sequential data - should succeed if forced
        $_POST['new_data'] = "NEW_DATA_3";
        $_POST['old_hash'] = "HASH(NEW_DATA)";
        $_POST['new_hash'] = "HASH(NEW_DATA_3)";
        $_POST['force'] = true;
        $res = $vaultage->start();
        $this->assertEquals($res, '{"error":false,"description":"","data":["NEW_DATA_3","HASH(NEW_DATA_3)"]}');
    }
}
?>
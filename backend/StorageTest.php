<?php
declare(strict_types=1);
require_once(__DIR__ . '/config.php');

use PHPUnit\Framework\TestCase;

/**
 * @covers Email
 */
final class StorageTest extends TestCase
{
    public function testMemoryCanBeCreated()
    {
        $this->assertInstanceOf(
            MemoryStorage::class,
            new MemoryStorage()
        );
    }

    public function testDatabaseCannotConnect()
    {
        $this->expectException(PDOException::class);

        $db = new DBStorage("localhost", "vaultage", "user", "pwd");

        $this->assertEquals($db->isConnected(), false); 
    }

    public function testMemoryDBUsage()
    {
        $db = new MemoryStorage();

        //default values
        $this->assertEquals($db->data,'');
        $this->assertEquals($db->last_hash,LAST_HASH_INITIAL_VALUE);

        $read1 = $db->read();
        $this->assertEquals($read1['data'],'');
        $this->assertEquals($read1['hash'],LAST_HASH_INITIAL_VALUE);

        // successful write
        $db->write("newdata", "???", "newhash", false);
        $this->assertEquals($db->data,'newdata');
        $this->assertEquals($db->last_hash,'newhash');

        $this->expectException(Exception::class);

        // unsuccessful write
        $db->write("newdata2", LAST_HASH_INITIAL_VALUE, "newhash2", false);
        $this->assertEquals($db->data,'newdata');
        $this->assertEquals($db->last_hash,'newhash');

        // successful write
        $db->write("newdata3", "newhash", "newhash3", false);
        $this->assertEquals($db->data,'newdata3');
        $this->assertEquals($db->last_hash,'newhash3');

        // successful write
        $db->write("newdata4", "NONSENSE", "newhash4", true);
        $this->assertEquals($db->data,'newdata4');
        $this->assertEquals($db->last_hash,'newhash4');

    }
}
?>
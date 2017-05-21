<?php

require_once(__DIR__ . '/access_control.php');
require_once(__DIR__ . '/models/cipher.php');
require_once(__DIR__ . '/models/user.php');
require_once(__DIR__ . '/io.php');
require_once(__DIR__ . '/backup.php');

function pull_handler() {
    $user = auth();
    $cipher = Cipher::get_last($user['id']);
    end_with_json(array('error' => false, 'data' => $cipher['data']));
}

function push_handler() {
    if(isset($_POST['data']) && isset($_POST['new_hash']) && isset($_POST['last_hash']))
    {
        $user = auth();
        Cipher::update($user['id'], $_POST['data'], $_POST['new_hash'], $_POST['last_hash']);

        $cipher = Cipher::get_last($user['id']);

        backup($cipher['data']);
        end_with_json(array('error' => false, 'data' => $cipher['data']));
    } else {
        end_with_json(array('error' => true, 'desc' => 'Bad request'));
    }
}

function changekey_handler() {
    if (isset($_POST['data']) && isset($_POST['new_hash']) && isset($_POST['last_hash']) && isset($_POST['update_key']) && $_POST['update_key'] != null)
    {
        $user = auth();
        Cipher::update($user['id'], $_POST['data'], $_POST['new_hash'], $_POST['last_hash']);

        $cipher = Cipher::get_last($user['id']);
        User::update_key($_POST['update_key'], $user);

        backup($cipher['data']);
        end_with_json(array('error' => false, 'data' => $cipher['data']));
    } else {
        end_with_json(array('error' => true, 'desc' => 'Bad request'));
    }
}

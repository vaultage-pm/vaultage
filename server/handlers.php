<?php

require_once(__DIR__ . '/access_control.php');
require_once(__DIR__ . '/models/cipher.php');
require_once(__DIR__ . '/models/user.php');
require_once(__DIR__ . '/io.php');
require_once(__DIR__ . '/backup.php');
require_once(__DIR__ . '/tfa/index.php');


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
        User::update_key($user, $_POST['update_key']);

        backup($cipher['data']);
        end_with_json(array('error' => false, 'data' => $cipher['data']));
    } else {
        end_with_json(array('error' => true, 'desc' => 'Bad request'));
    }
}

/**
 * Transmits configuration to the client.
 * Note that this handler does not require authentication so the username and
 * remoteKey portions of the URL can be set to any legal value.
 */
function config_handler() {
    end_with_json(array(
        'salts' => array(
            'USERNAME_SALT' => USERNAME_SALT
        )
    ));
}

function set_tfa_handler() {
    global $TFA_METHODS;
    $user = auth();
    if (isset($_POST['method'])) {

        $method = $TFA_METHODS[$_POST['method']];

        if (isset($_POST['confirm'])) {
            return $method->confirm($user, $_POST['confirm']);
        } else {
            return $method->generate($user);
        }
    } else {
        end_with_json(array('error' => true, 'desc' => 'Bad request'));
    }
}
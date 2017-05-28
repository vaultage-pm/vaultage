<?php

require_once(__DIR__ . '/io.php');
require_once(__DIR__ . '/crypto.php');
require_once(__DIR__ . '/constants.php');
require_once(__DIR__ . '/models/user.php');

/*
 * Checks that the url contains really the chain /user/password/do
 * To be used on top of SSL of course.
 */
function auth()
{
    global $db;
    if (preg_match(URL_PATTERN, @$_SERVER['PATH_INFO'], $matches)) {
        $username = $matches[1];
        $remote_key = $matches[2];
        $user = User::get_by_name($username);
        if ($user) {
            if ($user['remote_key'] == NULL) {
                User::update_key($remote_key, $user);
                return $user;
            }
            $hashed = hash_remote_key($remote_key, $user['salt']);
            if ($hashed == $user['remote_key']) {
                return $user;
            }
        }
        auth_fail();
    } else {
        auth_fail();
    }
}

function auth_fail() {
    end_with_json(array('error' => true, 'desc' => 'auth failed'));
}
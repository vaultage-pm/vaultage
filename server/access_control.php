<?php

require_once(__DIR__ . '/io.php');
require_once(__DIR__ . '/crypto.php');
require_once(__DIR__ . '/constants.php');
require_once(__DIR__ . '/models/user.php');
require_once(__DIR__ . '/tfa/index.php');



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
            if ($user['tfa_secret'] != null && !auth_tfa($user)) {
                return tfa_auth_fail();
            }
            if ($hashed == $user['remote_key']) {
                return $user;
            }
        }
        return auth_fail();
    } else {
        return auth_fail();
    }
}

function auth_tfa($user) {
    global $TFA_METHODS;
    $parts = parse_url($_SERVER['REQUEST_URI']);
    parse_str($parts['query'], $query);
    // First attempt a 2fa auth if requested
    if (isset($query['tfa_method']) && isset($query['tfa_request'])) {
        $method = $TFA_METHODS[$query['tfa_method']];
        return $method->auth($user, $query['tfa_request']);
    }
    // Second, attempt a cookie-based auth
    else if (isset($_COOKIE['tfa_tk'])) {
        return User::verify_tfa_token($user, $_COOKIE['tfa_tk']);
    }

    return 0;
}

function tfa_auth_fail() {
    end_with_json(array('error' => true, 'desc' => 'tfa auth failed', 'tfa_error' => 'bad token'));
}

function auth_fail() {
    end_with_json(array('error' => true, 'desc' => 'auth failed'));
}
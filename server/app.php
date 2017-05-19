<?php

require_once(__DIR__ . '/../vendor/autoload.php');

// By convention, force the system timezone to Swiss time
date_default_timezone_set('Europe/Zurich');

require_once(__DIR__ . '/constants.php');
require_once(__DIR__ . '/handlers.php');

class App {

    private $routes = array(
        // Route name must match ACTION_PATTERN
        "pull" => pull_handler,
        "push" => push_handler,
        "changekey" => changekey_handler,
        "settfa" => set_tfa_handler
    );

    function start() {
        if (preg_match(URL_PATTERN, @$_SERVER['PATH_INFO'], $matches) && array_key_exists(($action = $matches[3]), $this->routes)) {
            $this->routes[$action]();
        } else {
            end_with_json(array('error' => true, 'desc' => 'Bad request'));
        }
    }
}

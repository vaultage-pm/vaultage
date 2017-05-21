<?php

session_start();

use OTPHP\TOTP;

class TOTP_TFA {

    private function create_totp($username, $secret = null) {
        $totp = new TOTP($username, $secret);
        $totp->setIssuer(APP_NAME);
        return $totp;
    }

    function auth($user, $pin) {
        $totp = $this->create_totp($user['username'], $user['tfa_secret']);

        return $totp->verify($pin);
    }

    function generate($user) {
        $totp = $this->create_totp($user['username'], null);

        $_SESSION["totp_key"] = $totp->getSecret();

        return end_with_json(array('error' => false, 'data' => array('provisioning_uri' => $totp->getProvisioningUri())));
    }

    function confirm($user, $pin) {

        $totp = $this->create_totp($user['username'], $_SESSION["totp_key"]);

        if (!$totp->verify($pin)) {
            return end_with_json(array('error' => true, 'data' => 'bad pin'));
        }

        // Successful confirmation

        User::set_tfa_secret($user, $_SESSION["totp_key"]);
        $_SESSION["totp_key"] = null;

        end_with_json(array('error' => false, 'data' => array()));

    }
}
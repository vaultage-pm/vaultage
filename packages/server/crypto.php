<?php

function hash_remote_key($pwd, $salt)
{
    return hash('sha256', $salt.$pwd);
}
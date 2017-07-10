<?php

/* Always-on headers */
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache, must-revalidate, no-store, private');

/*
 * Sets the correct headers, and outputs the JSON {'error' : false, 'data' => $data}
 */
function end_with_json($data)
{
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
    header('Content-Type: application/json; charset=utf-8');
    die(json_encode($data));
}
<?php
if(!is_dir("web-cli")){
    die("Vaultage running headless, nothing here.");
} else {
    header("HTTP/1.1 301 Moved Permanently"); 
    header("Location: ./web-cli/index.html"); 
}
?>
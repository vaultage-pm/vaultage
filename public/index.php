<html>
<head>
    <title>Vaultage Server</title>
</head>
<body>
    <h1>Vaultage</h1>
    <p>This is a <a href="https://www.github.com/lbarman/vaultage">Vaultage</a> server. Depending on the configuration, it might be <i>headless</i> (in which case, you cannot interact with this server directly), or provide several <i>clients</i> to interact with. Clients are simply different user interfaces, providing the same functionalities.</p>
    <ul>
    <?php
    if(!(is_dir("web-cli") || is_dir("mobile-cli"))){
        echo '<li>Vaultage is running <b>headless</b>. Please install a client to interact with it!</li>';
    } else {
        if (is_dir("web-cli")){
            echo '<li>Vaultage is running with a <a href="./web-cli/"><b>web desktop client</b></a>.</li>';
        }
        if (is_dir("mobile-cli")){
            echo '<li>Vaultage is running with a <a href="./mobile-cli/"><b>web android/iPhone client</b></a>.</li>';
        }
    }
    ?>
    </ul>
    <p>Feeling lost ? Find more information on the <a href="https://www.github.com/lbarman/vaultage">Github</a>.</p>
</body>
</html>
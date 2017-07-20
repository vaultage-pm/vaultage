phonon.options({
    navigator: {
        defaultPage: 'login',
        animatePages: true,
        enableBrowserBackButton: true,
        templateRootDirectory: './templates'
    },
    i18n: null // for this example, we do not use internationalization
});

var API_URL = '../server/index.php';

var vault = new vaultage.Vault();

var app = phonon.navigator();

app.on({
    page: 'login',
    preventClose: false,
    content: 'login.html',
    readyDelay: 1
}, function(activity) {

    var loginFn = function(evt) {
        var username = $("#username").val()
        var password = $("#password").val()

        //sanity check
        if (username.trim() == "") {
            phonon.alert('Please enter your username', 'Error');
            return
        }
        if (password.trim() == "") {
            phonon.alert('Please enter your password', 'Error');
            return
        }

        var indicator = phonon.indicator('Logging in...', false);

        vault.auth(API_URL, username, password, function(err) {

            indicator.close();

            if (err) {
                phonon.alert(err.message, 'Error');
                return;
            }

            //success !
            document.location = "#!vault";
        });
    };

    activity.onCreate(function() {
        document.querySelector('#login').on('tap', loginFn);
    });
});

app.on({
    page: 'logout',
    preventClose: false,
    content: 'logout.html'
});

app.on({
    page: 'vault',
    preventClose: false,
    content: 'vault.html'
}, function(activity) {

    activity.onReady(function() {

        $('#dbSearchField').on('input', $.debounce(250, search))

        if (!vault.isAuth()) {
            phonon.alert('Please login first.', 'Error');
        } else {
            var nb_entries = vault.getNbEntries();
            if (nb_entries !== 0) {
                $('#dbStatus').html('Pull success, retrieved ' + nb_entries + ' entries.');
            } else {
                $('#dbStatus').html('Pull success, 0 entries. Future entries will be encrypted with the provided local password.');
            }
        }
    });
});

app.on({
    page: 'vault_add',
    preventClose: false,
    content: 'vault_add.html'
}, function(activity) {

    var pwdGenFn = function(evt) {
        var pwd = generatePassword(15, false, true, true).join('');
        $("#passwordWrapper").addClass('input-filled');
        $("#passwordInput").val(pwd);
    };

    var addEntryFn = function(evt) {

        if (!vault.isAuth()) {
            phonon.alert("Please login first.", "Error");
            return;
        }

        var title = $("#titleInput").val();
        var username = $("#usernameInput").val();
        var url = $("#urlInput").val();
        var password = $("#passwordInput").val();

        var confirm = phonon.confirm('<p>Creating a new entry...</p>' +
            '<p>' +
            'Title: ' + title + '<br/>' +
            'Username: ' + username + '<br/>' +
            'Url: ' + url + '<br/>' +
            'Password: ' + password + '<br/>' +
            '</p>' +
            '<p>Does this look OK ?</p>', 'Confirmation');

        confirm.on('confirm', function() {


            var indicator = phonon.indicator('Adding password...', false);

            //add the entry
            vault.addEntry({
                title: title,
                login: username,
                url: url,
                password: password
            });

            //save the new DB
            vault.save(function(err) {
                if (err) {
                    if (err.code === vaultage.ERROR_CODE.NOT_FAST_FORWARD) {
                        indicator.close();
                        phonon.alert("Cannot push : the server's information is newer than the one being pushed.<br />Please pull again, and retry", "Error");
                        return;
                    } else {
                        indicator.close();
                        phonon.alert("Vault error:" + err + ".<br />Please pull again, and retry", "Error");
                        return;
                    }
                } else {
                    //reset form
                    $("#titleInput").val('');
                    $("#usernameInput").val('');
                    $("#urlInput").val('');
                    $("#passwordInput").val('');

                    indicator.close();
                    phonon.alert("Success!");
                }
            });
        });
        confirm.on('cancel', function(value) {
            phonon.alert('Canceled!');
        });
    }

    activity.onCreate(function() {
        document.querySelector('#pwdGen').on('tap', pwdGenFn);
        document.querySelector('#entryAdd').on('tap', addEntryFn);
    });

    activity.onReady(function() {
        if (!vault.isAuth()) {
            phonon.alert('Please login first.', 'Error');
        }
    });
});

app.on({
    page: 'settings',
    preventClose: false,
    content: 'settings.html'
}, function(activity) {

    var validateFn = function(evt) {

        var url = $("#serverUrl").val()

        if (url == "") {
            phonon.alert('Please enter a URL', 'Error');
        } else {
            console.log("Contacting", url)
            $.ajax({
                type: 'GET',
                url: url,
                error: function() {
                    phonon.alert('The given URL cannot be contacted', 'Error');
                }
            });
        }
    };

    activity.onCreate(function() {
        $("#serverUrl").val(API_URL);
        document.querySelector('#validate').on('tap', validateFn);
    });
});

// Let's go!
app.start();
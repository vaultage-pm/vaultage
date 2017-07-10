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

app.on({page: 'login', preventClose: false, content: 'login.html', readyDelay: 1}, function(activity) {

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

        //loader
        var indicator = phonon.indicator('Logging in...', false);

        vault.auth(API_URL, username, password, function(err) {

            //close loader
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

app.on({page: 'logout', preventClose: false, content: 'logout.html'});

app.on({page: 'vault', preventClose: false, content: 'vault.html'}, function(activity) {

    activity.onCreate(function() {
        if (!vault.isAuth()) {
            tphonon.alert("Please login first.", 'Error');
        }
    });
});

app.on({page: 'vault_add', preventClose: false, content: 'vault_add.html'}, function(activity) {

    var pwdGenFn = function(evt) {
        var pwd = generatePassword(15, false, true, true).join('');
        $("#passwordWrapper").addClass('input-filled');
        $("#password").val(pwd);
    };

    activity.onCreate(function() {
        document.querySelector('#pwdGen').on('tap', pwdGenFn);
    });
});

app.on({page: 'settings', preventClose: false, content: 'settings.html'}, function(activity) {

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

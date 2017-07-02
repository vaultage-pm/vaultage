phonon.options({
    navigator: {
        defaultPage: 'login',
        animatePages: true,
        enableBrowserBackButton: true,
        templateRootDirectory: './templates'
    },
    i18n: null // for this example, we do not use internationalization
});


var app = phonon.navigator();


app.on({page: 'login', preventClose: false, content: null, readyDelay: 1}, function(activity) {

    var loginFn = function(evt) {
        var target = evt.target;

        phonon.alert('The given URL cannot be contacted', 'Error');
    };

    activity.onCreate(function() {
        document.querySelector('#login').on('tap', loginFn);
    });
});

app.on({page: 'settings', preventClose: false, content: null, readyDelay: 1}, function(activity) {

    var validateFn = function(evt) {
        var target = evt.target;

        phonon.alert('The given URL cannot be contacted', 'Error');
    };

    activity.onCreate(function() {
        document.querySelector('#validate').on('tap', validateFn);
    });
});

// Let's go!
app.start();

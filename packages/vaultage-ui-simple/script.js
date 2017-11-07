var vault = new vaultage.Vault(SALTS);

var entries = [];

function printAllEntries(){
    $('#result').html('');

    var stringBuilder = "";
    entries.forEach(function(element) {
        stringBuilder += formatEntry(element);
    });

    $('#result').html(stringBuilder);
}

function formatEntry(e){
    return '<div class="row">'+
                '<p>#'+e.id+' &nbsp; <b>'+e.title+'</b> &nbsp; '+e.login+' &nbsp;<b>:</b>&nbsp; '+e.password+' &nbsp;<b>@</b>&nbsp; '+e.url+'</p>'+
            '</div>';
}

function logout(){
    vault.unauth();
    entries = [];
    $('#password').val('')
    printAllEntries();
}

function search(){
    var searchTerm = $('#search').val().trim();
    entries = vault.findEntries(searchTerm);
    printAllEntries();
}

function authAndPull() {
    $('#decrypted_label').html('');

    var username = $('#username').val().trim()
    var password = $('#password').val().trim()

    vault.auth(REMOTE_URL, username, password, function(err){ 
        console.log(err);
    if(err != null) {
        $('#decrypted_label').html('Cannot decrypt. ' + err);
    } else {
        $('#decrypted_label').html('Decrypted '+vault.getNbEntries()+' entries');
        search();
        $('#decrypt').html('Logout');
    }});
    $('#decrypted_label').css('display', 'inline-block');
}

// bind button and searchbar actions
$( "#decrypt" ).click(function() {
    if(!vault.isAuth()){
        authAndPull();
    } else {
        logout();
    }
});

$( "#search" ).on('input', function() {
    if(!vault.isAuth()){
        return '';
    }
    search();  
});

// set the default value to the username field
$(function() {
    $('#username').val(DEFAULT_USER);
})
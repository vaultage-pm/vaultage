
var vault = new vaultage.Vault();

termHook = 0;

jQuery(document).ready(function($) {
    var id = 1;

    $('body').terminal(function(command, term) {

        termHook = term;
        if (command.lastIndexOf("man", 0) === 0 || command.lastIndexOf("help", 0) === 0) {

            var pageName = command.replace("man ", "").replace("help ", "").toLowerCase();
            var manPage = MANPAGES[pageName]; // Defined in manpages.js

            if (manPage) {
                term.echo(manPage);
            } else {
                var commands = [];
                var pageNames = Object.keys(MANPAGES);
                for (var i in pageNames) {
                    commands.push('<i>' + pageNames[i] + '</i>');
                }
                term.echo("available commands : " + commands.join(', ') + ".")
                term.echo("you can get additional information by typing <i>help CMD</i>, e.g. <i>help loadauth</i> (<i>man CMD</i> is an alias)");
            }

        } else if (command == 'welcome') {

            term.echo("<pre>" +
            " ************************************************* \n" +
            "                   _ _                             \n" +
            "                  | | |                            \n" +
            " __   ____ _ _   _| | |_ __ _  __ _  ___           \n" +
            " \\ \\ / / _` | | | | | __/ _` |/ _` |/ _ \\       \n" +
            "  \\ V / (_| | |_| | | || (_| | (_| |  __/         \n" +
            "   \\_/ \\__,_|\\__,_|_|\\__\\__,_|\\__, |\\___|   \n" +
            "                               __/ |               \n" +
            "                              |___/                \n" +
            "\n" +
            " Author : Ludovic Barman\n" +
            " Github : <a href=\"https://github.com/lbarman/vaultage/\">github.com/lbarman/vaultage</a>\n" +
            " \n" +
            " Vaultage is a password manager.\n" +
            " It is in-browser, and can be accessed from all your devices.\n" +
            " The password are encrypted/decrypted in your browser : no plaintext goes through the network.\n" +
            " It is self-hosted : install it securely on your own server (see on github).\n" +
            " It is open-source : please report any bugs on github; I'll do my best to fix them.\n" +
            " \n" +
            " Security technologies used : <a href=\"https://code.google.com/archive/p/crypto-js/\">CryptoJS</a> and the <a href=\"https://bitwiseshiftleft.github.io/\">Stanford Javascript Crypto Library</a>, using SHA256 as a hash function, and AES (256bits).\n" +
            " Plaintext passwords never leave your computer's memory. \n" +
            " \n" +
            " Trouble getting started ?\n" +
            " \n" +
            " Typical workflow : \n" +
            " 1. <i>auth</i>, or <i>loadauth</i>\n" +
            " 2. <i>new</i>, or <i>gen</i>\n" +
            " 3. <i>get TERM</i>, where TERM is one of your password's login, title, url, etc.\n" +
            " 4. maybe <i>edit</i>, or <i>rm</i>\n" +
            " 5. <i>saveauth</i>\n" +
            " 6. <i>logout</i>\n" +
            " \n" +
            " Further questions on a command ? use the <i>man COMMAND</i> ! (<i>help COMMAND</i> is an alias)\n" +
            " \n" +
            " ************************************************* \n" +
            "</pre>");

        } else if (command == 'auth') {
            promptValues(['user', 'password'], function(user, password) {
                term.echo('Trying to authenticate...');
                // Defer because the key derivation is blocking the main thread
                defer(function() {
                    vault.auth(API_URL, user, password, function(err) {
                        if (err) {
                            console.error(err);
                            console.log(err.cause);
                            return term.echo(err);
                        }
                        
                        var nb_entries = vault.getNbEntries();
                        if (nb_entries !== 0) {
                            term.echo('Pull success, retrieved ' + nb_entries + ' entries.');
                        } else {
                            term.echo('Pull success, 0 entries. Future entries will be encrypted with the provided local password.');
                        }
                    });
                });
            });
        } else if (command.lastIndexOf("get", 0) === 0) {

            search(command, term);

        }else if (command == "ls") {

            search("get *", term);

        } else if (command.lastIndexOf("rm", 0) === 0) {

            if (!vault.isAuth()) {
                term.echo("You should <i>auth</i> first.");
            } else {
                var searchKey = command.replace("rm ", "").toLowerCase();
                term.echo("Removing ID \"" + searchKey + "\"");
                var entry = vault.getEntry(searchKey);
                term.echo('Going to remove entry "' + (entry.title) + '".');
                term.push(function(command) {
                    if (command.match(/^(y|yes)$/i)) {

                        vault.remove(entry.id);
                        saveCipher(oldNotesLength, term);

                        term.pop();
                        history.enable();
                    } else if (command.match(/^(n|no)$/i)) {
                        term.pop();
                        history.enable();
                    }
                }, {
                    prompt: 'Are you sure? '
                });
            }

        } else if (command == "gen") {

            if (!isAuth) {
                term.echo("You should <i>auth</i> first.");
            } else {
                term.push(function(title, term) {
                    term.push(function(login, term) {
                        term.push(function(url, term) {
                            genEntry(title, login, url, term);
                            term.pop();
                            term.pop();
                            term.pop();
                        }, {
                            name: 'gen',
                            prompt: 'url : '
                        });
                    }, {
                        name: 'gen',
                        prompt: 'login : '
                    });
                }, {
                    name: 'gen',
                    prompt: 'title : '
                });
            }

        } else if (command == "new") {
            if (!vault.isAuth()) {
                term.echo("You should <i>auth</i> first.");
            } else {
                promptValues(['title', 'login', 'url', 'password'],
                function(title, login, url, password) {
                    addEntry(title, login, url, password, term);
                });
            }
        } else if (command.lastIndexOf("edit", 0) === 0) {

            if (!vault.isAuth()) {
                term.echo("You should <i>auth</i> first.");
            } else {
                var searchKey = command.replace("edit ", "").toLowerCase();
                var entry;
                try {
                    entry = vault.getEntry(searchKey);
                } catch(e) {
                    if (e.code === vaultage.ERROR_CODE.NO_SUCH_ENTRY) {
                        term.echo("Could not find this ID");
                    } else {
                        term.echo('Unexpected error ' + e);
                    }
                    return;
                }

                var s = '<span class="entry"><span class="id">(' + entry.id + ')</span> <span class="title">' + entry.title + "</span> -> <span class=\"login\">" + entry.login + "</span> @ <span class=\"url\">" + entry.url + "</span> : <span class=\"content\">" + entry.password + "</span></span>";

                term.echo("Going to edit the following entry :");
                term.echo(s);

                term.echo("(leave blank to keep previous value)");

                promptValues(['title (' + entry.title + ')', 'login (' + entry.login + ')', 'url (' + entry.url + ')', 'password (****)'], 
                        function(title, login, url, password) {
                    globalKeyUpValue = "";

                    entry = editEntry(entry.id, title, login, url, password, term);

                    var s = '<span class="entry"><span class="id">(' + entry.id + ')</span> <span class="title">' + entry.title + "</span> -> <span class=\"login\">" + entry.login + "</span> @ <span class=\"url\">" + entry.url + "</span> : <span class=\"content\" ondblclick=\"addUsage("+entry.id+")\">" + entry.password + "</span></span>";

                    term.echo("The entry #" + entry.id + " is now :");
                    term.echo(s);
                });
            }

        } else if (command.lastIndexOf("rotate", 0) === 0) {

            if (!isAuth) {
                term.echo("You should <i>auth</i> first.");
            } else {
                var searchKey = command.replace("rotate ", "").toLowerCase();

                var filtered = _.filter(notes, function(el) {
                    var id = (el.id == undefined) ? '' : (el.id + '');
                    return (id.indexOf(searchKey) != -1);
                });

                if (filtered.length == 0) {
                    term.echo("Could not find this ID")
                } else {
                    var s = '<span class="entry"><span class="id">(' + filtered[0].id + ')</span> <span class="title">' + filtered[0].title + "</span> -> <span class=\"login\">" + filtered[0].login + "</span> @ <span class=\"url\">" + filtered[0].url + "</span> : <span class=\"content\">" + filtered[0].content + "</span></span>";

                    term.echo("Going to rotate the following entry :");
                    term.echo(s);

                    var newPwd = generatePassword(15, false, true, true).join('');
                    editEntry(filtered[0].id, filtered[0].title, filtered[0].login, filtered[0].url, newPwd, term)

                    var s = '<span class="entry"><span class="id">(' + filtered[0].id + ')</span> <span class="title">' + filtered[0].title + "</span> -> <span class=\"login\">" + filtered[0].login + "</span> @ <span class=\"url\">" + filtered[0].url + "</span> : <span class=\"content\" ondblclick=\"addUsage("+filtered[0].id+")\">" + filtered[0].content + "</span></span>";

                    term.echo("The entry #" + filtered[0].id + " is now :");
                    term.echo(s);
                }
            }

        } else if (command == "push") {
            saveCipher(notes.length, term);
        } else if (command == "pull") {
            vault.refresh(function(err, vault) {
                if (!err) {
                    term.echo("Pull success, retrieved " + vault.getNbEntries() + " entries.");
                } else {
                    handleVaultageError(err, term);
                }
            });
        } else if (command == "saveauth") {

            if (!isAuth) {
                term.echo("You should <i>auth</i> first.");
            } else {
                Cookies.set('username', username, {
                    expires: 7,
                    secure: true
                });
                Cookies.set('remotePassword', remotePassword, {
                    expires: 7,
                    secure: true
                });
            }

        //if saveauth XXX
        } else if (command.lastIndexOf("saveauth", 0) === 0) {

            if (!isAuth) {
                term.echo("You should <i>auth</i> first.");
            } else {
                var days = command.replace("saveauth ", "").toLowerCase();

                if(!jQuery.isNumeric(days)) {
                    term.echo("Syntax : saveauth[ NUMBER=7]");
                }else {
                    term.echo("Saving cooking for "+days+" days");

                    days = parseInt(days)

                    Cookies.set('username', username, {
                        expires: days,
                        secure: true
                    });
                    Cookies.set('remotePassword', remotePassword, {
                        expires: days,
                        secure: true
                    });
                }


            }


        } else if (command == "pwd") {

            if (!vault.isAuth()) {
                term.echo("You should <i>auth</i> first.");
            } else {
                promptValues(['new master password', 'new master password (repeat)'], 
                        function(pass1, pass2) {
                    if (pass1 !== pass2) {
                        term.echo("Passwords don't match, aborting.");
                        return;
                    }
                    term.echo("Attempting to update the master password...");
                    // Defer because the key derivation is blocking the main thread
                    defer(function() {
                        vault.updateMasterPassword(pass1, function(err) {
                            if (err) {
                                term.echo("Failed to update the master password");
                                term.echo(err);
                            } else {
                                term.echo("Update successful!");
                            }
                        });
                    });
                });
            }

        } else if (command == "loadauth" || command == "la") {

            term.echo('Unavailable.\nThis feature needs to be refactored using server-side token distribution.');

        } else if (command == "clear") {

            term.clear();

        } else if (command == "logout") {

            vault.unauth();
            term.echo('logged out');

        } else if (command == "clearauth") {

            Cookies.remove('username');
            Cookies.remove('remotePassword');

        }  else {
            term.echo('unknow command "' + command + '"');
            term.echo("available commands : <i>auth</i>, <i>get TERM</i>, <i>new</i>, <i>gen</i>, <i>edit ID</i>, <i>rm ID</i>, <i>ls</i>, <i>push</i>, <i>pull</i>, <i>clear</i>, <i>logout</i>, <i>saveauth</i>, <i>loadauth</i>, <i>clearauth</i>, <i>pwd</i>.")
        }

        function promptValues(names, cb) {
            var i = 0;
            var values = [];
            if (/password/.test(names[i])) {
                term.set_mask('*');
            }
            term.push(function(data, term) {
                if (i < names.length) {
                    i++;
                    values.push(data);
                    term.set_mask(false);
                    if (i === names.length) {
                        term.pop();
                        term.set_mask(false); // Just in case first param was a password
                        cb.apply(this, values);
                    } else {
                        if (/password/.test(names[i])) {
                            term.set_mask('*');
                        }
                        term.set_prompt(names[i] + ': ');
                    }
                }
            }, {
                prompt: names[0] + ': '
            });
        };

    }, {
        greetings: "Vaultage v3.0-dev <br />*************<br />available commands : <i>auth</i>, <i>get TERM</i>, <i>new</i>, <i>gen</i>, <i>edit ID</i>, <i>rm ID</i>, <i>ls</i>, <i>push</i>, <i>pull</i>, <i>clear</i>, <i>logout</i>, <i>saveauth</i>, <i>loadauth</i>, <i>clearauth</i>, <i>pwd</i>.<br />*************<br /><span class=\"welcome\">New here ? type <i>welcome</i></span>",
        onBlur: function() {
            // prevent loosing focus
            return false;
        }
    });
});

var isAuth = false;
var notes = [];
var username = ""
var remotePassword = ""
var localPassword = ""

function defer(cb) {
    setTimeout(cb, 0);
}

function handleVaultageError(err, term) {
    if (err) {
        if (err.code == vaultage.ERROR_CODE.NOT_AUTHENTICATED) {
            term.echo('You should <i>auth</i> first.');
        } else {
            term.echo(err);
        }
    }
};

function editEntry(id, title, login, url, password, term) {

    var updated = vault.updateEntry(id, {
        title: title,
        login: login,
        url: url,
        password: password
    });

    saveCipher(notes.length, term);

    return updated;
}

function addEntry(title, login, url, password, term) {

    var oldNotesLength = vault.getNbEntries();

    vault.addEntry({
        title: title,
        login: login,
        url: url,
        password: password
    });

    saveCipher(oldNotesLength, term);
}

function genEntry(title, login, url, term) {

    var pwd = generatePassword(15, false, true, true).join('');
    addEntry(title, login, url, pwd, term);
}

function highlight(terms, baseString) {
    var i = 1
    _.each(terms, function(term) {
        baseString = baseString.replace(new RegExp("(" + term + ")", 'gim'), '<span class="highlight' + i + '">$1</span>');
        i++
    });

    return baseString
}

function saveCipher(oldNodeLength, term) {
    vault.save(function(err) {
        if (err) {
            if (err.code === vaultage.ERROR_CODE.NOT_FAST_FORWARD) {
                term.echo("Cannot push : the server's information is newer than the one being pushed. Please pull (it will remove your non-previously-pushed changes) and retry.");
            } else {
                handleVaultageError(err, term)
            }
        } else {
            term.echo("Push success, went from " + oldNodeLength + " to " + vault.getNbEntries() + " entries.");
        }
    });
}

/** Function count the occurrences of substring in a string;
 * @param {String} string   Required. The string;
 * @param {String} subString    Required. The string to search for;
 * @param {Boolean} allowOverlapping    Optional. Default: false;
 * @author Vitim.us http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 */
function countOccurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}

function search(command, term) {

     if (!vault.isAuth()) {
        term.echo("You should <i>auth</i> first.");
    } else if (searchKeys == "" || searchKeys == "get") {
        term.echo("Syntax : <i>get</i> SEARCH_TERM");
    } else {

        var searchKeys = command.replace("get ", "").toLowerCase();
        var filtered;
        var matcher = _.property('id');
        var nofilter = false;
        var op = "and"

        if (searchKeys.lastIndexOf("-or ", 0) === 0) {
            op = "or"
            searchKeys = searchKeys.replace("-or ", "")
        }

        if (searchKeys == "*") {
            nofilter = true;
            filtered = vault.findEntries("");
        } else {
            var searchKeysParts = searchKeys.split(" ");
            for (var i in searchKeysParts) {
                let matchSet = vault.findEntries(searchKeysParts[i]);

                if (filtered == null) {
                    filtered = matchSet;
                } else if (op === 'and') {
                    filtered = _.intersectionBy(matchSet, filtered, matchSet, matcher);
                } else {
                    filtered = _.unionBy(matchSet, filtered, matchSet, matcher);
                }
            }
        }

        filtered = _.uniq(filtered || [], function(item) {
            return item.id;
        });

        //this could be done in one step with the above function
        var sorted = _.sortBy(filtered, function(el) {
            var id = (el.id == undefined) ? '' : ("" + el.id).toLowerCase();
            var title = (el.title == undefined) ? '' : el.title.toLowerCase();
            var url = (el.url == undefined) ? '' : el.url.toLowerCase();
            var login = (el.login == undefined) ? '' : el.login.toLowerCase();

            var numMatched = 0

            _.each(searchKeysParts, function(searchKey) {
                var s = searchKey.toLowerCase().trim()

                numMatched += countOccurrences(id, s, false)
                numMatched += countOccurrences(title, s, false)
                numMatched += countOccurrences(url, s, false)
                numMatched += countOccurrences(login, s, false)
            });

            return 1000 - numMatched; //ugly trick to reverse the order easily
        });

        _.each(sorted, function(obj) {

            reUse = reUseTable[obj.content]
            reUseText = '<span class="reUse' + (reUse == 1 ? '1' : 'X') + '">'+(reUse == 1 ? 'not re-used' : ('re-used '+(reUse-1)+' times'))+'</span>'

            count = 0
            if (typeof obj.usageCount !== "undefined") {
                count = obj.usageCount
            }
            countText = '<span class="usage">accessed '+(count)+' times</span>'

            if (nofilter) {

                var s = '<span class="entry"><span class="id">(' + obj.id + ')</span> <span class="title">' + obj.title + "</span> -> <span class=\"login\">" + obj.login + "</span> @ <span class=\"url\">" + obj.url + "</span> : <span class=\"content blurred\" ondblclick=\"addUsage("+obj.id+")\">" + obj.password + "</span> " + reUseText + "</span> " + countText + "</span>";

                term.echo(s)

            } else {
                var _id = highlight(searchKeysParts, obj.id)
                var _title = highlight(searchKeysParts, obj.title)
                var _login = highlight(searchKeysParts, obj.login)
                var _url = highlight(searchKeysParts, obj.url)
                var _pwd = highlight(searchKeysParts, obj.password)


                var s = '<span class="entry"><span class="id">(' + _id + ')</span> <span class="title">' + _title + "</span> -> <span class=\"login\">" + _login + "</span> @ <span class=\"url\">" + _url + "</span> : <span class=\"content blurred\" ondblclick=\"addUsage("+_id+")\">" + _pwd + "</span> " + reUseText + "</span> " + countText + "</span>";

                term.echo(s)
            }
        })

        new Clipboard('.content');
    }
}
function addUsage(id){
    var index = 0;

    while (index < notes.length) {
        var nodeId = (notes[index].id == undefined) ? '' : (notes[index].id + '');
        if (nodeId == id) {
            break;
        }
        index++
    }

    if (notes[index].id != id) {
        termHook.echo("WARNING: addUsage did nothing, ID not found")
    }


    oldNotesLength = notes.length;
    oldHash = hash(JSON.stringify(notes));

    if (typeof notes[index].usageCount === "undefined"){
        notes[index].usageCount = 0
    }
    notes[index].usageCount++

    saveCipher(oldNotesLength, termHook);
}

reUseTable = new Object()
function addToReuseTable(pwd){
    if (typeof reUseTable[pwd] === "undefined"){
        reUseTable[pwd] = 0;
    }
    reUseTable[pwd]++;
}
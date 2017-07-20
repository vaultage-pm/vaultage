function search() {
    var searchKeys = $('#dbSearchField').val();
    console.log("Searching for", searchKeys);

    if (searchKeys.trim() == "") {
        var o = '<li>' +
            '<i>Please type a search term...</i>' +
            '</li>'
        $('#searchResults').html(o);
        return;
    }

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

    console.log(filtered)

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

    output = '';

    _.each(sorted, function(obj) {

        reUse = reUseTable[obj.content]
        reUseText = '<p class="reUse' + (reUse == 1 ? '1' : 'X') + '">' + (reUse == 1 ? 'not re-used' : ('re-used ' + (reUse - 1) + ' times')) + '</p>'

        count = 0
        if (typeof obj.usageCount !== "undefined") {
            count = obj.usageCount
        }
        countText = '<p class="usage">accessed ' + (count) + ' times</p>'

        var _id = obj.id
        var _title = obj.title
        var _login = obj.login
        var _url = obj.url
        var _pwd = obj.password

        if (!nofilter) {
            _id = highlight(searchKeysParts, obj.id)
            _title = highlight(searchKeysParts, obj.title)
            _login = highlight(searchKeysParts, obj.login)
            _url = highlight(searchKeysParts, obj.url)
            _pwd = highlight(searchKeysParts, obj.password)
        }

        var s = '<li>' +
            '<i class="pull-right icon icon-expand-more">' +
            '</i><a href="#link1" class="padded-list">' + _title + '</a>' +
            '<div class="accordion-content">' +
            '<p><span class="vaultageEntryLabel">Login:</span><span class="login">' + _login + '</span></p>' +
            '<p><span class="vaultageEntryLabel">URL:</span><span class="url">' + _url + '</span></p>' +
            '<p><span class="vaultageEntryLabel">Pass:</span><span class="pwd" onclick="addUsage(\'' + obj.id + '\')">' + _pwd + '</span></p>' +
            reUseText +
            countText +
            '</div>' +
            '</li>'

        output += s;

    })

    $('#searchResults').html(output);
}

function highlight(terms, baseString) {

    /*
    var signs = ['¢', '°', '§', '~', '¨', '=', '£']

    var i = 1
    var first = true
    _.each(terms, function(term){
        baseString = baseString.replace(new RegExp("("+term+")", 'gim'), ""+signs[i % signs.length]+'$1¬');
        i++
    });

    for(i = 0; i<signs.length; i++)    {
        baseString = baseString.replace(new RegExp(signs[i], 'gim'), '<span class="highlight'+(i+1)+'">');
        console.log("Replacing "+signs[i]+" with "+'<span class="highlight'+(i+1)+'">')
    }
    baseString = baseString.replace(new RegExp('¬', 'gim'), '</span>');
    */
    var i = 1
    _.each(terms, function(term) {
        baseString = baseString.replace(new RegExp("(" + term + ")", 'gim'), '<span class="highlight' + i + '">$1</span>');
        i++
    });

    return baseString
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
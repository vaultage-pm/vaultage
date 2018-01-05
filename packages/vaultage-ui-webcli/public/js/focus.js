$(function() {
    var timer;
    var refocusTimeout = 5000;

    window.clearTimeout(timer);

    function focus(){
        $('#main_input').focus();
    }

    $('body').dblclick(function() {
        timer = window.setTimeout(focus,refocusTimeout); 
    });
});
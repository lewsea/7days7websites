//onload
$(document).ready(function () {
    $('#mainFrame').css({ width: '100%', height: '100%' });
    $.Player = $("#player").player({ bgm: $("#BGM").text() });
});
var util = {
    images : {
        loading: chrome.extension.getURL('images/ajax-loader.gif')
    }
};
var escapeRegExp = function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};
var loadImage = function(img, src, evt) {
    var tempImg = document.createElement('img');
    tempImg.src = src;
    tempImg.onload = function() {
        img.attr('src', src);
        img.load(function() {
            adjustDivPos(img, evt);
        });
    };
};
var adjustDivPos = function(div, evt) {
    // if the div is overflowing out of the page place it just above the bottom
    var posY = evt.pageY - $(window).scrollTop() + 5,
        topVal = (div.height() + posY < window.innerHeight) ? posY : window.innerHeight - div.height() - 5;
    div.css({
        top: topVal,
        left: evt.pageX + 15
    });
};
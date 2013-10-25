var showImage = function(link) {
    var animeUrl = link.attr('href'),
        animeName = link.text(),
        animSpeed = 100,
        imgCss = {
            position: 'fixed',
            background: 'white',
            border: '3px solid white',
            'border-radius': '5px',
            '-webkit-box-shadow': '6px 6px 11px rgba(50, 50, 50, 0.75)',
            '-moz-box-shadow': '6px 6px 11px rgba(50, 50, 50, 0.75)',
            'box-shadow': '6px 6px 11px rgba(50, 50, 50, 0.75)'
        },
        timeout, img;
    // remove the tooltip from the links
    link.removeAttr('title');
    // attach the events
    link.mouseenter(function(evt) {
        // wait 200ms before creating/showing image to avoid unnecessary load
        timeout = setTimeout(function() {
            // if the image has already been created then just show it
            if (!img) {
                // create img with loading gif and append it to the dom
                img = $('<img />', {
                    src: util.images.loading,
                    alt: animeName
                })
                    .css(imgCss)
                    .appendTo(document.body)
                    .hide()
                    .fadeIn(animSpeed);
                // fix image position
                adjustDivPos(img, evt);
                // try to retrieve the actual media image url using ajax
                $.ajax({
                    url: animeUrl,
                    success: function(data) {
                        // create the regexp to find the img element in the anime page
                        var findSrc = new RegExp('<img src=".*" alt="' + escapeRegExp(animeName) + '" align="center">', 'gi');
                        // actually find the img element in the html
                        var imgSrc = data.match(findSrc);
                        // if the element was found
                        if (imgSrc) {
                            // extract the url of the image out of it
                            imgSrc = imgSrc[0].match(/http:\/\/cdn\.myanimelist.*\.jpg/gi)[0];
                            loadImage(img, imgSrc, evt);
                        } else {
                            console.log('failed to find image for anime with name > ' + animeName + ' on page > ' + animeUrl);
                        }
                    }
                });
            } else {
                img.fadeIn(animSpeed);
            }
        }, 200);
    }).mousemove(function(evt) {
        // make the image follow the cursor
        if (img) {
            adjustDivPos(img, evt);
        }
    }).mouseleave(function(evt) {
        // cancel timeout
        clearTimeout(timeout);
        // remove the image when the mouse
        if (img) {
            img.fadeOut(animSpeed);
        }
    });
};

var action = "bind show anime image events";

console.time(action);
$('a').each(function() {
    var $this = $(this),
        url = $this.attr('href');
    if(/^http:\/\/myanimelist\.net\/(manga|anime)\/[0-9]*\/[^\/]*$/.test(url) && $this.children('img').length === 0) {
        // clone link to get rid of events and data
        var newThis = $this.clone();
        // append the clone after the current one and remove the current one
        $this.after(newThis).remove();
        // bind events to newly appended clone
        showImage(newThis);
    }
});
console.timeEnd(action);
var showInfo = function(link) {
  var userUrl = link.attr('href'),
    userName = link.text(),
    animSpeed = 100,
    divCss = {
      position: 'fixed',
      background: 'white',
      border: '3px solid white',
      'border-radius': '5px',
      '-webkit-box-shadow': '6px 6px 11px rgba(50, 50, 50, 0.75)',
      '-moz-box-shadow': '6px 6px 11px rgba(50, 50, 50, 0.75)',
      'box-shadow': '6px 6px 11px rgba(50, 50, 50, 0.75)'
    },
    timeout, infoDiv;

  // attach the events
  link.mouseenter(function(evt) {
    // wait 200ms before creating/showing image to avoid unnecessary load
    timeout = setTimeout(function() {
      // if the image has already been created then just show it
      if (!infoDiv) {
        // create img with loading gif
        var loadingImg = $('<img />', {
          src: util.images.loading
        });
        // create div that will hold user info and append it to the DOM
        infoDiv = $('<div></div>')
          .css(divCss)
          .append(loadingImg)
          .appendTo(document.body)
          .hide()
          .fadeIn(animSpeed);
        // fix image position
        adjustDivPos(infoDiv, evt);
        // try to retrieve the image url using ajax
        $.ajax({
          url: userUrl,
          success: function(data) {
            var page = $(data.replace(/<img[^>]*>/g, ""));
            infoDiv.html($('div.normal_header', page).eq(5).parent())
              .append($('div#content > table > tbody > tr > td > div > table', page).last());
            // fix image position
            adjustDivPos(infoDiv, evt);
          },
          error: function() {
            infoDiv.html('dun goofed');
          }
        });
      } else {
        infoDiv.fadeIn(animSpeed);
      }
    }, 200);
  }).mousemove(function(evt) {
    // make the image follow the cursor
    if (infoDiv) {
      adjustDivPos(infoDiv, evt);
    }
  }).mouseleave(function(evt) {
    // cancel timeout
    clearTimeout(timeout);
    // hide the div
    if (infoDiv) {
      infoDiv.fadeOut(animSpeed);
    }
  });
};

var action = "bind show user info events";

console.time(action);
$('a').each(function() {
  var $this = $(this),
    url = $this.attr('href');
  // conditions for exit on invalid link
  if ($this.children('img').length > 0) return;
  if (!/http:\/\/myanimelist.net\/profile\/[^\/]*$/.test(url)) return;
  // valid url show bind events
  showInfo($(this));
});
console.timeEnd(action);

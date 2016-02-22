(function() {
  var searchButton = $('button.search'),
    mediaChoice = $('#media'),
    btnFullScreen = $('button.fullscreen'),
    // the 2 user fields
    user1 = $('#user1'),
    user2 = $('#user2'),
    // variables to store the names and the place to display results
    user1Name, user2Name, results = $('div.results'),
    // 2 objects to store the retrieved data
    user1Anime = {},
    user2Anime = {},
    // array that will hold the anime in common
    commonAnime = [],
    origURL = 'http://myanimelist.net/',
    baseURL = 'http://myanimelist.net/animelist/',
    // used to see if the request errored out
    comparedOnce = false;

  btnFullScreen.click(function(e) {
    chrome.windows.create({
      url: "popup.html",
      width: $(document.body).width() + 50
    });
  });

  mediaChoice.change(function(e) {
    baseURL = origURL + this.options[this.selectedIndex].value + 'list/';
  });

  searchButton.click(function(e) {
    user1Name = user1.val();
    user2Name = user2.val();
    planned = ($('#choosePlanned:checked').length !== 0) ? true : false;
    results.html('');
    if (user1Name === '' || user2Name === '') {
      results.append('<h1 align="center">All fields must be complete</h1>');
    } else {
      // reset the user objects and the commonAnime list
      user1Anime = {};
      user2Anime = {};
      commonAnime = [];
      comparedOnce = false;
      getAnimeList(user1Name, 1, planned);
      getAnimeList(user2Name, 2, planned);
    }
  });

  $(window).keypress(function(e) {
    if (e.which == 13) {
      searchButton.click();
    }
  });

  function getTitles(data, planned) {
    var anime = {
      titles: [],
      ratings: []
    };
    // select the planned if planned is true
    var query = (planned) ? $('table.header_ptw', data).nextAll() : $('table', data);
    // grab all the anime titles on the page
    query.each(function(index) {
      var $this = $(this);
      if ($this.attr('class') === 'header_ptw') {
        return false;
      }
      $this = $this.find('a.animetitle');
      // if there were no anime titles found go to the next elements
      if ($this.length === 0) {
        return;
      }
      // the span inside the grabbed link contains the title of the current anime
      // anime.titles[anime.titles.length] = $this.children().first().text();
      anime.titles[anime.titles.length] = $this[0].outerHTML;
      // the 2nd td sibling of the grabbed link contains the user rating
      anime.ratings[anime.ratings.length] = $this.parent().siblings().eq(1).text();
    });
    // if the object was populated then return it otherwise just return a blank object
    if (anime.titles.length > 0) {
      return anime;
    } else {
      return {};
    }
  }

  function getAnimeList(username, userNum, planned) {
    $.get(baseURL + username, function(data) {
      if (userNum === 1) {
        user1Anime = getTitles(data, planned);
      } else {
        user2Anime = getTitles(data, planned);
      }
      // process data
      compareAnime();
    });
  }

  function compareAnime() {
    // if both user objects have been populated
    if (user1Anime.titles && user2Anime.titles) {
      var avg1 = 0,
        avg2 = 0,
        aCount1 = 0,
        aCount2 = 0;

      $.each(user1Anime.titles, function(index, elem) {
        var match = $.inArray(elem, user2Anime.titles);
        if (match !== -1) {
          commonAnime[commonAnime.length] = [elem, user1Anime.ratings[index], user2Anime.ratings[match]];
        }
      });

      // sort the common anime alphabetically by title
      commonAnime.sort(function(a, b) {
        if (a[0].toLowerCase() > b[0].toLowerCase()) return 1;
        else if (a[0].toLowerCase() < b[0].toLowerCase()) return -1;
        else return 0;
      });

      // create a new table to hold the results
      var resultTable = $('<table></table>', {
        'class': 'resultTable'
      });
      // create links to the user profiles
      var user1Profile = '<a target="_self" href="' + baseURL + user1Name + '">' + user1Name + '\'s Rating</a>';
      var user2Profile = '<a target="_self" href="' + baseURL + user2Name + '">' + user2Name + '\'s Rating</a>';
      // add the header row to the table
      resultTable.append('<thead><tr><th>Title</th><th>' + user1Profile + '</th><th>' + user2Profile + '</th></tr></thead>');
      // loop though the common anime and add the contents
      $.each(commonAnime, function(index, elem) {
        var u1Rating = 0,
          u2Rating = 0;
        if (!isNaN(elem[1])) {
          u1Rating = parseInt(elem[1], 10);
          avg1 += u1Rating;
          aCount1++;
        }
        if (!isNaN(elem[2])) {
          u2Rating = parseInt(elem[2], 10);
          avg2 += u2Rating;
          aCount2++;
        }
        // highlight the higher score
        if (u1Rating && u2Rating) {
          if (u1Rating > u2Rating) {
            elem[1] = "<strong>" + elem[1] + "</strong>";
          } else if (u2Rating > u1Rating) {
            elem[2] = "<strong>" + elem[2] + "</strong>";
          } else {
            elem[1] = "<strong>" + elem[1] + "</strong>";
            elem[2] = "<strong>" + elem[2] + "</strong>";
          }
        }
        resultTable.append('<tr><td>' + elem[0] + '</td><td>' + elem[1] + '</td><td>' + elem[2] + '</td></tr>');
      });
      avg1 = (avg1 !== 0) ? Math.round((avg1 / aCount1) * 100) / 100 : '-';
      avg2 = (avg2 !== 0) ? Math.round((avg2 / aCount2) * 100) / 100 : '-';
      // append the score averages for the users
      resultTable.append('<tr><td>Average Scores</td><td>' + avg1 + '</td><td>' + avg2 + '</td></tr>');
      // appends the resulting table to the results div
      results.append(resultTable);
    } else {
      if (comparedOnce) {
        results.html('<h1 align="center">Invalid User or Network Error</h1>');
      } else {
        comparedOnce = true;
      }
    }
  }
})();

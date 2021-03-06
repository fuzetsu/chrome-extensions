var baseUrl = "https://cegep-heritage.omnivox.ca/",
    marksPageUrl = baseUrl + "intr/Module/ServicesExterne/Skytech.aspx?IdServiceSkytech=Skytech_Omnivox&lk=%2festd%2fcvie%3fmodule%3dnote%26item%3dintro",
    // the number of minutes to wait between each check for new marks
    minutesToWait = 15;

// initial call
setNumNewMarks();
// set alarm to check if there are any new marks
chrome.alarms.create('setMarks', {periodInMinutes: minutesToWait});

chrome.alarms.onAlarm.addListener(function(alarm) {
    if(alarm.name == 'setMarks') {
        setNumNewMarks();
    }
});

function checkLoggedIn(callback) {
    $.get(baseUrl, function(data) {
        // if we are logged in
        if (data.indexOf('Calendar of Events') != -1) {
            callback(true);
        } else {
            callback(false);
        }
    }).fail(function() {
        callback(false);
    });
}

function setNumNewMarks() {
    console.log('checking marks. ' + new Date().toString());
    setBadge({
        color: '#999',
        text: '...'
    });
    getNumNewMarks({
        success: function(num) {
            console.log(num + ' was received.');
            setBadge({
                color: '#F00',
                text: num
            });
        },
        fail: function() {
            console.log('check failed.');
            setBadge({
                color: '#FFFF00',
                text: 'x'
            });
        }
    });
}

function setBadge(opt) {
    (typeof opt.text == 'string') && chrome.browserAction.setBadgeText({
        text: opt.text
    });
    opt.color && chrome.browserAction.setBadgeBackgroundColor({
        color: opt.color
    });
}

function getNumNewMarks(callbacks) {
    checkLoggedIn(function(isLoggedIn) {
        if (isLoggedIn) {
            console.log('you are logged in, getting marks page...');
            $.get(marksPageUrl, function(data) {
                console.log('got marks page');
                var match = data.match(/<img src="\/images\/General\/TagNouveau.gif"/gi);
                // if there are any matches then pass that, otherwise pass empty str (to hide badge)
                callbacks.success(((match) ? match.length : '') + "");
            }).fail(function() {
                callbacks.fail();
            });
        } else {
            // we are not logged in so call the 'fail' callback
            callbacks.fail();
        }
    });
}
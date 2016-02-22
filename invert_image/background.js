var ENABLED = false;


chrome.browserAction.onClicked.addListener(function() {
  var scriptObj = {
    file: (ENABLED ? 'disable.js' : 'activate.js'),
    allFrames: true
  };
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach(function(tab) {
      chrome.tabs.executeScript(tab.id, scriptObj);
    });
    chrome.browserAction.setBadgeText({ text: ENABLED ? '' : 'On' });
    ENABLED = !ENABLED;
  });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (ENABLED) {
    chrome.tabs.executeScript(tabId, { file: 'activate.js', allFrames: true });
  }
});

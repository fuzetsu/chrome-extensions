chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.windows.get(tab.windowId, {populate: true}, function(win) {
        var tabs = win.tabs.slice(tab.index);
        // get tab ids for tabs including and after current one
        var tabsToMove = tabs.map(function(tab) {
            return tab.id;
        });
        chrome.windows.create({tabId: tabsToMove[0]}, function(newWin) {
            if(tabsToMove.length > 1) {
                chrome.tabs.move(tabsToMove.slice(1), { windowId: newWin.id, index: -1 }, maximize);
            } else {
                maximize();
            }
        });
    });
});

function maximize() {
    chrome.windows.getCurrent(function(win) {
        chrome.windows.update(win.id, {state: 'maximized'});
    });
}
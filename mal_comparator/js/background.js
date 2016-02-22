// ----------------------------------------------------------
//                      JUST PLAYING AROUND
// ----------------------------------------------------------

chrome.extension.onMessage.addListener(function(req, sender, sendRes) {
  console.log(sender.tab ?
    "from a content script:" + sender.tab.url :
    "from the extension");
  if (req.purpose == "open_tab") {
    chrome.windows.create({ url: req.url, incognito: true });
  }
});

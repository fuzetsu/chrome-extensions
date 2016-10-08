chrome.contextMenus.create({
  id: 'yomama',
  title: 'Set image as wallpaper',
  contexts: ['image']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if(info.menuItemId !== 'yomama') return;
  chrome.wallpaper.setWallpaper({
    url: info.srcUrl,
    layout: 'CENTER_CROPPED',
    filename: `yomama-${Date.now()}`
  }, () => {});
});
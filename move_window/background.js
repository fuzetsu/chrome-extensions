var monitors;

var updateMonitorInfo = function(cb) {
  chrome.system.display.getInfo(function(infoArr) {
    console.log(infoArr);
    monitors = infoArr.map(function(info) {
      var obj = info.workArea;
      obj.maxLeft = obj.left + obj.width;
      obj.maxTop = obj.top + obj.height;
      return obj;
    });
    if (cb) cb(monitors);
  });
};

var isWindowInMonitor = function(win, monitor) {
  return win.top <= monitor.maxTop && win.top >= monitor.top && win.left <= monitor.maxLeft && win.left >= monitor.left;
};

var getWinOffset = function(win, monitor) {
  return { top: win.top - monitor.top, left: win.left - monitor.left };
};

var nextMonitorIndex = function(index, length) {
  index += 1;
  if (index >= length) {
    index = 0;
  } else if (index < 0) {
    index = length - 1;
  }
  return index;
};

var getNextMonitorOffset = function(win) {
  var curMonitor, nextMonitor, winOffset;
  monitors.some(function(monitor, index) {
    if (isWindowInMonitor(win, monitor)) {
      curMonitor = monitor;
      nextMonitor = monitors[nextMonitorIndex(index, monitors.length)];
      winOffset = getWinOffset(win, curMonitor);
      return true;
    }
  });
  return {
    monitor: nextMonitor,
    window: winOffset,
    top: nextMonitor.top + winOffset.top,
    left: nextMonitor.left + winOffset.left
  };
};

updateMonitorInfo();

chrome.system.display.onDisplayChanged.addListener(function() {
  updateMonitorInfo();
});

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'move_to_monitor') {
    if (monitors) {
      chrome.windows.getCurrent(function(curWin) {
        var origState = curWin.state;
        // set state to 'normal' to preserve offset
        chrome.windows.update(curWin.id, { state: 'normal' }, function(normalWin) {
          // calculate offset and next monitor
          var offset = getNextMonitorOffset(normalWin);
          // apply new offset based on destination monitor
          chrome.windows.update(normalWin.id, { top: offset.top, left: offset.left }, function() {
            // restore window state
            chrome.windows.update(normalWin.id, { state: origState });
          });
        });
      });
    }
  }
});

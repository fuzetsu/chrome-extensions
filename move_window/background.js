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

var nextMonitorIndex = function(index, length, inc) {
  index += inc;
  if (index >= length) {
    index = 0;
  } else if (index < 0) {
    index = length - 1;
  }
  return index;
};

updateMonitorInfo();

chrome.system.display.onDisplayChanged.addListener(function() {
  updateMonitorInfo();
});

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'move_to_monitor') {
    if (monitors) {
      var inc = 1;
      chrome.windows.getCurrent(function(curWin) {
        var nextMonitor, curMonitor, offset;
        monitors.some(function(monitor, index) {
          if (isWindowInMonitor(curWin, monitor)) {
            curMonitor = monitor;
            nextMonitor = monitors[nextMonitorIndex(index, monitors.length, inc)];
            offset = getWinOffset(curWin, curMonitor);
            return true;
          }
        });
        chrome.windows.update(curWin.id, { left: nextMonitor.left + offset.left, top: nextMonitor.top + offset.top });
      });
    }
  }
});

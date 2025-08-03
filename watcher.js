const fs = require('fs');
const { ipcRenderer } = require('electron');


(async () => {
    const watcher = fs.watch('./index.html');
    watcher.on('change', () => {
        ipcRenderer.send('re-render');
    });
})();
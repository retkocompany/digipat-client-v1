const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
// const pyshell = require("python-shell");
// const {execFile: child} = require("child_process");
const fs = require("fs");
const {shell} = require("electron");
var child = require('child_process').execFile;
const { spawn } = require('child_process');



// In main process.

let mainWin, loginWin, viewerWin, filterWin, ref = 0

function closeWin(win){
    if(win) {
        // console.log(typeof win)
        // console.log(win)
        win.close()
        // win = null
    }
}

// function refresh(win){
//     if(win && ref) {
//         win.webContents.reloadIgnoringCache()
//         ref = 0
//     }
// }

function createLoginWin(callback) {
    loginWin = new BrowserWindow({
        width: 540,
        height: 560,
        // frame: false,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule:true
        }
    })

    loginWin.loadURL(url.format({
        pathname: path.join(__dirname, 'login.html'),
        protocol: 'file',
        slashes: true
    })).catch((error) => { if (error.code === 'ERR_ABORTED') return; throw error; }).then(r => console.log('login'))

    loginWin.on('closed', ()=>{
        app.quit()
    })
    // loginWin.once('ready-to-show', () => {
    //     loginWin.show()
    // })

    loginWin.webContents.on('did-finish-load', function () {
        if (typeof callback == 'function') {
            callback();
        }
    });
}

function createMainWin(callback) {
    mainWin = new BrowserWindow({
        parent: loginWin,
        width: 1200,
        height: 720,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule:true
        }
    })

    mainWin.loadURL(url.format({
        pathname: path.join(__dirname, 'files.html'),
        protocol: 'file',
        slashes: true
    })).catch((error) => { if (error.code === 'ERR_ABORTED') return; throw error; }).then(r => console.log('main'))

    mainWin.on('closed', ()=>{
        // app.quit()
        mainWin = null
    })

    mainWin.webContents.on('did-finish-load', function () {
        if (typeof callback == 'function') {
            callback();
        }
    });
}

function createViewerWin(callback) {
    viewerWin = new BrowserWindow({
        parent: mainWin,
        width: 1200,
        height: 720,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule:true
        }
    })

    viewerWin.loadURL(url.format({
        pathname: path.join(__dirname, 'viewer.html'),
        protocol: 'file',
        slashes: true
    })).catch((error) => { if (error.code === 'ERR_ABORTED') return; throw error; }).then(r => console.log('viewer'))
    viewerWin.webContents.on('did-finish-load', function () {
        if (typeof callback == 'function') {
            callback();
        }
    });

    viewerWin.on('closed', ()=>{
        viewerWin = null
    })
}

function createFilterWin(callback) {
    filterWin = new BrowserWindow({
        parent: mainWin,
        width: 540,
        height: 560,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule:true
        }
    })

    filterWin.loadURL(url.format({
        pathname: path.join(__dirname, 'filters.html'),
        protocol: 'file',
        slashes: true
    })).catch((error) => { if (error.code === 'ERR_ABORTED') return; throw error; }).then(r => console.log('filters'))
    filterWin.webContents.on('did-finish-load', function () {
        if (typeof callback == 'function') {
            callback();
        }
    });
    filterWin.on('closed', ()=>{
        filterWin = null
    })
}

// function createWindowPython () {
//     /*...*/
//     let python = require('child_process').spawn('python', ['maker/hello.py']);
//     python.stdout.on('data',function(data){
//         console.log("data: ",data.toString('utf8'));
//     });
// }

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


app.on('ready', ()=> {
    if(!loginWin){
        createLoginWin(function(){
            loginWin.show();
        })
    } else{
        loginWin.show();
    }
    // createLoginWin(function(){
    //     loginWin.show();
    // })
    // createWindows()
    // ipcMain.on('lab', (event, args) => {
    //     loginWin.hide()
    //     mainWin.hide()
    //     viewer.hide()
    // })
    ipcMain.on('logged-in', (event, arg) => {
        // loginWin.close()
        // loginWin = null
        if(!mainWin){
            createMainWin(function(){
                // mainWin.webContents.reloadIgnoringCache()
                // ref = 1
                // refresh(mainWin);
                mainWin.show();
                // closeWin(loginWin)
                loginWin.hide()
            })
        } else{
            // mainWin.webContents.reloadIgnoringCache()
            // ref = 1
            // refresh(mainWin);
            mainWin.show();
            // closeWin(loginWin)
            loginWin.hide()
        }
        // viewerWin.hide()

    })

    // ipcMain.on('labs', (event, arg) => {
    //     if(!mainWin){
    //         createMainWin(function(){
    //             mainWin.loadURL(url.format({
    //                 pathname: path.join(__dirname, 'labs.html'),
    //                 protocol: 'file',
    //                 slashes: true
    //             })).then(r => console.log('labs'))
    //             mainWin.show();
    //         })
    //     } else{
    //         mainWin.loadURL(url.format({
    //             pathname: path.join(__dirname, 'labs.html'),
    //             protocol: 'file',
    //             slashes: true
    //         })).then(r => console.log('labs'))
    //         mainWin.show();
    //     }
    // })

    // ipcMain.on('lab', (event, arg) => {
    //     if(!mainWin){
    //         createMainWin(function(){
    //             mainWin.loadURL(url.format({
    //                 pathname: path.join(__dirname, 'lab.html'),
    //                 protocol: 'file',
    //                 slashes: true
    //             })).then(r => console.log('lab'))
    //             mainWin.show();
    //         })
    //     } else{
    //         mainWin.loadURL(url.format({
    //             pathname: path.join(__dirname, 'lab.html'),
    //             protocol: 'file',
    //             slashes: true
    //         })).then(r => console.log('lab'))
    //         mainWin.show();
    //     }
    //     // console.log(__dirname)
    //
    // })

    ipcMain.on('file', (event, arg) => {
        if(!mainWin){
            createMainWin(function(){
                mainWin.loadURL(url.format({
                    pathname: path.join(__dirname, 'files.html'),
                    protocol: 'file',
                    slashes: true
                })).catch((error) => { if (error.code === 'ERR_ABORTED') return; throw error; }).then(r => console.log('main'))
                mainWin.show();
            })
        } else{
            mainWin.loadURL(url.format({
                pathname: path.join(__dirname, 'files.html'),
                protocol: 'file',
                slashes: true
            })).catch((error) => { if (error.code === 'ERR_ABORTED') return; throw error; }).then(r => console.log('main'))
            mainWin.show();
        }
    })

    ipcMain.on('document', (event, arg) => {
        if(!mainWin){
            createMainWin(function(){
                mainWin.loadURL(url.format({
                    pathname: path.join(__dirname, 'wsimages.html'),
                    protocol: 'file',
                    slashes: true
                })).catch((error) => { if (error.code === 'ERR_ABORTED') return; throw error; }).then(r => console.log('main'))
                mainWin.show();
            })
        } else{
            mainWin.loadURL(url.format({
                pathname: path.join(__dirname, 'wsimages.html'),
                protocol: 'file',
                slashes: true
            })).catch((error) => { if (error.code === 'ERR_ABORTED') return; throw error; }).then(r => console.log('main'))
            mainWin.show();
        }
    })

    ipcMain.on('viewer', (event, arg) => {
        // console.log('here')
        if(!viewerWin){
            createViewerWin(function(){
                viewerWin.show();
                mainWin.hide()
            })
        } else{
            viewerWin.show();
            mainWin.hide()
        }
        viewerWin.on('closed', ()=>{
            // console.log('1')
            // event.preventDefault()
            if(!mainWin){
                createMainWin(function(){
                    mainWin.show();
                })
            } else{
                mainWin.show();
            }
            // console.log('2')
            // filterWin.hide()
            // console.log('3')
            // loginWin.hide()
            // console.log('4')
            // viewerWin.close()
            viewerWin = null
            // console.log('5')
        })
        // filterWin.hide()
        // loginWin.hide()
    })

    ipcMain.on('logout', (event, arg) => {
        closeWin(viewerWin)
        closeWin(filterWin)
        closeWin(mainWin)
        // createMainWin()
        // mainWin.hide()
        if(!loginWin){
            createLoginWin(function(){
                loginWin.show();
            })
        } else{
            loginWin.show();
        }
        // if(!loginWin){
        //     createLoginWin(function(){
        //         loginWin.show();
        //     })
        // } else{
        //     loginWin.show();
        // }
    })

    ipcMain.on('exit', (event, args) => {
        app.quit()
    })

    ipcMain.on('back', (event, args) => {
        mainWin.webContents.goBack()
    })

    ipcMain.on('image-adjust', (event, args) => {
        if(!filterWin){
            createFilterWin(function(){
                filterWin.show()
            })
        } else{
            filterWin.show()
        }
    })

    ipcMain.on('file_created', (event, arg) => {
        if(!mainWin){
            createMainWin(function(){
                mainWin.loadURL(url.format({
                    pathname: path.join(__dirname, 'editfile.html'),
                    protocol: 'file',
                    slashes: true
                })).catch((error) => { if (error.code === 'ERR_ABORTED') return; throw error; }).then(r => console.log('main'))
                mainWin.show();
            })
        } else{
            mainWin.loadURL(url.format({
                pathname: path.join(__dirname, 'editfile.html'),
                protocol: 'file',
                slashes: true
            })).catch((error) => { if (error.code === 'ERR_ABORTED') return; throw error; }).then(r => console.log('main'))
            mainWin.show();
        }
    })

    ipcMain.on('filter', (event, args) => {
        viewerWin.webContents.send('doFilter', args)
        filterWin.hide()
    })

    ipcMain.on('newwsiHE', (event, args) => {
        // let url = path.join(__dirname, "/maker/HEMaker/HEMaker.exe");
        // console.log(url)
        // shell.openExternal("file:/"+url)
        // shell.openExternal("file:/D:/Dev/wsi/wsiclient/maker/HEMaker/HEMaker.exe")
        // var child = require('child_process').execFile;
        var batchFilePath = 'HEMaker.bat';

        const bat = spawn('cmd.exe', ['/c', batchFilePath]); // Or 'powershell.exe' for PowerShell scripts

        bat.stdout.on('data', (data) => {
            console.log('stdout:', data.toString());
        });

        bat.stderr.on('data', (data) => {
            console.error('stderr:', data.toString());
        });

        bat.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            fs.readFile("out.txt", (error, data) => {
                // Send result back to renderer process
                console.log(data.toString());
                mainWin.webContents.send("path", data.toString());
            });
            // mainWin.webContents.send('path', args)
            // event.reply('batch-file-result', { code: code }); // Send result back to renderer
        });
        // var executablePath = 'maker/HEMaker/HEMaker.exe';
        // var parameters = ['maker/HEMaker/'];
        // child(executablePath, parameters, function (err, data) {
        //     if(err) {
        //         console.log(err)
        //         return;
        //     }
        //     console.log(data.toString());
        //     mainWin.webContents.send("path", data.toString());
        // });
        // let pyshell =  require('python-shell');
        //
        // pyshell.PythonShell.run('maker/HEMaker/HEMaker.exe', function (err, results) {
        //     if (err) throw err;
        //     console.log('hello.py finished.');
        //     console.log('results', results);
        // }).then(r => mainWin.webContents.send('path', r)).catch(function () {
        //     console.log("Promise Rejected");
        // });

     })

    ipcMain.on('newwsiIHC', (event, args) => {
        // let url = path.join(__dirname, "/maker/IHCMaker/IHCMaker.exe");
        // console.log(url)
        // shell.openExternal("file:/"+url)
        // shell.openExternal("file:/D:/Dev/wsi/wsiclient/maker/IHCMaker/IHCMaker.exe")
        // var child = require('child_process').execFile;
        // var executablePath = 'maker/IHCMaker/IHCMaker.exe';
        // var parameters = ['maker/IHCMaker/'];
        // child(executablePath, parameters, function (err, data) {
        //     if(err) {
        //         console.log(err)
        //         return;
        //     }
        //     console.log(data.toString());
        //     mainWin.webContents.send("path", data.toString());
        // });
        var batchFilePath = 'IHCMaker.bat';

        const bat = spawn('cmd.exe', ['/c', batchFilePath]); // Or 'powershell.exe' for PowerShell scripts

        bat.stdout.on('data', (data) => {
            console.log('stdout:', data.toString());
        });

        bat.stderr.on('data', (data) => {
            console.error('stderr:', data.toString());
        });

        bat.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            fs.readFile("out.txt", (error, data) => {
                // Send result back to renderer process
                console.log(data.toString());
                mainWin.webContents.send("path", data.toString());
            });
            // event.reply('batch-file-result', { code: code }); // Send result back to renderer
        });
        // child(executablePath, parameters, function (err, data) {
        //     console.log(err)
        //     console.log(data.toString());
        // });
        // let pyshell =  require('python-shell');
        //
        // pyshell.PythonShell.run('maker/IHCMaker/IHCMaker.exe', function (err, results) {
        //     if (err) throw err;
        //     console.log('hello.py finished.');
        //     console.log('results', results);
        // }).then(r => mainWin.webContents.send('path', r)).catch(function () {
        //     console.log("Promise Rejected");
        // });

    });

    ipcMain.on('checkCam', (event, args) => {
        // let url = path.join(__dirname, "/maker/CamCheck/camCheck.exe");
        // console.log(url)
        // shell.openExternal("file:/"+url)
        // var child = require('child_process').execFile;
        var batchFilePath = 'CamCheck.bat';

        const bat = spawn('cmd.exe', ['/c', batchFilePath]); // Or 'powershell.exe' for PowerShell scripts

        bat.stdout.on('data', (data) => {
            console.log('stdout:', data.toString());
        });

        bat.stderr.on('data', (data) => {
            console.error('stderr:', data.toString());
        });

        bat.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            event.reply('batch-file-result', { code: code }); // Send result back to renderer
        });
        // var params = [args[0]];
        // var parameters = ['maker/CamCheck/'];
        // child(executablePath, parameters, function (err, data) {
        //     if(err) {
        //         console.log(err)
        //         return;
        //     }
        //     console.log(data.toString());
        // });
        // child(executablePath, parameters, function (err, data) {
        //     console.log(err)
        //     console.log(data.toString());
            // fs.readFile("maker/CamCheck/result.txt", (error, data) => {
            //     // Do something with file contents
            //     if("success" in data)
            //         fs.readFile("maker/CamCheck/camera.txt", (error, data) => {
            //             // Send result back to renderer process
            //             console.log(data.toString());
            //             mainWin.webContents.send("camera", data.toString());
            //         });
            // });
        fs.readFile("maker/CamCheck/camera.txt", (error, data) => {
            // Send result back to renderer process
            console.log(data.toString());
            loginWin.webContents.send("camera", data.toString());
        });

        // });
        // let pyshell =  require('python-shell');
        //
        // pyshell.PythonShell.run('maker/CamCheck/camCheck.exe', function (err, results) {
        //     if (err) throw err;
        //     console.log('hello.py finished.');
        //     console.log('results', results);
        // }).then(r => mainWin.webContents.send('path', r)).catch(function () {
        //     console.log("Promise Rejected");
        // });

    });
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createLoginWin(function(){
            loginWin.show();
        })
    }
})

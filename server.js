const express = require('express');
const https = require('https');
const fs = require('fs')
const path = require('path');
const app = express();
const { ipcMain, BrowserWindow } = require('electron')
const localip = require('local-ip');

let deviceId;

const initServer = (mainWindowId) => {
    const options = {
        key: fs.readFileSync(path.join(__dirname, './ssl-certificates/localhost.key')),
        cert: fs.readFileSync(path.join(__dirname, './ssl-certificates/localhost.crt'))
    };

    const server = https.createServer(options, app);
    const io = require('socket.io')(server)

    app.use(express.static(path.join(__dirname, './public')));
    app.use('/peerjs', require('peer').ExpressPeerServer(server, { debug: true }))

    server.listen(0, () => {
        console.log('listening on', server.address().port);
    });

    const window = BrowserWindow.fromId(mainWindowId);

    ipcMain.on('get-host-meta', () => {
        window.webContents.send('host-meta', { ip: localip(), port: server.address().port })
    })

    ipcMain.on('device-id', (event, id) => {
        deviceId = id;
    })

    io.on('connection', socket => {
        socket.emit('device-id', deviceId);

        socket.on('stop-share', () => {
            window.webContents.send('stop-share');
        })

        socket.on('disconnect', () => {
            window.webContents.send('stop-share')
        })
    });
}

module.exports = {
    initServer
}
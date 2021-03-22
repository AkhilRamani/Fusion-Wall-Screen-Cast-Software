const ipcRenderer = require('electron').ipcRenderer

ipcRenderer.send('get-host-meta')

ipcRenderer.on('host-meta', (event, hostMeta) => {
    document.getElementById('info-txt').innerHTML = `Visit https://${hostMeta.ip}:${hostMeta.port} to start presenting here...`

    const peer = new Peer(undefined, {
        host: 'localhost',
        port: hostMeta.port,
        path: '/peerjs',
        secure: true
    })

    peer.on('open', id => {
        console.log('peer', id)
        ipcRenderer.send('device-id', id)})

    peer.on('call', call => {
        console.log('calls')
    
        videoDiv.style.display = 'block'
        homeScreen.style.display = 'none'
    
        call.answer();
        call.on('stream', stream => {
            addVideoStream(videoPlayer, stream)
        })
        call.on('close', () => {
            videoPlayer.remove();
            videoDiv.style.display = 'none'
            homeScreen.style.display = 'block'
        })
    })
})

const homeScreen = document.getElementById('home-screen')
const videoDiv = document.getElementById('video')

const videoPlayer = document.createElement('video')
videoPlayer.muted = true


ipcRenderer.on('start', (event, arg) => {
    console.log('got it', arg)
})

ipcRenderer.on('stop-share', () => {
    videoPlayer.remove();
    videoDiv.style.display = 'none'
    homeScreen.style.display = 'block'
})

function addVideoStream(player, stream) {
    player.srcObject = stream
    player.addEventListener('loadedmetadata', () => {
        player.play()
    })
    videoDiv.append(player)
}
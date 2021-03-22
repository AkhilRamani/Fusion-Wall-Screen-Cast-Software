let socket = io();
let peer = new Peer(undefined, {
    host: location.hostname,
    port: location.port,
    path: '/peerjs'
});

const state = {
    deviceId: null
} 

socket.on('connect', function () {
    console.log('connected socket')
});

peer.on('open', id => {
    // console.log(id)
})

socket.on('device-id', id => {
    state.deviceId = id
    console.log(id)
})

const _handleShareClick = () => {
    navigator.mediaDevices.getDisplayMedia({ video: true })
        .then(stream => {
            console.log(state.deviceId)
            document.getElementById('wrapper').style.background = 'linear-gradient(241deg, rgb(255 70 70) 35%, rgb(216 33 33) 100%);'
            
            peer.call(state.deviceId, stream);

            stream.getVideoTracks()[0].onended = function () {
                socket.emit('stop-share');
            };
        })
        .catch(e => console.log(e))
}
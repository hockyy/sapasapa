let peerConnection;
let localStream;
let remoteStream;
const createOfferButton = document.getElementById("create-offer");
const createAnswerButton = document.getElementById("create-answer");
const addAnswerButton = document.getElementById("add-answer");
const offerSdp = document.getElementById("offer-sdp");
const answerSdp = document.getElementById("answer-sdp");

let servers = {
    iceServers: [
        {
            urls: ['stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302']
        }
    ]
}

let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    });
    document.getElementById("user-1").srcObject = localStream;
}

let createOffer = async () => {
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    document.getElementById("user-2").srcObject = remoteStream;

    console.log(localStream.getTracks())
    // Tracks can be audio and video
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    })

    peerConnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            offerSdp.value = JSON.stringify(peerConnection.localDescription)
        }
    }

    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer);

    offerSdp.value = JSON.stringify(offer)
}

let createAnswer = async () => {
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    document.getElementById("user-2").srcObject = remoteStream;
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    })

    peerConnection.ontrack = async (event) => {
        console.log(event.streams)
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            answerSdp.value = JSON.stringify(peerConnection.localDescription)
        }
    }

    let offer = offerSdp.value;
    if (!offer) return alert('empty offer sdp');

    offer = JSON.parse(offer);
    await peerConnection.setRemoteDescription(offer)

    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    answerSdp.value = JSON.stringify(answer)

}

let addAnswer = async () => {
    let answer = answerSdp.value
    if(!answer) return alert('empty answer sdp');

    answer = JSON.parse(answer);

    if(!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer)
    }
}

init();

createAnswerButton.addEventListener('click', createAnswer)
createOfferButton.addEventListener('click', createOffer)
addAnswerButton.addEventListener('click', addAnswer)

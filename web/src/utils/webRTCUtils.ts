export function waitForReceiverReady(socket: WebSocket, meetingID: number, secsToWait: number) {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            console.log("Timeout: Receiver did not respond.");
            resolve(false);
        }, secsToWait * 1000); 

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "receiverReady" && message.ID === meetingID) {
                clearTimeout(timeout);
                resolve(true);
            }
        };
    });
}

export function receiveTrack(pc: RTCPeerConnection, mediaStreamRef : React.MutableRefObject<MediaStream | null>, videoRef : React.RefObject<HTMLVideoElement>){
    pc.ontrack = (event)=>{
        if (!mediaStreamRef.current) {
            mediaStreamRef.current = new MediaStream();
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStreamRef.current;
            }
        }
        mediaStreamRef.current.addTrack(event.track);
    }
}

export function addIceCandidates(WSConnection: WebSocket, peerConnection: RTCPeerConnection, meetingID: number){
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            WSConnection?.send(JSON.stringify({ type: 'iceCandidate', ID: meetingID , candidate: event.candidate }));
        }
    };
}

export async function addTrack(peerConnection: RTCPeerConnection){
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
    if (peerConnection) {
        stream.getTracks().forEach((track)=> peerConnection.addTrack(track, stream));
    }
}

export async function addOwnVideo(ownVideoRef:React.RefObject<HTMLVideoElement>){
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
    if (ownVideoRef.current) {
        const videoOnlyStream = new MediaStream([stream.getVideoTracks()[0]]);
        ownVideoRef.current.srcObject = videoOnlyStream;
    }
}

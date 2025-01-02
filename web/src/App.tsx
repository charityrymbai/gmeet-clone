import { useEffect, useState, useRef } from "react";

const App = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const ownVideoRef = useRef<HTMLVideoElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [inputID, setInputID] = useState<number>(0);
    let pc : RTCPeerConnection | null;

    useEffect(()=>{
        const socket = new WebSocket(import.meta.env.VITE_WS_URL);
        setSocket(socket)
        return ()=>{
            socket.close();
        }
    },[])

    function waitForReceiverReady(socket: WebSocket, meetingID: number, secsToWait: number) {
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

    async function createMeeting(){
        if (!socket) return;
        const meetingID = Math.floor(Math.random() * 9000) + 1000; //generates random 4 digit number
        console.log(`MeetingID = ${meetingID}`);
        socket.send(JSON.stringify({type: "sender", ID: meetingID})); 
        pc = new RTCPeerConnection();

        const receiverReady = await waitForReceiverReady(socket, meetingID, 30);

        if(!receiverReady){
            console.log("Receiver not ready. Aborting......")
            return;
        }

        pc.onnegotiationneeded = async ()=>{
            if (!pc) pc = new RTCPeerConnection();
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.send(JSON.stringify({type: "createOffer", ID: meetingID ,sdp: pc.localDescription}))
            console.log("Sender: offer sent")
        }

        socket.onmessage = async (event)=>{
            if (!pc) pc = new RTCPeerConnection();
            const message = JSON.parse(event.data);
            if (message.type==="createAnswer"){
                console.log("Sender: answer received")
                await pc.setRemoteDescription(message.sdp);
            } else if (message.type === "iceCandidate"){
                await pc.addIceCandidate(message.candidate);
                console.log("iceCandidate received")
            }
        }
        addIceCandidates(socket, pc, meetingID);
        receiveTrack(pc);
        addTrack(pc);
    }

    async function joinMeeting(){
        if(!pc) pc = new RTCPeerConnection();
        if(!socket) {console.log("no ws connection"); return; }

        const meetingID = inputID;
        socket.send(JSON.stringify({type: "receiver", ID: meetingID}))

        socket.onmessage = async (event) => {
            if (!pc)  pc = new RTCPeerConnection(); 
            const message = JSON.parse(event.data);

            if (message.type==="createOffer"){
                console.log("Receiver: offer received")
                pc.setRemoteDescription(message.sdp);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({type: "createAnswer", ID: meetingID, sdp: pc.localDescription}))
            } else if (message.type === "iceCandidate"){
                pc.addIceCandidate(message.candidate);
            }
        }

        addIceCandidates(socket, pc, meetingID);
        receiveTrack(pc);
        addTrack(pc);
    }

    function receiveTrack(pc: RTCPeerConnection){
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

    function addIceCandidates(WSConnection: WebSocket, peerConnection: RTCPeerConnection, meetingID: number){
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                WSConnection?.send(JSON.stringify({ type: 'iceCandidate', ID: meetingID , candidate: event.candidate }));
            }
        };
    }

    async function addTrack(peerConnection: RTCPeerConnection){
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
        if (ownVideoRef.current) {
            const videoOnlyStream = new MediaStream([stream.getVideoTracks()[0]]);
            ownVideoRef.current.srcObject = videoOnlyStream;
        }
        if (peerConnection) {
            stream.getTracks().forEach((track)=> peerConnection.addTrack(track, stream));
        }
    }

    return (
        <div>
            <input type="number" onChange={(e)=>setInputID(parseInt(e.target.value))}></input>
            <button onClick={createMeeting}>Create</button>
            <button onClick={joinMeeting}>Join</button>
            <video ref={videoRef} autoPlay playsInline></video>
            <video ref={ownVideoRef} autoPlay playsInline width={200}></video>
            <button onClick={()=>videoRef.current?.play()}>start</button>
        </div>
    );
}

export default App;
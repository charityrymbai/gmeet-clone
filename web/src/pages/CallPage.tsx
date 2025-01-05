import { useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { addIceCandidates, addOwnVideo, addTrack, receiveTrack } from "../utils/webRTCUtils";
import { useWebSocket } from "../utils/WebsocketContext";

const CallPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const ownVideoRef = useRef<HTMLVideoElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const params = useParams();
    const meetingIDStr = params.meetingIDStr;

    const { state } = location;
    const socket = useWebSocket();
    const mode = state?.mode;

    if (!socket) return <>Error no websocket connection .....</>

    if (!meetingIDStr) {
        console.log(params)
        setTimeout(()=>{
            navigate("/")
        }, 5 * 1000)
        return <>Error while getting you into call. Redirecting......</>;
    };
    const meetingID:number = parseInt(meetingIDStr);
    let pc: RTCPeerConnection | null = null;

    if (mode ==="create"){
        createMeeting(socket);
    } else if(mode === "join"){
        joinMeeting(socket);
    }

    function createMeeting(socket:WebSocket){
        pc = new RTCPeerConnection();
        
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
        addIceCandidates(pc, meetingID, socket);
        receiveTrack(pc, mediaStreamRef, videoRef);
        addTrack(pc);
        addOwnVideo(ownVideoRef);
    }

    function joinMeeting(socket:WebSocket){
        if(!pc) pc = new RTCPeerConnection();
        if(!socket) {console.log("no ws connection"); return; }

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

        addIceCandidates(pc, meetingID, socket);
        receiveTrack(pc, mediaStreamRef, videoRef);
        addTrack(pc);
        addOwnVideo(ownVideoRef);
    }
    return (
        <div>
            <video ref={videoRef} autoPlay playsInline></video>
            <video ref={ownVideoRef} autoPlay playsInline width={200}></video>
        </div>
    );
}

export default CallPage;
import { useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { addIceCandidates, addOwnVideo, addTrack, receiveTrack } from "../utils/webRTCUtils";
import { useWebSocket } from "../utils/WebsocketContext";
import ErrorMessage from "../components/ErrorMessage";
import { motion } from 'framer-motion';
import endCallIcon from "/end-call-icon.svg"

let pc: RTCPeerConnection | null = null;

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

    if(!socket || !meetingIDStr) return <ErrorMessage />

    const meetingID:number = parseInt(meetingIDStr);

    if (mode ==="create"){
        createMeeting(socket);
    } else if(mode === "join"){
        joinMeeting(socket);
    } else if (mode === undefined){
        return <ErrorMessage />
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
            } else if (message.type === "error", message.desp==="meetingID not found"){
                return <ErrorMessage />
            }
        }

        addIceCandidates(pc, meetingID, socket);
        receiveTrack(pc, mediaStreamRef, videoRef);
        addTrack(pc);
        addOwnVideo(ownVideoRef);
    }

    function endCall(){
        pc?.close();
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        if (ownVideoRef.current) {
            ownVideoRef.current.srcObject = null;
        }
        navigate("/");
        window.location.reload();
    }
    return (
        <div>
            <div className="h-screen w-screen flex justify-center items-start md:items-center bg-black">
                <video 
                    className="rounded-xl h-[90%]" 
                    ref={videoRef} 
                    autoPlay 
                    playsInline
                ></video>
            </div>
            <div className="fixed bottom-20 right-4 w-40 md:w-64">
                <video 
                    className="rounded-2xl"
                    ref={ownVideoRef} 
                    autoPlay 
                    playsInline
                ></video>
            </div>
            <div className="w-screen flex justify-center">
                <div className="p-3 rounded-2xl fixed bottom-4 w-fit bg-gray-800 flex justify-center">
                    <motion.button
                        whileHover={{
                            scale: 1.1,
                            transition: { duration: 0.1 },
                        }}
                        whileTap={{ scale: 0.9 }}
                        onClick={endCall}
                        className={"w-16"} 
                    >
                        <img src={endCallIcon} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

export default CallPage;
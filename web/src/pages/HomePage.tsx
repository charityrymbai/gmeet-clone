import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { waitForReceiverReady } from "../utils/webRTCUtils";
import { useWebSocket } from "../utils/WebsocketContext.tsx";
import Button from "../components/Button.tsx";


const HomePage = () => {
    const socket = useWebSocket();
    const [inputID, setInputID] = useState<number>(NaN);
    const [meetingIDAlert, setMeetingIDAlert] = useState<string>("")

    const [joinMeetingBtn, setJoinMeetingBtn] = useState<boolean>(true);

    useEffect(()=>{
        if(isNaN(inputID)){
            setJoinMeetingBtn(true);
        } else {
            setJoinMeetingBtn(false);
        }
    },[inputID])

    function showMeetingID(meetingID:number){
        setTimeout(()=>{
            setMeetingIDAlert("");
        }, 30 * 1000)
        setMeetingIDAlert(`Meeting Created. Your Meeting ID is ${meetingID}`)
    }

    const navigate = useNavigate();

    async function create(){
        if (!socket) {console.log("no ws connection"); return; }
        const meetingID = Math.floor(Math.random() * 9000) + 1000; //generates random 4 digit number
        console.log(`MeetingID = ${meetingID}`);
        socket.send(JSON.stringify({type: "sender", ID: meetingID})); 

        showMeetingID(meetingID);
        
        const receiverReady = await waitForReceiverReady(socket, meetingID, 30);

        if(!receiverReady){
            console.log("Receiver not ready. Aborting......")
            return;
        }
        const meetingIDStr = meetingID.toString();
        navigate(`/call/${meetingIDStr}`, { state: { mode: "create"} });

    }

    async function join(){
        const meetingIDStr = inputID.toString();
        navigate(`/call/${meetingIDStr}`, { state: { mode: "join"} });
    }

    return (
        <>
            <>
                <div className="fixed w-screen p-5 text-lg flex justify-between">
                    <img className="rounded-full w-12 md:w-16" src="/logo.png"/>
                    <img className="rounded-full w-12 md:w-16" src="/profile.png"/>
                </div>
            </>
        <div className="text-center md:text-left  h-screen p-5 flex flex-col gap-5 justify-center">
            <h1 className="text-7xl">Video Calls for everyone</h1>
            <h4>Connect and celebrate from anywhere with C-meet</h4>
            <div className="flex flex-col md:flex-row gap-4">
                <Button 
                    className="border-2 w-40 bg-blue-600 text-white p-4" 
                    onClick={create} text="New Meeting"
                    disabled={false}
                />
                <input 
                    className="border-2 rounded-lg p-4"
                    type="number" 
                    onChange={(e)=>setInputID(parseInt(e.target.value))}
                    placeholder="Enter the meeting ID"    
                ></input>
                <Button 
                    className="p-4"
                    onClick={join} 
                    text="Join"
                    disabled={joinMeetingBtn}
                />
            </div>
            <div>{meetingIDAlert}</div>
        </div>
        </>
    );
}

export default HomePage;
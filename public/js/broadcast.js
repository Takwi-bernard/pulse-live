import { supabase } from "./supabaseClient.js";

const socket = io();

const peerConnection = new RTCPeerConnection({
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
});

let localStream = null;
let screenStream = null;

const localVideo =
document.getElementById("localVideo");

const streamCode =
window.location.pathname
.split("/")
.pop();

console.log("Broadcast:", streamCode);

socket.emit(
    "joinStream",
    streamCode
);

/*
LOAD STREAM
*/

async function loadStream(){

    const { data,error } =
    await supabase
    .from("streams")
    .select("*")
    .eq(
        "stream_code",
        streamCode
    )
    .single();

    if(error){

        console.log(error);
        return;

    }

    const title =
    document.getElementById(
        "streamTitle"
    );

    if(title){

        title.innerText =
        data.title ||
        "Untitled Stream";

    }

}

loadStream();

/*
CAMERA
*/

async function startCamera(){

    try{

        localStream =
        await navigator
        .mediaDevices
        .getUserMedia({

            video:true,
            audio:true

        });

        localVideo.srcObject =
        localStream;

        localStream
        .getTracks()
        .forEach(track=>{

            peerConnection.addTrack(
                track,
                localStream
            );

        });

    }

    catch(err){

        console.log(err);

        alert(
        "Camera access denied."
        );

    }

}

startCamera();

/*
WEBRTC
*/

peerConnection.onicecandidate=
(event)=>{

    if(event.candidate){

        socket.emit(
            "candidate",
            {

                code:
                streamCode,

                candidate:
                event.candidate

            }
        );

    }

};

socket.on(
"answer",
async(answer)=>{

    await peerConnection
    .setRemoteDescription(
        answer
    );

});

socket.on(
"candidate",
async(candidate)=>{

    try{

        await peerConnection
        .addIceCandidate(
            candidate
        );

    }

    catch(e){

        console.log(e);

    }

});

/*
COPY LINK
*/

document
.getElementById(
"copyBtn"
)
.onclick=function(){

    const link =

    window.location.origin +

    "/watch/" +

    streamCode;

    navigator
    .clipboard
    .writeText(link);

    alert(
    "Invite copied!"
    );

};

/*
START STREAM
*/

document
.getElementById(
"startBtn"
)
.onclick=
async function(){

    const { error } =
    await supabase
    .from("streams")
    .update({

        is_live:true,

        started_at:
        new Date()

    })
    .eq(
        "stream_code",
        streamCode
    );

    if(error){

        alert(error.message);
        return;

    }

    const offer =
    await peerConnection
    .createOffer();

    await peerConnection
    .setLocalDescription(
        offer
    );

    socket.emit(
        "offer",
        {

            code:
            streamCode,

            offer:
            offer

        }
    );

    document
    .getElementById(
    "liveStatus"
    )
    .innerHTML=
    "🔴 LIVE";

    this.disabled=true;

};

/*
MIC
*/

document
.getElementById(
"micBtn"
)
.onclick=function(){

    if(!localStream)
    return;

    const track=
    localStream
    .getAudioTracks()[0];

    if(!track)
    return;

    track.enabled=
    !track.enabled;

    this.innerHTML=

    track.enabled ?

    "🎤":

    "🔇";

};

/*
CAMERA
*/

document
.getElementById(
"camBtn"
)
.onclick=function(){

    if(!localStream)
    return;

    const track=
    localStream
    .getVideoTracks()[0];

    if(!track)
    return;

    track.enabled=
    !track.enabled;

    this.innerHTML=

    track.enabled ?

    "📹":

    "🚫";

};

/*
SCREEN SHARE
*/

document
.getElementById(
"screenBtn"
)
.onclick=
async function(){

    try{

        screenStream=
        await navigator
        .mediaDevices
        .getDisplayMedia({

            video:true

        });

        localVideo.srcObject=
        screenStream;

        const sender=
        peerConnection
        .getSenders()
        .find(s=>

            s.track &&
            s.track.kind==="video"

        );

        if(sender){

            sender.replaceTrack(

                screenStream
                .getVideoTracks()[0]

            );

        }

        screenStream
        .getVideoTracks()[0]
        .onended=()=>{

            localVideo.srcObject=
            localStream;

            if(sender){

                sender.replaceTrack(

                    localStream
                    .getVideoTracks()[0]

                );

            }

        };

    }

    catch(err){

        console.log(err);

    }

};

/*
END STREAM
*/

document
.getElementById(
"endBtn"
)
.onclick=
async function(){

    socket.emit(
        "streamEnded",
        streamCode
    );

    await supabase
    .from("streams")
    .update({

        is_live:false,

        ended_at:
        new Date()

    })
    .eq(
        "stream_code",
        streamCode
    );

    peerConnection.close();

    if(localStream){

        localStream
        .getTracks()
        .forEach(track=>{

            track.stop();

        });

    }

    if(screenStream){

        screenStream
        .getTracks()
        .forEach(track=>{

            track.stop();

        });

    }

    localVideo.srcObject=
    null;

    document
    .getElementById(
    "liveStatus"
    )
    .innerHTML=
    "⚫ OFFLINE";

    alert(
    "Stream ended."
    );

    window.location.href=
    "/dashboard";

};
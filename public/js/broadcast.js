import { supabase } from "./supabaseClient.js";

const socket = io();

const peerConnection = new RTCPeerConnection({
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
});

let localStream;
let screenStream;

const localVideo =
document.getElementById("localVideo");

const streamCode =
window.location.pathname.split("/").pop();

console.log(streamCode);

// START CAMERA

async function startCamera(){

    try{

        localStream =
        await navigator.mediaDevices.getUserMedia({

            video:true,
            audio:true

        });

        localVideo.srcObject =
        localStream;

        localStream.getTracks().forEach(track=>{

            peerConnection.addTrack(
                track,
                localStream
            );

        });

    }

    catch(err){

        console.log(err);

        alert("Camera access denied.");

    }

}

startCamera();


// SOCKET SIGNALING

peerConnection.onicecandidate=(event)=>{

    if(event.candidate){

        socket.emit(
            "candidate",
            event.candidate
        );

    }

};

 socket = io();

socket.emit(
    "joinStream",
    streamCode
);

socket.on(
"answer",
async(answer)=>{

    await peerConnection
    .setRemoteDescription(answer);

});

socket.on(
"candidate",
async(candidate)=>{

    try{

        await peerConnection
        .addIceCandidate(candidate);

    }

    catch(e){

        console.log(e);

    }

});


// COPY INVITE

document
.getElementById("copyBtn")
.onclick=function(){

    const link =
    window.location.origin+
    "/watch?stream="+
    streamCode;

    navigator.clipboard.writeText(link);

    alert("Invite copied!");

};


// START STREAM

document
.getElementById("startBtn")
.onclick=async function(){

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

    const offer =
    await peerConnection
    .createOffer();

    await peerConnection
    .setLocalDescription(
        offer
    );

    socket.emit(
        "offer",
        offer
    );

    document
    .getElementById(
    "liveStatus"
    ).innerHTML=
    "🔴 LIVE";

    this.disabled=true;

};


// MIC

document
.getElementById("micBtn")
.onclick=function(){

    const track =
    localStream
    .getAudioTracks()[0];

    track.enabled=
    !track.enabled;

    this.innerHTML=
    track.enabled ?
    "🎤":"🔇";

};


// CAMERA

document
.getElementById("camBtn")
.onclick=function(){

    const track =
    localStream
    .getVideoTracks()[0];

    track.enabled=
    !track.enabled;

    this.innerHTML=
    track.enabled ?
    "📹":"🚫";

};


// SCREEN SHARE

document
.getElementById("screenBtn")
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

        sender.replaceTrack(
            screenStream
            .getVideoTracks()[0]
        );

        screenStream
        .getVideoTracks()[0]
        .onended=()=>{

            localVideo.srcObject=
            localStream;

            sender.replaceTrack(
                localStream
                .getVideoTracks()[0]
            );

        };

    }

    catch(err){

        console.log(err);

    }

};


// END STREAM

document
.getElementById("endBtn")
.onclick=
async function(){

    socket.emit(
        "streamEnded",
        streamCode
    );

    await supabase
    .from("streams")
    .update({

        is_live:false

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

    localVideo.srcObject=null;

    document
    .getElementById(
    "liveStatus"
    ).innerHTML=
    "⚫ OFFLINE";

    alert(
        "Stream ended."
    );

    window.location.href=
    "/dashboard";

};
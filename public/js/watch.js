import { supabase } from "./supabaseClient.js";

const socket = io();

const remoteVideo =
document.getElementById("remoteVideo");

const peerConnection =
new RTCPeerConnection({

    iceServers:[
        {
            urls:"stun:stun.l.google.com:19302"
        }
    ]

});

const params =
new URLSearchParams(
window.location.search
);

const streamCode =
params.get("stream");

let localStream;


// LOAD STREAM

async function loadStream(){

    const {data,error} =
    await supabase
    .from("streams")
    .select("*")
    .eq(
        "stream_code",
        streamCode
    )
    .single();

    if(error||!data){

        showExpired();

        return;

    }

    if(!data.is_live){

        showExpired();

        return;

    }

    document
    .getElementById(
    "streamTitle"
    ).innerText=
    data.title;

    document
    .getElementById(
    "streamCategory"
    ).innerText=
    data.category;

    document
    .getElementById(
    "hostName"
    ).innerText=
    "Live Host";

}

loadStream();


// RECEIVE VIDEO

peerConnection.ontrack=(event)=>{

    remoteVideo.srcObject=
    event.streams[0];

};


// RECEIVE OFFER

socket.on(
"offer",
async(offer)=>{

    await peerConnection
    .setRemoteDescription(
        offer
    );

    const answer=
    await peerConnection
    .createAnswer();

    await peerConnection
    .setLocalDescription(
        answer
    );

    socket.emit(
        "answer",
        answer
    );

});


// RECEIVE ICE

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


// SEND ICE

peerConnection.onicecandidate=(event)=>{

    if(event.candidate){

        socket.emit(
            "candidate",
            event.candidate
        );

    }

};


// VIEWER MIC

async function initAudio(){

    try{

        localStream=
        await navigator
        .mediaDevices
        .getUserMedia({

            audio:true,
            video:false

        });

        localStream
        .getAudioTracks()
        .forEach(track=>{

            track.enabled=false;

        });

    }

    catch(e){

        console.log(e);

    }

}

initAudio();


// MIC

window.toggleMic=function(){

    if(!localStream)return;

    const track=
    localStream
    .getAudioTracks()[0];

    track.enabled=
    !track.enabled;

};


// FULLSCREEN

window.toggleFullscreen=function(){

    remoteVideo
    .requestFullscreen();

};


// COPY LINK

window.copyStreamLink=function(){

    navigator
    .clipboard
    .writeText(
    window.location.href
    );

    alert(
    "Link copied."
    );

};


// LEAVE

window.leaveStream=function(){

    socket.disconnect();

    peerConnection.close();

    window.location.href=
    "/view";

};


// CHAT

window.sendMessage=function(){

    const input=
    document
    .getElementById(
    "chatMessage"
    );

    if(
    input.value.trim()==""
    ) return;

    socket.emit(
    "chat",
    input.value
    );

    input.value="";

};


socket.on(
"chat",
(msg)=>{

    const messages=
    document
    .getElementById(
    "messages"
    );

    messages.innerHTML+=`

    <div class="chat-message">

    ${msg}

    </div>

    `;

    messages.scrollTop=
    messages.scrollHeight;

});


// STREAM ENDED

socket.on(
"streamEnded",
()=>{

    alert(
    "This stream has ended."
    );

    window.location.href=
    "/view";

});


// EXPIRED

function showExpired(){

document.body.innerHTML=`

<div class="container">

<div class="card">

<h1>

Stream Ended

</h1>

<p>

This stream is no longer available.

</p>

<button onclick="window.location='/view'">

Browse Streams

</button>

</div>

</div>

`;

}


// VIEWER JOIN

window.onload=()=>{

    socket.emit(
        "viewerJoined",
        streamCode
    );

};
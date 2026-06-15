import { supabase } from "./supabaseClient.js";

const socket = io();

const remoteVideo =
document.getElementById("remoteVideo");

const peerConnection =
new RTCPeerConnection({
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
});

const streamCode =
window.location.pathname
.split("/")
.pop();

console.log("Watching:", streamCode);

socket.emit(
    "joinStream",
    streamCode
);

let localStream = null;

/*
========================
LOAD STREAM
========================
*/

async function loadStream() {

    const { data, error } =
    await supabase
    .from("streams")
    .select("*")
    .eq("stream_code", streamCode)
    .single();

    if (error || !data) {
        showExpired();
        return;
    }

    if (!data.is_live) {
        showExpired();
        return;
    }

    const title =
    document.getElementById("streamTitle");

    if(title){
        title.innerText =
        data.title || "Untitled";
    }

    const category =
    document.getElementById("streamCategory");

    if(category){
        category.innerText =
        data.category || "";
    }

    const host =
    document.getElementById("hostName");

    if(host){
        host.innerText =
        "Live Host";
    }

}

loadStream();

/*
========================
VIDEO
========================
*/

peerConnection.ontrack =
(event)=>{

    remoteVideo.srcObject =
    event.streams[0];

};
socket.emit("joinStream", streamCode);

/*
========================
OFFER
========================
*/

socket.on(
"offer",
async(data)=>{

    await peerConnection
    .setRemoteDescription(
        data
    );

    const answer =
    await peerConnection
    .createAnswer();

    await peerConnection
    .setLocalDescription(
        answer
    );

    socket.emit(
        "answer",
        {
            code:
            streamCode,

            answer:
            answer
        }
    );

});

/*
========================
ICE
========================
*/

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

peerConnection.onicecandidate =
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

/*
========================
VIEWER AUDIO
========================
*/

async function initAudio(){

    try{

        localStream =
        await navigator
        .mediaDevices
        .getUserMedia({

            audio:true,
            video:false

        });

        localStream
        .getAudioTracks()
        .forEach(track=>{

            track.enabled =
            false;

        });

    }

    catch(e){

        console.log(e);

    }

}

initAudio();

/*
========================
MIC
========================
*/

window.toggleMic =
function(){

    if(!localStream)
    return;

    const track =
    localStream
    .getAudioTracks()[0];

    if(!track)
    return;

    track.enabled =
    !track.enabled;

};

/*
========================
FULLSCREEN
========================
*/

window.toggleFullscreen =
function(){

    if(remoteVideo.requestFullscreen){

        remoteVideo.requestFullscreen();

    }

};

/*
========================
COPY LINK
========================
*/

window.copyStreamLink =
function(){

    navigator.clipboard
    .writeText(
        window.location.href
    );

    alert(
        "Link copied!"
    );

};

/*
========================
LEAVE
========================
*/

window.leaveStream =
function(){

    socket.disconnect();

    peerConnection.close();

    window.location.href =
    "/view";

};

/*
========================
CHAT
========================
*/

window.sendMessage =
function(){

    const input =
    document
    .getElementById(
        "chatMessage"
    );

    if(
        input.value.trim() === ""
    ){
        return;
    }

    socket.emit(
        "chat",
        {
            code:
            streamCode,

            message:
            input.value
        }
    );

    input.value = "";

};

socket.on(
"chat",
(msg)=>{

    const messages =
    document
    .getElementById(
        "messages"
    );

    messages.innerHTML +=
    `<div class="chat-message">
    ${msg}
    </div>`;

    messages.scrollTop =
    messages.scrollHeight;

});

/*
========================
STREAM ENDED
========================
*/

socket.on(
"streamEnded",
()=>{

    alert(
        "This stream has ended."
    );

    window.location.href =
    "/view";

});

/*
========================
EXPIRED
========================
*/

function showExpired(){

document.body.innerHTML = `

<div class="container">

<div class="card">

<h1>Stream Ended</h1>

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
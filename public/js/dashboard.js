
import { supabase } from "./supabaseClient.js";

// SESSION CHECK
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "/pages/login.html";
}

// LOAD PROFILE

export async function loadUserProfile() {

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error && error.code !== "PGRST116") {
        console.error("Profile error:", error);
        return;
    }

    document.getElementById("userEmail").innerText =
        data?.full_name || user.email;
}
loadUserProfile();

// GO LIVE
window.goLive = async function () {

    

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "/pages/login.html";
        return;
    }

    const { data, error } = await supabase
        .from("streams")
        .insert({
            user_id: user.id,
            title: "My Live Stream",
            is_live: true
        })
        .select()
        .single();

    if (error) {
        console.error(error);
        alert(error.message);
        return;
    }

    localStorage.setItem("currentStream", JSON.stringify(data));

    alert("You are now LIVE!");
    window.location.href = "/pages/live.html";
};
// WATCH LIVE (placeholder for next module)
window.watchLive = async function () {

    const { data, error } = await supabase
        .from("streams")
        .select("*")
        .eq("is_live", true)
        .order("created_at", { ascending: false });

    if (error) {
        alert(error.message);
        return;
    }

    if (!data || data.length === 0) {
        alert("No live streams available.");
        return;
    }

    // Store selected stream
    localStorage.setItem(
        "currentStream",
        JSON.stringify(data[0])
    );

    window.location.href = "/pages/view.html";
};
// Generate unique stream code
function generateStreamCode() {
    return "pulse-" +
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).substring(2, 8);
}

// Get stream code from URL
const code = window.location.pathname.split("/").pop();

console.log("Stream Code:", code);

window.copyInvite = function () {

    const inviteLink =
        window.location.origin +
        "/view/" +
        code;

    navigator.clipboard.writeText(inviteLink);

    alert("Invite link copied!");
};

localStream.getTracks().forEach(track => {
    peerConnection.addTrack(
        track,
        localStream
    );
});


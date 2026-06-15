import { supabase } from "./supabaseClient.js";

// SESSION
const user = JSON.parse(
    localStorage.getItem("user")
);

if (!user) {
    window.location.href = "/login";
}

// LOAD USER PROFILE
async function loadUserProfile() {

    const { data, error } =
    await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

    if (error && error.code !== "PGRST116") {
        console.log(error);
        return;
    }

    const userEmail =
    document.getElementById("userEmail");

    if (userEmail) {
        userEmail.innerText =
        data?.full_name || user.email;
    }
}

loadUserProfile();


// CREATE STREAM
window.goLive = async function () {

    const user =
    JSON.parse(
        localStorage.getItem("user")
    );

    if (!user) {
        window.location.href = "/login";
        return;
    }

     window.location.href = "/pages/live.html";
};


// WATCH LIVE
window.watchLive = function () {

    window.location.href = "/pages/watch.html";

};


// LOGOUT
window.logout = async function () {

    localStorage.removeItem("user");
    localStorage.removeItem("currentStream");

    await supabase.auth.signOut();

    window.location.href = "/login";

};
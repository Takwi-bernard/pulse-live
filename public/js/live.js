import { supabase } from "./supabaseClient.js";

console.log("create.js loaded");

window.createStream = async function () {

    console.log("Create Stream clicked");

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    if (!user) {
        alert("Please login first.");
        window.location.href = "/login";
        return;
    }

    const title =
        document.getElementById("title").value.trim();

    const description =
        document.getElementById("description").value.trim();

    const category =
        document.getElementById("category").value;

    const duration =
        document.getElementById("duration").value.trim();

    if (!title) {
        alert("Please enter a stream title.");
        return;
    }

    const streamCode = generateStreamCode();

    console.log("Creating stream:", streamCode);

    const { data, error } = await supabase
        .from("streams")
        .insert({
            user_id: user.id,
            title: title,
            description: description,
            category: category,
            expected_duration: duration,
            stream_code: streamCode,
            is_live: false
        })
        .select()
        .single();

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
        alert(error.message);
        return;
    }

    localStorage.setItem(
        "currentStream",
        JSON.stringify(data)
    );

    const shareLink =
        window.location.origin +
        "/view/" +
        streamCode;

    alert(
        "Stream created successfully!\n\n" +
        shareLink
    );

    window.location.href =
        "/broadcast/" +
        streamCode;
};

function generateStreamCode() {

    return (
        "pulse-" +
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}
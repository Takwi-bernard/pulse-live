import { supabase } from "./supabaseClient.js";

const container = document.getElementById("streamList");

async function loadStreams() {
  await supabase
.from("streams")
.delete()
.eq("is_live", false);
    if (!container) return;

    const { data, error } = await supabase
        .from("streams")
        .select("*")
        .eq("is_live", true)
        .order("started_at", {
            ascending: false

        });

      
console.log(data);
console.log(error);
    if (error) {
        console.log(error);
        return;
    }

    container.innerHTML = "";

    if (!data || data.length === 0) {

        container.innerHTML = `
        <div class="card">
            <h3>No Live Streams</h3>
            <p>Come back later.</p>
        </div>
        `;

        return;
    }

    data.forEach(stream => {

        container.innerHTML += `
        <div class="stream-card">

            <h2>${stream.title}</h2>

            <p>🔴 LIVE</p>

            <p>${stream.category}</p>

            <button onclick="joinStream('${stream.stream_code}')">
                Join Stream
            </button>

        </div>
        `;

    });
}

window.joinStream = function (code) {

    console.log("Joining:", code);

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    if (!user) {

        localStorage.setItem(
            "pendingStream",
            code
        );

        window.location.href = "/login";
        return;
    }

    window.location.href =
        "/watch/" + code;
};

window.onload = () => {
    loadStreams();
    setInterval(loadStreams, 5000);
};
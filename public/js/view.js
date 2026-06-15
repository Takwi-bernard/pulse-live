import { supabase }
    from "./supabaseClient.js";

async function loadStreams() {

    const { data, error } =

        await supabase

            .from("streams")

            .select("*")

            .eq("is_live", true)

            .order(
                "started_at",
                {
                    ascending: false
                }
            );

    if (error) {

        console.log(error);

        return;

    }

    renderStreams(data);

}

loadStreams();

function renderStreams(streams) {

    const container =

        document.getElementById(
            "streamList"
        );

    container.innerHTML = "";

    if (streams.length == 0) {

        container.innerHTML = `

<div class="card">

<h2>

No active streams.

</h2>

<p>

Come back later.

</p>

</div>

`;

        return;

    }

    streams.forEach(stream => {

        container.innerHTML += `

<div class="stream-card">

<div class="stream-thumb">
</div>

<div class="stream-content">

<p class="live-badge">

🔴 LIVE

</p>

<h3>

${stream.title}

</h3>

<p>

${stream.category}

</p>

<p>

👥 ${stream.viewers || 0}

Watching

</p>

<button

class="watch-btn"

onclick="joinStream(
'${stream.stream_code}'
)">

Watch Live

</button>

</div>

</div>

`;

    });

}



window.joinStream = function(code){

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    if(!user){

        localStorage.setItem(
            "pendingStream",
            code
        );

        window.location.href="/login";
        return;
    }

    window.location.href=
        "/pages/watch.html?stream="+code;
}
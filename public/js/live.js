import { supabase }
    from "./supabaseClient.js";

window.createStream =
    async function () {

        const user =
            JSON.parse(
                localStorage.getItem("user")
            );

        const code =
            generateStreamCode();

        const title =
            document.getElementById(
                "title"
            ).value;

        const description =
            document.getElementById(
                "description"
            ).value;

        const category =
            document.getElementById(
                "category"
            ).value;

        const duration =
            document.getElementById(
                "duration"
            ).value;

        const { data, error } =
            await supabase
                .from("streams")
                .insert({

                    user_id: user.id,

                    title,

                    description,

                    category,

                    expected_duration:
                        duration,

                    stream_code: code,

                    is_live: false

                })
                .select()
                .single();

        if (error) {

            alert(error.message);

            return;

        }

        const link =
            window.location.origin +
            "/view/" + code;

        localStorage.setItem(
            "currentStream",
            JSON.stringify(data)
        );

        alert(
            "Share this link:\n\n" +
            link
        );

        window.location.href =
            "/broadcast/" + code;

    };

    // Generate unique stream code
function generateStreamCode() {
    return "pulse-" +
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).substring(2, 8);
}
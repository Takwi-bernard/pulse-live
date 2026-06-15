
import { supabase } from "./supabaseClient.js";
// REGISTER
window.register = async function () {

    const fullName = document.getElementById("fullName").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                username: username
            }
        }
    });

    const { data: sessionData } = await supabase.auth.getUser();

if (sessionData.user) {
    await supabase
        .from("profiles")
        .upsert({
            id: sessionData.user.id,
            full_name: fullName,
            username: username
        });
}
    if (error) {
        alert(error.message);
        return;
    }

    alert("Account created successfully!");
    window.location.replace("/login");
};

// LOGIN
window.login = async function () {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.replace("/dashboard");
};

// NAVIGATION


// LOGOUT
window.logout = async function () {

    await supabase.auth.signOut();

    localStorage.removeItem("user");

    window.location.replace("/login");
};
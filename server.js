const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});

/* =========================
   🧭 CLEAN NAVIGATION ROUTES
   ========================= */

// 🟣 SPLASH
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/splash.html"));
});
//welcome page
app.get("/welcome", (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/welcome.html"));
});

// 🔐 LOGIN
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/login.html"));
});

// 📝 REGISTER
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/register.html"));
});

// 📊 DASHBOARD
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/dashboard.html"));
});

// 🔴 LIVE
app.get("/live", (req, res) => {
    res.sendFile(path.join(__dirname, "public/pages/live.html"));
});

app.get("/view/:code", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public/pages/view.html"
        )
    );
});
app.get(
"/broadcast/:code",
(req,res)=>{

res.sendFile(
path.join(
__dirname,
"public/pages/broadcast.html"
)
);

}
);
app.get(
"/watch/:code",
(req,res)=>{

res.sendFile(
path.join(
__dirname,
"public/pages/watch.html"
)
);

}
);

app.get("/create",(req,res)=>{

res.sendFile(
path.join(
__dirname,
"public/pages/create.html"
));

});




app.get("/view",(req,res)=>{

res.sendFile(
path.join(
__dirname,
"public/pages/view.html"
));

});

app.get("/watch",(req,res)=>{

res.sendFile(
path.join(
__dirname,
"public/pages/watch.html"
));

});

/* =========================
   ⚡ SOCKET.IO (REAL TIME)
   ========================= */

io.on("connection",(socket)=>{

    console.log("User connected");

    socket.on("joinStream",(streamCode)=>{

        socket.join(streamCode);

        socket.to(streamCode).emit(
            "viewerJoined"
        );

    });

    socket.on("offer",(data)=>{

        socket.to(data.code).emit(
            "offer",
            data.offer
        );

    });

    socket.on("answer",(data)=>{

        socket.to(data.code).emit(
            "answer",
            data.answer
        );

    });

    socket.on("candidate",(data)=>{

        socket.to(data.code).emit(
            "candidate",
            data.candidate
        );

    });

    socket.on("chat",(data)=>{

        socket.to(data.code).emit(
            "chat",
            data.message
        );

    });

    socket.on("streamEnded",(code)=>{

        socket.to(code).emit(
            "streamEnded"
        );

    });

    socket.on("disconnect",()=>{

        console.log("User disconnected");

    });

});

app.use((req,res)=>{
    res.status(404).send("Page not found");
});
/* =========================
   🚀 START SERVER
   ========================= */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
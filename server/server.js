const db_conncection_f = require("./db");
const models = require("./model");
const express = require("express");
var cors = require('cors');
const app = express();
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:4200"
    }
});

db_conncection_f();
app.use(express.urlencoded({ extent: false }));
app.use(express.json());
app.use(cors());

//all route
app.get("/getUsername/:username", async (req, res) => {
    const user = req.params;
    if (user) {
        const query = await models.find(user).exec();
        if (query.length > 0) { res.send(true).status(200); }
        else { res.send(false).status(200); }
    }
    else { res.send("bad request").status(400); }
});

app.get("/getScore/:username", async (req, res) => {
    const username = req.params;

    if (username) {
        const query = await models.find(username).select("score").exec();
        if (query.length > 0) {
            res.send(query).status(200);
        }
        else { res.send(false).status(200); }
    }
    else { res.send("bad request").status(400); }
});

app.post("/insertUser", async (req, res) => {
    const user = req.body;
    if (user) {
        const user_instance = new models(user);
        await user_instance.save();
        res.send(true).status(200);
    }
    else {
        res.send("insertUser fail").status(400);
    }

});

app.post("/login", async (req, res) => {
    const user = req.body;
    if (user) {
        const users = await models.find(user).select("username password").exec();
        if (users.length > 0) { res.send(true).status(200) }
        else { res.send(false).status(400) }
    }
    else {
        res.send("login fail").status(400);
    }

});

//add the engine
const jsChessEngine = require('js-chess-engine');
var game;

//game.printToConsole();



//socket.io handle
var players = 0;
var players_c = 0;
var player_arr = [];
var white;
var black;
io.on("connection", (socket) => {




    socket.emit("connected", "now you are connected");
    console.log("new client connected");
    if (players == 0) {
        socket.emit("setWhite", true);
    }
    else if (players == 1) {
        socket.emit("setBlack", true);
        game = new jsChessEngine.Game();
        game.printToConsole();
    }
    else {
        socket.emit("setWatcher", true);
    }
    players++;
    players_c++;



    socket.on("sendUsername", (user) => {
        player_arr.push(user);
        if (player_arr.length == 1) {
            white = player_arr[0];
        }
        if (player_arr.length == 2) {
            black = player_arr[1];

        }
        if (player_arr.length >= 2) {
            io.sockets.emit("setPlayer", white, black)
        }
    })


    if (players >= 2) {
        io.sockets.emit("setLoader", false);
    }




    socket.on("chat message", (message) => {
        message = message.toString();
        console.log("Received:", message);
        io.sockets.emit("chat message", message);
    });

    socket.on("PossibleMovesReq", (position, user) => {
        if (user == white || user == black) {
            message = game.moves(position);
            console.log(message);
            io.sockets.emit("chat private", message);
        }
    })

    socket.on("movePiece", (new_p, old_p, user) => {
        if (user == white || user == black) {
            console.log("move");
            // game.removePiece(new_p);
            game.move(old_p, new_p);
            console.log(game.exportJson());
            game.printToConsole();
            io.sockets.emit("moveFrontEnd", new_p, old_p);
        }
    })

    /*/
        socket.on("chat private", (message, user) => {
            if (user == white || user == black) {
                console.log(player_arr);
                console.log("Received:", message);
                io.sockets.emit("chat private", message);
            }
    
        })
    */


    socket.on("disconnect", () => {
        players_c--;
        if (players_c < 2) {
            player_arr = [];
            players = 0;
            players_c = 0;

            io.sockets.emit("setFinish", true);
        }
        console.log("A client has disconnected");
    });

});





httpServer.listen(3000, () => {
    console.log("ws server listen on port 3000");
});

app.listen(8080, () => {
    console.log("Server listen on port 8080");
});

//inserimento dell'engine per il corretto controllo della partita


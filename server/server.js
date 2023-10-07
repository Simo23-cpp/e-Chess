const db_conncection_f = require("./db");
const global = require("./config");
const models = require("./model");
const express = require("express");
var cors = require('cors');
const app = express();
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*"
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


app.get("/setScore/:username/:score", async (req, res) => {
    const user = req.params.username;

    const score = req.params.score;

    const player = { username: user };
    if (user) {
        await models.findOneAndUpdate({ username: user }, { score: score });
        res.send("update").status(200);
    }
    else {
        res.send("bad request").status(400);
    }
})


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

//socket.io global var
var Arr_rooms = [];




var contatore;
var arr_story;
var history = [];
var players = 0;
var players_c = 0;
var main = 0;
var player_arr = [];
var white;
var black;
var w_score;
var b_score;


//socket.io handler
io.on("connection", (socket) => {
    //connection handler
    console.log("new client connected");
    socket.emit("connected");

    //send rooms to homepage
    socket.on("Send_rooms", () => {
        io.sockets.emit("send_arr", Arr_rooms);
    })

    //handle for room's creation
    socket.on("createRoom", (name, time) => {
        var room = {
            room_name: name,
            room_time: time,
            room_players: 1
        }
        Arr_rooms.push(room);
        console.log(room.name)
        socket.join("room-" + room.room_name);
        io.sockets.emit("send_arr", Arr_rooms);
        io.sockets.in("room-" + room.room_name).emit("connect_room");
    })

    //handle for room's join
    socket.on("join", (name) => {
        let stanza = Arr_rooms.find(item => item.room_name == name);
        console.log(stanza);
        socket.join("room-" + name);
        stanza.room_players++;
        io.sockets.emit("send_arr", Arr_rooms);
    })

    if (players == 0) {
        socket.emit("setWhite", true);
        main++;
    }
    else if (players == 1) {
        socket.emit("setBlack", true);
        game = new jsChessEngine.Game();
        //game.printToConsole(); command for print the game to console
        io.sockets.emit("start_w_timer");
        main++;
    }
    else {
        socket.emit("setWatcher", true, history, arr_story, contatore);
    }
    players++;
    players_c++;



    socket.on("sendUsername", (user, score) => {
        player_arr.push(user);
        if (player_arr.length == 1) {
            white = player_arr[0];
            w_score = score;
        }
        if (player_arr.length == 2) {
            black = player_arr[1];
            b_score = score
            if (black === white) {
                io.sockets.emit("invalidgame");
            }

        }
        if (player_arr.length >= 2) {
            io.sockets.emit("setPlayer", white, black, w_score, b_score);
        }
    })


    if (players >= 2) {
        io.sockets.emit("setLoader", false);
    }




    socket.on("chat message", (message) => {
        message = message.toString();
        io.sockets.emit("chat message", message);
    });

    socket.on("PossibleMovesReq", (position, user) => {
        if (user == white || user == black) {
            message = game.moves(position);

            socket.emit("chat private", message);
        }
    })

    socket.on("movePiece", (new_p, old_p, user) => {
        if (user == white || user == black) {

            history.push(old_p);
            history.push(new_p);

            game.move(old_p, new_p);

            //game.printToConsole();
            io.sockets.emit("moveFrontEnd", new_p, old_p);
            let checkmate = game.exportJson().checkMate;
            let isFinish = game.exportJson().isFinished;


            if (checkmate && isFinish) {
                let winner = game.exportJson().turn;
                io.sockets.emit("setWinner", winner);
                io.sockets.emit("setFinish", true);
            }
            else if (!checkmate && isFinish) {
                io.sockets.emit("draw", true);
            }
        }
    })


    socket.on("refreshHistory", (story, counter) => {
        arr_story = story;
        contatore = counter;
    })

    socket.on("arrocco", (new_p, old_p, user) => {
        if (user == white) {

            history.push(old_p);
            history.push(new_p);

        }
    })

    socket.on("exit", async (user) => {
        if (user == black || user == white) {

            main--;
            io.sockets.emit("abbandono", user);
            io.sockets.emit("setFinish", true);
            if (user == black) {
                if (b_score >= 10) {
                    b_score -= 10;
                    await models.findOneAndUpdate({ username: black }, { score: b_score });
                }
            }
            else if (user == white) {
                if (w_score >= 10) {
                    w_score -= 10;
                    await models.findOneAndUpdate({ username: white }, { score: w_score });
                }
            }

        }
    })

    socket.on("change_w", () => {
        io.sockets.emit("change");
    })

    socket.on("change_b", () => {
        io.sockets.emit("change2");
    })


    socket.on("disconnect", () => {
        players_c--;
        if (players_c < 2 || main < 2) {
            player_arr = [];
            players = 0;
            players_c = 0;
            history = [];
            arr_story = [];
            io.sockets.emit("setFinish", true);
        }
        console.log("A client has disconnected");
    });

});





httpServer.listen(global.SOCKET_IO_PORT, () => {
    console.log("ws server listen on port 3000");
});

app.listen(global.SERVER_PORT, () => {
    console.log("Server listen on port 8080");
});




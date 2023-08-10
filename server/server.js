const db_conncection_f = require("./db");
const models = require("./model");
const express = require("express");
var cors = require('cors');
const app = express();
//const { createServer } = require("http");
//const { Server } = require("socket.io");
//const httpServer = createServer(app);
//const io = new Server(httpServer);

db_conncection_f();
app.use(express.urlencoded({ extent: false }));
app.use(express.json());
app.use(cors());

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
    console.log(username);
    const query = await models.find(username).select("username score").exec();
    console.log(query);
    res.send(query).status(200);
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



app.listen(8080, () => {
    console.log("Server listen on port 8080");
});

//inserimento dell'engine per il corretto controllo della partita


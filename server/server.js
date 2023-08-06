//gestione delle route tramite socketio

//inizializzazione
const express = require("express");
const { CreateServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const httpServer = CreateServer(app);
const io = new Server(httpServer);

//inserimento dell'engine per il corretto controllo della partita


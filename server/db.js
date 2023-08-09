const mongoose = require("mongoose");


const mongoDB = "mongodb://127.0.0.1:27017/test";


async function main() {
    await mongoose.connect(mongoDB);

    console.log("connesso");
}



module.exports = main;
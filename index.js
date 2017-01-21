require('dotenv').config();
let express = require("express");
let bodyParser = require("body-parser");
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

require("./routes/user.js")(app);
require("./routes/expense.js")(app);
require("./routes/admin")(app);

let MongoClient = require('mongodb');
global.database = ''
MongoClient.connect(process.env.MONGODB_URL, function (err, db) {
    if (!err) {
        console.log('connected to database');
        database = db
    } else {
        console.log('cannot connect to database', err);
        server.close()
    }
});

let server = app.listen(process.env.SERVER_PORT, function () {
    console.log("Listening on port %s...", server.address().port);
});
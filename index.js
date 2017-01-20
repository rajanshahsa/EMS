let express = require("express");
let bodyParser = require("body-parser");
let app = express();

require('dotenv').config();
require('./messages');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var routes = require("./routes/user.js")(app);

let server = app.listen(process.env.SERVER_PORT, function () {
    console.log("Listening on port %s...", server.address().port);
});
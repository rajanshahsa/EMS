var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var server = app.listen(3000, function () {
    console.log("Listening on port %s...", server.address().port);
});

app.post("/user/signUp", function (req, res) {

    /*
            userName : "rajan",
            emailId : "rajan.shah@solutionanalysts.com,
            sex : "M",
            dob : 19-10-1990,
            mobileNo : 9377929445
    */
    if (!req.body.username || !req.body.password || !req.body.sex || !req.body.dob || !req.body.mobileNo || !req.body.emailId) {
        return res.send({ "status": "error", "message": "missing a parameter" });
    } else {
        var jwt = require('jsonwebtoken');
        // Retrieve
        var MongoClient = require('mongodb').MongoClient;
        // Connect to the db
        MongoClient.connect("mongodb://127.0.0.1:27017/EMS", function (err, db) {
            if (!err) {
                var collection = db.collection('User');
                //Create some users
                var token = jwt.sign(req.body.emailId, "secret");
                console.log(token);
                var user1 = { username: req.body.username, password: req.body.password, sex: req.body.sex, dob: req.body.dob, mobileNo: req.body.mobileNo, emailId: req.body.emailId };

                // Insert some users
                collection.insert([user1], function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        var data = {
                            userId: result._id,
                            username: req.body.username,
                            emailId: req.body.emailId,
                            sex: req.body.sex,
                            dob: req.body.dob,
                            mobileNo: req.body.mobileNo,
                        }
                        var body = {
                            xAuthToken: token,
                            data: data,
                            message: "valid user",
                            status: 1
                        }
                        return res.send(body)
                        console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
                    }
                    //Close connection
                    db.close();
                });
            }
            else {
                console.log(err)
            }
        });
    }
});

app.post("/user/login", function (req, res) {
    /*
    "{ message : ""Success"", status : 1, x-auth-token : XASDXSDFfdsfs, data : {
    userId : 1
     userName : ""rajan"",
     emailId : ""rajan.shah@solutionanalysts.com,
     sex : ""M"",
     dob : 19-10-1990,
     mobileNo : 9377929445
    userType : admin / normal
    }
    }"
    */
    if (!req.body.emailId || !req.body.password) {
        return res.send({ "status": "error", "message": "missing a parameter" });
    } else {
        console.log("Authenticate");
        var jwt = require('jsonwebtoken');
        var token = jwt.sign(req.body.emailId, "secret");
        console.log(token);
        // Retrieve
        var MongoClient = require('mongodb').MongoClient;
        // Connect to the db
        MongoClient.connect("mongodb://127.0.0.1:27017/EMS", function (err, db) {
            if (!err) {
                var EMS = db.collection('User');
                var result = EMS.find({ $and: [{ emailId: req.body.emailId }, { password: req.body.password }] }).toArray(function (err, result) {
                    if (err) {
                        var body = {
                            message: "Error occurred",
                            status: 0
                        }
                        db.close();
                        return res.send(body)

                        console.log(err);
                    } else if (result.length) {
                        var data = {
                            username: result[0].username,
                            emailId: result[0].emailId,
                            sex: result[0].sex,
                            dob: result[0].dob,
                            mobileNo: result[0].mobileNo
                        }
                        var body = {
                            xAuthToken: token,
                            data: data,
                            message: "Success",
                            status: 1
                        }
                        db.close();
                        return res.send(body)
                    } else {
                        var body = {
                            message: "Invalid Credentials",
                            status: 0
                        }
                        db.close();
                        return res.send(body)

                        console.log('No document(s) found with defined "find" criteria!');
                    }
                    //Close connection
                    db.close();
                });

            }
            else {
                console.log(err)
            }
        });
    }
});

app.get("/user/getUser", function (req, res) {
    // Retrieve
    var MongoClient = require('mongodb').MongoClient;
    // Connect to the db
    MongoClient.connect("mongodb://127.0.0.1:27017/EMS", function (err, db) {
        if (!err) {
            var EMS = db.collection('User');
            var result = EMS.find({}).toArray(function (err, result) {
                if (err) {
                    var body = {
                        message: "Error occurred",
                        status: 0
                    }
                    db.close();
                    return res.send(body)

                    console.log(err);
                } else if (result.length) {
                    var token = req.get("xAuthToken")
                    var jwt = require('jsonwebtoken');
                    var decoded = jwt.decode(token, { complete: true });
                    var userArray = []
                    for (var i = 0; i < result.length; i++) {
                        if (decoded.payload !== result[i].emailId) {
                            var data = {
                                username: result[i].username,
                                emailId: result[i].emailId,
                                sex: result[i].sex,
                                dob: result[i].dob,
                                mobileNo: result[i].mobileNo
                            }
                            userArray.push(data);
                        }


                    }

                    var body = {
                        data: userArray,
                        message: "Success",
                        status: 1
                    }
                    db.close();
                    return res.send(body)
                } else {
                    var body = {
                        message: 'No user found',
                        status: 0
                    }
                    db.close();
                    return res.send(body)

                    console.log('No document(s) found with defined "find" criteria!');
                }
                //Close connection
                db.close();
            });

        }
        else {
            console.log(err)
        }
    });
});

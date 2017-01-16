let express = require("express");
let bodyParser = require("body-parser");
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let server = app.listen(3000, function () {
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
        let jwt = require('jsonwebtoken');
        // Retrieve
        let MongoClient = require('mongodb').MongoClient;
        // Connect to the db
        MongoClient.connect("mongodb://127.0.0.1:27017/EMS", function (err, db) {
            if (!err) {
                let collection = db.collection('User');
                //Create some users
                let token = jwt.sign(req.body.emailId, "secret");
                let user1 = { username: req.body.username, password: req.body.password, sex: req.body.sex, dob: req.body.dob, mobileNo: req.body.mobileNo, emailId: req.body.emailId };

                // Insert some users
                collection.insert([user1], function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        let data = {
                            userId: result._id,
                            username: req.body.username,
                            emailId: req.body.emailId,
                            sex: req.body.sex,
                            dob: req.body.dob,
                            mobileNo: req.body.mobileNo,
                        }
                        let body = {
                            xAuthToken: token,
                            data: data,
                            message: "valid user",
                            status: 1
                        }
                        return res.send(body)
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
        let jwt = require('jsonwebtoken');
        let token = jwt.sign(req.body.emailId, "secret");
        // Retrieve
        let MongoClient = require('mongodb').MongoClient;
        // Connect to the db
        MongoClient.connect("mongodb://127.0.0.1:27017/EMS", function (err, db) {
            if (!err) {
                let EMS = db.collection('User');
                let result = EMS.find({ $and: [{ emailId: req.body.emailId }, { password: req.body.password }] }).toArray(function (err, result) {
                    if (err) {
                        let body = {
                            message: "Error occurred",
                            status: 0
                        }
                        db.close();
                        return res.send(body)
                    } else if (result.length) {
                        let data = {
                            username: result[0].username,
                            emailId: result[0].emailId,
                            sex: result[0].sex,
                            dob: result[0].dob,
                            mobileNo: result[0].mobileNo
                        }
                        let body = {
                            xAuthToken: token,
                            data: data,
                            message: "Success",
                            status: 1
                        }
                        db.close();
                        return res.send(body)
                    } else {
                        let body = {
                            message: "Invalid Credentials",
                            status: 0
                        }
                        db.close();
                        return res.send(body)
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
    if (req.get("xAuthToken")) {
        // Retrieve
        let MongoClient = require('mongodb').MongoClient;
        // Connect to the db
        MongoClient.connect("mongodb://127.0.0.1:27017/EMS", function (err, db) {
            if (!err) {
                let EMS = db.collection('User');
                let result = EMS.find({}).toArray(function (err, result) {
                    if (err) {
                        let body = {
                            message: "Error occurred",
                            status: 0
                        }
                        db.close();
                        return res.send(body)
                    } else if (result.length) {
                        let token = req.get("xAuthToken")
                        let jwt = require('jsonwebtoken');
                        let decoded = jwt.decode(token, { complete: true });
                        let userArray = []
                        for (let i = 0; i < result.length; i++) {
                            if (decoded.payload !== result[i].emailId) {
                                let data = {
                                    username: result[i].username,
                                    emailId: result[i].emailId,
                                    sex: result[i].sex,
                                    dob: result[i].dob,
                                    mobileNo: result[i].mobileNo
                                }
                                userArray.push(data);
                            }


                        }

                        let body = {
                            data: userArray,
                            message: "Success",
                            status: 1
                        }
                        db.close();
                        return res.send(body)
                    } else {
                        let body = {
                            message: 'No user found',
                            status: 0
                        }
                        db.close();
                        return res.send(body)
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
    else {
        let body = {
            message: "Unauthorised Request",
            status: 0
        }
        return res.send(body)
    }

});

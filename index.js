let express = require("express");
let bodyParser = require("body-parser");
let app = express();
let jwt = require('jsonwebtoken');
let MongoClient = require('mongodb').MongoClient;
let crypto = require("crypto");
let nodemailer = require('nodemailer');
let validator = require('validator');
require('dotenv').config();
require('./messages');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//Mongodb connection 
let database = '';
MongoClient.connect("mongodb://127.0.0.1:27017/EMS", function (err, db) {
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

app.post(process.env.SIGNUP_URL, function (req, res) {

    /*
            userName : "rajan",
            emailId : "rajan.shah@solutionanalysts.com,
            sex : "M",
            dob : 19-10-1990,
            mobileNo : 9377929445
    */
    if (!req.body.username) {
        let body = {
            message: "username required",
            status: 0
        }
        return res.send(body);
    } else if (!req.body.password) {
        let body = {
            message: "Password required",
            status: 0
        }
        return res.send(body);
    } else if (!req.body.sex) {
        let body = {
            message: "Sex required",
            status: 0
        }
        return res.send(body);
    } else if (!req.body.mobileNo) {
        let body = {
            message: "Mobile No required",
            status: 0
        }
        return res.send(body);
    } else if (!req.body.emailId) {
        let body = {
            message: "E-Mail Id required",
            status: 0
        }
        return res.send(body);
    } else if (!validator.isEmail(req.body.emailId)) {
        let body = {
            message: "Invalid E-Mail Id",
            status: 0
        }
        return res.send(body);
    } else if (req.body.dob === Date) {
        let body = {
            message: "Type of date of birth is invalid",
            status: 0
        }
        return res.send(body);
    } else if (req.body.mobileNo === Number) {
        let body = {
            message: "Type of mobile Number is invalid",
            status: 0
        }
        return res.send(body);
    } else {
        
        let collection = database.collection('User');
        //Create some users
        let token = jwt.sign(req.body.emailId,process.env.SECRET_KEY);
        let sha256 = crypto.createHash("sha256");
        sha256.update(req.body.password, "utf8"); //utf8 here
        let encryptedPassword = sha256.digest("hex");
        let user1 = {
            username: req.body.username,
            password: encryptedPassword,
            sex: req.body.sex,
            dob: req.body.dob,
            mobileNo: req.body.mobileNo,
            emailId: req.body.emailId
        };
        collection.find({
            emailId: req.body.emailId
        }).count(function (e, count) {
            if (count <= 0) {
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
                            message: VALID_USER,
                            status: 1
                        }
                        return res.send(body)
                    }
                 });
            } else {
                let body = {
                    message: "User already exists",
                    status: 0
                }
                return res.status(403).send(body)
            }
        });



    }
});

app.post(process.env.LOGIN_URL, function (req, res) {
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
    if (!req.body.emailId) {
        let body = {
            message: "emailId required",
            status: 0
        }
        return res.send(body);
    } else if (!req.body.password) {
        let body = {
            message: "Password required",
            status: 0
        }
        return res.send(body);
    } else if (!validator.isEmail(req.body.emailId)) {
        let body = {
            message: "Invalide E-Mail Id",
            status: 0
        }
        return res.send(body);
    } else {
        let token = jwt.sign(req.body.emailId, "secret");
        // Connect to the db

        MongoClient.connect("mongodb://127.0.0.1:27017/EMS", function (err, db) {
            if (!err) {
                let EMS = db.collection('User');
                let sha256 = crypto.createHash("sha256");
                sha256.update(req.body.password, "utf8"); //utf8 here
                let encryptedPassword = sha256.digest("hex");
                console.log(encryptedPassword);
                let result = EMS.find({
                    $and: [{
                        emailId: req.body.emailId
                    }, {
                        password: encryptedPassword
                    }]
                }).toArray(function (err, result) {
                    if (err) {
                        let body = {
                            message: "Error occurred",
                            status: 0
                        }
                        req.status = 500
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

            } else {
                console.log(err)
            }
        });
    }

});

app.get(process.env.GET_USER, function (req, res) {
    if (req.get("xAuthToken")) {
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
                        req.status = 500
                        db.close();
                        return res.send(body)
                    } else if (result.length) {
                        let token = req.get("xAuthToken")
                        let decoded = jwt.decode(token, {
                            complete: true
                        });
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

            } else {
                console.log(err)
            }
        });
    } else {
        let body = {
            message: "Unauthorised Request",
            status: 0
        }
        res.status = 403;
        return res.send(body)
    }

});


app.get(process.env.FORGET_PASSWORD_URL, function (req, res) {
    if (req.get("xAuthToken")) {
        // Connect to the db
        MongoClient.connect("mongodb://127.0.0.1:27017/EMS", function (err, db) {
            if (!err) {
                let EMS = db.collection('User');
                let token = req.get("xAuthToken")
                let decoded = jwt.decode(token, {
                    complete: true
                });
                console.log(decoded.payload);
                let result = EMS.find({
                    emailId: decoded.payload
                }).toArray(function (err, result) {
                    if (err) {
                        let body = {
                            message: "Error occurred",
                            status: 0
                        }
                        req.status = 500
                        db.close();
                        return res.send(body)
                    } else if (result.length) {
                        return sendEmail(req, res, result[0].emailId);
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

            } else {
                console.log(err)
            }
        });
    } else {
        let body = {
            message: "Unauthorised Request",
            status: 0
        }
        res.status = 403;
        return res.send(body)
    }

});


function sendEmail(req, res, receiverEmail) {
    // Not the movie transporter!
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'email', // Your email id
            pass: 'password' // Your password
        }
    });
    let text = 'Hello world from EMS \n\n';

    let mailOptions = {
        from: 'example@gmail.com', // sender address
        to: receiverEmail, // list of receivers
        subject: 'Email Example', // Subject line
        text: text //, // plaintext body
        // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.json({
                yo: 'error'
            });
        } else {
            console.log('Message sent: ' + info.response);
            let body = {
                message: "Email sent successfully.",
                status: 0
            }
            res.send(body);
        };
    });
}
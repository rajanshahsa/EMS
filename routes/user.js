let jwt = require('jsonwebtoken');
let MongoClient = require('mongodb').MongoClient;
let crypto = require("crypto");
let nodemailer = require('nodemailer');
let validator = require('validator');
//Mongodb connection 
let database = '';
MongoClient.connect(process.env.MONGODB_URL, function (err, db) {
    if (!err) {
        console.log('connected to database');
        database = db
    } else {
        console.log('cannot connect to database', err);
        server.close()
    }
});

let appRouter = function (app) {

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
            res.status = 400
            return res.send(body);
        } else if (!req.body.password) {
            let body = {
                message: "Password required",
                status: 0
            }
            res.status = 400
            return res.send(body);
        } else if (!req.body.sex) {
            let body = {
                message: "Sex required",
                status: 0
            }
            res.status = 400
            return res.send(body);
        } else if (!req.body.mobileNo) {
            let body = {
                message: "Mobile No required",
                status: 0
            }
            res.status = 400
            return res.send(body);
        } else if (!req.body.emailId) {
            let body = {
                message: "E-Mail Id required",
                status: 0
            }
            res.status = 400
            return res.send(body);
        } else if (!validator.isEmail(req.body.emailId)) {
            let body = {
                message: "Invalid E-Mail Id",
                status: 0
            }
            res.status = 400
            return res.send(body);
        } else if (req.body.dob === Date) {
            let body = {
                message: "Type of date of birth is invalid",
                status: 0
            }
            res.status = 400
            return res.send(body);
        } else if (req.body.mobileNo === Number) {
            let body = {
                message: "Type of mobile Number is invalid",
                status: 0
            }
            res.status = 400
            return res.send(body);
        } else {

            let collection = database.collection('User');
            //Create some users
            let token = jwt.sign(req.body.emailId, process.env.SECRET_KEY);
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
                                userId: result.ops[0]._id
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
            res.status = 400
            return res.send(body);
        } else if (!req.body.password) {
            let body = {
                message: "Password required",
                status: 0
            }
            res.status = 400
            return res.send(body);
        } else if (!validator.isEmail(req.body.emailId)) {
            let body = {
                message: "Invalide E-Mail Id",
                status: 0
            }
            res.status = 400
            return res.send(body);
        } else {
            let token = jwt.sign(req.body.emailId, "secret");
            let EMS = database.collection('User');
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
                    req.status(500)
                    return res.send(body)
                } else if (result.length) {
                    let data = {
                        username: result[0].username,
                        emailId: result[0].emailId,
                        sex: result[0].sex,
                        dob: result[0].dob,
                        mobileNo: result[0].mobileNo,
                        userId: result[0]._id
                    }
                    let body = {
                        xAuthToken: token,
                        data: data,
                        message: "Success",
                        status: 1
                    }
                   
                    return res.send(body)
                } else {
                    let body = {
                        message: "Invalid Credentials",
                        status: 0
                    }
                   
                    return res.send(body)
                }
                //Close connection
               
            });
        }

    });

    app.get(process.env.GET_USER, function (req, res) {
        if (req.get("xAuthToken")) {
            let EMS = database.collection('User');
            let result = EMS.find({}).toArray(function (err, result) {
                if (err) {
                    let body = {
                        message: "Error occurred",
                        status: 0
                    }
                    req.status(500)
                   
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
                                mobileNo: result[i].mobileNo,
                                userId: result[i]._id
                            }
                            userArray.push(data);
                        }
                    }

                    let body = {
                        data: userArray,
                        message: "Success",
                        status: 1
                    }
                   
                    return res.send(body)
                } else {
                    let body = {
                        message: 'No user found',
                        status: 0
                    }
                   
                    return res.send(body)
                }
                //Close connection
               
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
        let EMS = database.collection('User');
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
                req.status(500)
               
                return res.send(body)
            } else if (result.length) {
                return sendEmail(req, res, result[0].emailId);
            } else {
                let body = {
                    message: "Invalid Credentials",
                    status: 0
                }
               
                return res.send(body)
            }
            //Close connection
           
        });
    });

    app.post("/user/addExpense", function (req, res) {
        if (req.get("xAuthToken")) {
            /* title: "Dinner at 31- 12 - 2016",
                     paidBy : 1,
                             contributor : [
                                     {
                                             contributerId: 3,
                                             amount: 80
                                     },
                                     {
                                             contributerId: 1,
                                             amount: 40
                                     },
                                     {
                                             contributerId: 2,
                                             amount: 30
                                     },
                             ],
                                     amount : 150,*/

            if (!req.body.title || !req.body.paidBy || !req.body.contributor || !req.body.date || !req.body.amount || !req.body.expenseType || !req.body.description) {
                let body = {
                    message: "title missing",
                    status: 1
                }
                res.status = 400
                res.send(body)
            }
            else if (!req.body.contributor) {
                let body = {
                    message: "contributor missing",
                    status: 1
                }
                res.status = 400
                res.send(body)
            }
            else if (!req.body.date) {
                let body = {
                    message: "date missing",
                    status: 1
                }
                res.status = 400
                res.send(body)
            }
            else if (!req.body.expenseType) {
                let body = {
                    message: "expenseType missing",
                    status: 1
                }
                res.status = 400
                res.send(body)
            }
            else if (!req.body.paidBy) {
                let body = {
                    message: "paidBy missing",
                    status: 1
                }
                res.status = 400
                res.send(body)
            }
            else {
                // Retrieve
                let MongoClient = require('mongodb').MongoClient;
                // Connect to the db
                let expense = database.collection('Expense');
                //Create some users
                let addExpense = { title: req.body.title, paidBy: req.body.paidBy, contributor: req.body.contributor, date: req.body.date, amount: req.body.amount, expenseType: req.body.expenseType };
                // Insert some users
                expense.insert([addExpense], function (err, result) {
                    if (err) {
                        let body = {
                            message: "Error occurred while inserting",
                            status: 0
                        }
                        res.status = 500;
                        res.send(body);
                    } else {
                        let insertedID = result.ops[0]._id;
                        let user = database.collection('User');
                        let contributor = req.body.contributor.replace(/'/g, '"');
                        console.log(contributor);
                        // contributor = JSON.parse(contributor);
                        // console.log(contributor);
                        for (let i = 0; i < req.body.contributor.count; i++) {
                            let userId = req.body.contributor[i].id
                            console.log("UserId" + userId);
                            user.findOneAndUpdate({ _id: userId }, { $push: { transactionId: insertedID } });
                        }
                        let body = {
                            message: "Expense added successfully",
                            status: 1
                        }
                        res.send(body)
                    }
                    //Close connection
                   
                });

                return res
            }
        }
        else {
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
}
module.exports = appRouter;
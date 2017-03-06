let jwt = require('jsonwebtoken');
let crypto = require("crypto");
let nodemailer = require('nodemailer');
let validator = require('validator');


let appRouter = function (app) {

    / user Sign API /
    /**
     * @api {post} /user/signUp Login User 
     * @apiName signUp  
     * @apiGroup User
     * @apiVersion 0.1.0
     * @apiParam {String} userName 
     * @apiParam {String} emailId  
     * @apiParam {String} sex  
     * @apiParam {String} dob  
     * @apiParam {String} mobileNo  
     * @apiParam {String} userType  
     * 
     * @apiSuccessExample Success-Response 
     * 
     * {
        "xAuthToken": "eyJhbGciOiJIUzI1NiJ9.YXNoaWxAZ21haWwuY29t.NADjv0gRjYaQhXLop1COv800lWF8xdVblZzB3Y0c_20",
        "data": {
             "userId": "58832f2d9491a65e5584f840",
             "username": "Ashil",
             "emailId": "ashil@gmail.com",
              "sex": "M",
              "dob": "1990-10-19T00:00Z",
              "mobileNo": 9377929445
        },
        "message": "User created",
         "status": 1
        }
     * */

    app.post(process.env.SIGNUP_URL, function (req, res) {

        /*
                userName : "rajan",
                emailId : "rajan.shah@solutionanalysts.com,
                sex : "M",
                dob : 19-10-1990,
                mobileNo : 9377929445
        */
        console.log(req.body)
        if (!req.body.username) {
            console.log("username required")
            let body = {
                message: "username required",
                status: 0
            }
            res.status(400)
            res.send(body);
        } else if (!req.body.password) {
            console.log("password required")
            let body = {
                message: "Password required",
                status: 0
            }
            res.status(400)
            res.send(body);
        } else if (!req.body.sex) {
            console.log("sex required")
            let body = {
                message: "Sex required",
                status: 0
            }
            res.status(400)
            res.send(body);
        } else if (!req.body.mobileNo) {
            console.log("mobileNo required")
            let body = {
                message: "Mobile No required",
                status: 0
            }
            res.status(400)
            res.send(body);
        } else if (!req.body.emailId) {
            console.log("Email required")
            let body = {
                message: "E-Mail Id required",
                status: 0
            }
            res.status(400)
            res.send(body);
        } else if (!validator.isEmail(req.body.emailId)) {
            console.log("Email Invalid")
            let body = {
                message: "Invalid E-Mail Id",
                status: 0
            }
            res.status(400)
            res.send(body);
        } else if (!req.body.userType) {
            console.log("userType required")
            let body = {
                message: "userType required",
                status: 0
            }
            res.status(400)
            res.send(body);
        } else if (req.body.dob === Date) {
            console.log("dob required")
            let body = {
                message: "Type of date of birth is invalid",
                status: 0
            }
            res.status(400)
            res.send(body);
        } else if (req.body.mobileNo === Number) {
            console.log("mobileNo number required")
            let body = {
                message: "Type of mobile Number is invalid",
                status: 0
            }
            res.status(400)
            res.send(body);
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
                emailId: req.body.emailId,
                transactionId: [],
                userType: req.body.userType
            };
            collection.find({ emailId: req.body.emailId }).count(function (e, count) {
                if (count <= 0) {
                    // Insert some users
                    collection.insert([user1], function (err, result) {
                        if (err) {
                            console.log("Success")
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
                            console.log("Success")
                            let body = {
                                xAuthToken: token,
                                data: data,
                                message: "User created",
                                status: 1
                            }
                            res.send(body)
                        }
                    });
                } else {
                    console.log("Success")
                    let body = {
                        message: "User already exists",
                        status: 0
                    }
                    res.status(403).send(body)
                }
            });
        }
        return res
    });

    / user login API /
    /**
     * @api {post} /user/login Login User 
     * @apiName login  
     * @apiGroup User
     * @apiVersion 0.1.0
     * @apiParam {String} emailId  
     * @apiParam {String} Password  
     * 
     * @apiSuccessExample Success-Response 
     * 
     * {
        "xAuthToken": "eyJhbGciOiJIUzI1NiJ9.YXNoaWxAZ21haWwuY29t.NADjv0gRjYaQhXLop1COv800lWF8xdVblZzB3Y0c_20",
        "data": {
             "userId": "58832f2d9491a65e5584f840",
             "username": "Ashil",
             "emailId": "ashil@gmail.com",
              "sex": "M",
              "dob": "1990-10-19T00:00Z",
              "mobileNo": 9377929445
        },
        "message": "Success",
         "status": 1
        }
     * */
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
            res.status(400)
            return res.send(body);
        } else if (!req.body.password) {
            let body = {
                message: "Password required",
                status: 0
            }
            res.status(400)
            return res.send(body);
        } else if (!validator.isEmail(req.body.emailId)) {
            let body = {
                message: "Invalide E-Mail Id",
                status: 0
            }
            res.status(400)
            return res.send(body);
        } else {
            let token = jwt.sign(req.body.emailId, "secret");
            let EMS = database.collection('User');
            let sha256 = crypto.createHash("sha256");
            sha256.update(req.body.password, "utf8"); //utf8 here
            let encryptedPassword = sha256.digest("hex");
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
                    res.status(500)
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


    / user getUser API /
    /**
     * @api {get} /user/getUser Login User 
     * @apiName login  
     * @apiGroup User
     * @apiVersion 0.1.0
     * 
     * @apiSuccessExample Success-Response 
     * 
     * list of user
     * */
    app.get(process.env.GET_USER, function (req, res) {
        if (req.get("xAuthToken")) {
            let EMS = database.collection('User');
            let result = EMS.find({}).toArray(function (err, result) {
                if (err) {
                    let body = {
                        message: "Error occurred",
                        status: 0
                    }
                    res.status(500)

                    return res.send(body)
                } else if (result.length) {
                    let token = req.get("xAuthToken")
                    let decoded = jwt.decode(token, {
                        complete: true
                    });
                    let userArray = []
                    for (let i = 0; i < result.length; i++) {
                      //  if (decoded.payload !== result[i].emailId) {
                            let data = {
                                username: result[i].username,
                                emailId: result[i].emailId,
                                sex: result[i].sex,
                                dob: result[i].dob,
                                mobileNo: result[i].mobileNo,
                                userId: result[i]._id
                            }
                            userArray.push(data);
                        //}
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
            res.status(403);
            return res.send(body)
        }

    });

    / user forgotPassword API /
    /**
     * @api {post} /user/forgotPassword Login User 
     * @apiName login  
     * @apiGroup User
     * @apiVersion 0.1.0
     * @apiParam {String} emailId  
     * 
     * @apiSuccessExample Success-Response 
     * 
     * {
                    message: "Email sent successfully.",
                    status: 0
                }
     * */
    app.post(process.env.FORGET_PASSWORD_URL, function (req, res) {
        let EMS = database.collection('User');
        console.log(req.body.emailId);
        let result = EMS.find({ emailId: req.body.emailId }).toArray(function (err, result) {
            if (err) {
                let body = {
                    message: "Error occurred",
                    status: 0
                }
                res.status(500)

                return res.send(body)
            } else if (result.length) {
                return sendEmail(req, res, result[0]);
            } else {
                let body = {
                    message: 'Email id not exists.',
                    status: 0
                }
                return res.send(body)
            }
        });
    });

    function sendEmail(req, res, receiverData) {
        // Not the movie transporter!
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'rajan.shah.sa@gmail.com', // Your email id
                pass: 'password' // Your password
            }
        });
        let randomstring = require("randomstring");
        let newPassword = randomstring.generate(5);
        let data = req.body.emailId + '<>' + newPassword
        let tokenForPasswordUpdate = jwt.sign({ data: data }, "secret", { expiresIn: 60 * 15 });
        let text = 'Hello ' + receiverData.username + '\n\n Your new password is: ' + newPassword + '\n\n If you have requested for password change than please click on below link: \n\nhttp://' + process.env.SERVER_URL + ':' + process.env.SERVER_PORT + process.env.UPDATE_PASSWORD_URL + '?token=' + tokenForPasswordUpdate;

        let mailOptions = {
            from: 'no-reply@EMS.com', // sender address
            to: receiverData.emailId, // list of receivers
            subject: 'Change Password request', // Subject line
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


    / user updatePassword API /
    /**
     * @api {get} /user/updatePassword Login User 
     * @apiName login  
     * @apiGroup User
     * @apiVersion 0.1.0
     * 
     * @apiSuccessExample Success-Response 
     * 
     * 
     * */
    app.get(process.env.UPDATE_PASSWORD_URL, function (req, res) {
        let tokenverify = jwt.verify(req.query.token, process.env.SECRET_KEY, { ignoreExpiration: false }, function (err, token) {
            console.log(err);
            if (!err) {
                let emailIdPassword = token.data;
                let valueArray = emailIdPassword.split('<>')
                let emailId = valueArray[0];
                let password = valueArray[1];
                let user = database.collection('User');
                user.findOneAndUpdate({ emailId: emailId }, { $set: { password: password } });
                let body = {
                    message: 'Your password updated successfully'
                }
                res.send(body)
            }
            else {
                let tokenExpired = err.message;
                if (tokenExpired === 'jwt expired') {
                    let body = {
                        message: 'Sorry link expired'
                    }
                    res.send(body)
                }
            }
        });
        return res
    });

    / user dashboard API /
    /**
     * @api {get} /user/dashboard Login User 
     * @apiName login  
     * @apiGroup User
     * @apiVersion 0.1.0
     * 
     * @apiSuccessExample Success-Response 
     * 
     * list of transaction made by user
     * */
    app.get(process.env.DASHBOARD_URL, function (req, res) {
        if (req.get("xAuthToken")) {
            let token = req.get("xAuthToken")
            let decoded = jwt.decode(token, {
                complete: true
            });
            let user = database.collection('User');
            console.log(decoded.payload);
            let result = user.find({ emailId: decoded.payload }).toArray(function (err, result) {
                if (err) {
                    let body = {
                        message: "Error occurred finding user",
                        status: 0
                    }
                    res.status(500)
                    res.send(body)
                } else if (result.length) {
                    let objectId = result[0]._id
                    let expenses = database.collection('Expense');
                    expenses.find({ contributor: { $exists: objectId } }).toArray(function (err, result) {
                        if (err) {
                            console.log(err)
                            let body = {
                                message: "Error occurred find transaction",
                                status: 0
                            }
                            res.status(500)
                            res.send(body)
                        } else if (result.length) {

                            let expenseArray = []
                            for (var i = 0; i < result.length; i++) {
                                let expense = {
                                    id: result[i]._id,
                                    title: result[i].title,
                                    paidBy: result[i].paidBy,
                                    amount: result[i].amount,
                                    expenseType: result[i].expenseType,
                                    description: result[i].description,
                                    data: result[i].date,
                                    contributor: result[i].contributor
                                }
                                expenseArray.push(expense)
                            }
                            res.send(expenseArray)
                        }
                        else {

                        }
                    });
                } else {
                    let body = {
                        message: 'No user found',
                        status: 0
                    }
                    res.send(body)
                }
            });
        } else {
            let body = {
                message: "Unauthorised Request",
                status: 0
            }
            res.status(403);
            res.send(body)
        }
        return res
    });
}
module.exports = appRouter;
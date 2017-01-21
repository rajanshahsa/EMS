let jwt = require('jsonwebtoken');
let crypto = require("crypto");
let nodemailer = require('nodemailer');
let validator = require('validator');
let mongo = require('mongodb');

let appRouter = function (app) {

    app.post(process.env.ADD_EXPENSES_URL, function (req, res) {
        if (req.get("xAuthToken")) {
            /* {
                "title":"Dakshinyar",
                "paidBy":{"id":"5881c5a720135c1aec22c106", "name" : "Rajan"},
                "amount":450,
                "contributor":[{"name": "Deepak","id" :"5881c59620135c1aec22c105","amount": 250},{"name": "Rajan","id" :"5881c5a720135c1aec22c106","amount": 200}],
                "expenseType":"Dinner",
                "description":"Dinner on sunday",
                "date":"5-1-2017"
            }*/
            if (!req.body.title) {
                let body = {
                    message: "title missing",
                    status: 1
                }
                res.status(400)
                res.send(body)
            }
            else if (!req.body.contributor) {
                let body = {
                    message: "contributor missing",
                    status: 1
                }
                res.status(400)
                res.send(body)
            }
            else if (!req.body.date) {
                let body = {
                    message: "date missing",
                    status: 1
                }
                res.status(400)
                res.send(body)
            }
            else if (!req.body.expenseType) {
                let body = {
                    message: "expenseType missing",
                    status: 1
                }
                res.status(400)
                res.send(body)
            }
            else if (!req.body.paidBy) {
                let body = {
                    message: "paidBy missing",
                    status: 1
                }
                res.status(400)
                res.send(body)
            }
            else if (!req.body.amount) {
                let body = {
                    message: "amount missing",
                    status: 1
                }
                res.status(400)
                res.send(body)
            }
            else {
                let expense = database.collection('Expense');
                let addExpense = { title: req.body.title, paidBy: req.body.paidBy, contributor: req.body.contributor, date: req.body.date, amount: req.body.amount, expenseType: req.body.expenseType, creditedBy : [] , debitedBy : []};
                expense.insert([addExpense], function (err, result) {
                    if (err) {
                        let body = {
                            message: "Error occurred while inserting",
                            status: 0
                        }
                        res.status(500);
                        res.send(body);
                    } else {
                        let insertedID = result.insertedIds[0];
                        let user = database.collection('User');
                        let contributorArray = req.body.contributor
                        for (let i = 0; i < req.body.contributor.length; i++) {
                            var o_id = new mongo.ObjectID(req.body.contributor[i].id);
                            user.findOneAndUpdate({ '_id': o_id }, { $push: { transactionId: insertedID } });
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
            res.status(403);
            return res.send(body)
        }
    });

    app.post(process.env.UPDATE_EXPENSES_URL, function (req, res) {
        if (req.get("xAuthToken")) {
            console.log(req.body);
            if (!req.body.expenseId) {
                let body = {
                    message: "Expense Id missing",
                    status: 1
                }
                res.status(400)
                res.send(body)
            }
            else if (!req.body.title) {
                let body = {
                    message: "title missing",
                    status: 1
                }
                res.status(400)
                res.send(body)
            }
            else if (!req.body.contributor) {
                let body = {
                    message: "contributor missing",
                    status: 1
                }
                res.status(400)
                res.send(body)
            }
            else if (!req.body.date) {
                let body = {
                    message: "date missing",
                    status: 1
                }
                res.status(400)
                res.send(body)
            }
            else if (!req.body.expenseType) {
                let body = {
                    message: "expenseType missing",
                    status: 1
                }
                res.status(400)
                res.send(body)
            }
            else if (!req.body.paidBy) {
                let body = {
                    message: "paidBy missing",
                    status: 1
                }
                res.status(400)
                res.send(body)
            }
            else if (!req.body.amount) {
                let body = {
                    message: "amount missing",
                    status: 1
                }
                res.status(400)
                res.send(body)
            }
            else {
                let expense = database.collection('Expense');
                let updateExpense = { title: req.body.title, paidBy: req.body.paidBy, contributor: req.body.contributor, date: req.body.date, amount: req.body.amount, expenseType: req.body.expenseType };
                var o_id = new mongo.ObjectID(req.body.expenseId);
                console.log(o_id);
                expense.findOneAndUpdate({ '_id': o_id }, { $set: updateExpense });
                let body = {
                    message: "Expense Update successfully",
                    status: 0
                }
                res.send(body)
            }
        }
        else {
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
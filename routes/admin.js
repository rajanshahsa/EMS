let jwt = require('jsonwebtoken');
let crypto = require("crypto");
let nodemailer = require('nodemailer');
let validator = require('validator');
let mongo = require('mongodb');

let appRouter = function (app) {

    app.get(process.env.GET_ALL_TRANSACTION_URL, function (req, res) {
        if (req.get("xAuthToken")) {
            let token = req.get("xAuthToken")
            let decoded = jwt.decode(token, {
                complete: true
            });
            console.log(decoded.payload);
            let expense = database.collection('Expense');
            expense.find({}).toArray(function (err, result) {
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
                            contributor: result[i].contributor,
                            creditedBy : result[i].creditedBy,
                            debitedBy : result[i],debitedBy
                        }
                        expenseArray.push(expense);
                    }
                    let body = {
                        data: expenseArray,
                        status: 1
                    }
                    res.send(body)
                }
                else {
                    console.log(err)
                    console.log(result)

                    let body = {
                        message: "Error occurred find transaction",
                        status: 0
                    }
                    res.status(500)
                    res.send(body)
                }
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

    app.post(process.env.ADMIN_UPDATE_EXPENSES_URL, function (req, res) {
        if (req.get("xAuthToken")) {
            if (!req.body.expenseId) {
                let body = {
                    message: "expenseId missing",
                    status: 1
                }
                res.status(400)
                res.send(body)
            }
            else {
                let expense = database.collection('Expense');
                let updateExpense = { creditedBy: req.body.creditedBy, debitedBy: req.body.debitedBy };
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
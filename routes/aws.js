const aws = require('aws-sdk');
aws.config = {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
};

const s3 = new aws.S3();

// Bucket names must be unique across all S3 users

let appRouter = function (app) {
    let myBucket = 'ems-nodejs-2018';
    app.post(process.env.S3_BUCKET_URL, function (req, res) {
        s3.createBucket({ Bucket: myBucket }, function (err, data) {
            if (err) {
                res.status(400);
                res.send({ status: 1, messaga: 'Bucket creation failed!!' });
            } else {
                res.status(200);
                res.send({ status: 1, messaga: 'Bucket created successfully!' });
            }
        });

    });

    app.post(process.env.S3_BUCKET_UPLOAD_URL, function (req, res) {
        let myKey = 'testing_Node.js';
        let params = { Bucket: myBucket, Key: myKey, Body: 'Hello!' };
        s3.putObject(params, function (err, data) {
            if (err) {
                res.status(400);
                res.send({ status: 1, messaga: 'Failed! uploading document' });
                console.log('Failed! uploading document');
                console.log(err);
            } else {
                res.status(200);
                res.send({
                    status: 1, messaga: 'Successfully uploaded data to ' + myBucket / myKey + ''
                });
                console.log("Successfully uploaded data to myBucket/myKey");
            }
        });
    });
}

module.exports = appRouter;
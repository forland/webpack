    'use strict';

    const moment = require('moment');
    const AWS = require('aws-sdk');
    const dynamoDb = new AWS.DynamoDB.DocumentClient();

    module.exports = (data) => {
        const params = {
            TableName: 'signedUpLeagues',
            Item: {
                emailAddress: data.emailAddress,
                signedLeagues: data.signedLeagues,
                addedAt: moment(Date.now()).toISOString(),
            }
        };
        return dynamoDb.put(params).promise()
            .then(result => params.Item)
    };
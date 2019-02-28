    'use strict';

    const AWS = require('aws-sdk');
    const dynamoDb = new AWS.DynamoDB.DocumentClient();

    module.exports = (emailAddress) => {
        const params = {
            TableName: 'signedUpLeagues',
            Key: { emailAddress }
        };
        return dynamoDb.delete(params).promise();
    };
    'use strict';

    const AWS = require('aws-sdk');
    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    const uuid = require('uuid');

    module.exports = () => {
        const params = {
            TableName: 'games',
            Item: {
                name: "cc",
                listingId: uuid.v1(),
                addedAt: Date.now(),
            }
        };
        return dynamoDb.put(params).promise()
            .then(result => params.Item)
    };
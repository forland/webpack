   'use strict';
    const AWS = require('aws-sdk');
    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    const uuid = require('uuid');
    const { differenceWith, isEqual } = require('lodash');
    
    const addProduct = require('./handlers/create');
    const viewProduct = require('./handlers/view');
    const listProducts = require('./handlers/list');
    const removeProduct = require('./handlers/remove');
    
    const createGames = require('./handlers/creategames');
    
    
    const request = require('axios');
    const { extractGamesFromHTML } = require('./handlers/games');
    const { extractStatsFromHTML } = require('./handlers/stats');
    const { extractGameInfoFromHTML } = require('./handlers/gameinfo');

    const { sendEmail } = require('./handlers/sendEmail');

    const creategames = (event, context, callback) => {
        //  const data = JSON.parse(event.body);
        createGames()
            .then(result => {
                const response = { body: JSON.stringify(result) };
                callback(null, response);
            })
            .catch(callback);
    };


    const create = (event, context, callback) => {
        const data = JSON.parse(event.body);
        addProduct(data)
            .then(result => {
                const response = { body: JSON.stringify(result) };
                callback(null, response);
            })
            .catch(callback);
    };

    const list = (event, context, callback) => {
        listProducts()
            .then(result => {
                const response = { body: JSON.stringify(result) };
                callback(null, response);
            })
            .catch(callback);
    };


    const view = (event, context, callback) => {
        viewProduct(event.pathParameters.id)
            .then(result => {
                const response = { body: JSON.stringify(result) };
                callback(null, response);
            })
            .catch(callback);
    };


    const remove = (event, context, callback) => {
        removeProduct(event.pathParameters.id)
            .then(result => {
                const response = { body: JSON.stringify({message: 'Product removed.'}) };
                callback(null, response);
            })
            .catch(callback);
    };

    const getgameinfo = (event, context, callback) => {
        // let idx = '/turnering/32794/raekke/90464/pulje/33636/kamp/671010'
        // let idx = '/turnering-32794-raekke-90482-pulje-36509-kamp-711864'
        let idx = '/turnering/32794/raekke/90490/pulje/33669/kamp/681145'
        
        if (event.pathParameters !== null && event.pathParameters !== undefined) {
            
                idx = event.pathParameters.id
        }
        idx = idx.replace(/-/g,'/');
        
        const url = 'https://minidraet.dgi.dk' + idx
        
        request(url)
            .then(({data}) => {
                const response = {
                                    statusCode: 200,
                                    headers: {
                                                'Access-Control-Allow-Origin': '*',
                                                'Access-Control-Allow-Credentials': true,
                                    },
                                    body: JSON.stringify(extractGameInfoFromHTML(data))
                                 };
                
                callback(null, response);
            })
            .catch(callback);
    };
    
    const getstats = (event, context, callback) => {
        let idx = '-turnering-32794-Raekke-90473-Pulje-33647'
        if (event.pathParameters !== null && event.pathParameters !== undefined) {
            
                idx = event.pathParameters.id
        }
        
        idx = idx.replace(/-/g,'/');
        
        const url = 'https://minidraet.dgi.dk' + idx
        
        request(url)
            .then(({data}) => {
                const response = {
                                    statusCode: 200,
                                    headers: {
                                                'Access-Control-Allow-Origin': '*',
                                                'Access-Control-Allow-Credentials': true,
                                    },
                                    body: JSON.stringify(extractStatsFromHTML(data))
                                 };
                
                callback(null, response);
            })
            .catch(callback);
    };
    
    const getgames = (event, context, callback) => {
        let gamesListNew;
        let gamesListOld;
        let gamesListNewPlayed;
        let gamesListOldPlayed;
        
        // let idx = '-forening-2154900-hold-165377'
        // let idx = '-forening-2148000-hold-152096'
        let idx = '-forening-2148000-hold-152407'
        if (event.pathParameters !== null && event.pathParameters !== undefined) {
            
                idx = event.pathParameters.id
        }
        
        const forening = idx.slice(10, idx.indexOf("-hold-")); 
        const hold = idx.slice(idx.lastIndexOf("-") + 1, idx.length);
        
        const url = 'https://minidraet.dgi.dk' + idx.replace(/-/g,'/');
        
        request(url)
            .then(({data}) => {
                gamesListNew = extractGamesFromHTML(data);
            
                return dynamoDb.scan({
                    TableName: 'games'
                }).promise();
                
            })
            
            .then(() => {
                // Get old list for this one from DB
                
                var params = {
                    TableName: "games",
                    Key:{
                        "forening": forening,
                        "hold": hold
                    }
                };
                    
                  return dynamoDb.get(params, function(err, datas) {
                        if (err) {
                            console.log("Error", err);
                        } else {
                            
                            gamesListOld = datas.Item ? datas.Item.games : []; 
                            gamesListOldPlayed = gamesListOld.filter(played => played.gameResult !== '');
                            
                        }
                    }).promise();
            })
            .then(() => {
                // save list in DB - only the ones with result
                gamesListNewPlayed = gamesListNew.filter(played => played.gameResult !== '');
                
                return dynamoDb.put({
                    TableName: 'games',
                    Item: {
                        id: uuid.v1(),
                        forening: forening,
                        hold: hold,
                        games: gamesListNewPlayed,
                        addedAt: Date.now(),
                    }
                }).promise();
            })
            .then(() => {
                 
                let newGamesPlayed = differenceWith(gamesListNewPlayed, gamesListOldPlayed, isEqual);
                console.log("newGamesPlayed", newGamesPlayed);
                console.log("new length", newGamesPlayed.length);
               
                 if (newGamesPlayed.length > 0) {
                 return sendEmail(newGamesPlayed)
                 }
                 else return;
            })
            .then(() => {
                
                const response = {
                                    statusCode: 200,
                                    headers: {
                                                'Access-Control-Allow-Origin': '*',
                                                'Access-Control-Allow-Credentials': true,
                                    },
                                    body: JSON.stringify(gamesListNew)
                                 };
                
                callback(null, response);
            })
                
            .catch(callback);
    };
    
    // const getgames = (event, context, callback) => {
    //     let gamesList
    //     let idx = '-forening-2148000-hold-152407'
    //     if (event.pathParameters !== null && event.pathParameters !== undefined) {
            
    //             idx = event.pathParameters.id
    //     }
        
    //     idx = idx.replace(/-/g,'/');
        
    //     const url = 'https://minidraet.dgi.dk' + idx
        
    //     request(url)
    //         .then(({data}) => {
    //             gamesList = extractGamesFromHTML(data)
    //             const response = {
    //                                 statusCode: 200,
    //                                 headers: {
    //                                             'Access-Control-Allow-Origin': '*',
    //                                             'Access-Control-Allow-Credentials': true,
    //                                 },
    //                                 body: JSON.stringify(gamesList)
    //                              };
                
    //             callback(null, response);
    //         })
            
    //         .catch(callback);
    // };


    module.exports = {
        create,
        view,
        remove,
        list,
        getgames,
        getstats,
        getgameinfo,
        creategames,
        sendEmail
    };
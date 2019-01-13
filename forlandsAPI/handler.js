   'use strict';
    const AWS = require('aws-sdk');

    const { differenceWith, isEqual } = require('lodash');
    const request = require('axios');
    
    const addProduct = require('./handlers/create');
    const viewProduct = require('./handlers/view');
    const listProducts = require('./handlers/list');
    const removeProduct = require('./handlers/remove');
    

    const { extractGamesFromHTML } = require('./handlers/games');
    const { extractStatsFromHTML } = require('./handlers/stats');
    const { extractGameInfoFromHTML } = require('./handlers/gameinfo');
    const { getOldPlayedGamesFromDB } = require('./handlers/getOldPlayedGamesFromDB');
    const { saveNewPlayedGamesInDB } = require('./handlers/saveNewPlayedGamesInDB');
    const { sendEmail } = require('./handlers/sendEmail');


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

        let idx = '-turnering-32794-raekke-90490-pulje-33669-kamp-681145'
        
        if (event.pathParameters !== null && event.pathParameters !== undefined) {
            
                idx = event.pathParameters.id
        }
        
        const url = 'https://minidraet.dgi.dk' + idx.replace(/-/g,'/');
        
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
        
        const url = 'https://minidraet.dgi.dk' + idx.replace(/-/g,'/');
        
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
        let gamesListNew, gamesListOld, gamesListNewPlayed, gamesListOldPlayed;
        
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
      
            })
            .then(function(result) {
                // Get old list for this forening and hold from DB
                return getOldPlayedGamesFromDB(forening, hold);
                
            }).then((gamesListOldPlayedPromiseResult) => {
                gamesListOldPlayed = gamesListOldPlayedPromiseResult
                
                // save played games as list in DB
                gamesListNewPlayed = gamesListNew.filter(played => played.gameResult !== '');
                return saveNewPlayedGamesInDB(forening, hold, gamesListNewPlayed);  
            })
            .then(() => {
                // send an email with new games dif to old if any
                let difGamesPlayed = differenceWith(gamesListNewPlayed, gamesListOldPlayed, isEqual);
                console.log("newGamesPlayed", difGamesPlayed);
                console.log("newGames length", difGamesPlayed.length);
               
                 if (difGamesPlayed.length > 0) {
                 return sendEmail(difGamesPlayed)
                 }
                 else return;
            })
            .then(() => {
                // send respons og all new games to consumer
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

    module.exports = {
        create,
        view,
        remove,
        list,
        getgames,
        getstats,
        getgameinfo,
        sendEmail
    };
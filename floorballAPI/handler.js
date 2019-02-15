   'use strict';
    const AWS = require('aws-sdk');

    const { differenceWith, isEqual } = require('lodash');
    const request = require('axios');

    // Leagues
    const { extractLeaguesFromHTML } = require('./handlers/getLeaguesFromDGI');
    const { saveLeaguesInDB } = require('./handlers/saveLeaguesInDB');
    const { getLeaguesList } = require('./handlers/getLeaguesListFromDB');
   
    // Update Games
    const { updateLeagueGames } = require('./handlers/updateGames');
    
    // Old stuff    
    const { extractGamesFromHTML } = require('./handlers/games');
    const { extractStatsFromHTML } = require('./handlers/stats');
    const { extractGameInfoFromHTML } = require('./handlers/gameinfo');
    const { getOldPlayedGamesFromDB } = require('./handlers/getOldPlayedGamesFromDB');
    const { saveNewPlayedGamesInDB } = require('./handlers/saveNewPlayedGamesInDB');
    const { sendEmail } = require('./handlers/sendEmail');


    const updateGames = (event, context, callback) => {
        let seasonX = '2018-19';
        
        if (event.pathParameters !== null && event.pathParameters !== undefined) {
                seasonX = event.pathParameters.season
        };
        
        getLeaguesList(seasonX)
            .then(result => {
            
            return updateLeagueGames(result);   
                
            })
            .then(result => {
                // console.log(result)
                const response = { body: JSON.stringify('Update of leagueGames Table done') };
                callback(null, response);
            })
            .catch(callback);
    };    

    const getLeaguesFromDB = (event, context, callback) => {
        let seasonX = '2018-19';
        
        if (event.pathParameters !== null && event.pathParameters !== undefined) {
                seasonX = event.pathParameters.season
        };
        
        getLeaguesList(seasonX)
            .then(result => {
                const response = { body: JSON.stringify(result) };
                callback(null, response);
            })
            .catch(callback);
    };    


    const getLeaguesFromDGI = (event, context, callback) => {
        let leaguesList
        let idx = '-turnering-32794'
        
        if (event.pathParameters !== null && event.pathParameters !== undefined) {
            
                idx = event.pathParameters.id
        }
        
        const url = 'https://minidraet.dgi.dk' + idx.replace(/-/g,'/');
        
        request(url)
            .then(({data}) => {
                return leaguesList = extractLeaguesFromHTML(data);
            })
            .then((leaguesList) => {
                console.log('Leagues found: ' + leaguesList.length)
                return saveLeaguesInDB(leaguesList); 
                
            })   
            .then(() => {
                
                const response = {
                                    statusCode: 200,
                                    headers: {
                                                'Access-Control-Allow-Origin': '*',
                                                'Access-Control-Allow-Credentials': true,
                                    },
                                    body: JSON.stringify(leaguesList)
                                 };
                
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
        updateGames,
        getLeaguesFromDB,
        getLeaguesFromDGI,
        getgames,
        getstats,
        getgameinfo,
        sendEmail
    };
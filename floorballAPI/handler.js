   'use strict';
    const AWS = require('aws-sdk');

    const { differenceWith, isEqual } = require('lodash');
    const request = require('axios');
    
    // Dates
    const moment = require('moment');

    // Leagues
    const { extractLeaguesFromHTML } = require('./handlers/getLeaguesFromDGI');
    const { saveLeaguesInDB } = require('./handlers/saveLeaguesInDB');
    const { getLeaguesList } = require('./handlers/getLeagues');
   
    // get new played Games
    const { getNewGamesPlayedList } = require('./handlers/getNewGamesPlayed');
    
        // get signedLeagues
    const { getSignedLeaguesByEmail } = require('./handlers/getSignedLeaguesByEmail');
    const { getSignedLeagues } = require('./handlers/getSignedLeagues');
   
    // Update Games
    const { updateLeagueGames } = require('./handlers/updateGames');
    
    // Update/send email
    const updateEmail = require('./handlers/updateEmail');
    const { sendEmailSigned } = require('./handlers/sendEmailSigned');
    
    // Old stuff    
    const { extractGamesFromHTML } = require('./handlers/games');
    const { extractStatsFromHTML } = require('./handlers/stats');
    const { extractGameInfoFromHTML } = require('./handlers/gameinfo');
    const { getOldPlayedGamesFromDB } = require('./handlers/getOldPlayedGamesFromDB');
    const { saveNewPlayedGamesInDB } = require('./handlers/saveNewPlayedGamesInDB');
    const { sendEmail } = require('./handlers/sendEmail');

    const updateEmailLeagues = (event, context, callback) => {
        
        let data = {    "emailAddress": "frankforland@gmail.com",
                        "signedLeagues": [  { "leagueId": "/turnering/32794/raekke/90462/pulje/33635", "leagueName": "Unihoc Floorball Liga - Landsdækkende" },
                                            { "leagueId": "/turnering/32794/raekke/90465/pulje/33641", "leagueName": "2. Division - Herrer - Vest - Nord" }]
                            
                        };
        
        if (event.body !== null && event.body !== undefined) {           
            data = JSON.parse(event.body);
        }
        
        updateEmail(data)
            .then(result => {
                const response = { body: JSON.stringify(result) };
                callback(null, response);
            })
            .catch(callback);
    };


    const updateGames = (event, context, callback) => {

        let data = {    "season": "2018/19",
                        "leaguesReqToUpdate": "ACTIVE",
                        //"leaguesToUpdate": [    { "leagueId": "/turnering/32794/raekke/90462/pulje/33635", "leagueName": "Unihoc Floorball Liga - Landsdækkende" },
                        //                        { "leagueId": "/turnering/32794/raekke/90465/pulje/33641", "leagueName": "2. Division - Herrer - Vest - Nord" }
                       //                         ]
                        };
        
        if (event.body !== null && event.body !== undefined) {           
            data = JSON.parse(event.body);
        }
        
        getLeaguesList(data.season)
            .then(leaguesList => {
                let leaguesToHandle = [];
                
                    if (data.leaguesReqToUpdate !== undefined && data.leaguesReqToUpdate === 'ACTIVE') {
                        // only the not finished leagues
                        let leagueListActiveFiltered = leaguesList.filter(leagueActive => leagueActive.nextGameDate !== 'Z');
                        console.log('FILTERED ' + leagueListActiveFiltered.length + ' active league(s) for season: ' + data.season);
                        
                        // Only the ones recently played
                        let leguesListActivePlayDate = leagueListActiveFiltered.filter(leagueActivePlayDate => leagueActivePlayDate.nextGameDate < moment(Date.now()).toISOString());
                        console.log('FILTERED ' + leguesListActivePlayDate.length + ' playdate-surpassed league(s) for season: ' + data.season);
                        
                        leaguesList = leguesListActivePlayDate
                        
                    }
                    if (data.leaguesToUpdate !== undefined && data.leaguesToUpdate.length > 0) {
                        
                        let leagueIDs = data.leaguesToUpdate.map(function (item) {return item.leagueId})
                        leaguesList = leaguesList.filter(function(item) {
                                                        return leagueIDs.indexOf(item.leagueId) !== -1;
                                                    });  
                        
                        console.log('FILTERED ' + leaguesList.length + ' league(s) by request for season: ' + data.season);

                    }

                
                if (leaguesList.length > 0) {
                        return updateLeagueGames(leaguesList);
                }
                else {
                    const response = { body: JSON.stringify('DONE: No leagues to update for season ' + data.season) };
                    callback(null, response);
                }
                
            })
            .then(() => {
                // console.log(result)
                const response = { body: JSON.stringify('DONE: Update of leagueGames Table for season ' + data.season + ' and handled signed emails') };
                callback(null, response);
            })
            .catch(callback);
    };    

    const getLeagues = (event, context, callback) => {
        let season = '2018-19';
        
        if (event.pathParameters !== null && event.pathParameters !== undefined) {
                season = event.pathParameters.season
        };
        
        season = season.replace(/-/g,'/');
        
        getLeaguesList(season)
            .then(result => {
                const response = { body: JSON.stringify(result) };
                callback(null, response);
            })
            .catch(callback);
    };    


    const updateLeagues = (event, context, callback) => {
        
        let data = {    "tournamentId": "32794",
                        "season": "2018/19"
                        };
        
        
        if (event.body !== null && event.body !== undefined) {           
            data = JSON.parse(event.body);
        }
        
        let leaguesList = []
        let season = data.season
        let tournamentId = data.tournamentId
        
        const url = 'https://minidraet.dgi.dk/turnering/' + tournamentId;
        
        request(url)
            .then(({data}) => {
                return leaguesList = extractLeaguesFromHTML(data, season);
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
 
     const sendSignedEmails = (event, context, callback) => {
        
        getNewGamesPlayedList(undefined)
            .then(newGamesPlayedList => {
                if (newGamesPlayedList.length > 0) {
                    console.log(newGamesPlayedList.length)
                    return sendEmailSigned(newGamesPlayedList);
                }
                else {
                    const response = { body: JSON.stringify('DONE: no emails to send ') };
                    callback(null, response);
                }
                    
            })
            .then(result => {
                const response = { body: JSON.stringify(result) };
                callback(null, response);
            })
            .catch(callback);
    };    
    
     const getSignedLeaguesByEmailAddress = (event, context, callback) => {
        let data = {    "emailAddress": "frankforland@gmail.com"
                        };
        
        if (event.body !== null && event.body !== undefined) {           
            data = JSON.parse(event.body);
        }
        
        getSignedLeaguesByEmail(data.emailAddress)
            .then(result => {
                const response = { body: JSON.stringify(result) };
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
        updateEmailLeagues,
        updateGames,
        getLeagues,
        updateLeagues,
        sendSignedEmails,
        getSignedLeaguesByEmailAddress,
        getgames,
        getstats,
        getgameinfo,
        sendEmail
    };
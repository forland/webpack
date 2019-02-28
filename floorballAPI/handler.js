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
    const { getSignedLeaguesList } = require('./handlers/getSignedLeagues');
       
    // Get Games
    const { updateLeagueGames } = require('./handlers/updateGames');
   
    // Update Games
    const { getLeagueGamesList } = require('./handlers/getLeagueGames');
    
    // Update/send/delete email
    const updateEmail = require('./handlers/updateEmail');
    const { sendEmailSigned } = require('./handlers/sendEmailSigned');
    const unsubscribe = require('./handlers/deleteSignedEmail');
    
    // Get more data   
    const { extractStatsFromHTML } = require('./handlers/stats');
    const { extractGameInfoFromHTML } = require('./handlers/gameinfo');

    
    const deleteSignedEmail = (event, context, callback) => {
    
        let emailAddressEnc = 'frankforland%40gmail.com';
        
        
        if (event.pathParameters !== null && event.pathParameters !== undefined) {
                emailAddressEnc = event.pathParameters.emailAddress
        };
        
        let emailAddressDec = decodeURIComponent(emailAddressEnc)
        
        console.log(emailAddressDec)
        
        unsubscribe(emailAddressDec)
            .then(result => {
                const response = { body: JSON.stringify({message: 'signedEmail ' + emailAddressDec + ' removed.'}) };
                callback(null, response);
            })
            .catch(callback);
    };


    const updateEmailLeagues = (event, context, callback) => {
        
        let data = {    "emailAddress": "frankforland@gmail.com",
                        "signedLeagues": [  { "leagueId": "/turnering/32794/raekke/90467/pulje/33640", "leagueName": "Sjællandsserien - Øst" },
                                            { "leagueId": "/turnering/32794/raekke/90465/pulje/33641", "leagueName": "2. Division - Herrer - Vest - Nord" },
                                            { "leagueId": "/turnering/32794/raekke/90468/pulje/33645", "leagueName": "Serie 1 - Kreds 2" }]
                            
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

    const getLeagueGames = (event, context, callback) => {
        
        let data = {    "season": "2018/19",
                        "leaguesToGet": [   { "leagueId": "/turnering/32794/raekke/90462/pulje/33635", "leagueName": "Unihoc Floorball Liga - Landsdækkende" },
                                            { "leagueId": "/turnering/32794/raekke/90465/pulje/33641", "leagueName": "2. Division - Herrer - Vest - Nord" }
                                                ]
                        };
        
        if (event.body !== null && event.body !== undefined) {           
            data = JSON.parse(event.body);
        }
        
        getLeagueGamesList(data.season, data.leaguesToGet)
            .then(leagueGamesList => {
                let response
                
                if (leagueGamesList.length > 0) {
                    response = { body: JSON.stringify(leagueGamesList) };
                }
                else {
                    response = { body: JSON.stringify('No leagues matched the request') };
                }
                
                callback(null, response);
            })
            .catch(callback);
    };  
    
    const updateGames = (event, context, callback) => {
        console.log(event)
        console.log(context)

        let data = {    "season": "2018/19",
                        "leaguesReqToUpdate": "ACTIVE",
                        // "leaguesToUpdate": [    { "leagueId": "/turnering/32794/raekke/90462/pulje/33635", "leagueName": "Unihoc Floorball Liga - Landsdækkende" },
                        //                         { "leagueId": "/turnering/32794/raekke/90465/pulje/33641", "leagueName": "2. Division - Herrer - Vest - Nord" }
                        //                        ]
                        };
        
        if (event.body !== null && event.body !== undefined) {           
            data = JSON.parse(event.body);
        }
        
        if (event.detail !== null && event.detail !== undefined) {
            if (event.source === 'aws.events') {    
                data = event.detail;
            }
        }; 
        
        getLeaguesList(data.season)
            .then(leaguesList => {
                let leaguesToHandle = [];
                // console.log(leaguesList)
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
                const response = { body: JSON.stringify('DONE: Update of leagueGames Table for season ' + data.season) };
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
        
        let extend = 'test';
        
        if (event.pathParameters !== null && event.pathParameters !== undefined) {
                extend = event.pathParameters.extend
        };
        
        if (event.source !== null && event.source !== undefined) {
            if (event.source === 'aws.events') {    
                extend = 'prod'
            }
        };   
        
        console.log('extend: ' + extend)
        
        getNewGamesPlayedList(undefined)
            .then(newGamesPlayedList => {
                if (newGamesPlayedList.length > 0) {
                    return getSignedLeaguesList(extend)
                        .then(signedUpList => {
                            // console.log(signedUpList)
                            return sendEmailSigned(newGamesPlayedList, signedUpList)
                    });
                }
                else {
                    const response = { body: JSON.stringify('DONE: no emails to send ') };
                    callback(null, response);
                }
                    
            })
            .then(result => {
                const response = { body: JSON.stringify('DONE: emails send ') };
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
    

    module.exports = {
        updateEmailLeagues,
        getLeagueGames,
        updateGames,
        getLeagues,
        updateLeagues,
        sendSignedEmails,
        getSignedLeaguesByEmailAddress,
        deleteSignedEmail,
        getstats,
        getgameinfo
    };
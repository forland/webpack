// AWS stuff
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Dates
const moment = require('moment');

// Request service
const request = require('axios');

// extract from HTML
const { extractGamesFromHTML } = require('./games');



function getHTML(leagueListItem) {
    return new Promise(resolve => {
        let url ='https://minidraet.dgi.dk' + leagueListItem.leagueId;
        console.log('--GETTING HTML for URL: ' + url);
        resolve(request(url));
    })
}

function extractGames(axiosHTML, leagueListItem) {
    return new Promise(resolve => {
      resolve(extractGamesFromHTML(axiosHTML.data, leagueListItem));
    })
    
}

function updateNextGameDate(gamesList, leagueListItem) {
    return new Promise(resolve => {
      let gamesListNotPlayed = gamesList.filter(played => played.gameResult === null)
      // console.log('notplayed: ' + JSON.stringify(gamesListNotPlayed))
      let nextGameDate = gamesListNotPlayed[0].gameDate
      
                  var params = {  TableName: 'leagues',
                                        Key: {
                                              leagueId: leagueListItem.leagueId,
                                              leagueName: leagueListItem.leagueName
                                        },
                                        UpdateExpression: "set nextGameDate = :n",
                                        ExpressionAttributeValues:{
                                                              ":n":nextGameDate
                                        },
                                        ReturnValues:"UPDATED_NEW"
         	                    }
      
      resolve(dynamoDb.update(params).promise().then(console.log('UPDATED nextGameDate for league >' + leagueListItem.leagueName + '< Id: ' + leagueListItem.leagueId)))
    })
}

function saveGameData(gamesList, leagueListItem) {

  moment.locale('da');
  var params = {
                    TableName: 'leagueGames',
                    Item: {
                        leagueId: leagueListItem.leagueId,
                        leagueName: leagueListItem.leagueName,
                        season: leagueListItem.season,
                        leagueGames: gamesList,
                        addedAt: moment(Date.now()).toISOString(),
                    }
                    
  }
    var newGamesPromise = new AWS.DynamoDB.DocumentClient().put(params).promise();
    
    // Handle promise's fulfilled/rejected states
    return newGamesPromise.then(
      function() {
              console.log('UPDATED games in DB for >' + leagueListItem.leagueName + '< leagueId: ' + leagueListItem.leagueId)
              return 
      }).catch(
        function(err) {
        console.error('error saving games to DB for >' + leagueListItem.leagueName + '< leagueId: ' + leagueListItem.leagueId, err, err.stack);
      });
      

}


function updateLeagueGames (leaguesList) {
    let chain = Promise.resolve();
    for (let leagueListItem of leaguesList) {
        chain = chain.then(()=>getHTML(leagueListItem))
         .then(axiosHTML => extractGames(axiosHTML, leagueListItem))
         .then(gamesList => {
                      return updateNextGameDate(gamesList, leagueListItem)
                      .then(result => saveGameData(gamesList, leagueListItem))
                      .catch(error => console.log(error));
                      
         })
         // .then(result => console.log(result))
         .catch(error => console.log(error));

    }
    return chain;
  
  
}

module.exports = {
updateLeagueGames,

             
};

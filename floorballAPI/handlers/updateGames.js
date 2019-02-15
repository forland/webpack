// AWS stuff
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Dates
const moment = require('moment');

// diff Array items
const { differenceWith, isEqual } = require('lodash');

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
      let nextGameDate = 'Z'
      let gamesListNotPlayed = gamesList.filter(played => played.gameResult === 'Z')
      
      if (gamesListNotPlayed.length > 0) {
        let gamesListNotPlayedTooOld = gamesListNotPlayed.filter(playedSoon => moment.duration(moment(playedSoon.gameDate).diff(moment(Date.now()).toISOString())).asDays() > (-8))

          if (gamesListNotPlayedTooOld.length > 0) {
            nextGameDate = gamesListNotPlayedTooOld[0].gameDate
          }
      }
      
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
    var saveGamesPromise = new AWS.DynamoDB.DocumentClient().put(params).promise();
    
    // Handle promise's fulfilled/rejected states
    return saveGamesPromise.then(
      function() {
              console.log('UPDATED games in DB for >' + leagueListItem.leagueName + '< leagueId: ' + leagueListItem.leagueId)
              return 
      }).catch(
        function(err) {
        console.error('error saving games to DB for >' + leagueListItem.leagueName + '< leagueId: ' + leagueListItem.leagueId, err, err.stack);
      });
      

}

function getLeagueGames(leagueListItem) {

  var params = {
                    TableName: 'leagueGames',
                    Key: {
                        leagueId: leagueListItem.leagueId,
                        leagueName: leagueListItem.leagueName,
                    }
                    
  }
    var getGamesPromise = new AWS.DynamoDB.DocumentClient().get(params).promise();
    
    // Handle promise's fulfilled/rejected states
    return getGamesPromise.then(
      function(data) {
              let gamesListDB = data.Item ? data.Item.leagueGames : [];
              console.log('RETRIEVED ' + gamesListDB.length + ' games in DB for >' + leagueListItem.leagueName + '< leagueId: ' + leagueListItem.leagueId)

              return gamesListDB   
      }).catch(
        function(err) {
        console.error('error retrieving games to DB for >' + leagueListItem.leagueName + '< leagueId: ' + leagueListItem.leagueId, err, err.stack);
      });
}

function saveNewGamesPlayed (leagueGamesList, updatedGamesList, leagueListItem) {
    
    let updatedGamesListPlayed = updatedGamesList.filter(updatedPlayed => updatedPlayed.gameResult !== 'Z')
    let leagueGamesListPlayed = leagueGamesList.filter(played => played.gameResult !== 'Z')
    let diffGamesPlayed = differenceWith(updatedGamesListPlayed, leagueGamesListPlayed, isEqual);
    console.log('FILTERED diffGamesPlayed for ' + leagueListItem.leagueName + ':');
    console.log(diffGamesPlayed);

    let neweGamesChain = Promise.resolve();
    for (let diffGamesPlayedItem of diffGamesPlayed) {
        neweGamesChain = neweGamesChain.then(() => {
                  
                  var params = {    TableName: 'newLeagueGames',
                                    Item: {
                                        leagueId: leagueListItem.leagueId,
                                        gameId: diffGamesPlayedItem.gameNumber,
                                        leagueName: leagueListItem.leagueName,
                                        season: leagueListItem.season,
                                        leagueGames: diffGamesPlayedItem,
                                        addedAt: moment(Date.now()).toISOString(),
                                    }
                                    
                  }
                  var savePlayedGamesPromise = new AWS.DynamoDB.DocumentClient().put(params).promise();
                    
                  // Handle promise's fulfilled/rejected states
                  return savePlayedGamesPromise.then(
                    function() {
                            console.log('UPDATED newLeagueGames table with game ' + diffGamesPlayedItem.gameNumber + ' for >' + leagueListItem.leagueName + '< leagueId: ' + leagueListItem.leagueId)
                            return 
                    }).catch(
                      function(err) {
                      console.error('error saving playedGames to DB for >' + leagueListItem.leagueName + '< leagueId: ' + leagueListItem.leagueId, err, err.stack);
                    });         
        })
         .catch(error => console.log(error));
    }
    return neweGamesChain;
}



// Main function
function updateLeagueGames (leaguesList) {
    let gamesChain = Promise.resolve();
    for (let leagueListItem of leaguesList) {
        gamesChain = gamesChain.then(()=>getHTML(leagueListItem))
         .then(axiosHTML => extractGames(axiosHTML, leagueListItem))
         .then(updatedGamesList => {
                      // Get gamesList form DB 
                      return getLeagueGames(leagueListItem)
                      //.then(leagueGamesList => console.log(leagueGamesList))
                      .then(leagueGamesList => saveNewGamesPlayed(leagueGamesList, updatedGamesList, leagueListItem))
                      .then(result => saveGameData(updatedGamesList, leagueListItem))
                      .then(result => updateNextGameDate(updatedGamesList, leagueListItem))
                      .catch(error => console.log(error));
                      
         })
         // .then(result => console.log(result))
         .catch(error => console.log(error));

    }
    return gamesChain;
}

module.exports = {
updateLeagueGames,

             
};

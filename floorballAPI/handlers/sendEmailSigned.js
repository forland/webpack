// AWS stuff
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Dates
const moment = require('moment');

// diff Array items
const { differenceWith, isEqual } = require('lodash');


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





// Main function
function sendEmailSigned (newGamesPlayedList) {
  
  console.log('hello')
    var signedUpLeaguesListPromise = new AWS.DynamoDB.DocumentClient().scan({ TableName: 'signedUpLeagues' }).promise();
    
    // Handle promise's fulfilled/rejected states
    return signedUpLeaguesListPromise.then(
      function(data) {
        console.log(data);
              // let leagueListFiltered = data.Items.filter(seasonList => seasonList.season === season);
              // console.log('RETRIEVED ' + leagueListFiltered.length + ' league(s) for season: ' + season);
              return data
      }).catch(
        function(err) {
        console.error("Error getting leagues from DB", err, err.stack);
      });  
  
  
  
    // let newPlayedGamesChain = Promise.resolve();
    // for (let newGamesPlayedItem of newGamesPlayedList) {
    //     newPlayedGamesChain = newPlayedGamesChain.then(()=>getHTML(leagueListItem))
    //     .then(axiosHTML => extractGames(axiosHTML, leagueListItem))
    //     .then(updatedGamesList => {
    //                   // Get gamesList form DB 
    //                   return getLeagueGames(leagueListItem)
    //                   //.then(leagueGamesList => console.log(leagueGamesList))
    //                   .then(leagueGamesList => saveNewGamesPlayed(leagueGamesList, updatedGamesList, leagueListItem))
    //                   .then(result => saveGameData(updatedGamesList, leagueListItem))
    //                   .then(result => updateNextGameDate(updatedGamesList, leagueListItem))
    //                   .catch(error => console.log(error));
                      
    //     })
    //     // .then(result => console.log(result))
    //     .catch(error => console.log(error));

    // }
    // return newPlayedGamesChain;
}

module.exports = {
sendEmailSigned,

             
};

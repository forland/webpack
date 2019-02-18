  // Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'eu-west-1'});


// Create the promise and SES service object

function getNewGamesPlayedList(handledDate) {
    
    var newGamesPlayedList = new AWS.DynamoDB.DocumentClient().scan({ TableName: 'newLeagueGames' }).promise();
    
    // Handle promise's fulfilled/rejected states
    return newGamesPlayedList.then(
      function(data) {
        // console.log(data);
              let newGameslistFiltered = data.Items.filter(notsend => notsend.handledDate === handledDate);
              console.log('RETRIEVED ' + newGameslistFiltered.length + ' new games played (s) for handledDate: ' + handledDate);
              return newGameslistFiltered
      }).catch(
        function(err) {
        console.error("Error getting leagues from DB", err, err.stack);
      });
}

module.exports = {
getNewGamesPlayedList
};
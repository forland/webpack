  // Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'eu-west-1'});

const uuid = require('uuid');
    
// Create the promise and SES service object

function saveNewPlayedGamesInDB (forening, hold, gamesListNewPlayed) {


  var params = {
                    TableName: 'games',
                    Item: {
                        id: uuid.v1(),
                        forening: forening,
                        hold: hold,
                        games: gamesListNewPlayed,
                        addedAt: Date.now(),
                    }
                    
  }
    
    var newGamesPromise = new AWS.DynamoDB.DocumentClient().put(params).promise();
    
    // Handle promise's fulfilled/rejected states
    return newGamesPromise.then(
      function() {
              console.log("put done - saved new games to DB")
              return 
      }).catch(
        function(err) {
        console.error("error saving new games", err, err.stack);
      });
      

}

module.exports = {
saveNewPlayedGamesInDB
             
};

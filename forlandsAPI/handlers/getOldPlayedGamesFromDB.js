  // Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'eu-west-1'});


// Create the promise and SES service object

function getOldPlayedGamesFromDB (forening, hold) {

  let gamesListOld;
  let gamesListOldPlayed;
  var params = {
                    TableName: "games",
                    Key:{
                        "forening": forening,
                        "hold": hold
                    }
                };
                    

    
    var oldGamesPromise = new AWS.DynamoDB.DocumentClient().get(params).promise();
    
    // Handle promise's fulfilled/rejected states
    return oldGamesPromise.then(
      function(data) {
        // console.log(data);
              console.log("Retrieved old games from DB");
              gamesListOld = data.Item ? data.Item.games : []; 
              gamesListOldPlayed = gamesListOld.filter(played => played.gameResult !== '');
              return gamesListOldPlayed
      }).catch(
        function(err) {
        console.error("Error getting old games from DB", err, err.stack);
      });
      

}

module.exports = {
getOldPlayedGamesFromDB
             
};
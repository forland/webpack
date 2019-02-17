  // Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'eu-west-1'});


// Create the promise and SES service object

function getSignedLeaguesList() {
    
    var signedLeaguesList = new AWS.DynamoDB.DocumentClient().scan({ TableName: 'signedUpLeagues' }).promise();
    
    // Handle promise's fulfilled/rejected states
    return signedLeaguesList.then(
      function(data) {
        // console.log(data);
              console.log('RETRIEVED ' + data.length + ' signedUpleague(s)');
              return data
      }).catch(
        function(err) {
        console.error("Error getting signedUpLeagues from DB", err, err.stack);
      });
}

module.exports = {
getSignedLeaguesList
};
  // Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'eu-west-1'});


// Create the promise and SES service object

function getSignedLeaguesList(extend) {
    
    var signedLeaguesList = new AWS.DynamoDB.DocumentClient().scan({ TableName: 'signedUpLeagues' }).promise();
    
    // Handle promise's fulfilled/rejected states
    return signedLeaguesList.then(
      function(data) {
        // console.log(data);
              
              if (extend === 'test') {
                let filteredSignedForTest = data.Items.filter(testEmail => testEmail.emailAddress === 'frankforland@gmail.com')
                console.log('RETRIEVED ' + filteredSignedForTest.length + ' signedUpleague(s) FOR TEST');
                return filteredSignedForTest             
              }
              else {
                console.log('RETRIEVED ' + data.Items.length + ' signedUpleague(s) FOR PROD');
                return data.Items
              }
      }).catch(
        function(err) {
        console.error("Error getting signedUpLeagues from DB", err, err.stack);
      });
}

module.exports = {
getSignedLeaguesList
};
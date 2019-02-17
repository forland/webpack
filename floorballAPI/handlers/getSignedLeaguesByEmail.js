  // Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'eu-west-1'});


// Create the promise and SES service object

function getSignedLeaguesByEmail(emailAddress) {
    
  var params = {
                    TableName: 'signedUpLeagues',
                    Key: {
                        emailAddress: emailAddress,
                    }
                    
  }
    var getSignedLeaguesPromise = new AWS.DynamoDB.DocumentClient().get(params).promise();
    
    // Handle promise's fulfilled/rejected states
    return getSignedLeaguesPromise.then(
      function(data) {
              let signedLeagues = data.Item ? data.Item.signedLeagues : [];
              console.log('RETRIEVED ' + signedLeagues.length + ' signedLeagues in DB for ' + emailAddress)
              return signedLeagues  
      }).catch(
        function(err) {
        console.error('error retrieving games to DB for ' + emailAddress, err, err.stack);
      });
}

module.exports = {
getSignedLeaguesByEmail
};
  // Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'eu-west-1'});


// Create the promise and SES service object

function getLeaguesList(seasonX) {

    const seasonY = seasonX.replace(/-/g,'/');
    
    var leaguesList = new AWS.DynamoDB.DocumentClient().scan({ TableName: 'leagues' }).promise();
    
    // Handle promise's fulfilled/rejected states
    return leaguesList.then(
      function(data) {
        // console.log(data);
              console.log("Retrieved leagues");
              let leagueListFiltered = data.Items.filter(seasonList => seasonList.season === seasonY);
              return leagueListFiltered
      }).catch(
        function(err) {
        console.error("Error getting leagues from DB", err, err.stack);
      });
}

module.exports = {
getLeaguesList
};
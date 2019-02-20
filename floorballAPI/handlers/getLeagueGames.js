  // Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'eu-west-1'});


// Create the promise and SES service object

function getLeagueGamesList(season, leaguesToGet) {
    
    var leaguesList = new AWS.DynamoDB.DocumentClient().scan({ TableName: 'leagueGames' }).promise();
    
    // Handle promise's fulfilled/rejected states
    return leaguesList.then(
      function(data) {
        // console.log(data);
              let leagueListFiltered = data.Items.filter(seasonList => seasonList.season === season);
              
              if (leaguesToGet !== null && leaguesToGet !== undefined) {
                
                let leagueIDs = leaguesToGet.map(function (item) {return item.leagueId})
                console.log(leagueIDs)
                      
                    leagueListFiltered = leagueListFiltered.filter(function(item) {
                                                        return leagueIDs.indexOf(item.leagueId) !== -1;
                                                    });  
                        
                        console.log('FILTERED ' + leagueListFiltered.length + ' league(s) by request for season: ' + season);
              }
              
              console.log('RETRIEVED ' + leagueListFiltered.length + ' league(s) for season: ' + season);
              return leagueListFiltered
      }).catch(
        function(err) {
        console.error("Error getting leagues from DB", err, err.stack);
      });
}

module.exports = {
getLeagueGamesList
};
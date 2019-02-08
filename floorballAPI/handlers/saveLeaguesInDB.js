  // Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'eu-west-1'});
    
// Create the promise and SES service object

function saveLeaguesInDB (leaguesList) {


        var promises = [];
        for(var i = 0; i < leaguesList.length; i++) {
        	
        	  var params = {  TableName: 'leagues',
                          Item: {
                                leagueId: leaguesList[i].leagueId,
                                leagueName: leaguesList[i].leagueName,
                                leagueCategory: leaguesList[i].leagueCategory,
                                leagueRegion: leaguesList[i].leagueRegion,
                                season: leaguesList[i].season,
                                
                                }
        	  }
        	
        	var promise = new AWS.DynamoDB.DocumentClient().put(params).promise();;
        	promises.push(promise);
        }

return Promise.all(promises).then();

}

module.exports = {
saveLeaguesInDB
             
};

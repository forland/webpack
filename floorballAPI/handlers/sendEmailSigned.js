// AWS stuff
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// flatMap
var flatMap = require('array.prototype.flatmap');

// Dates
const moment = require('moment');
    
function updateNewGameState(newGamesPlayedItem) {
    return new Promise(resolve => {
      let handledDate = moment(Date.now()).toISOString()
      

                  var params = {  TableName: 'newLeagueGames',
                                        Key: {
                                              leagueId: newGamesPlayedItem.leagueId,
                                              gameId: newGamesPlayedItem.gameId
                                        },
                                        UpdateExpression: "set handledDate = :n",
                                        ExpressionAttributeValues:{
                                                              ":n":handledDate
                                        },
                                        ReturnValues:"UPDATED_NEW"
         	                    }
      
      resolve(dynamoDb.update(params).promise().then(console.log('UPDATED state in newLeagueGames for league >' + newGamesPlayedItem.leagueName + '< Id: ' + newGamesPlayedItem.leagueId)))
    })
}

function updateNewGames(newGamesPlayedList){
  // console.log(newGamesPlayedList)
  
    let updateStateChain = Promise.resolve();
     for (let newGamesPlayedItem of newGamesPlayedList) {
         updateStateChain = updateStateChain.then(() => updateNewGameState(newGamesPlayedItem))
         .catch(error => console.log(error));

     }
     return updateStateChain;
}


function sendEmail(emailsDataItem) {
console.log(emailsDataItem)
 // Make html Body
    let resultRows = ''
    let rowX
    
    for (let gameItem of emailsDataItem.gamesData) {
    
         rowX = `<h3>` + gameItem.leagueName + ` </h3>` +
                `<p><small>` + gameItem.gameDateTxt + ` (` + gameItem.gameTime + `)</small><br>` +
                gameItem.homeTeam + ` vs. ` + gameItem.awayTeam + `<br>` +
                `Resultat: ` + gameItem.gameResult + ` <a href='https://minidraet.dgi.dk` + gameItem.gameNumberUrl + `'><small> >>>mere</small></a></p>`
                
        
        resultRows = resultRows + rowX
    }
    

    const body_html = `<html>
    <head></head>
    <body>
      <h1>Nye resultater i ` + emailsDataItem.gamesData.length + ` pulje(r) </h1>`
      
       + resultRows + 
     
     `<a href='http://forlands.dk/'> Se flere resultater her...</a>
        
    </body>
    </html>`;



    // Create sendEmail params 
    var params = {
      Destination: { /* required */
        ToAddresses: [
          emailsDataItem.emailAddress
        ]
      },
      Message: { /* required */
        Body: { /* required */
          Html: {
           Charset: "UTF-8",
           Data: body_html
          },
          Text: {
           Charset: "UTF-8",
           Data: "Der er nye resultater, se dem her: www.forlands.dk"
          }
         },
         Subject: {
          Charset: 'UTF-8',
          Data: 'Floorballresultater'
         }
        },
      Source: 'frankforland@gmail.com', /* required */
      ReplyToAddresses: [
          'frankforland@gmail.com',
        /* more items */
      ],
    };   
    
    
    var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
    
    // Handle promise's fulfilled/rejected states
    return sendPromise.then(
      function(data) {
        console.log("Emails send with MessageID: ", data.MessageId);
      }).catch(
        function(err) {
        console.error("Error sending email: ", err, err.stack);
      });
      

}

// Main function
function sendEmailSigned (newGamesPlayedList, signedUpLeaguesList) {
  
  // console.log(newGamesPlayedList)
   // console.log(signedUpLeaguesList)
   
    // Filter only relevant emails
    let newGamesPlayedListID = newGamesPlayedList.map(function(item) {return item.leagueId})
    const signedUpLeaguesListFiltered = signedUpLeaguesList.filter(leagueSigned => leagueSigned.signedLeagues.find(legauesPlayed => newGamesPlayedListID.includes(legauesPlayed.leagueId)));
    console.log('signedLeagues filtered: ' + signedUpLeaguesListFiltered.length)
    
    // Filter only relevant newGames  
    let signedUpLeaguesListID = flatMap(signedUpLeaguesList, function(item) {return item.signedLeagues}).map(function (itemX) {return itemX.leagueId});
    const newGamesPlayedListFiltered = newGamesPlayedList.filter(function(item) {return signedUpLeaguesListID.indexOf(item.leagueId) !== -1;}); 
    console.log('newgames filtered: ' + newGamesPlayedListFiltered.length);
    
    // do an array for each emailaddress
    const emailsData = [];

        for (let signedItem of signedUpLeaguesListFiltered) {
          let emailAddress = signedItem.emailAddress
                
                let gamesData = []
              
                  for (let signedLeagueItem of signedItem.signedLeagues) {
              
                          for (let newPlayedItem of newGamesPlayedListFiltered) {
                            if (signedLeagueItem.leagueId === newPlayedItem.leagueId) {
                            
                              let gamesList = newPlayedItem.leagueGames
                              gamesData.push({gamesList,});
                            }
                          }
                  }
      
          gamesData = flatMap(gamesData, function (item) {return item.gamesList})
          
          emailsData.push({emailAddress, gamesData});
      
          
        };   
      
      console.log('FILTERED ' + emailsData.length + ' emails to SEND' )
      

  // send emails
  
    let sendEmailsChain = Promise.resolve();
     for (let emailsDataItem of emailsData) {
         // sendEmailsChain = sendEmailsChain.then(() => updateNewGames(newGamesPlayedList))
         sendEmailsChain = sendEmailsChain.then(() => sendEmail(emailsDataItem))
         .catch(error => console.log(error));

     }
     return sendEmailsChain.then(result => updateNewGames(newGamesPlayedList));
}

module.exports = {
sendEmailSigned,

             
};

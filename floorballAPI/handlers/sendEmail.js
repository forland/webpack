 
 // Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'eu-west-1'});

    

// Create the promise and SES service object

function sendEmail (emailBodyData) {


    // Make html Body
    let resultRows = ''
    let rowX
    
    emailBodyData.forEach(makeList)
    
    function makeList(item, index) {
         rowX = `<p>` + item.homeTeam + ` vs. ` + item.awayTeam + ` - Resultat: ` + item.gameResult + `</p>`
        
        resultRows = resultRows + rowX
    }
    

    const body_html = `<html>
    <head></head>
    <body>
      <h1>Nye resultater i pulje ` + emailBodyData[0].raekke + `</h1>`
      
       + resultRows + 
     
     `<a href='https://forlands.dk/'> Se mere her...</a>
        
    </body>
    </html>`;



    // Create sendEmail params 
    var params = {
      Destination: { /* required */
        ToAddresses: [
          'frankforland@gmail.com'
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
          Data: 'Nye floorballresultater'
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

module.exports = {
sendEmail
             
};
const cheerio = require('cheerio');
const moment = require('moment');

  // Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'eu-west-1'});


function extractLeaguesFromHTML (html) {
 
  const $ = cheerio.load(html)

  const tableRowLeagues = $('#Views_Turnering_Oversigt').find($('.footable').children());

  let season = '2018/19'
  let headerTXT = null

  
  const leagues = [];
  
  
  tableRowLeagues.each((i, el) => {
    if ($(el).is('thead')) { // if tableheader then save leagueName first part for later hit on tablebody
      headerTXT = $(el).children().eq(0).text().trim();
    }
    
    else if ($(el).children().eq(0).children().eq(0).find('a').text().trim().length > 0) {
      
      let leagueId = $(el).children().eq(0).find('a').attr('href');
      let leagueName = headerTXT + ' - ' + $(el).children().eq(0).children().eq(0).find('a').text().trim();
      let leagueCategory = 'Herrer'
        if (headerTXT.substring(0, 1) === 'U' && headerTXT.substring(0, 2) !== 'Un') {
          leagueCategory = 'Ungdom'
        }
        else if (headerTXT.indexOf("Damer") > 0) {
          leagueCategory = 'Damer'
        }
      let leagueRegion = $(el).children().eq(0).children().eq(0).find('a').text().trim();
      
      leagues.push({leagueId, leagueName, leagueCategory, leagueRegion, season})
      
    }
    
  });
  // console.log(leagues);
  return leagues;
}


module.exports = {
extractLeaguesFromHTML
             
};
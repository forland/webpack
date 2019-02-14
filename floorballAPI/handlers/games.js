const cheerio = require('cheerio');
const moment = require('moment');
const request = require('axios');


function extractGamesFromHTML (html, leagueListItem) {
 
  const $ = cheerio.load(html)
  const leagueCategory = leagueListItem.leagueCategory;
  const leagueName = leagueListItem.leagueName;
  const leagueRegion = leagueListItem.leagueRegion;
  const leagueUrl = leagueListItem.leagueId;
  
  const tableRowsGames = $('#Views_Turnering_Raekke_Pulje_Program').find($('.footable tbody tr'));

  const games = [];
  
  
  tableRowsGames.each((i, el) => {

    // Extract information from each row of the table
    let gameNumberX = $(el).children().eq(0).text().trim();
    let gameNumber = gameNumberX.slice(0,(gameNumberX.indexOf('\n',0))).trim();
    let gameNumberUrl = $(el).children().eq(0).children().eq(0).attr('href');
    let gameDate = $(el).children().eq(1).children().eq(0).text().trim();
    let gameTime = ($(el).children().eq(1).text().trim()).slice(-5).trim();
    let homeTeam = $(el).children().eq(2).children().eq(0).text().trim();
    let homeTeamUrl = $(el).children().eq(2).children().eq(0).attr('href');
    let awayTeam = $(el).children().eq(2).children().eq(1).text().trim();
    let awayTeamUrl = $(el).children().eq(2).children().eq(1).attr('href');
    let gameLocation = $(el).children().eq(3).children().eq(1).text().trim();
    let gameLocationUrl = $(el).children().eq(3).children().eq(1).attr('href');
    let gameResult = $(el).children().eq(4).text().trim();
      // set gameResult to null if blank - to fit into dynamoDB
      if (gameResult === '')  {gameResult = null};
    
    moment.locale('da');
    
    let dateAndTime = gameDate + " " + gameTime;
    gameDate = moment(dateAndTime, 'DD-MM-YYYY HH:mm').toISOString();
    
    let gameDateTxt = moment(dateAndTime, 'DD-MM-YYYY').format('LL');;

    games.push({leagueName, leagueRegion, leagueCategory, leagueUrl, gameNumber, gameNumberUrl, gameDate, gameTime, gameDateTxt, homeTeam, homeTeamUrl, awayTeam, awayTeamUrl, gameLocation, gameLocationUrl, gameResult,});

    
  });
  console.log('CREATED Array with ' + games.length + ' games for >' + leagueListItem.leagueName + '< Id: ' + leagueListItem.leagueId)
  return games;
}

module.exports = {
extractGamesFromHTML
             
};
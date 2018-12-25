const cheerio = require('cheerio');
const moment = require('moment');
const request = require('axios');


function extractGamesFromHTML (html) {
 
  const $ = cheerio.load(html)
  const tableRowsGames = $('#Views_Turnering_Raekke_Pulje_Program').find($('.footable tbody tr'));

  const games = [];
  
  
  tableRowsGames.each((i, el) => {

    // Extract information from each row of the table
    let gameNumber = $(el).children().eq(0).text().trim();
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
    moment.locale('da');
    gameDate = moment(gameDate, 'DD-MM-YYYY');
    gameDateTxt = moment(gameDate, 'DD-MM-YYYY').format('LL');;
    gameDateCalc = moment(gameDate, 'DD-MM-YYYY').fromNow();

    games.push({gameNumber, gameNumberUrl, gameDate, gameTime, gameDateTxt, gameDateCalc, homeTeam, homeTeamUrl, awayTeam, awayTeamUrl, gameLocation, gameLocationUrl, gameResult,});
  });

  return games;
}

module.exports = {
extractGamesFromHTML
             
};
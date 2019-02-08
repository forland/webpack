const cheerio = require('cheerio');
const moment = require('moment');
const request = require('axios');


function extractStatsFromHTML (html) {
 
  const $ = cheerio.load(html)

  const tableRowsStats = $('#Views_Turnering_Raekke_Pulje_Stilling').find($('.footable tbody tr'));
  const stats = [];
  
  
  tableRowsStats.each((i, el) => {

    // Extract information from each row of the table
    let teamPositionX= $(el).children().eq(0).text().trim();
    let teamPosition = teamPositionX.slice(0,(teamPositionX.indexOf('.',0))).trim();
    let team = $(el).children().eq(1).children().eq(0).text().trim();
    let teamUrlX = $(el).children().eq(1).children().eq(0).attr('href');
    let teamUrl = 'https://minidraet.dgi.dk' + teamUrlX;
    let playedGames = $(el).children().eq(2).text().trim();
    
    let gamesWon = $(el).children().eq(3).text().trim();
    let gamesDraw = $(el).children().eq(4).text().trim();
    let gamesLost = $(el).children().eq(5).text().trim();
    let gamesScore = $(el).children().eq(6).text().trim();
    let gamesPoint = $(el).children().eq(7).text().trim();
    
    let homeTeam = $(el).children().eq(2).children().eq(0).text().trim();
    let homeTeamUrl = $(el).children().eq(2).children().eq(0).attr('href');
    let awayTeam = $(el).children().eq(2).children().eq(1).text().trim();
    let awayTeamUrl = $(el).children().eq(2).children().eq(1).attr('href');
    let gameLocation = $(el).children().eq(3).children().eq(1).text().trim();
    let gameLocationUrl = $(el).children().eq(3).children().eq(1).attr('href');
    let gameResult = $(el).children().eq(4).text().trim();

    stats.push({teamPosition, team, teamUrl, playedGames, gamesWon, gamesDraw, gamesLost, gamesScore, gamesPoint});

    
  });

  return stats;
}

module.exports = {
extractStatsFromHTML
             
};
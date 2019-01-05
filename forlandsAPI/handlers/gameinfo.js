const cheerio = require('cheerio');
const moment = require('moment');


function extractGameInfoFromHTML (html) {
 
  const $ = cheerio.load(html)
  const gameInfoTabel = $('#Views_Turnering_Raekke_Pulje_Kamp_Info').find($('.footable tbody tr'));
  
  const gameNumber = $(gameInfoTabel[0]).children().eq(1).text().trim();
  const gameLocationFull = $(gameInfoTabel[3]).children().eq(1).text().trim();
  // console.log($(gameInfoTabel[3]).children().eq(1).text())  
  
  let gameLocationHead = gameLocationFull
  let gameLocationSub = ''
  if (gameLocationFull.search("  ") > 0) {
    gameLocationHead = gameLocationFull.slice(0,(gameLocationFull.indexOf('\n',0)));
    gameLocationSub = gameLocationFull.slice(gameLocationFull.lastIndexOf('\n'),gameLocationFull.length).trim();
  }  

  const gameLocationUrl = 'https://minidraet.dgi.dk' + $(gameInfoTabel[3]).children().eq(1).children().eq(0).attr('href');
  
  
  let gameRound = $(gameInfoTabel[7]).children().eq(1).text().trim();
  
  let gameReferees = '';
  if ($(gameInfoTabel[8]).children().eq(0).text().trim() == 'Dommer(e)') {
        gameReferees = $(gameInfoTabel[8]).children().eq(1).text().trim();
        gameRound = $(gameInfoTabel[9]).children().eq(1).text().trim();
  }
  
  let gameRapportUrl = '';
  
  if ($(gameInfoTabel[11]).children().eq(1).children().eq(0).attr('href')) {
        gameRapportUrl = $(gameInfoTabel[11]).children().eq(1).children().eq(0).attr('href');
  }
  
  
  const gameInfo = [];
  
    gameInfo.push({gameNumber, gameLocationHead, gameLocationSub, gameLocationUrl, gameReferees, gameRound, gameRapportUrl});

  return gameInfo;
}

module.exports = {
extractGameInfoFromHTML
             
};
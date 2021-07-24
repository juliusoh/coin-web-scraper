const cheerio = require("cheerio");
const request = require("request");
const fetch = require('node-fetch');


async function getCoinName() {

  const request = await fetch("https://www.pcgs.com/coinfacts/coin/1935-1936-1c-alaska-rrc-bingle/20020");
  const text = await request.text();
  const $ = cheerio.load(text);
  const coinName = $("h1").html();
  console.log(coinName)
}

getCoinName()


// async function getCoinName(coinDashName, specNo) {
//   const request = await fetch(
//     `https://www.pcgs.com/coinfacts/coin/${coinDashName}/${specNo}`
//   );
//   const text = await request.text();
//   const $ = cheerio.load(text);
//   const coinName = $("h1").html();
//   return coinName;
// }


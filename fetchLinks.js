const cheerio = require("cheerio");
const fetch = require("node-fetch");
const FormData = require("form-data");
const Coin = require("./coinModel");
const connectDB = require("./db");
const dotenv = require("dotenv");
const request = require("request");

dotenv.config();
connectDB();
// sync happens in order
// async result depends on another
async function main() {
  await Coin.deleteOldData();
  const request = await fetch("https://www.pcgs.com/coinfacts");
  const text = await request.text();
  const $ = cheerio.load(text);

  // const linkList = $(".row.coin-list")
  //   .find("a")
  //   .toArray()
  //   .map((el) => {
  //     const list = $(el).attr("href");
  //     const homeUrl = "https://www.pcgs.com";
  //     return homeUrl + list;
  //   });

  const linkList = {};
  const categoryName = $(".row.coin-list .box")
    .toArray()
    .forEach((box) => {
      const header = $(box).find("a.text-default").html();
      const urls = $(box)
        .find("ul li a")
        .toArray()
        .map((el) => {
          const list = $(el).attr("href");
          const homeUrl = "https://www.pcgs.com";
          return homeUrl + list;
        });
      linkList[header] = urls;
    });

  // category/property is key, value is array of links,

  let arr = [];

  if (Object.keys(linkList).length === 0) {
    console.error("Blocked :(");
  }

  // loop through object
  let counter = 0;
  const totalNumber = Object.values(linkList).reduce((accum, currentValue) => {
    return Number(accum) + Number(currentValue.length);
  }, 0);

  for (const category in linkList) {
    const arrayOfLinks = linkList[category];

    // category : url
    for (let url of arrayOfLinks) {
      counter++;
      setTimeout(async () => {
        //
        const response = await fetch(url);
        const text = await response.text();
        const linkData = getLinkData(url, text, category);
        // execute fetches, store the data, then 1 fetch at a time again

        // flatten array
        arr = [...arr, ...linkData];

        // to not do 2 fetch requests at the same time
        if (counter === totalNumber) {
          getNames(arr);
        }
      }, 2000 * counter);
    }
  }
}

main();

function getNames(array) {
  for (let i in array) {
    const { coinUrl } = array[i];
    setTimeout(async () => {
      const fullName = await getCoinName(coinUrl);

      array[i] = { ...array[i], fullName };
      if (Number(i) === array.length - 1) {
        apiRequest(array);
        console.log("getNames is done");
      }
    }, 2000 * i);
  }
}

// because they blocked too much
function apiRequest(arr) {
  for (let i in arr) {
    setTimeout(async () => {
      const data = await getGridData(arr[i]);
    }, 2000 * i);
  }
}

function getLinkData(url, data, category) {
  const $ = cheerio.load(data);
  const getCorrectLinks = ($) => {
    const linkList = $(".link-list.no-margin")
      .find("a")
      .toArray()
      .map((el) => {
        const list = $(el).attr("href").split("/");
        const coinUrl = $(el).attr("href");
        console.log(coinUrl);
        const specNo = list.pop();
        const coinName = list.pop();
        return {
          specNo,
          coinName,
          category,
          coinUrl,
        };
      });
    if (linkList.length === 0) {
      console.log(url);
    }
    return linkList;
  };
  if ($(".row.cf-cat-list").toArray().length > 0) {
    const stupidLinks = $(".row.cf-cat-list").find("a").toArray();
    for (let i in stupidLinks) {
      setTimeout(async () => {
        const stupidLinkUrl = $(stupidLinks[i]).attr("href");
        const stupidReq = await fetch(`https://www.pcgs.com${stupidLinkUrl}`);
        const text = await stupidReq.text();
        const $ = cheerio.load(text);
        getCorrectLinks($);
      }, 2000 * i);
    }
  } else {
    return getCorrectLinks($);
  }
}

async function getCoinName(url) {
  const request = await fetch(`https://www.pcgs.com${url}`);
  const text = await request.text();
  const $ = cheerio.load(text);
  const realCoinName = $("#detailImages h1.no-margin").html();

  return realCoinName;
}

async function getGridData({ specNo, coinName, category, fullName }) {
  try {
    const form = new FormData();
    form.append("specNo", specNo);
    // form.append("grade", "6");
    form.append("coinName", coinName);
    form.append("showEbay", "false");
    form.append("plusGrade", "false");
    const request = await fetch(
      `https://www.pcgs.com/coinfacts/GetValueViewGridData`,
      {
        method: "post",
        body: form,
      }
    );
    const data = await request.json();
    // const { GradeName, PopulationCount } = data.valueViewData.ValueViewItems;
    const array = data.valueViewData.ValueViewItems.map((item) => {
      const { GradeName, PopulationCount } = item;
      return { GradeName, PopulationCount };
    });

    const coinData = {
      specNo,
      fullName,
      coinName,
      category,
      array,
    };

    if (array.length != 0) {
      const newCoin = new Coin(coinData);
      newCoin.save(function (err, result) {
        if (err) {
          console.log("error", err);
        } else {
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
}

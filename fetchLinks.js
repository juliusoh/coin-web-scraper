const cheerio = require("cheerio");
const fetch = require("node-fetch");
const FormData = require("form-data");
const Coin = require("./coinModel");
const connectDB = require("./db");
const dotenv = require("dotenv");

dotenv.config();
connectDB();
// sync happens in order
// async result depends on another
async function main() {
  await Coin.deleteOldData()
  const request = await fetch("https://www.pcgs.com/coinfacts");
  const text = await request.text();
  const $ = cheerio.load(text);
  const linkList = $(".row.coin-list")
    .find("a")
    .toArray()
    .map((el) => {
      const list = $(el).attr("href");
      const homeUrl = "https://www.pcgs.com";
      return homeUrl + list;
    });

  let arr = [];

  if (linkList.length === 0) {
    console.error("Blocked :(");
  }
  for (let i in linkList) {
    const url = linkList[i];
    setTimeout(async () => {
      const resp = await fetch(url);
      const text = await resp.text();
      const debug = getLinkData(url, text);
      arr = [...arr, ...debug];

      if (Number(i) === linkList.length - 1) {
        anyName(arr);
      }
    }, 1000 * i);
  }
}

main();

function anyName(arr) {
  for (let i in arr) {
    setTimeout(async () => {
      const data = await getGridData(arr[i]);
      console.log(data);
    }, 1000 * i);
  }
}

function getLinkData(url, data) {
  const $ = cheerio.load(data);
  const linkList = $(".row.cf-cat-list, .link-list.no-margin")
    .find("a")
    .toArray()
    .map((el) => {
      const list = $(el).attr("href").split("/");
      const specNo = list.pop();
      const coinName = list.pop();
      return {
        specNo,
        coinName,
      };
    });
  if (linkList.length === 0) {
    console.log(url);
  }
  return linkList;
}

async function getGridData({ specNo, coinName }) {
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
      coinName,
      array,
    };

    const newCoin = new Coin(coinData);
    newCoin.save(function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

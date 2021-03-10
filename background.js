const URL_TO_FETCH = (pair) => `https://api1.binance.com/api/v3/ticker/24hr?symbol=${pair}`;

const RED = [220, 53, 69, 255];
const GREEN = [40, 167, 69, 255];

let quotation = {
  "BTC": null,
  "ETH": null
};

let prevVariation = {
  "BTC": 0,
  "ETH": 0
};

const getCleanedData = (data, base, quote) => {
  return {
    pair: data.symbol,
    base: base,
    quote: quote,
    price: parseFloat(data.lastPrice),
    variation: parseFloat(data.priceChangePercent),
    ohlc: {
      open: parseFloat(data.openPrice),
      close: parseFloat(data.prevClosePrice),
      low: parseFloat(data.lowPrice),
      high: parseFloat(data.highPrice),
    },
  };
};

const EXEMPLO = {
  symbol: "BTCUSDT",
  priceChange: "2434.66000000",
  priceChangePercent: "4.715",
  weightedAvgPrice: "53674.83933318",
  prevClosePrice: "51638.04000000",
  lastPrice: "54072.70000000",
  lastQty: "0.00037000",
  bidPrice: "54072.69000000",
  bidQty: "1.63430100",
  askPrice: "54072.70000000",
  askQty: "0.00003300",
  openPrice: "51638.04000000",
  highPrice: "54815.84000000",
  lowPrice: "51300.00000000",
  volume: "73465.06991800",
  quoteVolume: "3943225824.44934034",
  openTime: 1615239681786,
  closeTime: 1615326081786,
  firstId: 691846199,
  lastId: 694000756,
  count: 2154558,
};

const priceK = (price, fixed = 1) => {
  return (price / 1000).toFixed(fixed);
};

const formatPrice = (price) => `${price}K`;
const Alert = (pair, variation) => `[${pair}] Abnormal Volatility Alert  (15m) -> ${variation}%`;


const BTCHandler = (data) => {
  if (!quotation.BTC) {
    quotation.BTC = getCleanedData(data, "BTC", "USDT");
    prevVariation.BTC = quotation.BTC.variation;
  } else {
    prevVariation.BTC = quotation.BTC.variation;
    quotation.BTC = getCleanedData(data, "BTC", "USDT");
  }
  chrome.browserAction.setBadgeText({ text: formatPrice(priceK(quotation.BTC.price)) });
  chrome.browserAction.setBadgeBackgroundColor({ color: quotation.BTC.variation > 0 ? GREEN : RED });
  if (Math.abs(quotation.BTC.variation - prevVariation.ETH) >= 1) {
    alert(Alert("BTCUSDT", quotation.BTC.variation.toFixed(2)));
  }
}

const ETHHandler = (data) => {
  if (!quotation.ETH) {
    quotation.ETH = getCleanedData(data, "ETH", "USDT");
    prevVariation.ETH = quotation.ETH.variation;
  } else {
    prevVariation.ETH = quotation.ETH.variation;
    quotation.ETH = getCleanedData(data, "ETH", "USDT");
  }

  if (Math.abs(quotation.ETH.variation - prevVariation.ETH) >= 1) {
    alert(Alert("ETHUSDT", quotation.ETH.variation.toFixed(2)));
  }

  console.log(quotation)
}

const Handler = {
  "BTCUSDT": BTCHandler,
  "ETHUSDT": ETHHandler,
}

const fetchAll = () => {
  fetchApi("BTCUSDT");
  fetchApi("ETHUSDT");
}

const fetchApi = (pair) => {
  chrome.browserAction.setBadgeText({ text: "..." });
  fetch(URL_TO_FETCH(pair))
    .then(function (response) {
      response.json().then(function (data) {
        Handler[pair](data);
      });
    })
    .catch(function (err) {
      console.error("Failed retrieving information", err);
    });
};


fetchAll();

const ONE_MINUTE_IN_MS = 60000;
const MINUTES = 15;

setInterval(fetchAll, ONE_MINUTE_IN_MS * MINUTES);

chrome.extension.onConnect.addListener(function (port) {
  port.postMessage(quotation);
  /* port.onMessage.addListener(function (msg) {
    // fetchApi();
  }); */
});

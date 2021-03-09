const URL_TO_FETCH = (pair) => `https://api1.binance.com/api/v3/ticker/24hr?symbol=${pair}`;

const RED = [220, 53, 69, 255];
const GREEN = [40, 167, 69, 255];

let quotation = null;
let prevVariation = 0;

const getCleanedData = (data) => {
  return {
    pair: data.symbol,
    base: "BTC",
    quote: "USDT",
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
const Alert = (variation) => `[BTCUSDT] Abnormal Volatility Alert  (15m) -> ${variation}%`;
const fetchApi = () => {
  chrome.browserAction.setBadgeText({ text: "loading.." });
  fetch(URL_TO_FETCH("BTCUSDT"))
    .then(function (response) {
      response.json().then(function (data) {
        if (!quotation) {
          quotation = getCleanedData(data);
          prevVariation = quotation.variation;
        } else {
          prevVariation = quotation.variation;
          quotation = getCleanedData(data);
        }
        chrome.browserAction.setBadgeText({ text: formatPrice(priceK(quotation.price)) });
        chrome.browserAction.setBadgeBackgroundColor({ color: quotation.variation > 0 ? GREEN : RED });
        if (Math.abs(quotation.variation - prevVariation) >= 1) {
          alert(Alert(quotation.variation.toFixed(2)));
        }
      });
    })
    .catch(function (err) {
      console.error("Failed retrieving information", err);
    });
};
fetchApi();

const ONE_MINUTE_IN_MS = 60000;
const MINUTES = 15;

setInterval(fetchApi, ONE_MINUTE_IN_MS * MINUTES);

chrome.extension.onConnect.addListener(function (port) {
  port.postMessage(quotation);
  /* port.onMessage.addListener(function (msg) {
    // fetchApi();
  }); */
});

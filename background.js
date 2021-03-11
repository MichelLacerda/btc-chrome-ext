const URL_TO_FETCH = (pair) => `https://api1.binance.com/api/v3/ticker/24hr?symbol=${pair}`;
const makeId = () => Math.random().toString(36).substring(7);

const RED = [220, 53, 69, 255];
const GREEN = [40, 167, 69, 255];

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

const getIcon = (base) => `icons/${base.toLowerCase()}.svg`;

const basicNotification = (title, message, icon, priority) => {
  var opt = {
    title: title,
    message: message,
    iconUrl: icon,
    priority: priority,
    type: "basic",
    requireInteraction: true,
  };
  chrome.notifications.create("basicnotification" + makeId(), opt, function (notificationId) {
    console.log(notificationId);
  });
};

const notificationVariation = (pair, variation) => {
  var icon = getIcon(pair.substr(0, 3));
  var message = () => `Abnormal Volatility Alert (15m) = ${variation}%`;
  basicNotification(pair, message(), icon, 2);
};

const removeNose = (id) => {
  chrome.storage.sync.get(["nose"], function (res) {
    var filtered = res.nose.length ? res.nose.filter((n) => n.id !== id) : [];
    chrome.storage.sync.set({ nose: filtered }, function () {
      console.log("saved...");
    });
  });
};

const gotNose = (price, nose) => {
  const message = () => `The price hit the target ${price} ${nose.operator} ${nose.target}`;
  switch (nose.operator) {
    case ">=":
      if (price >= nose.target) {
        basicNotification(nose.pair, message(), "icons/fire.svg", 2);
        removeNose(nose.id);
      }
      break;
    case "<=":
      if (price <= nose.target) {
        basicNotification(nose.pair, message(), "icons/fire.svg", 2);
        removeNose(nose.id);
      }
      break;
    default:
      console.log("nothing noses");
      break;
  }
};

const priceK = (price, fixed = 1) => {
  return (price / 1000).toFixed(fixed);
};

const formatPrice = (price) => `${price}K`;

const getQuotation = (callback) => {
  chrome.storage.sync.get(["quotation"], (res) => {
    callback(res.quotation);
  });
};

const setQuotation = (pair, quotation) => {
  getQuotation((value) => {
    var tmpQuotation = value;
    tmpQuotation[pair] = quotation;
    chrome.storage.sync.set({ quotation: tmpQuotation }, () => {
      console.log("saved..");
    });
  });
};

const BTCHandler = (data) => {
  getQuotation((res) => {
    let pair = "BTCUSDT";
    let prevPrice = typeof res[pair] === "number" ? res[pair] : res[pair].price;
    let currQuotation = getCleanedData(data, "BTC", "USDT");
    let currPrice = currQuotation.price;
    setQuotation(pair, currQuotation);

    let variation = 1 - prevPrice / currPrice;
    if (prevPrice !== 0 && Math.abs(variation) >= 0.025) {
      notificationVariation("BTCUSDT: $" + currPrice.toLocaleString(), prevPrice.toFixed(2).toString());
    }

    var formatedPrice = formatPrice(priceK(currPrice));
    chrome.browserAction.setBadgeText({ text: formatedPrice });
    chrome.browserAction.setBadgeBackgroundColor({ color: variation > 0 ? GREEN : RED });
  });
};

const ETHHandler = (data) => {
  getQuotation((res) => {
    let pair = "ETHUSDT";
    let prevPrice = typeof res[pair] === "number" ? res[pair] : res[pair].price;
    let currQuotation = getCleanedData(data, "ETH", "USDT");
    let currPrice = currQuotation.price;
    setQuotation(pair, currQuotation);

    let variation = 1 - prevPrice / currPrice;
    if (prevPrice !== 0 && Math.abs(variation) >= 0.025) {
      notificationVariation("ETHUSDT: $" + currPrice.toLocaleString(), prevPrice.toFixed(2).toString());
    }
  });
};

const Handler = {
  BTCUSDT: BTCHandler,
  ETHUSDT: ETHHandler,
};

const fetchAll = () => {
  fetchApi("BTCUSDT");
  fetchApi("ETHUSDT");
};

const fetchApi = (pair) => {
  chrome.browserAction.setBadgeText({ text: "..." });
  fetch(URL_TO_FETCH(pair))
    .then(function (response) {
      response.json().then(function (data) {
        Handler[pair](data);
        chrome.storage.sync.get(["nose"], (res) => {
          for (let nose of res.nose) {
            gotNose(parseFloat(data.lastPrice), nose);
          }
        });
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
  /* getQuotation((quotation) => {
    console.log(quotation);
  }); */
  port.postMessage(true);
  /* port.onMessage.addListener(function (msg) {
    // fetchApi();
  }); */
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ nose: [], quotation: { BTCUSDT: 0, ETHUSDT: 0 } });
});

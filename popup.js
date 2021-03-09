var port = chrome.extension.connect({
  name: "Sample Communication",
});

const PriceRow = (country, symbol, value, variation, variationClass) => `
<td width="16px">
  <img src="https://www.countryflags.io/${country}/flat/16.png">
</td>
<td><strong>${symbol}</strong></td>
<td>${value}</td>
<td class="${variationClass}">${variation.toFixed(2)}%</td>`;

const Row = (col1, col2, col3, col4) => `
<td>${col1}</td>
<td>${col2}</td>
<td>${col3}</td>
<td>${col4}</td>`;

const getCountry = (quote) => {
  return quote.substr(0, 2).toLowerCase();
};

const priceK = (price, fixex = 2) => {
  return price / 1000;
};

const addHeader = (target, data) => {
  var tr = document.createElement("tr");
  var country = getCountry(data.quote);
  var price = data.price.toLocaleString();
  var variation = data.variation;
  var status = variation > 0 ? "positive" : "negative";
  tr.innerHTML = PriceRow(country, data.quote, price, variation, status);
  target.append(tr);
};

const addRowOHLC = (target, label, value) => {
  var tr = document.createElement("tr");
  var labelFormat = (label) => `<strong style="color: #f0bb92;">${label}</strong>`;
  var valueFormat = (value) => `<span style="font-weight: 300;">${value}</span>`;
  tr.innerHTML = Row("", labelFormat(label), valueFormat(value), "");
  target.append(tr);
};

const addEmptyRow = (target) => {
  var tr = document.createElement("tr");
  tr.innerHTML = '<tr><td colspan="4" height="10px"></td></tr>';
  target.append(tr);
};

const priceLocale = (price) => {
  return price.toLocaleString();
};

const app = document.getElementById("app");
port.onMessage.addListener(function (data) {
  app.innerHTML = "";
  addHeader(app, data);
  addEmptyRow(app);
  addRowOHLC(app, "Open", priceLocale(data.ohlc.open));
  addRowOHLC(app, "High", priceLocale(data.ohlc.high));
  addRowOHLC(app, "Low", priceLocale(data.ohlc.low));
  addRowOHLC(app, "Close", priceLocale(data.ohlc.close));
});

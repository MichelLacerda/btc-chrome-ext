var port = chrome.extension.connect({
  name: "Sample Communication",
});

const Row = (col1, col2, col3, col4) => `
<td width="25%">${col1}</td>
<td width="25%">${col2}</td>
<td width="25%">${col3}</td>
<td width="25%">${col4}</td>
`;

const priceK = (price, fixex = 2) => {
  return price / 1000;
};

const priceLocale = (price) => {
  return price.toLocaleString();
};

const viewDetail = (base, quote, price, variation, ohlc, variationClass) => {
  var html = () => `
  <td colspan="4" style="padding: 20px 20px 20px 10px;">
    <div class="row">
      <div class="col-6">
        <div style="text-align: center; width: 100%">
          <img src="icons/${base.toLowerCase()}.svg" />
          <img src="icons/separator.svg" />
          <img src="icons/${quote.toLowerCase()}.svg" />
        </div>
        <div class="row">
          <div class="col-12">
            <h4 class="text-center" style="margin-top: 20px;">${price}</h4>
          </div>
          <div class="col-12">
            <h6 class="text-center ${variationClass}" style="font-weight: 300;">${variation.toFixed(2)}%</h6>
          </div>
        </div>
      </div>
      <div class="col-6">
        <table width="100%">
          <tr>
            <td width="50%" style="text-align: right"><strong style="margin-right: 4px;">Open</strong></td>
            <td width="50%" style="text-align: left; font-weight: 300;">${ohlc.open.toLocaleString()}</td>
          </tr>
          <tr>
            <td width="50%" style="text-align: right"><strong style="margin-right: 4px;">High</strong></td>
            <td width="50%" style="text-align: left; font-weight: 300;">${ohlc.high.toLocaleString()}</td>
          </tr>
          <tr>
            <td width="50%" style="text-align: right"><strong style="margin-right: 4px;">Low</strong></td>
            <td width="50%" style="text-align: left; font-weight: 300;">${ohlc.low.toLocaleString()}</td>
          </tr>
          <tr>
            <td width="50%" style="text-align: right"><strong style="margin-right: 4px;">Close</strong></td>
            <td width="50%" style="text-align: left; font-weight: 300;">${ohlc.close.toLocaleString()}</td>
          </tr>
        </table>
      </div>
    </div>
  </td>
  `;
  return html();
};

const addHeader = (target, data) => {
  var tr = document.createElement("tr");
  var price = data.price.toLocaleString();
  var variation = data.variation;
  var variationClass = variation > 0 ? "positive" : "negative";
  tr.innerHTML = viewDetail(data.base, data.quote, price, variation, data.ohlc, variationClass);
  target.append(tr);
};

const addRowOHLC = (target, ohlc) => {
  var tr = document.createElement("tr");
  var text = (label, value) => `<strong style="color: #f0bb92;">${label}</strong> ${value.toLocaleString()}`;
  tr.innerHTML = Row(text("O", ohlc.open), text("H", ohlc.high), text("L", ohlc.low), text("C", ohlc.close));
  target.append(tr);
};

const addSeparator = (target, colspan = 4, height = "10px") => {
  var tr = document.createElement("tr");
  var html = (_colspan, _height) => `<tr><td colspan="${_colspan}" height="${_height}"><hr /></td></tr>`;
  tr.innerHTML = html(colspan, height);
  target.append(tr);
};


const app = document.getElementById("app");

port.onMessage.addListener(function (data) {
  var BTC = data.BTC;
  var ETH = data.ETH;
  app.innerHTML = "";
  addHeader(app, BTC);
  addSeparator(app, 4, "20px");
  addHeader(app, ETH);
});

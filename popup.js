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

/* Form */
const noseObjectToText = (nose) => `${nose.id} ${nose.pair} ${nose.operator} ${nose.target}`;

const addNose = (newNose) => {
  chrome.storage.sync.get(["nose"], function (result) {
    if (!result.nose) {
      chrome.storage.sync.set({ nose: [newNose] }, function () {
        console.log("Value is set to " + newNose);
      });
      viewNose();
    } else {
      var values = Array.prototype.concat(result.nose, newNose);
      chrome.storage.sync.set({ nose: values }, function () {
        for (nose of result.nose) {
          console.log("Value is set to " + noseObjectToText(nose));
        }
      });
      viewNose();
    }
  });
};

const clearNose = () => {
  chrome.storage.sync.set({ nose: [] }, function () {
    console.log("nose cleaned");
  });
};

const addNoseFormEl = document.getElementById("addNoseForm");

const makeId = () => Math.random().toString(36).substring(7);

const getNoses = () => {};

addNoseFormEl.addEventListener("submit", function (ev) {
  ev.preventDefault();
  var pair = document.getElementById("pair").value;
  var target = document.getElementById("target").value;
  var op = document.getElementById("operator").value;

  addNose({ id: makeId(), pair: pair, target: parseFloat(target), operator: op });
});

const removeNose = (id, callback) => {
  chrome.storage.sync.get(["nose"], function (res) {
    var filtered = res.nose.length ? res.nose.filter((n) => n.id !== id) : [];
    chrome.storage.sync.set({ nose: filtered }, function () {
      console.log("saved...");
      callback();
    });
  });
};

const bindNosesRemove = () => {
  for (el of document.querySelectorAll("#deleteNose")) {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      removeNose(el.dataset.id, viewNose);
    });
  }
};

const viewNose = () => {
  var html = (nose) => `
    <div class="col-10">
        <div class="row">
            <div class="col-5"><h6 style="margin-top: 8px; text-align: right;" >${nose.pair}</h6></div>
            <div class="col-2"><h5 style="margin-top: 4px; text-align: center;" class="text-warning">${nose.operator}</h5></div>
            <div class="col-5"><h6 style="margin-top: 8px; text-align: left;">${nose.target}</h6></div>
        </div>
    </div>
    <div class="col-2">
      <div class="btn btn-danger" id="deleteNose" data-id="${nose.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
          <path
            d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"
          />
        </svg>
      </div>
    </div>
  `;
  const nosesEl = document.getElementById("noses");
  nosesEl.innerHTML = "";
  chrome.storage.sync.get(["nose"], function (result) {
    for (let nose of result.nose) {
      var div = document.createElement("div");
      div.classList.add("row");
      div.classList.add("g-2");
      div.style.padding = "10px";
      div.innerHTML = html(nose);
      nosesEl.append(div);
    }
    bindNosesRemove();
  });
};

const app = document.getElementById("app");

const getQuotation = (callback) => {
  chrome.storage.sync.get(["quotation"], (res) => {
    callback(res.quotation);
  });
};


port.onMessage.addListener(function (msg) {
  getQuotation((quotation) => {
    app.innerHTML = "";
    addHeader(app, quotation.BTCUSDT);
    addSeparator(app, 4, "20px");
    addHeader(app, quotation.ETHUSDT);
    viewNose();
  })
});

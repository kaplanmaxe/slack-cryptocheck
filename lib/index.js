'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _child_process = require('child_process');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _nodeMarkdown = require('node-markdown');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('dotenv').config();

var app = (0, _express2.default)();
_http2.default.createServer(app).listen(process.env.PORT);
app.use(_bodyParser2.default.urlencoded({ extended: false }));

/**
 * Kraken endpoint
 */
app.post('/api/v1/kraken', function (req, res) {
  (0, _child_process.exec)('cryptocheck kraken ' + parseCurrency(req.body.text), function (err, stdout) {
    // Currently a work around due to a bug in cryptocheck.
    if (err) res.json({ text: 'Asset not found.' });
    res.json({ text: stdout });
  });
});

/**
 * GDAX endpoint
 */
app.post('/api/v1/gdax', function (req, res) {
  (0, _child_process.exec)('cryptocheck gdax ' + parseCurrency(req.body.text), function (err, stdout) {
    res.json({ text: stdout });
  });
});

/**
 * Coinmarketcap endpoint
 */
app.post('/api/v1/cmc', function (req, res) {
  (0, _child_process.exec)('cryptocheck cmc ' + parseCurrency(req.body.text), function (err, stdout) {
    res.json({ text: stdout });
  });
});

app.get('/api/v1/auth', function (req, res) {
  var options = {
    uri: 'https://slack.com/api/oauth.access?code=' + req.query.code + '&client_id=' + process.env.CLIENT_ID + '&client_secret=' + process.env.CLIENT_SECRET + '&redirect_uri=' + process.env.REDIRECT_URI,
    method: 'GET'
  };
  (0, _request2.default)(options, function (error, response, body) {
    var success = JSON.parse(body).ok;
    // I don't want any of your data.
    body = {};
    if (success) {
      res.send('Cryptocheck has successfully been added to your slack team! Click <a href="hhttps://github.com/kaplanmaxe/slack-cryptocheck">here</a> to see the docs.');
    } else {
      res.send('An error occurred. Please email info@kaplankomputing.com');
    }
  });
});

app.get('/', function (req, res) {
  res.send((0, _nodeMarkdown.Markdown)(_fs2.default.readFileSync(_path2.default.join(__dirname, '../README.md'), 'utf8')));
});

/**
 * Gets currency from command
 * @param {string} msg Message coming from slack
 * @return {string}
 */
function parseCurrency(msg) {
  return msg.split(' ')[0].toUpperCase().trim();
}
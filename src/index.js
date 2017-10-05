import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import request from 'request';
import { Markdown } from 'node-markdown';

require('dotenv').config();

const app = express();
http.createServer(app).listen(process.env.PORT);
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * Kraken endpoint
 */
app.post('/api/v1/kraken', (req, res) => {
  exec(`cryptocheck kraken ${parseCurrency(req.body.text)}`, (err, stdout) => {
    // Currently a work around due to a bug in cryptocheck.
    if (err) res.json({ text: 'Asset not found.' });
    res.json({ text: stdout });
  });
});

/**
 * GDAX endpoint
 */
app.post('/api/v1/gdax', (req, res) => {
  exec(`cryptocheck gdax ${parseCurrency(req.body.text)}`, (err, stdout) => {
    res.json({ text: stdout });
  });
});

/**
 * Coinmarketcap endpoint
 */
app.post('/api/v1/cmc', (req, res) => {
  exec(`cryptocheck cmc ${parseCurrency(req.body.text)}`, (err, stdout) => {
    res.json({ text: stdout });
  });
});

app.get('/api/v1/auth', (req, res) => {
  const options = {
    uri: `https://slack.com/api/oauth.access?code=${req.query.code}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=${process.env.REDIRECT_URI}`,
    method: 'GET',
  };
  request(options, (error, response, body) => {
      const success = JSON.parse(body).ok;
      // I don't want any of your data.
      body = {};
      if (success) {
        res.send('Cryptocheck has successfully been added to your slack team! Click <a href="https://github.com/kaplanmaxe/slack-cryptocheck">here</a> to go home.');
      } else {
        res.send('An error occurred. Please email info@kaplankomputing.com');
      }
  });
});

app.get('/', (req, res) => {
  res.send(Markdown(fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8')));
});

/**
 * Gets currency from command
 * @param {string} msg Message coming from slack
 * @return {string}
 */
function parseCurrency(msg) {
  return msg.split(' ')[0].toUpperCase().trim();
}

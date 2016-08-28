#!/usr/bin/env node
var urlJoin = require('url-join');
var client = require('../')(require('../lib/auth'));

var args = process.argv.slice(2);
var ep = client.endpoints.BASE;
ep = urlJoin(ep, ...args);
console.log(ep);

client.request(ep)
  .then(resp => console.log(JSON.stringify(resp, null, 2)))
  .catch(err => console.log(err, err.response.body));
;

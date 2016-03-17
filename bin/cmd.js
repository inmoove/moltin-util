var urlJoin = require('url-join');
var client = require('../')(require('../lib/auth'));

var args = process.argv.slice(2);
var ep = client.endpoints[args[0].toUpperCase()];
ep = urlJoin(ep, ...args.slice(1));
console.log(ep);

client.request(ep)
  .then(resp => console.log(resp))
  .catch(err => console.log(err, err.response.body));
;

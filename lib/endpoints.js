var joinUrl = require('url-join');
var base = 'https://api.molt.in/v1/';

var endpoints = {
  'PRODUCTS': 'products',
  'IMAGES': 'files'
};

module.exports = Object.keys(endpoints).reduce( (acc, k) => {
  acc[k] = joinUrl(base, endpoints[k]);
  return acc;
}, {});

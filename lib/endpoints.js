var joinUrl = require('url-join');
var base = 'https://api.molt.in/v1/';

var endpoints = {
  'BASE': base,
  'PRODUCTS': 'products',
  'IMAGES': 'files',
  'CATEGORIES': 'categories',
  'TAXES': 'taxes',
  'FLOWS': 'flows',
  'ORDERS': 'orders',
  'CARTS': 'carts',
  'GATEWAYS': 'gateways',
  'CUSTOMERS': 'customers',
  'ADDRESSES': 'addresses',
};

module.exports = Object.keys(endpoints).reduce( (acc, k) => {
  acc[k] = k === 'BASE' ? base : joinUrl(base, endpoints[k]);
  return acc;
}, {});

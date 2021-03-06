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
  'ADDRESSES': 'customers/{customer_id}/addresses',
  'CURRENCIES': 'currencies',
  'MODIFIERS': 'products/{product_id}/modifiers',
  'VARIATIONS': 'products/{product_id}/modifiers/{modifier_id}/variations',
};

module.exports = Object.keys(endpoints).reduce( (acc, k) => {
  acc[k] = k === 'BASE' ? base : joinUrl(base, endpoints[k]);
  return acc;
}, {});

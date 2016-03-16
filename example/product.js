require('dotenv').config();
var util = require('../')({
  publicId: process.env.PUBLIC_ID,
  secretKey: process.env.SECRET_KEY
});

util.request(util.endpoints.PRODUCTS, {
  method: 'POST',
  body: {
    title: 'Bulk Glass Eye Charms',
    price: 30,
    description: 'Eye charms',
    slug: 'bulk-glass-eye-charms',
    sku: 'bulk-glass-eye-charms',
    status: 1,
    category: '1202285736791900705',
    stock_level: '1',
    stock_status: 1,
    requires_shipping: 1,
    catalog_only: 0,
    tax_band: '1202285736968061337'
  }
})
  .then(resp => console.log(resp))
  .catch(err => console.log('err', err, err.response.body))
;

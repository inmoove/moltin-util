require('dotenv').config();
var util = require('../')({
  publicId: process.env.PUBLIC_ID,
  secretKey: process.env.SECRET_KEY
});

// get all products
util.request(util.endpoints.PRODUCTS)
  .then(resp => console.log(resp))
  .catch(err => console.log('err', err))
;

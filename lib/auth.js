var conf = require('rc')('moltin-util');

module.exports = {
  publicId: conf.PUBLIC_ID,
  secretKey: conf.SECRET_KEY
};

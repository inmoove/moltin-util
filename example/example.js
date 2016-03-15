require('dotenv').config();
var MoltinUtil = require('../index');

var util = MoltinUtil({
  publicId: process.env.PUBLIC_ID,
  secretKey: process.env.SECRET_KEY
});

util.fetchImage('https://img1.etsystatic.com/128/0/6265082/il_fullxfull.867656535_tcx5.jpg')
  .then(util.resize.bind(util, 600))
  .then(util.createImage.bind(util, {
    name: 'example.jpg'
  }))
  .then(resp => console.log(resp.body))
  .catch(err => console.log('error', err))
;

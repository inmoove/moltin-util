# moltin util

Tool for working with the Moltin API. Plus &mdash; promises.


## install

    $ npm install moltin-util


## example

Upload an image:

```js
var MoltinUtil = require('moltin-util');

var util = MoltinUtil({
  publicId: process.env.PUBLIC_ID,
  secretKey: process.env.SECRET_KEY
});

util.fetchImage('http://example.com/image.jpg')
  .then(util.resize.bind(util, 600))
  // opts for api: https://docs.moltin.com/images/
  .then(util.createImage.bind(util, {
    name: 'example.jpg'
  }))
  .then(resp => console.log(resp.body))
  .catch(err => console.log('error', err))
;
```

Get a list of products:

```js
  require('dotenv').config();
  var util = require('moltin-util')({
    publicId: process.env.PUBLIC_ID,
    secretKey: process.env.SECRET_KEY
  });

  // proxy `got` with some defaults
  util.request(util.endpoints.PRODUCTS)
    .then(resp => console.log(resp))
    .catch(err => console.log('err', err))
  ;
```

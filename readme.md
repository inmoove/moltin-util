# moltin util

Upload images to moltin. Plus, promises.


## install

    $ npm install moltin-util


## example

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

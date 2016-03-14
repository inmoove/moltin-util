# moltin util

Functions for things missing from the `moltin` library. Right now it can authorize and create images. All functions return promises.


## install

    $ npm install moltin-util


## example

```js
var util = require('moltin-util');

// wrapper around `got`
util.fetchImage('http://example.com/picture.jpg')
  .then(resp => resp.body)
  .then(util.resize.bind(null, 500))
  // API requires filename and contentType
  .then(image => {
    return {
      image: {
        file: image, filename: 'test.jpg', contentType: 'image/jpeg'
      },
      // add other moltin fields here
      // ex: 'assign_to': 1
    };
  })
  .then(upload)
  .then(resp => console.log(resp.body))
;

function upload(imageObj) {
  return util.auth({
      publicId: process.env.PUBLIC_ID,
      secretKey: process.env.SECRET_KEY
    })
    .then(auth => util.createImage(auth, imageObj))
  ;
}
```


## API

```js
module.exports = {
  jimp: jimp,  // expose `jimp` module
  resize: resize, // jimp.image.resize
  // return promise
  auth: auth,
  fetchImage: fetchImage,
  createImage: createImage
};
```

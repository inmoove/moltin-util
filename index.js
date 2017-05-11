var xtend = require('xtend');
var Q = require('q');
var jimp = require('jimp');
var Form = require('form-data');
var got = require('got');


function MoltinUtil(creds) {
  if ( !(this instanceof MoltinUtil) ) return new MoltinUtil(creds);

  this.creds = {
    'client_id': creds.publicId,
    'client_secret': creds.secretKey,
    'grant_type': creds.grantType || 'client_credentials'
  };

  this.AUTH_URL = 'https://api.molt.in/oauth/access_token';
  this.authData = false;  // tokens from server
}

MoltinUtil.prototype.endpoints = require('./lib/endpoints');

// => promise for auth object
MoltinUtil.prototype.auth = function auth() {
  var self = this;
  if ( self.authData ) {
    return Promise.resolve(self.authData);
  }
  return got(this.AUTH_URL, {
    method: 'POST',
    body: this.creds,
    json: true
  })
    .then(resp => {
      self.authData = resp.body;
      return resp.body;
    })
  ;
};

MoltinUtil.prototype.createImage = function(data, buffer) {
  var FILE_URL = this.endpoints.IMAGES;
  var self = this;

  // => promise
  function createImage() {
    // fetch image if we are passed a url
    if (typeof buffer === 'string') {
      return self.fetchImage(buffer)
        .then(img => self.createImage(data, img))
      ;
    }

    var form = new Form();
    form.append('file', buffer, {
      filename: data.name || 'image.jpg',
      contentType: data.mime || 'image/jpeg'
    });

    var props = xtend({}, data);
    delete props.file;  // buffer is passed in separately
    Object.keys(props).forEach(k => {
      form.append(k, props[k]);
    });

    var headers = xtend(form.getHeaders(), self.authHeader());

    return got.post(FILE_URL, {
      headers: headers,
      body: form,
      json: true
    });
  }

  return self.auth().then(createImage);
};

// => {} (header object)
MoltinUtil.prototype.authHeader = function() {
  return {
    Authorization: 'Bearer ' + this.authData.access_token
  };
};

// => promise for buffer
MoltinUtil.prototype.fetchImage = function(url) {
  return got(url, { encoding: null })
    .then(resp => resp.body)
  ;
};

// => promise for buffer
MoltinUtil.prototype.resize = function(width, image) {
  return jimp.read(image)
    .then(i => {
      i.resize(width, jimp.AUTO);
      return Q.nfcall(i.getBuffer.bind(i), jimp.MIME_JPEG);
    })
  ;
};

// make a request with auth headers
// => promise
MoltinUtil.prototype.request = function(url, opts) {
  var self = this;
  return this.auth()
    .then(auth => {
      var headers = self.authHeader();
      return got(url, xtend(opts, {
        headers: headers,
        json: true
      }))
        .then(resp => resp.body)
      ;
    })
  ;
};

// create a product (and images if you pass them in)
// images = array of buffers or urls
// => promise for { product: {}, images: [] }
MoltinUtil.prototype.createProduct = function(product, images) {
  var self = this;
  images = images || [];
  return this.auth()
    .then(self.request.bind(self, self.endpoints.PRODUCTS, {
      method: 'POST',
      body: product
    }))
    .then(prod => prod.result)
    .then(prod => {
      return Promise.all(images.map( (img, i) => {
        return self.createImage({
          name: prod.slug+'-'+i,
          assign_to: prod.id
        }, img)})
      )
        .then(imgs => { return { product: prod, images: imgs }; })
      ;
    })
  ;
};

// create a currency
// => promise for { currency: {} }
MoltinUtil.prototype.createCurrency = function(currency) {
  var self = this;
  return this.auth()
    .then(self.request.bind(self, self.endpoints.CURRENCIES, {
      method: 'POST',
      body: currency
    }))
    .then(curr => curr.result)
  ;
};

// create a modifier
// => promise for { modifier: {} }
MoltinUtil.prototype.createModifier = function(modifier, product_id) {
  var self = this;
  var url = self.endpoints.MODIFIER.replace('{product_id}', product_id);
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'POST',
      body: modifier
    }))
    .then(curr => curr.result)
  ;
};

// create a variation
// => promise for { variation: {} }
MoltinUtil.prototype.createVariation = function(variation, product_id, modifier_id) {
  var self = this;
  var url = self.endpoints.VARIATIONS.replace('{product_id}', product_id).replace('{modifier_id}', modifier_id);
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'POST',
      body: variation
    }))
    .then(curr => curr.result)
  ;
};

// remove a modifier
// => promise for { modifier: {} }
MoltinUtil.prototype.removeModifier = function(modifier_id, product_id) {
  var self = this;
  var url = self.endpoints.MODIFIER.replace('{product_id}', product_id) + '/' + modifier_id;
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'DELETE',
      body: {}
    }))
    .then(curr => curr.result)
  ;
};

// remove a variation
// => promise for { variation: {} }
MoltinUtil.prototype.removeVariation = function(variation_id, product_id, modifier_id) {
  var self = this;
  var url = self.endpoints.VARIATIONS.replace('{product_id}', product_id).replace('{modifier_id}', modifier_id) + '/' + variation_id;
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'DELETE',
      body: {}
    }))
    .then(curr => curr.result)
  ;
};

MoltinUtil.prototype.delProducts = function() {
};

MoltinUtil.prototype.jimp = jimp;

module.exports = MoltinUtil;

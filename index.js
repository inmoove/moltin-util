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

  var now = Date.now();

  if (self.authData && self.authData.expires * 1000 > now) {
    return Promise.resolve(self.authData);
  } else {
    return got(this.AUTH_URL, {
      method: 'POST',
      body: this.creds,
      json: true
    })
      .then(resp => {
        self.authData = resp.body;
        console.log("Moltin renew token: ", JSON.stringify(self.authData));
        return resp.body;
      })
  };
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
      .then(resp => {
        return resp.body;
      });
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

// edit a product
// => promise for { product: {} }
MoltinUtil.prototype.editProduct = function(product_id, data) {
  var self = this;
  var url = self.endpoints.PRODUCTS + '/' + product_id;
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'PUT',
      body: data
    }))
    .then(product => { return { product: product.result };})
  ;
};

// remove a product
// => promise for { status: {} }
MoltinUtil.prototype.removeProduct = function(product_id) {
  var self = this;
  var url = self.endpoints.PRODUCTS + '/' + product_id;
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'DELETE',
      body: {}
    }))
    .then(status => { return status; })
  ;
};

// create a customer
// => promise for { customer: {} }
MoltinUtil.prototype.createCustomer = function(customer) {
  var self = this;
  return this.auth()
    .then(self.request.bind(self, self.endpoints.CUSTOMERS, {
      method: 'POST',
      body: customer
    }))
    .then(customer => { return { customer: customer.result };})
  ;
};

// create a address
// => promise for { address: {} }
MoltinUtil.prototype.createAddress = function(customer_id, address) {
  var self = this;
  var url = self.endpoints.ADDRESSES.replace('{customer_id}', customer_id);
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'POST',
      body: address
    }))
    .then(address => { return { address: address.result };})
  ;
};

// edit a address
// => promise for { address: {} }
MoltinUtil.prototype.editAddress = function(customer_id, address_id, address) {
  var self = this;
  var url = self.endpoints.ADDRESSES.replace('{customer_id}', customer_id) + '/' + address_id;
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'PUT',
      body: address
    }))
    .then(address => { return { address: address.result };})
  ;
};

// remove a address
// => promise for { status: {} }
MoltinUtil.prototype.removeAddress = function(customer_id, address_id) {
  var self = this;
  var url = self.endpoints.ADDRESSES.replace('{customer_id}', customer_id) + '/' + address_id;
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'DELETE',
      body: {}
    }))
    .then(status => { return status; })
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
    .then(currency => { return { currency: currency.result };})
  ;
};

// create a modifier
// => promise for { modifier: {} }
MoltinUtil.prototype.createModifier = function(modifier, product_id) {
  var self = this;
  var url = self.endpoints.MODIFIERS.replace('{product_id}', product_id);
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'POST',
      body: modifier
    }))
    .then(modifier => { return { modifier: modifier.result };})
  ;
};

// create a variant
// => promise for { variant: {} }
MoltinUtil.prototype.createVariant = function(variant, modifier_id, product_id) {
  var self = this;
  var url = self.endpoints.VARIATIONS.replace('{product_id}', product_id).replace('{modifier_id}', modifier_id);
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'POST',
      body: variant
    }))
    .then(variant => { return { variant: variant.result };})
  ;
};

// create a single
// => promise for { single: {} }
MoltinUtil.prototype.createSingle = function(single, modifier_id, product_id) {
  var self = this;
  var url = self.endpoints.VARIATIONS.replace('{product_id}', product_id).replace('{modifier_id}', modifier_id);
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'POST',
      body: single
    }))
    .then(single => { return { single: single.result };})
  ;
};

// remove a modifier
// => promise for { status: {} }
MoltinUtil.prototype.removeModifier = function(modifier_id, product_id) {
  var self = this;
  var url = self.endpoints.MODIFIERS.replace('{product_id}', product_id) + '/' + modifier_id;
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'DELETE',
      body: {}
    }))
    .then(status => { return status; })
  ;
};

// remove a variant
// => promise for { status: {} }
MoltinUtil.prototype.removeVariant = function(variant_id, product_id, modifier_id) {
  var self = this;
  var url = self.endpoints.VARIATIONS.replace('{product_id}', product_id).replace('{modifier_id}', modifier_id) + '/' + variant_id;
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'DELETE',
      body: {}
    }))
    .then(status => { return status; })
  ;
};

// remove a single
// => promise for { status: {} }
MoltinUtil.prototype.removeSingle = function(single_id, product_id, modifier_id) {
  var self = this;
  var url = self.endpoints.VARIATIONS.replace('{product_id}', product_id).replace('{modifier_id}', modifier_id) + '/' + single_id;
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'DELETE',
      body: {}
    }))
    .then(status => { return status; })
  ;
};

// ALL ITEMS

// get all item
// => promise for { data: {} }
MoltinUtil.prototype.get = function(url) {
  var self = this;
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'GET'
    }))
    .then(data => { return { data: data.result };})
  ;
};

// create a item
// => promise for { data: {} }
MoltinUtil.prototype.post = function(url, data) {
  var self = this;
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'POST',
      body: data
    }))
    .then(data => { return { data: data.result };})
  ;
};

// edit a item
// => promise for { data: {} }
MoltinUtil.prototype.put = function(url, data) {
  var self = this;
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'PUT',
      body: data
    }))
    .then(data => { return { data: data.result };})
  ;
};

// remove a item
// => promise for { status: {} }
MoltinUtil.prototype.remove = function(url) {
  var self = this;
  return this.auth()
    .then(self.request.bind(self, url, {
      method: 'DELETE',
      body: {}
    }))
    .then(status => { return status; })
  ;
};

MoltinUtil.prototype.jimp = jimp;

module.exports = MoltinUtil;

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
}

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

MoltinUtil.prototype.delProducts = function() {
};

MoltinUtil.prototype.jimp = jimp;

module.exports = MoltinUtil;

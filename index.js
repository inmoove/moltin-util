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
  this.authData = '';  // tokens from server
}

// => promise for auth object
MoltinUtil.prototype.auth = function auth() {
  var self = this;
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
  var FILE_URL = 'https://api.molt.in/v1/files';
  var self = this;

  function doAuth() {
    if ( !this.authData ) return self.auth();
    return Promise.resolve(self.authData);
  }

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

  return doAuth().then(createImage);
};

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
}

// => promise for buffer
MoltinUtil.prototype.resize = function(width, image) {
  return jimp.read(image)
    .then(i => {
      i.resize(width, jimp.AUTO);
      return Q.nfcall(i.getBuffer.bind(i), jimp.MIME_JPEG);
    })
  ;
}

MoltinUtil.prototype.jimp = jimp;

module.exports = MoltinUtil;

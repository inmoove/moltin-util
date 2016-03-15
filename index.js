require('dotenv').config();
var xtend = require('xtend');
var Q = require('q');
var jimp = require('jimp');
var Form = require('form-data');
var got = require('got');

function auth(keys) {
  return got('https://api.molt.in/oauth/access_token', {
    method: 'POST',
    body: {
      'client_id': keys.publicId,
      'client_secret': keys.secretKey,
      'grant_type': keys.grantType || 'client_credentials'
    },
    json: true
  })
    .then(resp => {
      return resp.body;
    })
    .catch(err => {
      console.log('err', err);
    })
  ;
}


function resize(width, image) {
  return jimp.read(image)
    .then(i => {
      i.resize(width, jimp.AUTO);
      return Q.nfcall(i.getBuffer.bind(i), jimp.MIME_JPEG);
    })
  ;
}


// imgs = [];
// opts = {
//   auth: { publicId: '', secretKey: '' },
//   size: 500,
//
//   any fields for image api
//   image: {
//     filename: '',
//     contentType: 'image/jpeg'
//   }
// }
function uploadImages(imgs, opts) {
  var imgBuffers;
  return Promise.all(imgs.map(i => fetchImage(i)))
    .then(is => {
      if (opts.size) return Promise.all(is.map(i => resize(opts.size, i)));
      return is;
    }
    .then(is => {
      imgBuffers = is;
      return auth(opts.auth);
    })
    .then(auth => {
      return Promise.all(imgBuffers.map(img, index => {
        return createImage(auth, xtend(opts.image, {
          image: {
            file: img,
            filename: (opts.image.filename || 'img')+index,
            contentType: opts.image.contentType || 'image/jpeg'
          }
        }));
      }));
    })
  ;
}


function fetchImage(url) {
  return got(url, { encoding: null });
}

function createImage(auth, opts) {
  opts = normalizeImage(opts);
  var form = new Form();
  form.append('file', opts.image.file, {
    filename: opts.image.filename || 'image.jpg',
    contentType: opts.image.contentType || 'image/jpeg'
  });
  Object.keys(opts).forEach(k => {
    if (k === 'image') return;
    form.append(k, opts[k]);
  });
  var h = form.getHeaders();
  h.Authorization = 'Bearer ' + auth.access_token;

  return got.post('https://api.molt.in/v1/files', {
    headers: h,
    body: form
  });
}


function normalizeImage(body) {
  if (!body.image || body.image.file === undefined) {
    return xtend(body, {
      image: {
        file: body, filename: 'test.jpg', contentType: 'image/jpeg'
      }
    });
  }
  return body;
}

module.exports = {
  jimp: jimp,
  resize: resize,
  auth: auth,
  fetchImage: fetchImage,
  createImage: createImage,
  uploadImages: uploadImages
};

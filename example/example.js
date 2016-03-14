var util = require('../index');

util.fetchImage('https://img1.etsystatic.com/128/0/6265082/il_fullxfull.867656535_tcx5.jpg')
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


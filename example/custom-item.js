var MoltinUtil = require('../index');

var util = MoltinUtil({
    publicId: '',
    secretKey: ''
});

var url = util.endpoints.ORDERS + '/1528535744853836294';
console.log(url);
// util.post(url, {sku:'country-difference', title:'country-difference', quantity:1, price:10.00, tax_band:'1465301310000595443', tax_rate:0})
    // .then(result => console.log(JSON.stringify(result, null, 2)))
    // .catch(err => console.log(JSON.stringify(err, null, 2)));

util.get(url)
    .then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(err => console.log('err', err));

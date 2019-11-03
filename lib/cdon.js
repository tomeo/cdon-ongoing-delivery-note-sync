const axios = require('axios');
const { CDON_APIURL, CDON_APIKEY } = require('../config');

const auth = { headers: { Authorization: `api ${CDON_APIKEY}` } };
const get = path => axios.get(`${CDON_APIURL}${path}`, auth);
const post = (path, data, options = {}) =>
  axios.post(
    `${CDON_APIURL}${path}`,
    data,
    Object.assign(auth, options),
  );

const pendingOrders = () => get('/api/order');
const deliveryNote = order =>
  post('/api/deliverynote', [order], { responseType: 'arraybuffer' });

module.exports = {
  pendingOrders,
  deliveryNote,
};

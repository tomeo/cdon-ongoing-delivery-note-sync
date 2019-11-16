const axios = require('axios');

module.exports = class CDONClient {
  constructor(url, apikey) {
    this.url = url;
    this.auth = { headers: { Authorization: `api ${apikey}` } };
  }

  get(path) {
    return axios.get(`${this.url}${path}`, this.auth);
  }

  post(path, data, options = {}) {
    return axios.post(
      `${this.url}${path}`,
      data,
      Object.assign(this.auth, options),
    );
  }

  pendingOrders() {
    return this.get('/api/order').catch(error =>
      error.response.status === 404
        ? Promise.resolve({ data: [] })
        : Promise.reject(error),
    );
  }

  deliveryNote(order) {
    return this.post('/api/deliverynote', [order], {
      responseType: 'arraybuffer',
    });
  }
};

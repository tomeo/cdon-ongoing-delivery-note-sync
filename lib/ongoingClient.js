const axios = require('axios');

module.exports = class OngoingClient {
  constructor(url, goodsOwnerId, username, password) {
    this.url = url;
    this.goodsOwnerId = goodsOwnerId;
    this.auth = { auth: { username, password } };
  }

  get(path) {
    return axios.get(`${this.url}${path}`, this.auth);
  }

  post(path, data) {
    return axios.post(`${this.url}${path}`, data, this.auth);
  }

  pendingOrders() {
    return this.get(
      `/api/v1/orders?goodsOwnerId=${this.goodsOwnerId}&orderStatusTo=499`,
    );
  }

  orderFiles(orderId) {
    return this.get(`/api/v1/orders/${orderId}/files`);
  }

  uploadOrderFile(orderId, fileName, mimeType, fileDataBase64) {
    let data = {
      fileName: fileName,
      mimeType: mimeType,
      fileDataBase64: fileDataBase64,
    };
    return this.post(`/api/v1/orders/${orderId}/files`, data);
  }
};

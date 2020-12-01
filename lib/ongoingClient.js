const axios = require('axios');

const base64 = binary =>
  Buffer.from(binary, 'binary').toString('base64');

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

  put(path, data) {
    return axios.put(`${this.url}${path}`, data, this.auth);
  }

  async pendingOrders() {
    return this.get(
      `/api/v1/orders?goodsOwnerId=${this.goodsOwnerId}&orderStatusTo=499`,
    ).then(response =>
      response.data.map(order => ({
        orderId: order.orderInfo.orderId,
        orderNumber: order.orderInfo.orderNumber,
      })),
    );
  }

  async orderFiles(orderId) {
    return this.get(`/api/v1/orders/${orderId}/files`).then(
      response => response.data,
    )
    .catch(e => {
      console.log(`Error fetching order files for order ${orderId}. ${e}`);
      return [];
    });
  }

  async uploadDeliveryNote(orderId, fileName, fileData) {
    let data = {
      mimeType: 'application/pdf',
      fileDataBase64: base64(fileData),
    };
    return this.put(`/api/v1/orders/${orderId}/files/?fileName=${fileName}`, data);
  }
};

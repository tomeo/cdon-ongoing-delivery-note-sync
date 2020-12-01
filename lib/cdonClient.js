const axios = require('axios');

const cdonOrderToDeliveryNote = (order, addressId) => ({
  OrderId: order.OrderId,
  AddressId: addressId,
  DeliveryNoteRows: order.OrderRows.map(row => ({
    ProductId: row.ProductId,
    ProductName: row.ProductName,
    Quantity: row.Quantity,
  })),
});

module.exports = class CDONClient {
  constructor(url, apikey, addressId) {
    this.url = url;
    this.auth = { headers: { Authorization: `api ${apikey}` } };
    this.addressId = addressId;
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

  async pendingOrders(skip = 0, take = 200, items = []) {
    return this.get(`/api/order?skip=${skip}&take=${take}`)
      .then(response => {
        var newItems = response.data.map(order => order.OrderDetails);
        items = items.concat(newItems);
        return (newItems.length === take)
          ? this.pendingOrders(skip+=take, take, items)
          : items;
      })
      .catch(error =>
        error.response.status === 404
          ? Promise.resolve(items)
          : Promise.reject(error),
      );
  }

  async deliveryNote(order) {
    return this.post(
      '/api/deliverynote',
      [cdonOrderToDeliveryNote(order, this.addressId)],
      {
        responseType: 'arraybuffer',
      },
    )
      .then(response => {
        return response.data;
      })
      .catch(error => console.log(error));
  }
};

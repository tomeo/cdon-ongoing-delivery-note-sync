const axios = require('axios');
const {
  ONGOING_APIURL,
  ONGOING_GOODSOWNERID,
  ONGOING_USERNAME,
  ONGOING_PASSWORD,
} = require('../config');

const auth = {
  auth: { username: ONGOING_USERNAME, password: ONGOING_PASSWORD },
};
const get = path => axios.get(`${ONGOING_APIURL}${path}`, auth);
const post = (path, data) =>
  axios.post(`${ONGOING_APIURL}${path}`, data, auth);

const pendingOrders = () =>
  get(
    `/api/v1/orders?goodsOwnerId=${ONGOING_GOODSOWNERID}&orderStatusTo=499`,
  );
const orderFiles = orderId => get(`/api/v1/orders/${orderId}/files`);
const uploadOrderFile = (
  orderId,
  fileName,
  mimeType,
  fileDataBase64,
) =>
  post(`/api/v1/orders/${orderId}/files`, {
    fileName: fileName,
    mimeType: mimeType,
    fileDataBase64: fileDataBase64,
  });

module.exports = {
  pendingOrders,
  orderFiles,
  uploadOrderFile,
};

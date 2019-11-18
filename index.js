const sync = require('./sync');

const {
  CDON_ADDRESSID,
  CDON_APIURL,
  CDON_APIKEY,
  ONGOING_APIURL,
  ONGOING_GOODSOWNERID,
  ONGOING_USERNAME,
  ONGOING_PASSWORD,
} = require('./config');

const cdonSettings = {
  addressId: CDON_ADDRESSID,
  apiUrl: CDON_APIURL,
  apiKey: CDON_APIKEY,
};
const ongoingSettings = {
  apiUrl: ONGOING_APIURL,
  goodsOwnerId: ONGOING_GOODSOWNERID,
  username: ONGOING_USERNAME,
  password: ONGOING_PASSWORD,
};

sync(cdonSettings, ongoingSettings).then(() => console.log('DONE'));

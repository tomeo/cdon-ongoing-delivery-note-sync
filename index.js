const sync = require('./sync');

const {
  CDON_ADDRESSID,
  CDON_APIURL,
  CDON_APIKEY,
  ONGOING_APIURL,
  ONGOING_GOODSOWNERID,
  ONGOING_USERNAME,
  ONGOING_PASSWORD,
  SLACK_WEBHOOK,
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
const slackSettings = {
  url: SLACK_WEBHOOK,
};

sync(cdonSettings, ongoingSettings, slackSettings).then(() => {});

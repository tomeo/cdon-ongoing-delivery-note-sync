'use strict';

const AWS = require('aws-sdk');
const sync = require('./sync');

const CDON = {
  ADDRESSID: `/${process.env.ACCOUNT}/cdon/addressid`,
  ADMIN_URL: `/${process.env.ACCOUNT}/cdon/adminurl`,
  API_KEY: `/${process.env.ACCOUNT}/cdon/apikey`,
};

const ONGOING = {
  API_URL: `/${process.env.ACCOUNT}/ongoing/apiurl`,
  GOODS_OWNER_ID: `/${process.env.ACCOUNT}/ongoing/goodsownerid`,
  USERNAME: `/${process.env.ACCOUNT}/ongoing/username`,
  PASSWORD: `/${process.env.ACCOUNT}/ongoing/password`,
};

const ssm = new AWS.SSM();
const keyPromise = ssm
  .getParameters({
    Names: [
      CDON.ADDRESSID,
      CDON.ADMIN_URL,
      CDON.API_KEY,
      ONGOING.API_URL,
      ONGOING.GOODS_OWNER_ID,
      ONGOING.USERNAME,
      ONGOING.PASSWORD,
    ],
    WithDecryption: true,
  })
  .promise();

exports.handler = async event => {
  const result = await keyPromise;

  const cdonSettings = {
    addressId: result.Parameters.find(p => p.Name === CDON.ADDRESSID)
      .Value,
    apiUrl: result.Parameters.find(p => p.Name === CDON.ADMIN_URL)
      .Value,
    apiKey: result.Parameters.find(p => p.Name === CDON.API_KEY)
      .Value,
  };

  const ongoingSettings = {
    apiUrl: result.Parameters.find(p => p.Name === ONGOING.API_URL)
      .Value,
    goodsOwnerId: result.Parameters.find(
      p => p.Name === ONGOING.GOODS_OWNER_ID,
    ).Value,
    username: result.Parameters.find(p => p.Name === ONGOING.USERNAME)
      .Value,
    password: result.Parameters.find(p => p.Name === ONGOING.PASSWORD)
      .Value,
  };

  return sync(cdonSettings, ongoingSettings);
};

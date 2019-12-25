const axios = require('axios');

module.exports = config => {
  let messages = [];

  const log = message => {
    messages = [...messages, message];
    console.log(message);
  };

  const print = () => {
    if (config.url) {
      axios.post(config.url, {
        text: `\`\`\`${messages.join('\n')}\`\`\``,
      });
    }
    return Promise.resolve();
  };

  return {
    log,
    print,
  };
};

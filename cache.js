const LRU = require("lru-cache");

const oneDay = 1000 * 60 * 60 * 24;
const cache = new LRU({ max: 350, maxAge: oneDay });

let id = 1;

module.exports.addMessage = function (name, text) {
  cache.set(id++, { name, text });
};

module.exports.messages = function () {
  return cache.values();
};

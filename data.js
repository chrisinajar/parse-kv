const fs = require('fs');
const path = require('path');

module.exports = {
  test: fs.readFileSync(path.join(__dirname, 'test.kv')),
  dota_english: fs.readFileSync(path.join(__dirname, 'dota_english.txt'))
};

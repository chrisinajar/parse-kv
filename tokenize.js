
module.exports = tokenizeKV;

function tokenizeKV (data) {
  data = data.toString();
  return data
    .split('\n')
    .map((s, i) => {
      return {
        text: s.trim(),
        line: i + 1
      };
    })
    .filter(s => s.text.length)
    .filter(s => s.text.substr(0, 2) !== '//')
    .map(tokenizeLine);
}

function tokenizeLine (entry) {
  entry.tokens = entry.text
    .split(/(["\\\\])/g)
    // .map(s => s.trim())
    .filter(s => s.length);

  return entry;
}

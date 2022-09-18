
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
  const tokens = [];

  entry.text
    .split(/(["\\\\])/g)
    .filter(s => s.length)
    .map(function (token) {
      const tempTokens1 = token.split(/([{\\\\])/g);
      tempTokens1.forEach(function (t1) {
        const tempTokens2 = t1.split(/([}\\\\])/g);
        tempTokens2.forEach(function (t2) {
          if (t2.length) {
            tokens.push(t2);
          }
        });
      });
      const tparts = token.split('//');
      return tparts.shift();
    });

  entry.tokens = tokens;

  return entry;
}

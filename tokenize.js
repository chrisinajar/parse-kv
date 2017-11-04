
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
  var tokens = [];

  entry.text
    .split(/(["\\\\])/g)
    .filter(s => s.length)
    .map(function (token) {
      var tparts = token.split('//');
      token = tparts.shift();

      tokens.push(token);
      if (tparts.length) {
        tokens.push('//' + tparts.join('//'));
      }
      return token;
    });

  entry.tokens = tokens;

  return entry;
}

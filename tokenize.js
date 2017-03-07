
module.exports = tokenizeKV;

function tokenizeKV (data) {
  data = data.toString();
  return data
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length)
    .filter(s => s.substr(0, 2) !== '//')
    .map(tokenizeLine);
}

function tokenizeLine (line) {
  return line
    .split(/(")/g)
    .map(s => s.trim())
    .filter(s => s.length);
}

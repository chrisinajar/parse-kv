var tokenizeKV = require('./tokenize');
var debug = require('debug')('parseKV:parse');

module.exports = parseKV;

function parseKV (data) {
  var lines = tokenizeKV(data);
  var result = {
    values: {}
  };
  var currentResult = result;
  var popStack = rootPopStack;

  // state variables
  var stack = [];
  var key = null;
  var value = null;
  var temporaryStack = '';
  var isInQuotes = false;
  var isInComment = false;

  lines.forEach(function (line, i) {
    debug(line);
    if (isInComment) {
      return;
    }
    line.forEach(function (token) {
      switch (token) {
        case '"':
          isInQuotes = !isInQuotes;
          if (!isInQuotes && temporaryStack.length) {
            if (!key) {
              key = temporaryStack;
            } else if (!value) {
              value = temporaryStack;
            } else {
              debug(line);
              throw new Error('Too many values on line ' + i);
            }
            temporaryStack = '';
          }
          return;
        case '{':
          if (!temporaryStack) {
            debug(line);
            throw new Error('Unexpected "{" character on line ' + i);
          }
          pushStack(temporaryStack);
          temporaryStack = '';
          return;
        case '}':
          return popStack();
      }
      if (isInQuotes) {
        if (!stack.length) {
          // root level title
          debug('opening category', token);
        }
        temporaryStack += token;
      } else if (token.substr(0, 2) === '//') {
        isInComment = true;
      } else {
        debug('found stuff outside of quotes', line);
        throw new Error('Unexpected token "' + token + '"');
      }
    });
    debug('leftover stack', temporaryStack);
    temporaryStack = '';
    if (key && !value) {
      temporaryStack = key;
    } else if (key && value) {
      currentResult.values[key] = value;
    }
    key = null;
    value = null;
    isInComment = false;

    if (isInQuotes) {
      debug('Invalid line: ', line);
      throw new Error('Unmatched close quotation on line ' + i);
    }
  });

  return result;

  function pushStack (title) {
    var _popStack = popStack;
    var parentResult = currentResult;

    debug('pushing to stack', title);
    stack.push(title);

    currentResult[title] = {
      values: {}
    };

    currentResult = currentResult[title];

    popStack = function () {
      debug('stack pop', stack.pop());
      popStack = _popStack;
      currentResult = parentResult;
    };
  }

  function rootPopStack () {
    throw new Error('Unexpected "}"');
  }
}

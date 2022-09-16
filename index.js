const tokenizeKV = require('./tokenize');
const debug = require('debug')('parseKV:parse');

module.exports = parseKV;

function parseKV (data) {
  const lines = tokenizeKV(data);
  const result = {
    values: {}
  };
  let currentResult = result;
  let popStack = rootPopStack;

  Object.defineProperty(currentResult, 'comments', {
    enumerable: false,
    value: {}
  });

  // state variables
  const stack = [];
  let key = null;
  let value = null;
  let temporaryStack = '';
  let isInQuotes = false;
  let isInComment = false;
  let isEscaping = false;

  lines.forEach(function (entry, i) {
    const line = entry.tokens;
    let comment = '';
    line.forEach(function (token) {
      if (isInComment) {
        if (token[0] === '"') {
          comment += ' ';
        }
        comment += token;
        return;
      }
      if (!isInQuotes) {
        token = token.trim();
        if (!token.length) {
          return;
        }
      }
      switch (token) {
        case '\\':
          isEscaping = true;
          return;
        case '"':
          if (isEscaping) {
            isEscaping = false;
            break;
          }
          isInQuotes = !isInQuotes;
          if (!isInQuotes) {
            // console.log(key, temporaryStack);
            if (!key) {
              key = temporaryStack;
            } else if (value === null) {
              value = temporaryStack;
            } else if (isInComment) {
              // do nothing, this a comment
              comment += token;
            } else if (key && value) {
              currentResult.values[key] = value;
              key = temporaryStack;
              value = null;
            } else {
              debug(entry);
              throw new Error('Too many values on line ' + entry.line);
            }
            temporaryStack = '';
          }
          return;
        case '{':
          if (!temporaryStack) {
            if (key && !value) {
              temporaryStack = key;
              key = '';
            } else {
              debug(entry);
              // throw new Error('Unexpected "{" character on line ' + entry.line);
              console.log('Warning: Unexpected "{" character on line ' + entry.line);
            }
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
        if (isEscaping) {
          isEscaping = false;
          temporaryStack += '\\';
        }
        temporaryStack += token;
      } else if (token.substr(0, 2) === '//') {
        isInComment = true;
        comment = token.substr(2);
      } else if (isInComment) {
        comment += token;
      } else {
        debug('found stuff outside of quotes', line);
        // throw new Error('Unexpected token "' + token + '" on line ' + entry.line);
        console.log('Warning: Unexpected text on line ' + entry.line + ': "' + token + '"');
        comment += token;
      }
    });
    if (isInQuotes) {
      debug('Invalid line: ', entry);
      // throw new Error('Unmatched close quotation on line ' + entry.line);
      return;
    }
    if (temporaryStack.length) {
      debug('leftover stack', temporaryStack);
    }
    temporaryStack = '';
    if (key && value === null) {
      temporaryStack = key;
      currentResult.comments[key] = comment.trim();
    } else if (key !== null && value !== null) {
      currentResult.values[key] = value;
      if (comment.length) {
        // console.log(key, comment);
        currentResult.comments[key] = comment.trim();
      }
      // Object.defineProperty(  , 'comment', {
      //   enumerable: false,
      //   value: comment
      // });
    }
    key = null;
    value = null;
    isInComment = false;
    comment = '';
  });

  return result;

  function pushStack (title) {
    const _popStack = popStack;
    const parentResult = currentResult;

    debug('pushing to stack', title);
    stack.push(title);

    currentResult[title] = {
      values: {}
    };
    currentResult = currentResult[title];

    Object.defineProperty(currentResult, 'comments', {
      enumerable: false,
      value: {}
    });

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

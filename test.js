var test = require('tape');
var fileData = require('./data');

var parseKV = require('./index');

test('basic usage', function (t) {
  t.ok(fileData, 'can read file data');

  var data = null;
  t.doesNotThrow(function () {
    data = parseKV(fileData);
  }, 'runs without exception');

  t.ok(data);

  // console.log(JSON.stringify(data, null, 2));

  t.ok(data.DOTAAbilities, 'gets root level category');
  t.ok(data.DOTAAbilities.item_recipe_abyssal_blade, 'reads all sub-categories');
  t.equal(data.DOTAAbilities.item_recipe_abyssal_blade.values.ID, '207', 'reads in values');
  t.ok(data.DOTAAbilities.item_recipe_abyssal_blade.ItemRequirements, 'nested sub-categories');

  t.end();
});

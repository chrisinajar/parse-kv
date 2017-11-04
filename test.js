var test = require('tape');
var fileData = require('./data');

var parseKV = require('./index');

test('basic usage', function (t) {
  t.ok(fileData, 'can read file data');

  var data = null;
  t.doesNotThrow(function () {
    data = parseKV(fileData.test);
  }, 'runs without exception');
  t.doesNotThrow(function () {
    parseKV(fileData.dota_english);
  }, 'can parse dota tooltips');

  t.ok(data);

  // console.log(JSON.stringify(data, null, 2));

  t.ok(data.DOTAAbilities, 'gets root level category');
  t.equals(data.DOTAAbilities.ability_base_datadriven.values.AbilityType, 'DOTA_ABILITY_TYPE_BASIC', 'reads value after empty string');
  t.ok(data.DOTAAbilities.ability_base_datadriven, 'reads all sub-categories');
  t.equal(data.DOTAAbilities.item_recipe_abyssal_blade.values.ID, '207', 'reads in values');
  t.ok(data.DOTAAbilities.item_recipe_abyssal_blade.ItemRequirements, 'nested sub-categories');

  t.equal(data.DOTAAbilities.ability_base_datadriven.comments.AbilityTextureName, 'test comment', 'saves comments');
  t.equal(data.DOTAAbilities.item_recipe_abyssal_blade.AbilitySpecial['01'].comments.var_type, 'other test', 'saves comments');

  t.end();
});

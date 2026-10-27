const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function nativeApp() {
  const filename = path.resolve(__dirname, '../lib/core/nativeApp.js');
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  new Function('module', 'exports', code)(module, module.exports);
  return module.exports;
}

test('system tab bar applies only to iOS build 3 and later', () => {
  const { isNativeFeatureCompatible } = nativeApp();
  assert.equal(isNativeFeatureCompatible('systemTabBar', { platform: 'ios', version: 2 }), false);
  assert.equal(isNativeFeatureCompatible('systemTabBar', { platform: 'ios', version: 3 }), true);
  assert.equal(isNativeFeatureCompatible('systemTabBar', { platform: 'android', version: 99 }), false);
  assert.equal(isNativeFeatureCompatible('systemTabBar', null), false);
});

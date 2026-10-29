import test from 'node:test';
import assert from 'node:assert/strict';
import { APP_STORES, detectStorePlatform } from '../lib/landing/stores.mjs';

const cases = [
  ['Android phone', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36', 5, 'android'],
  ['iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148', 5, 'ios'],
  ['iPad mobile UA', 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15', 5, 'ios'],
  ['iPad desktop UA', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15', 5, 'ios'],
  ['Mac desktop', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', 0, null],
  ['Windows touch laptop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 10, null],
  ['Unknown client', '', 0, null],
];
for (const [name, ua, touch, expected] of cases) {
  test(name, () => assert.equal(detectStorePlatform(ua, touch), expected));
}
test('download destinations use the native application IDs', () => {
  assert.equal(new URL(APP_STORES.android.url).searchParams.get('id'), 'com.icecream.kwklasplus');
  assert.equal(new URL(APP_STORES.ios.url).pathname, '/app/id6820491776');
});

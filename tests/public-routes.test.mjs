import test from 'node:test';
import assert from 'node:assert/strict';
import { isPublicRoute } from '../lib/core/publicRoutes.mjs';

for (const path of ['/', '/?from=store', '/privacy', '/privacy/', '/tos#terms', '/changelog', '/download']) {
  test(`public: ${path}`, () => assert.equal(isPublicRoute(path), true));
}
for (const path of ['/feed', '/agent?conversation=1', '/support', '/calendar', '/privacy/extra', '/tos-extra']) {
  test(`native: ${path}`, () => assert.equal(isPublicRoute(path), false));
}

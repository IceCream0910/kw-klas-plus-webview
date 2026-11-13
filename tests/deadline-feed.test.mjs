import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decodeDeadlineFeed } from '../lib/calendar/deadlineFeed.mjs';

test('the legacy callback can still supply a verified empty list', () => {
  assert.deepEqual(decodeDeadlineFeed('READY', '[]'), { status: 'READY', data: [] });
});

test('partial success supplies only available results and keeps its status when empty', () => {
  const items = [{ subj: 'fixture', onlineLecture: [{}], task: [], teamTask: [] }];
  assert.deepEqual(decodeDeadlineFeed('PARTIAL', JSON.stringify(items)), { status: 'PARTIAL', data: items });
  assert.deepEqual(decodeDeadlineFeed('PARTIAL', ''), { status: 'PARTIAL', data: [] });
});

test('failed and malformed responses do not replace previously displayed data', () => {
  for (const [status, json] of [['FAILED', '[]'], ['READY', '{}'], ['PARTIAL', 'invalid']]) {
    assert.deepEqual(decodeDeadlineFeed(status, json), { status: 'FAILED', data: null });
  }
});

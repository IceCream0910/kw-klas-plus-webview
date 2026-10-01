const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const ts = require('typescript');
const { JSDOM } = require('jsdom');

const repo = path.resolve(__dirname, '..');
// Exercise the actual JS/TS implementation without another test bundler dependency.
function source(relative, overrides = {}, cache = new Map()) {
  const filename = path.resolve(repo, relative);
  if (overrides[filename]) return overrides[filename];
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }
  }).outputText;
  const nativeRequire = createRequire(filename);
  const localRequire = name => {
    if (!name.startsWith('.')) return nativeRequire(name);
    const base = path.resolve(path.dirname(filename), name);
    const resolved = [base, `${base}.ts`, `${base}.js`].find(file => fs.existsSync(file) && fs.statSync(file).isFile());
    return source(path.relative(repo, resolved), overrides, cache);
  };
  new Function('require', 'module', 'exports', code)(localRequire, module, module.exports);
  return module.exports;
}

const { AgentConversation } = source('workers/agent-api/src/conversation.ts');
const worker = source('workers/agent-api/src/index.ts').default;

function memoryState() {
  const values = new Map();
  let queue = Promise.resolve();
  const storage = {
    get: async key => structuredClone(values.get(key)),
    put: async (key, value) => { values.set(key, structuredClone(value)); },
    deleteAll: async () => { values.clear(); },
    setAlarm: async () => {},
    transaction: callback => {
      const result = queue.then(() => callback(storage));
      queue = result.catch(() => {});
      return result;
    }
  };
  return { storage };
}
function environment(limits = {}) {
  const objects = new Map();
  const keys = [];
  return {
    OPENAI_API_KEY: 'test-key',
    ALLOWED_ORIGINS: 'https://klasplus.yuntae.in',
    ...limits,
    AGENT_RATE_LIMITER: { limit: async ({ key }) => { keys.push(key); return { success: true }; } },
    AGENT_CONVERSATIONS: {
      idFromName: name => name,
      get: name => {
        if (!objects.has(name)) objects.set(name, new AgentConversation(memoryState()));
        return objects.get(name);
      }
    },
    keys
  };
}
function request(body, headers = {}) {
  return new Request('https://agent.example/v1/agent/stream', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body)
  });
}
function message(overrides = {}) {
  return { type: 'message', userId: 'user-0000000000001', conversationId: 'conversation-000001',
    messageId: crypto.randomUUID(), assistantMessageId: crypto.randomUUID(), message: 'Hello', ...overrides };
}
async function objectRequest(env, name, body) {
  return env.AGENT_CONVERSATIONS.get(name).fetch(new Request('https://internal/', {
    method: 'POST', body: JSON.stringify(body)
  }));
}
async function ownerKey(userId) {
  return Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(userId))).toString('hex');
}
function openAIResponse(id, callId) {
  const events = callId
    ? [{ type: 'response.output_item.done', item: { type: 'function_call', call_id: callId, name: 'getGrades', arguments: '{}' } }]
    : [{ type: 'response.output_text.delta', delta: 'Safe response' }];
  events.push({ type: 'response.completed', response: { id } });
  return new Response(events.map(event => `data: ${JSON.stringify(event)}\n\n`).join(''), {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
function responseRecorder(t, callback) {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    const body = JSON.parse(options.body);
    calls.push(body);
    if (!body.stream) return Response.json({ status: 'completed', output_text: 'Test title' });
    return callback ? callback(body, calls.length) : openAIResponse(`resp_${calls.length}`);
  });
  return calls;
}
function apiResponse() {
  return { statusCode: 200, headers: {}, data: undefined,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; }, end() { return this; } };
}

test('both public API handlers reject alternate SSRF representations before fetching', async t => {
  const proxy = source('pages/api/proxy.ts').default;
  const crawler = source('pages/api/crawler/turndown.js').default;
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; throw new Error('must not fetch'); });
  for (const url of ['http://klas.kw.ac.kr/std/test.do', 'https://127.0.0.1/', 'https://[::1]/',
    'https://2130706433/', 'https://www.kw.ac.kr.attacker.test/', 'https://klas.kw.ac.kr@attacker.test/',
    'https://name:password@klas.kw.ac.kr/', 'https://klas.kw.ac.kr:8443/', 'file:///etc/passwd']) {
    const first = apiResponse();
    await proxy({ method: 'POST', body: { url } }, first);
    assert.equal(first.statusCode, 400, url);
    const second = apiResponse();
    await crawler({ method: 'GET', query: { url } }, second);
    assert.equal(second.statusCode, 400, url);
  }
  assert.equal(calls, 0);
});

test('university POST and page conversion remain usable; redirects are never followed', async t => {
  const proxy = source('pages/api/proxy.ts').default;
  const crawler = source('pages/api/crawler/turndown.js').default;
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options });
    if (url.includes('redirect')) return new Response(null, { status: 302, headers: { Location: 'http://127.0.0.1/private' } });
    if (url.includes('www.kw.ac.kr')) return new Response('<main><h2>공지</h2><a href="/next">다음</a><img src="/photo.png"></main>');
    return Response.json({ grades: [4.5] });
  });
  const result = apiResponse();
  await proxy({ method: 'POST', body: { url: 'https://klas.kw.ac.kr/std/test.do', headers: { Cookie: 'SESSION=test;', Accept: 'application/json' }, body: { selectSubj: 'test' } } }, result);
  assert.deepEqual(result.data, { grades: [4.5] });
  assert.equal(calls[0].options.headers.cookie, 'SESSION=test;');
  assert.equal(calls[0].options.body, '{"selectSubj":"test"}');
  const page = apiResponse();
  await crawler({ method: 'GET', query: { url: 'https://www.kw.ac.kr/notice' } }, page);
  assert.equal(page.statusCode, 200);
  assert.match(page.data.markdown, /https:\/\/www.kw.ac.kr\/next/);
  assert.match(page.data.markdown, /https:\/\/www.kw.ac.kr\/photo.png/);
  for (const [handler, req] of [[proxy, { method: 'POST', body: { url: 'https://klas.kw.ac.kr/redirect' } }],
    [crawler, { method: 'GET', query: { url: 'https://www.kw.ac.kr/redirect' } }]]) {
    const redirect = apiResponse();
    await handler(req, redirect);
    assert.equal(redirect.statusCode, 500);
  }
  assert.ok(calls.every(call => call.options.redirect === 'manual'));
  assert.ok(calls.every(call => new URL(call.url).protocol === 'https:'));
  const rejected = apiResponse();
  await proxy({ method: 'POST', body: { url: 'https://klas.kw.ac.kr/', headers: { Authorization: 'Bearer extra' } } }, rejected);
  assert.equal(rejected.statusCode, 400);
});

test('board sanitizer removes active/malformed HTML and retains formatted/image-only content', () => {
  const { sanitizeBoardHtml } = source('lib/board/sanitizeBoardHtml.js');
  const dom = new JSDOM('');
  const payload = '<p style="background:url(https://evil.test)">Text<img src="/photo" onerror="window.Android.openPage(\'x\')"></p>'
    + '<svg onload="alert(1)"><a xlink:href="javascript:alert(1)">X</a></svg><math><mtext><img src=x onerror=alert(1)></mtext></math>'
    + '<a href="jAvAsCrIpT&#58;alert(1)">Bad</a><iframe srcdoc="<script>alert(1)</script>"></iframe>'
    + '<object data="https://evil.test"></object><script>alert(1)</script>';
  const clean = sanitizeBoardHtml(payload, dom.window);
  const container = dom.window.document.createElement('div');
  container.innerHTML = clean;
  assert.equal(container.querySelector('script,svg,math,iframe,object,embed,style'), null);
  for (const element of container.querySelectorAll('*')) {
    for (const attr of element.attributes) {
      assert.ok(!/^on/i.test(attr.name));
      assert.notEqual(attr.name, 'style');
      assert.ok(!/javascript:/i.test(attr.value));
    }
  }
  const ordinary = sanitizeBoardHtml('<table><tr><td><strong>강의</strong></td></tr></table><ul><li>공지</li></ul><a href="/file">파일</a><img src="/photo.png">', dom.window);
  assert.match(ordinary, /<table>/);
  assert.match(ordinary, /<strong>강의<\/strong>/);
  assert.match(ordinary, /href="\/file"/);
  assert.match(sanitizeBoardHtml('<img src="/only.png">', dom.window), /<img/);
  assert.equal(sanitizeBoardHtml('<img onerror="alert(1)">', undefined), '');
  dom.window.close();
});

test('foreign, missing, deleted and wrong-tool continuations fail before any paid call', async t => {
  const env = environment();
  const calls = responseRecorder(t);
  const own = message();
  const owner = await ownerKey(own.userId);
  await objectRequest(env, own.conversationId, { action: 'append', ownerKey: owner,
    latestResponseId: 'resp_own', message: { id: own.messageId, role: 'user', content: 'Existing', createdAt: 1 } });
  for (const body of [message({ previousResponseId: 'resp_victim' }),
    message({ conversationId: 'new-conversation-0001', previousResponseId: 'resp_victim' }),
    { ...own, type: 'tool_output', previousResponseId: 'resp_own', callId: 'call_wrong', output: {} },
    { ...own, type: 'tool_output', conversationId: 'empty-conversation-001', previousResponseId: 'resp_own', callId: 'call_test', output: {} }]) {
    assert.equal((await worker.fetch(request(body), env)).status, 409);
  }
  assert.equal((await worker.fetch(request(message({ userId: 'other-user-0000001' })), env)).status, 403);
  await objectRequest(env, own.conversationId, { action: 'delete_conversation', ownerKey: owner });
  assert.equal((await worker.fetch(request(message({ previousResponseId: 'resp_own' })), env)).status, 409);
  assert.equal(calls.length, 0);
});

test('owned history and multi-step tool continuation use stored response IDs and reject replay', async t => {
  const env = environment();
  let turns = 0;
  const calls = responseRecorder(t, () => ++turns === 1 ? openAIResponse('resp_first', 'call_one') : openAIResponse('resp_second'));
  const first = message();
  const firstResponse = await worker.fetch(request(first), env);
  assert.match(await firstResponse.text(), /tool.requested/);
  const tool = { ...first, type: 'tool_output', callId: 'call_one', output: { grades: [4.5] }, previousResponseId: 'resp_first' };
  assert.equal((await worker.fetch(request({ ...tool, callId: 'call_wrong' }), env)).status, 409);
  const resumed = await worker.fetch(request(tool), env);
  assert.match(await resumed.text(), /Safe response/);
  assert.equal(calls[1].previous_response_id, 'resp_first');
  assert.equal((await worker.fetch(request(tool), env)).status, 409);
  const restored = await objectRequest(env, first.conversationId, { action: 'history', ownerKey: await ownerKey(first.userId) });
  assert.equal((await restored.json()).latestResponseId, 'resp_second');
  const next = await worker.fetch(request(message()), env);
  await next.text();
  assert.equal(calls.findLast(call => call.stream).previous_response_id, 'resp_second');
});

test('rotating IDs, IPs and forwarding headers cannot reset global paid-call budget', async t => {
  const env = environment({ AGENT_MODEL_CALLS_PER_MINUTE: '2', AGENT_MODEL_CALLS_PER_DAY: '2' });
  const calls = responseRecorder(t, (_body, count) => openAIResponse(`resp_${count}`, 'pending_call'));
  for (let i = 0; i < 3; i++) {
    const result = await worker.fetch(request(message({ userId: `rotated-user-00000${i}`, conversationId: `rotated-conversation-${i}` }),
      { 'CF-Connecting-IP': `192.0.2.${i}`, 'X-Forwarded-For': `203.0.113.${i}` }), env);
    assert.equal(result.status, i < 2 ? 200 : 429);
    await result.text();
  }
  assert.equal(calls.length, 2);
});

test('title calls count against the same budget and missing IP uses a shared source bucket', async t => {
  const env = environment({ AGENT_MODEL_CALLS_PER_MINUTE: '1', AGENT_MODEL_CALLS_PER_DAY: '1' });
  const calls = responseRecorder(t);
  const result = await worker.fetch(request(message()), env);
  await result.text();
  assert.equal(calls.length, 1); // Title uses a local fallback because the main call spent the quota.
  const blocked = await worker.fetch(request(message({ userId: 'other-user-0000012', conversationId: 'another-conversation-1' })), env);
  assert.equal(blocked.status, 429);
  const sourceKeys = env.keys.filter(key => key.startsWith('source-'));
  assert.equal(sourceKeys[0], sourceKeys[1]);
});

test('atomic quota and run reservation reject concurrent use and deleted run completion', async () => {
  const env = environment();
  const results = await Promise.all(Array.from({ length: 10 }, () => objectRequest(env, '$agent-model-budget-v1', {
    action: 'reserve_budget', perMinute: 3, perDay: 3
  })));
  assert.equal(results.filter(result => result.ok).length, 3);
  const begin = { action: 'begin_run', ownerKey: 'owner', requestType: 'message' };
  const runs = await Promise.all(['a', 'b'].map(runId => objectRequest(env, 'conversation-000001', { ...begin, runId })));
  assert.deepEqual(runs.map(result => result.status), [200, 409]);
  await objectRequest(env, 'conversation-000001', { action: 'delete_conversation', ownerKey: 'owner' });
  const finish = await objectRequest(env, 'conversation-000001', { action: 'finish_run', ownerKey: 'owner', runId: 'a', latestResponseId: 'resp_deleted' });
  assert.equal(finish.status, 409);
});

test('upstream failure releases run reservation for an ordinary retry', async t => {
  const env = environment();
  let failed = true;
  responseRecorder(t, () => failed ? new Response('Unavailable', { status: 503 }) : openAIResponse('resp_retry'));
  assert.equal((await worker.fetch(request(message()), env)).status, 503);
  failed = false;
  const retry = await worker.fetch(request(message()), env);
  assert.equal(retry.status, 200);
  assert.match(await retry.text(), /Safe response/);
});

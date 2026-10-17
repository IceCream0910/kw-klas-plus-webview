const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const ts = require('typescript');
const repo = path.resolve(__dirname, '..');
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

const endpoint = 'https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreHakjukInfo.do';
function app(t, ua) {
    const oldWindow = globalThis.window, oldNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    globalThis.window = { localStorage: { removeItem() {} } };
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { userAgent: ua } });
    t.after(() => { if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow;
        if (oldNavigator) Object.defineProperty(globalThis, 'navigator', oldNavigator); else delete globalThis.navigator; });
}
function bridge(value, fail) {
    const calls = [], chunks = JSON.stringify(value).match(/[\s\S]{1,6144}/g);
    return { calls, default: {
        async requestKlasApi(...args) { calls.push(args); if (fail) return { error: fail }; return { responseId: args[0], chunkCount: chunks.length }; },
        async readKlasApiChunk(id, index) { return chunks[Number(index)]; },
        async cancelKlasApi() {},
    } };
}
function client(mock) { return source('lib/core/klas.ts', { [path.join(repo, 'lib/core/klasNativeBridge.js')]: { __esModule: true, ...mock } }).KLAS; }

test('Android 34 and iOS 2 start native mode; older and unidentified apps retain proxy', async t => {
    for (const [ua, native] of [['AndroidApp_v33', false], ['AndroidApp_v34', true], ['AndroidApp_v35', true], ['iOSApp_v1', false], ['iOSApp_v2', true], ['iOSApp_v3', true], ['browser', false]]) {
        await t.test(ua, async t => {
            app(t, ua); const mock = bridge({ rows: [], optional: null }); let proxy = 0;
            t.mock.method(globalThis, 'fetch', async (url, options) => { proxy++; assert.equal(url, '/api/proxy'); assert.ok(JSON.parse(options.body).headers.Cookie.includes('legacy-token')); return Response.json({ rows: [], optional: null }); });
            const data = await client(mock)(endpoint, native ? '' : 'legacy-token', {});
            assert.deepEqual(data, { rows: [], optional: null });
            assert.equal(proxy, native ? 0 : 1); assert.equal(mock.calls.length, native ? 1 : 0);
            if (native) { assert.equal(window.__klasNativeApi, true); assert.equal(mock.calls[0][1], new URL(endpoint).pathname); }
        });
    }
});

test('foreign and alternate URLs are rejected before either transport runs', async t => {
    app(t, 'AndroidApp_v34'); const mock = bridge({}); let requests = 0;
    t.mock.method(globalThis, 'fetch', async () => { requests++; throw new Error('unexpected fetch'); });
    const request = client(mock);
    for (const url of ['https://evil.test/path', 'https://klas.kw.ac.kr.evil.test/path', 'https://evil@klas.kw.ac.kr/path', 'http://klas.kw.ac.kr/path', 'https://klas.kw.ac.kr:444/path', endpoint + '#fragment', 'https://klas.kw.ac.kr/std/cps/inqire/../inqire/AtnlcScreHakjukInfo.do', 'https://klas.kw.ac.kr/%2e%2e/path', 'https://klas.kw.ac.kr//evil.test/path']) await assert.rejects(request(url, 'token', {}));
    assert.equal(requests, 0); assert.equal(mock.calls.length, 0);
});

test('native error never falls back, mutations are not repeated, and large JSON is reassembled', async t => {
    app(t, 'iOSApp_v2'); let proxy = 0;
    t.mock.method(globalThis, 'fetch', async () => { proxy++; throw new Error('unexpected proxy'); });
    const failed = bridge({}, 'OUTCOME_UNKNOWN');
    await assert.rejects(client(failed)('https://klas.kw.ac.kr/std/ads/admst/MySchdulSave.do', '', { title: '일정' }), { code: 'OUTCOME_UNKNOWN' });
    assert.equal(failed.calls.length, 1); assert.equal(proxy, 0);
    const value = { html: '<html>게시글</html>', rows: ['한'.repeat(20000)], missing: null };
    assert.deepEqual(await client(bridge(value))(endpoint, '', {}), value);
});

test('AbortSignal cancels native work and ignores a late response', async t => {
    app(t, 'AndroidApp_v34'); let resolve, chunks = 0, cancelled = 0;
    const mock = { default: {
        requestKlasApi: () => new Promise(done => { resolve = done; }),
        readKlasApiChunk: async () => { chunks++; return '{}'; },
        cancelKlasApi: async () => { cancelled++; },
    } };
    const controller = new AbortController();
    const pending = client(mock)(endpoint, '', {}, { signal: controller.signal });
    controller.abort(); await assert.rejects(pending, { name: 'AbortError' });
    resolve({ responseId: 'late', chunkCount: 1 }); await new Promise(done => setImmediate(done));
    assert.ok(cancelled > 0); assert.equal(chunks, 0);
});

test('lecture-plan aggregation retains partial keys; notices retain page order and bound concurrency', async () => {
    const { aggregateLecturePlan, aggregateLectureNotices } = source('lib/klas/aggregates.js');
    const plan = await aggregateLecturePlan(async (url, token, body) => {
        assert.equal(body.selectSubj, 'course'); if (url.endsWith('/LectreAstnt.do')) throw new Error('unavailable'); return { value: null };
    }, '', 'course');
    assert.equal(plan.success, true); assert.equal(Object.keys(plan.data).length, 8); assert.equal(plan.data.lectureAssistant, undefined);
    let active = 0, maximum = 0;
    const notices = await aggregateLectureNotices(async (url, token, body) => {
        maximum = Math.max(maximum, ++active); await new Promise(done => setTimeout(done, 1)); active--;
        return { list: [body.currentPage], page: { totalPages: 8 } };
    }, '', true);
    assert.deepEqual(notices, { notices: [0, 1, 2, 3, 4, 5, 6, 7] }); assert.ok(maximum <= 3);
});

test('supported aggregate services and board search make no internal KLAS API call', async t => {
    app(t, 'AndroidApp_v34'); const urls = [];
    const request = async url => { urls.push(url); return url.includes('BoardStdList') ? { list: [], page: { totalPages: 1 } } : { list: [], page: { totalPages: 1 } }; };
    const overrides = { [path.join(repo, 'lib/core/klas.ts')]: { KLAS: request } };
    t.mock.method(globalThis, 'fetch', async () => { throw new Error('internal API called'); });
    const services = source('lib/klas/services.js', overrides);
    await services.loadLecturePlan('', 'course'); await services.loadLectureNotices('', true);
    const { nativeSearchBatch } = source('lib/klas/search.js', overrides); const results = [];
    await nativeSearchBatch({ term: '2026,2', keyword: 'exam', sources: [{ id: 'course/notice', kind: 'notice', courseId: 'course', courseName: 'Course', page: 0 }] }, new AbortController().signal, result => results.push(result));
    assert.ok(urls.length >= 11); assert.equal(results[0].status, 'success');
    assert.ok(urls.every(url => new URL(url).hostname === 'klas.kw.ac.kr'));
});

test('legacy server core refuses redirects without forwarding SESSION to another host', async t => {
    let count = 0;
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        count++; assert.equal(options.redirect, 'manual'); assert.equal(new URL(url).hostname, 'klas.kw.ac.kr');
        return new Response(null, { status: 302, headers: { Location: 'https://evil.test/' } });
    });
    const { serverKLAS } = source('lib/server/klas.js');
    await assert.rejects(serverKLAS(endpoint, 'legacy-token', {}), { code: 'AUTH_ACTION_REQUIRED' });
    assert.equal(count, 1);
    await assert.rejects(serverKLAS('https://evil.test/', 'legacy-token', {})); assert.equal(count, 1);
});


test('new KLAS page reads use native GET operation without an internal crawler request', async t => {
    app(t, 'iOSApp_v2'); const html = '<main><h2>학사 정보</h2><script>secret()</script></main>';
    const mock = bridge(html); const overrides = { [path.join(repo, 'lib/core/klasNativeBridge.js')]: { __esModule: true, ...mock } };
    t.mock.method(globalThis, 'fetch', async () => { throw new Error('internal crawler called'); });
    const { KLAS_PAGE } = source('lib/core/klas.ts', overrides);
    const value = await KLAS_PAGE('https://klas.kw.ac.kr/new/page.do?term=2026');
    assert.equal(value, html); assert.equal(mock.calls[0][1], 'page:/new/page.do?term=2026');
    const { officialPageMarkdown } = source('lib/klas/pageContent.js');
    const markdown = officialPageMarkdown(value, 'https://klas.kw.ac.kr/new/page.do?term=2026');
    assert.ok(markdown.includes('학사 정보')); assert.ok(!markdown.includes('secret'));
    await assert.rejects(KLAS_PAGE('https://evil.test/')); assert.equal(mock.calls.length, 1);
});

test('old aggregate services retain their original API routes', async t => {
    app(t, 'AndroidApp_v33'); const calls = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => { calls.push(url); assert.equal(JSON.parse(options.body).token, 'old-token'); return Response.json({ success: true, data: {}, notices: [] }); });
    const services = source('lib/klas/services.js');
    await services.loadLecturePlan('old-token', 'course'); await services.loadLectureNotices('old-token', true);
    assert.deepEqual(calls, ['/api/lecturePlan', '/api/lectureNotice']);
});

test('profile hooks load without a token in native mode and still wait for it on old apps', async t => {
    const React = require('react'), { createRoot } = require('react-dom/client'), { JSDOM } = require('jsdom');
    for (const [ua, native] of [['AndroidApp_v34', true], ['iOSApp_v1', false]]) {
        await t.test(ua, async t => {
            app(t, ua);
            const dom = new JSDOM('<div id="root"></div>', { url: 'https://klasplus.yuntae.in/profile' });
            const oldDocument = globalThis.document, oldAct = globalThis.IS_REACT_ACT_ENVIRONMENT;
            globalThis.window = dom.window; globalThis.document = dom.window.document; globalThis.IS_REACT_ACT_ENVIRONMENT = true;
            const tokens = [];
            const overrides = {
                [path.join(repo, 'lib/core/klasNativeBridge.js')]: { __esModule: true, default: { completePageLoad() {} } },
                [path.join(repo, 'lib/core/klas.ts')]: { KLAS: async (url, token) => { tokens.push(token); return url.includes('SungjukInfo') ? [] : { kname: 'Fixture' }; } },
                [path.join(repo, 'lib/grade/calculateGPA.js')]: { __esModule: true, default: async () => [], calculateGPA: async () => [] },
            };
            const { useProfileData } = source('lib/profile/useProfileData.js', overrides);
            function Probe() { const value = useProfileData(); return React.createElement('span', null, value.data?.kname || 'waiting'); }
            const root = createRoot(document.getElementById('root'));
            try {
                await React.act(async () => { root.render(React.createElement(Probe)); });
                assert.equal(tokens.length, native ? 3 : 0);
                await React.act(async () => { window.receiveToken(native ? null : 'old-token'); });
                assert.equal(tokens.length, 3); assert.ok(tokens.every(token => native ? !token : token === 'old-token'));
                assert.equal(document.querySelector('span').textContent, 'Fixture');
            } finally {
                await React.act(async () => root.unmount()); dom.window.close(); globalThis.document = oldDocument; globalThis.IS_REACT_ACT_ENVIRONMENT = oldAct;
            }
        });
    }
});


test('Android secondary WebViews use injected build identity for API only', async t => {
    app(t, 'Mozilla/5.0'); window.__klasNativeApiApp = { platform: 'android', version: 34 };
    const mock = bridge({ rows: [] });
    t.mock.method(globalThis, 'fetch', async () => { throw new Error('proxy called'); });
    assert.deepEqual(await client(mock)(endpoint, '', {}), { rows: [] });
    const { isNativeFeatureCompatible } = source('lib/core/nativeApp.js');
    assert.equal(isNativeFeatureCompatible('klasApi'), true);
    assert.equal(isNativeFeatureCompatible('header'), false);
});

 test('new endpoints and query parameters need no native registration', async t => {
    app(t, 'AndroidApp_v34');
    const mock = bridge({ ok: true });
    const url = 'https://klas.kw.ac.kr/new/feature.do?q=%ED%95%99%EC%82%AC';
    assert.deepEqual(await client(mock)(url, '', {}), { ok: true });
    assert.equal(mock.calls[0][1], '/new/feature.do?q=%ED%95%99%EC%82%AC');
    const { serverKLAS } = source('lib/server/klas.js');
    t.mock.method(globalThis, 'fetch', async (target, options) => {
        assert.equal(target, url); assert.equal(options.redirect, 'manual');
        return Response.json({ ok: true });
    });
    assert.deepEqual(await serverKLAS(url, 'token', {}), { ok: true });
});

test('new POST endpoint bridge failures report unknown outcome without retry', async t => {
    app(t, 'AndroidApp_v34'); let calls = 0;
    const mock = { default: {
        requestKlasApi: async () => { calls++; throw new Error('bridge timeout'); },
        cancelKlasApi: async () => {},
    } };
    await assert.rejects(client(mock)('https://klas.kw.ac.kr/new/action.do', '', {}), { code: 'OUTCOME_UNKNOWN' });
    assert.equal(calls, 1);
});

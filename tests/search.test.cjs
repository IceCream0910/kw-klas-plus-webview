const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const load = file => import('data:text/javascript;base64,' + Buffer.from(fs.readFileSync(path.join(__dirname, '../lib/search', file), 'utf8')).toString('base64'));
const now = 1800000000000;
const row = (id, fetchedAt = now) => ({ id, kind: 'task', title: '중간고사 범위', term: '2026,2', courseId: 'C', fetchedAt, sourceRef: { sourceId: id } });
test('assignment metadata includes course, completion and deadline without guessing missing values', async () => {
    const { resultMetadata, deadlineLabel } = await load('presentation.js');
    assert.equal(resultMetadata({ kind: 'task', courseName: '자료구조', completionState: 'incomplete', endsAt: '202610092359' }), '자료구조 · 미완료 · 2026.10.09 23:59 마감');
    assert.equal(resultMetadata({ kind: 'teamTask', courseName: '자료구조', completionState: 'complete', endsAt: '2026-10-09 23:59:00' }), '자료구조 · 완료 · 2026.10.09 23:59 마감');
    assert.equal(deadlineLabel(null), '마감일 미확인');
    assert.ok(resultMetadata({ kind: 'task' }).includes('완료 여부 미확인'));
    assert.equal(resultMetadata({ kind: 'notice', courseName: '자료구조' }), '자료구조');
});
test('Agent handoff keeps at most five current-term references and excludes credentials and bodies', async () => {
    const { createAgentContext, agentContextDraft } = await load('agentContext.js');
    const context = createAgentContext(' 질문 ', '2026,2', [
        { ...row('old'), term: '2025,2' },
        ...Array.from({ length: 8 }, (_, i) => ({ ...row(String(i)), token: 'SECRET_TOKEN', body: 'PRIVATE_BODY' })),
    ]);
    assert.equal(context.question, '질문');
    assert.equal(context.references.length, 5);
    const draft = agentContextDraft(context);
    assert.ok(draft.includes('2026,2'));
    assert.ok(!draft.includes('SECRET_TOKEN'));
    assert.ok(!draft.includes('PRIVATE_BODY'));
    assert.ok(!draft.includes('old'));
    assert.equal(agentContextDraft({ question: 'x', references: Array(6).fill({}) }), '');
});
test('expired and wrong-term records never appear; browsing does not extend TTL', async () => {
    const { prune, LIMITS } = await load('cache.js');
    assert.deepEqual(prune([row('old', now - LIMITS.ttl), { ...row('term'), term: '2025,2' }, row('ok')], '2026,2', now).map(x => x.id), ['ok']);
});
test('both independent storage bounds and allowed fields are enforced', async () => {
    const { prune, LIMITS } = await load('cache.js');
    const items = prune(Array.from({ length: 4000 }, (_, i) => ({ ...row(String(i)), title: '한'.repeat(900), token: 'private' })), '2026,2', now);
    assert.ok(items.length <= LIMITS.count);
    assert.ok(Buffer.byteLength(JSON.stringify(items)) <= LIMITS.bytes);
    assert.ok(!JSON.stringify(items).includes('private'));
});
test('partial and failed batches preserve prior records; successful empty replaces its unit', async () => {
    const { SearchCache } = await load('cache.js');
    const cache = new SearchCache({ storage: null, now: () => now });
    await cache.setScope('opaque', '2026,2'); cache.merge([row('old')]);
    cache.replaceBatch({ courseId: 'C', kind: 'task', status: 'partial', items: [] }, '2026,2');
    assert.equal(cache.all().length, 1);
    cache.replaceBatch({ courseId: 'C', kind: 'task', status: 'failed', items: [] }, '2026,2');
    assert.equal(cache.all().length, 1);
    cache.replaceBatch({ courseId: 'C', kind: 'task', status: 'success', items: [] }, '2026,2');
    assert.equal(cache.all().length, 0);
    await cache.setScope('other', '2026,2'); assert.equal(cache.all().length, 0);
});
test('last week uses KST boundaries and menu synonyms remain local', async () => {
    const { parseQuery, localSearch } = await load('queryParser.js');
    const query = parseQuery('지난주 자료구조 공지 중간고사', [{ courseId: 'C', courseName: '자료구조' }], Date.parse('2026-10-09T09:00:00+09:00'));
    assert.equal(query.since, Date.parse('2026-09-28T00:00:00+09:00'));
    assert.equal(query.until, Date.parse('2026-10-05T00:00:00+09:00'));
    assert.equal(localSearch([{ ...row('x'), title: '온라인시험 응시', kind: 'menu' }], '중간고사').length, 1);
});
test('public requests share in-flight work, cache for 60 seconds, and never send credentials', async () => {
    const { SearchCoordinator } = await load('coordinator.js');
    let calls = 0, time = now;
    const runner = new SearchCoordinator({ now: () => time, fetcher: async (url, options) => {
        calls++; assert.equal(options.body, undefined);
        return { ok: true, json: async () => ({ items: [], more: false }) };
    } });
    const query = { scope: 'opaque', term: '2026,2', keyword: '장학' };
    await Promise.all([runner.school(query), runner.school(query)]);
    await runner.school(query); assert.equal(calls, 1);
    time += 60001; await runner.school(query); assert.equal(calls, 2);
});
test('cancellation discards a response even when fetch ignores the signal', async () => {
    const { SearchCoordinator } = await load('coordinator.js');
    let resolveFetch;
    const runner = new SearchCoordinator({ fetcher: () => new Promise(resolve => { resolveFetch = resolve; }) });
    const request = runner.school({ keyword: '장학', term: '2026,2' });
    await new Promise(resolve => setImmediate(resolve)); runner.cancel();
    resolveFetch({ ok: true, json: async () => ({ items: [], more: false }) });
    await assert.rejects(request, { name: 'AbortError' });
    assert.equal(runner.cache.size, 0);
});

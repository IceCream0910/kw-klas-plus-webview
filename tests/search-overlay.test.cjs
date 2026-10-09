const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { JSDOM } = require('jsdom');

function load(relative, overrides = {}) {
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', relative), 'utf8'), {
        fileName: relative.replace(/\.js$/, '.jsx'), compilerOptions: { jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    new Function('require', 'module', 'exports', code)(name => overrides[name] ?? require(name), module, module.exports);
    return module.exports;
}

async function render(props, action) {
    const dom = new JSDOM('<div id="__next"><div id="root"></div></div>', { url: 'https://klasplus.yuntae.in/feed' });
    global.window = dom.window; global.document = dom.window.document; global.IS_REACT_ACT_ENVIRONMENT = true;
    dom.window.scrollTo = () => {};
    const Overlay = load('components/search/SearchOverlay.js', {
        './SearchOverlay.module.css': {}, '@reacticons/ionicons': () => null,
        '../../lib/search/presentation': load('lib/search/presentation.js'),
        '../../lib/search/queryParser': load('lib/search/queryParser.js'),
        'border-beam': { BorderBeam: ({ children }) => React.createElement('div', null, children) },
        'framer-motion': { useReducedMotion: () => true },
        '../agent/AgentComposer': load('components/agent/AgentComposer.js', {
            './AgentComposer.module.css': {}, '@reacticons/ionicons': () => null,
            './SearchContextCard': () => null,
            'border-beam': { BorderBeam: ({ children }) => React.createElement('div', null, children) },
            'framer-motion': { useReducedMotion: () => true },
        }).default,
        '../agent/AgentExperience': ({ sharedDraft, onDraftChange, onComposerChange }) => {
            const composer = React.useMemo(() => ({ value: sharedDraft, onChange: onDraftChange, onSubmit() {}, disabled: false }), [sharedDraft, onDraftChange]);
            React.useEffect(() => { onComposerChange(composer); }, [composer, onComposerChange]);
            return React.createElement('div', null, 'Agent 대화');
        },
    }).default;
    const root = require('react-dom/client').createRoot(document.getElementById('root'));
    const update = async changes => React.act(async () => root.render(React.createElement(Overlay, { query: '', setQuery() {}, onInput() {}, onSubmit() {}, onClose() {}, results: [], ...props, ...changes })));
    try { await update({}); await action(dom.window, update); }
    finally { await React.act(async () => root.unmount()); assert.equal(document.getElementById('__next').inert, undefined); dom.window.close(); }
}

test('initial partial learning batches do not show a search failure; tab switches preserve the Agent draft', async () => {
    await render({ snapshot: { batches: [{ kind: 'onlineLecture', status: 'partial' }, { kind: 'teamTask', status: 'partial' }] }, query: '질문 초안' }, async () => {
        assert.doesNotMatch(document.body.textContent, /불러오지 못했습니다/);
        assert.equal(document.getElementById('__next').inert, true);
        const input = document.querySelector('textarea');
        assert.equal(document.querySelectorAll('textarea').length, 1);
        assert.equal(document.querySelector('[aria-label="파일 첨부"]').disabled, true);
        await React.act(async () => document.getElementById('agent-tab').click());
        assert.equal(document.querySelector('textarea'), input);
        assert.equal(document.querySelectorAll('textarea').length, 1);
        assert.equal(document.querySelector('[aria-label="파일 첨부"]').disabled, false);
        assert.equal(document.querySelector('textarea').value, '질문 초안');
        await React.act(async () => document.getElementById('search-tab').click());
        assert.equal(document.querySelector('textarea'), input);
        assert.equal(document.querySelector('[aria-label="파일 첨부"]').disabled, true);
        assert.equal(document.getElementById('agent-panel').hidden, true);
        await React.act(async () => document.getElementById('agent-tab').click());
        assert.equal(document.querySelector('textarea').value, '질문 초안');
    });
});

test('1500ms idle starts one remote search, Enter prevents a duplicate, and edge swipe closes', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let submissions = 0, closes = 0;
    await render({ query: '검색', onSubmit: () => submissions++, onClose: () => closes++ }, async (window, update) => {
        await React.act(async () => t.mock.timers.tick(1499)); assert.equal(submissions, 0);
        await React.act(async () => t.mock.timers.tick(1)); assert.equal(submissions, 1);
        await update({ query: '다음 검색' });
        await React.act(async () => document.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })));
        await React.act(async () => t.mock.timers.tick(1500)); assert.equal(submissions, 2);
        const dialog = document.querySelector('[role="dialog"]');
        await React.act(async () => {
            const start = new window.Event('touchstart', { bubbles: true }); start.touches = [{ clientX: 8, clientY: 100 }]; dialog.dispatchEvent(start);
            const end = new window.Event('touchend', { bubbles: true }); end.changedTouches = [{ clientX: 120, clientY: 110 }]; dialog.dispatchEvent(end);
        });
        assert.equal(closes, 1);
    });
});

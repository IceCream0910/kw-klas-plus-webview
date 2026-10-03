const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function source(relative, overrides = {}) {
    const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '..', relative), 'utf8'), {
        fileName: relative.replace(/\.js$/, '.jsx'),
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
    }).outputText;
    const module = { exports: {} };
    new Function('require', 'module', 'exports', code)(name => overrides[name] ?? require(name), module, module.exports);
    return module.exports;
}
const { KlasNativeBridgeAdapter } = source('lib/core/klasNativeBridge.js');
const settings = source('lib/core/deadlineNotificationSettings.js', { './klasNativeBridge': {} });
const methods = ['getNotificationCapabilities', 'openDeadlineNotificationSettings', 'getDeadlineNotificationState', 'setDeadlineNotificationsEnabled'];
const off = { enabled: false, pending: false, ready: true, permission: 'denied', status: 'IDLE' };
function environment(native, legacy = {}) { global.window = { KlasNativeBridgeNative: native, Android: legacy, setTimeout, clearTimeout }; }
test('capability requires the consent flow and state/set methods', async () => {
    const cap = { available: true, feature: 'deadlineReminders', schemaVersion: 1, consentFlow: 'nativePermissionSheet', supportedMethods: methods };
    const bridge = { isAvailable: () => true, getNotificationCapabilities: async () => cap };
    assert.equal(await settings.supportsDeadlineNotificationSettings(bridge), true);
    for (const value of [{ ...cap, available: false }, { ...cap, consentFlow: undefined }, { ...cap, feature: 'academicReminders' }, { ...cap, schemaVersion: 2 }, { ...cap, supportedMethods: ['openDeadlineNotificationSettings'] }]) {
        assert.equal(await settings.supportsDeadlineNotificationSettings({ ...bridge, getNotificationCapabilities: async () => value }), false);
    }
    assert.equal(await settings.supportsDeadlineNotificationSettings({ isAvailable: () => false }), false);
    assert.equal(await settings.supportsDeadlineNotificationSettings({ ...bridge, getNotificationCapabilities: async () => { throw Error('UNKNOWN_METHOD'); } }), false);
});
test('read and toggle use exact no-argument / boolean wire contract and validate failures', async () => {
    assert.deepEqual(await settings.readDeadlineNotificationState({ getDeadlineNotificationState: async (...args) => { assert.deepEqual(args, []); return off; } }), off);
    for (const enabled of [true, false]) assert.deepEqual(await settings.setDeadlineNotificationsEnabled(enabled, { setDeadlineNotificationsEnabled: async (...args) => { assert.deepEqual(args, [enabled]); return off; } }), off);
    await assert.rejects(settings.readDeadlineNotificationState({ getDeadlineNotificationState: async () => ({}) }));
    await assert.rejects(settings.setDeadlineNotificationsEnabled(true, { setDeadlineNotificationsEnabled: async () => ({ ...off, status: 'OPEN_FAILED' }) }));
});
test('all notification methods forbid legacy fallback while existing methods retain it', async () => {
    let calls = 0;
    const legacy = Object.fromEntries(methods.map(method => [method, () => { calls++; }]));
    legacy.openPage = () => { calls++; return 'legacy'; };
    environment(undefined, legacy);
    const adapter = new KlasNativeBridgeAdapter();
    for (const method of methods) { assert.equal(adapter.isAvailable(method), false); assert.throws(() => adapter.invoke(method)); }
    assert.equal(calls, 0); assert.equal(adapter.invoke('openPage'), 'legacy');
    const native = { postMessage: payload => { const req = JSON.parse(payload); queueMicrotask(() => native.onmessage({ data: { version: 1, id: req.id, ok: false, error: { code: 'UNKNOWN_METHOD' } } })); } };
    environment(native, legacy);
    for (const method of methods) await assert.rejects(adapter.invoke(method), /UNKNOWN_METHOD/);
    assert.equal(calls, 1); assert.equal(await adapter.invoke('openPage'), 'legacy'); assert.equal(calls, 2);
});
async function render(api, action) {
    const React = require('react');
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM('<div id="root"></div>', { url: 'https://klasplus.yuntae.in/settings' });
    global.window = dom.window; global.document = dom.window.document; global.IS_REACT_ACT_ENVIRONMENT = true;
    const Component = source('components/settings/SettingsDeadlineNotificationSection.js', {
        '../../lib/core/deadlineNotificationSettings': api, 'react-hot-toast': { error: () => {} },
        '../common/ToggleSwitch': source('components/common/ToggleSwitch.js', {
            '../../lib/core/klasNativeBridge': { isAvailable: () => false }
        })
    }).default;
    const root = require('react-dom/client').createRoot(document.getElementById('root'));
    try { await React.act(async () => { root.render(React.createElement(Component)); }); await action(React); }
    finally { await React.act(async () => root.unmount()); dom.window.close(); }
}
test('ON starts native sheet and cancellation rolls toggle back without a web permission CTA', async () => {
    let value = off; let requested;
    await render({ supportsDeadlineNotificationSettings: async () => true, readDeadlineNotificationState: async () => value,
        setDeadlineNotificationsEnabled: async enabled => { requested = enabled; return value = { ...off, pending: true }; } }, async React => {
        const input = document.querySelector('[role="switch"]');
        assert.equal(input.checked, false);
        await React.act(async () => input.click()); assert.equal(requested, true); assert.equal(input.checked, true); assert.equal(input.disabled, true);
        assert.doesNotMatch(document.body.textContent, /권한 허용하기|시스템 설정으로 이동/);
        value = { ...off, status: 'CANCELLED' };
        await React.act(async () => window.dispatchEvent(new window.Event('focus')));
        assert.equal(input.checked, false); assert.equal(input.disabled, false);
    });
});
test('native completion becomes ON and OFF saves through native bridge', async () => {
    let value = { ...off, enabled: true, permission: 'authorized', status: 'COMPLETED' }; let requested;
    await render({ supportsDeadlineNotificationSettings: async () => true, readDeadlineNotificationState: async () => value,
        setDeadlineNotificationsEnabled: async enabled => { requested = enabled; return value = off; } }, async React => {
        const input = document.querySelector('input'); assert.equal(input.checked, true);
        await React.act(async () => input.click()); assert.equal(requested, false); assert.equal(input.checked, false);
    });
});
test('failed OFF keeps prior state and offers recheck', async () => {
    await render({ supportsDeadlineNotificationSettings: async () => true, readDeadlineNotificationState: async () => ({ ...off, enabled: true }),
        setDeadlineNotificationsEnabled: async () => { throw Error('STORAGE_FAILED'); } }, async React => {
        const input = document.querySelector('input'); await React.act(async () => input.click());
        assert.equal(input.checked, true); assert.match(document.body.textContent, /다시 확인/);
    });
});
test('old native versions hide toggle', async () => {
    await render({ supportsDeadlineNotificationSettings: async () => false }, async () => { assert.equal(document.querySelector('input'), null); });
});
test('recheck resumes polling after the permission wait times out', async () => {
    let value = off;
    await render({ supportsDeadlineNotificationSettings: async () => true, readDeadlineNotificationState: async () => value,
        setDeadlineNotificationsEnabled: async () => value = { ...off, pending: true } }, async React => {
        const originalNow = Date.now;
        const originalInterval = window.setInterval;
        const originalClear = window.clearInterval;
        let now = 1000;
        let tick;
        let active = false;
        Date.now = () => now;
        window.setInterval = callback => { tick = callback; active = true; return 1; };
        window.clearInterval = () => { active = false; };
        try {
            await React.act(async () => document.querySelector('input').click());
            now += 120_001;
            await React.act(async () => tick());
            assert.match(document.body.textContent, /다시 확인/);
            await React.act(async () => document.querySelector('button').click());
            value = { ...off, enabled: true, status: 'COMPLETED' };
            assert.equal(active, true);
            await React.act(async () => tick());
            assert.equal(document.querySelector('input').checked, true);
            assert.equal(document.querySelector('input').disabled, false);
        } finally {
            Date.now = originalNow;
            window.setInterval = originalInterval;
            window.clearInterval = originalClear;
        }
    });
});

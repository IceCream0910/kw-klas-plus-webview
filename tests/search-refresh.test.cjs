const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

test('search blocks pull gestures and pending refresh callbacks, then restores normal scrolling rules', () => {
    let open = false, reloads = 0, options;
    const document = { querySelector: selector => selector === '[data-search-overlay]' && open ? {} : null, body: {} };
    const window = { scrollY: 0 };
    const dependencies = {
        pulltorefreshjs: { init: config => { options = config; return { destroy() {} }; } },
        './core/constants': { PULL_TO_REFRESH_CONFIG: {} },
        './core/klasNativeBridge': { reload: () => { reloads++; } },
    };
    const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/pullToRefreshUtils.js'), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const module = { exports: {} };
    new Function('require', 'module', 'exports', 'document', 'window', 'MutationObserver', code)(
        name => dependencies[name], module, module.exports, document, window,
        class { observe() {} disconnect() {} },
    );
    const refresh = module.exports.initializePullToRefresh();
    assert.equal(options.shouldPullToRefresh(), true);
    open = true;
    assert.equal(options.shouldPullToRefresh(), false);
    options.onRefresh();
    assert.equal(reloads, 0);
    open = false;
    window.scrollY = 100;
    assert.equal(options.shouldPullToRefresh(), false);
    window.scrollY = 0;
    assert.equal(options.shouldPullToRefresh(), true);
    options.onRefresh();
    assert.equal(reloads, 1);
    refresh.destroy();
});

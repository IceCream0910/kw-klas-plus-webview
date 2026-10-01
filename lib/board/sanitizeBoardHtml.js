import createDOMPurify from 'dompurify';

export function sanitizeBoardHtml(content, browserWindow = globalThis.window) {
    if (!browserWindow || typeof content !== 'string') return '';
    return createDOMPurify(browserWindow).sanitize(content, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
        FORBID_ATTR: ['style'],
        ALLOW_DATA_ATTR: false,
    });
}

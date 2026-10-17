import { parse } from 'node-html-parser';
import TurndownService from 'turndown';

export function officialPageMarkdown(html, url) {
    const root = parse(html);

    let targetElement = root.querySelector('div.contents-wrap-in');

    if (!targetElement) {
        const htmlLowerCase = html.toLowerCase();
        const hasContentsWrapIn = htmlLowerCase.includes('contents-wrap-in');
        const alternatives = [
            '.contents-wrap-in',
            'div[class*="contents-wrap-in"]',
            '[class*="contents-wrap-in"]',
            '.contents-wrap',
            '.content-wrap',
            '.contents',
            '.content',
            'main',
            '#content',
            '#contents'
        ];

        for (const selector of alternatives) {
            targetElement = root.querySelector(selector);
            if (targetElement) {
        break;
            }
        }
    }

    if (!targetElement) {
        targetElement = root.querySelector('body');
    }

    if (!targetElement) {
        targetElement = root;
    }

    let contentHtml = '';
    if (targetElement) {
        ['script', 'style', 'noscript', 'iframe', 'nav', 'header', 'footer', '.gnb', '.lnb', '.sidebar'].forEach(selector => {
            targetElement.querySelectorAll(selector).forEach(el => el.remove());
        });
        contentHtml = targetElement.innerHTML;
    }

    const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced'
    });

    turndownService.addRule('links', {
        filter: 'a',
        replacement: function (content, node) {
            const href = node.getAttribute('href');
            const absoluteHref = href ? new URL(href, url).toString() : '';
            return `[${content}](${absoluteHref})`;
        }
    });

    turndownService.addRule('images', {
        filter: 'img',
        replacement: function (content, node) {
            const alt = node.getAttribute('alt') || '';
            const src = node.getAttribute('src') || '';
            const absoluteSrc = src ? new URL(src, url).toString() : '';
            return `![${alt}](${absoluteSrc})`;
        }
    });

    let markdown = turndownService.turndown(contentHtml);

    markdown = markdown
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\s+|\s+$/g, '')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, linkUrl) => {
            try {
        const fetchedUrlOrigin = new URL(url).origin;
        const linkUrlObj = new URL(linkUrl);
        if (linkUrlObj.origin === fetchedUrlOrigin && (linkUrl.startsWith('#') || linkUrlObj.pathname === new URL(url).pathname)) {
            return text;
        }
            } catch (e) {
        if (linkUrl.startsWith('#') || linkUrl.startsWith('/')) {
            return text;
        }
            }
            return match;
        });

    return markdown.replace('글자확대 글자축소 [프린트](javascript:;)\n\n', '');
}

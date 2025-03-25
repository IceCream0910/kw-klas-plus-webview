import { parse } from 'node-html-parser';
import TurndownService from 'turndown';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }
      const html = await response.text();

      const root = parse(html);

      const targetElement = root.querySelector('div.contents-wrap-in');

      let contentHtml = '';
      if (targetElement) {
        ['script', 'style', 'noscript', 'iframe'].forEach(tag => {
          targetElement.querySelectorAll(tag).forEach(el => el.remove());
        });
        contentHtml = targetElement.innerHTML;
      } else {
        console.warn(`Element 'div.contents-wrap-in' not found on ${url}. Processing will result in empty content.`);
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

      res.status(200).json(markdown.replace('글자확대 글자축소 [프린트](javascript:;)\n\n', ''));
    } catch (error) {
      console.error('Error fetching or processing URL:', error);
      res.status(500).json({ error: `Failed to process the URL: ${error.message}` });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
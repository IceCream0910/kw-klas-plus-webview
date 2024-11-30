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
      const html = await response.text();

      // Parse HTML
      const root = parse(html);

      // Remove unnecessary elements
      ['script', 'style', 'noscript', 'iframe'].forEach(tag => {
        root.querySelectorAll(tag).forEach(el => el.remove());
      });

      // Extract main content
      let content = root.innerHTML;

      // Convert HTML to Markdown
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced'
      });

      // Preserve links
      turndownService.addRule('links', {
        filter: 'a',
        replacement: function (content, node) {
          const href = node.getAttribute('href');
          return `[${content}](${href})`;
        }
      });

      // Handle images
      turndownService.addRule('images', {
        filter: 'img',
        replacement: function (content, node) {
          const alt = node.getAttribute('alt') || '';
          const src = node.getAttribute('src') || '';
          return `![${alt}](${src})`;
        }
      });

      let markdown = turndownService.turndown(content);

      // Clean up and simplify the markdown
      markdown = markdown
        .replace(/\n{3,}/g, '\n\n')  // Remove excessive newlines
        .replace(/^\s+|\s+$/g, '')   // Trim whitespace
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
          if (url.startsWith('#') || url.startsWith('/')) {
            return text; // Remove internal links but keep the text
          }
          return match; // Keep external links
        });

      res.status(200).json({ markdown });
    } catch (error) {
      console.error('Error fetching or processing URL:', error);
      res.status(500).json({ error: 'Failed to process the URL' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
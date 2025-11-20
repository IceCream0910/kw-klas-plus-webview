import { parse } from 'node-html-parser';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = await getKwSitemap();
        if (!data) {
            return res.status(500).json({ error: 'Failed to fetch data' });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

function getFullUrl(href) {
    if (!href) return null;
    if (href.startsWith('http')) {
        return href;
    } else {
        return `https://www.kw.ac.kr${href}`;
    }
}

async function getKwSitemap() {
    try {
        const response = await fetch('https://www.kw.ac.kr/ko/info/sitemap.jsp', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = await response.text();
        const root = parse(html);
        const sitemapBoxes = root.querySelectorAll('.sitemap-box');

        const sections = [];

        sitemapBoxes.forEach(sectionElement => {
            const titleElement = sectionElement.querySelector('h3');
            if (!titleElement) return;

            const title = titleElement.text.trim();
            const sitemapBlock = sectionElement.querySelector('.sitemap-block');
            const ul = sitemapBlock?.querySelector('ul');

            const categories = [];
            const links = [];

            if (ul) {
                ul.querySelectorAll('li').forEach(li => {
                    const dl = li.querySelector('dl');
                    if (dl) {
                        const dt = dl.querySelector('dt');
                        const a = dt?.querySelector('a');
                        if (!a) return;

                        const categoryTitle = a.text.trim();
                        const categoryHref = a.getAttribute('href');
                        const categoryLink = getFullUrl(categoryHref);

                        if (!categoryTitle || !categoryLink) return;

                        const subLinks = [];
                        dl.querySelectorAll('dd a').forEach(ddA => {
                            const subTitle = ddA.text.trim();
                            const subHref = ddA.getAttribute('href');
                            const subLink = getFullUrl(subHref);

                            if (subTitle && subLink) {
                                subLinks.push({
                                    t: subTitle,
                                    l: subLink
                                });
                            }
                        });

                        categories.push({
                            t: categoryTitle,
                            l: categoryLink,
                            subs: subLinks.length > 0 ? subLinks : undefined
                        });
                    } else {
                        const strongA = li.querySelector('strong a');
                        if (strongA) {
                            const linkTitle = strongA.text.trim();
                            const linkHref = strongA.getAttribute('href');
                            const link = getFullUrl(linkHref);

                            if (linkTitle && link) {
                                links.push({
                                    t: linkTitle,
                                    l: link
                                });
                            }
                        }
                    }
                });
            }

            sections.push({
                cat: categories.length > 0 ? categories : undefined,
                ls: links.length > 0 ? links : undefined
            });
        });

        return sections;

    } catch (error) {
        console.error('Error fetching sitemap:', error);
        return [];
    }
}
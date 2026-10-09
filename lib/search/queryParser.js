export const normalize = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[_./-]/g, ' ').replace(/\s+/g, ' ').trim();
export function isNaturalLanguageQuery(query) {
    const text = normalize(query);
    return text.length >= 6 && /알려\s*줘|찾아\s*줘|정리\s*해|요약\s*해|설명\s*해|추천\s*해|비교\s*해|도와\s*줘|계획\s*해|언제|어떻게|왜\s|뭐였|무엇|뭔가요|인가요|있나요|할까요|해\s*줄래|해\s*줘|[?？]$/.test(text);
}
export function parseQuery(query, courses = [], now = Date.now()) {
    const normalized = normalize(query).slice(0, 200);
    const selected = courses.filter(course => normalized.includes(normalize(course.courseName)));
    let keyword = normalized;
    for (const course of selected) keyword = keyword.replace(normalize(course.courseName), ' ');
    const kinds = /자료|강의자료/.test(keyword) ? ['material'] : /공지/.test(keyword) ? ['notice'] : ['notice', 'material'];
    let since = null, until = null;
    if (/지난주/.test(keyword)) {
        const date = new Date(now + 9 * 3600000);
        const monday = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - (date.getUTCDay() + 6) % 7) - 9 * 3600000;
        since = monday - 7 * 86400000; until = monday;
    }
    keyword = keyword.replace(/지난주|교수님이|올린|알려줘|찾아줘|뭐였지|무엇인가요|공지사항|강의자료|공지|자료실/g, ' ').replace(/[?？]/g, '').replace(/\s+/g, ' ').trim();
    return { raw: query, keyword: keyword || normalized, courses: selected.length ? selected : courses, kinds, since, until,
        wantsAnswer: /요약|비교|뭐였지|알려줘|무엇/.test(normalized) };
}
export function localSearch(items, query, now = Date.now()) {
    const terms = normalize(query).split(' ').filter(Boolean);
    if (!terms.length) return [];
    const aliases = term => /중간고사|중간시험|midterm/.test(term) ? ['중간고사', '중간시험', 'midterm', '시험'] : [term];
    return items.filter(item => item.kind === 'menu' || now - item.fetchedAt < 7 * 86400000).map(item => {
        const title = normalize(item.title), course = normalize(item.courseName);
        const score = terms.reduce((sum, term) => sum + Math.max(...aliases(term).map(word => title.includes(word) ? 3 : course.includes(word) ? 1 : 0)), 0);
        return { ...item, score, stale: item.kind !== 'menu' && now - item.fetchedAt >= 86400000 };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score || b.fetchedAt - a.fetchedAt).slice(0, 150);
}

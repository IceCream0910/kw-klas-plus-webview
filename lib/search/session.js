let session = '';
export function setSearchSession(value) { session = typeof value === 'string' ? value : ''; }
export function getSearchSession() { return session; }

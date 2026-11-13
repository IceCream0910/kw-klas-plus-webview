export function decodeDeadlineFeed(status, json) {
  if (status === 'PARTIAL' && json === '') return { status, data: [] };
  if (status === 'READY' || status === 'PARTIAL') {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data)) return { status, data };
    } catch {
      // 잘못된 응답은 기존 목록을 유지한다.
    }
  }
  return { status: 'FAILED', data: null };
}

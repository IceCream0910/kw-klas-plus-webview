export function deadlineLabel(value) {
    const match = typeof value === 'string' && value.match(/^(\d{4})-?(\d{2})-?(\d{2})(?:[ T]?(\d{2}):?(\d{2}))?/);
    if (!match) return '마감일 미확인';
    const [, year, month, day, hour, minute] = match;
    return `${year}.${month}.${day}${hour ? ` ${hour}:${minute}` : ''} 마감`;
}

export function resultMetadata(item) {
    const parts = [item.courseName];
    if (item.kind === 'task' || item.kind === 'teamTask') {
        parts.push(item.completionState === 'complete' ? '완료' : item.completionState === 'incomplete' ? '미완료' : '완료 여부 미확인');
        parts.push(deadlineLabel(item.endsAt));
    } else if (item.kind === 'onlineLecture') {
        parts.push(item.completionState === 'complete' ? '수강 완료' : item.completionState === 'incomplete' ? '미수강' : '수강 여부 미확인');
    }
    if (item.stale) parts.push('이전 조회 정보');
    return parts.filter(Boolean).join(' · ');
}

export function resultChips(item) {
    const chips = [];
    if (item.courseName) {
        let hash = 0;
        for (const char of item.courseId || item.courseName) hash = (hash * 31 + char.charCodeAt(0)) | 0;
        chips.push({ type: 'course', label: item.courseName, hue: ((hash % 360) + 360) % 360 });
    }
    if (['task', 'teamTask', 'onlineLecture'].includes(item.kind)) chips.push({ type: 'completion', label: item.completionState === 'complete' ? '완료' : item.completionState === 'incomplete' ? '미완료' : '상태 미확인' });
    if (['task', 'teamTask'].includes(item.kind)) chips.push({ type: 'deadline', label: deadlineLabel(item.endsAt) });
    if (item.publishedAt) chips.push({ type: 'date', label: item.publishedAt.slice(0, 10) });
    if (item.stale) chips.push({ type: 'stale', label: '이전 조회' });
    return chips;
}

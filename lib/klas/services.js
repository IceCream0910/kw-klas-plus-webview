import { KLAS } from '../core/klas';
import { isNativeFeatureCompatible } from '../core/nativeApp';
import { aggregateLecturePlan, aggregateLectureNotices } from './aggregates';
async function legacyService(url, payload) {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
}
export function loadLecturePlan(token, subj) {
    return isNativeFeatureCompatible('klasApi') ? aggregateLecturePlan(KLAS, token, subj) : legacyService('/api/lecturePlan', { token, subj });
}
export function loadLectureNotices(token, all = false) {
    return isNativeFeatureCompatible('klasApi') ? aggregateLectureNotices(KLAS, token, all) : legacyService('/api/lectureNotice', { token, all });
}

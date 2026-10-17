const PLAN_ENDPOINTS = {
    lecturePlan: 'LectrePlanData.do', lectureTime: 'LectreTimeInfo.do', lectureAssistant: 'LectreAstnt.do',
    lectureTeam: 'LectreTeam.do', lectureEngineerCourse: 'LectreEnginerGwamok.do', lecturePlanTab4: 'LectrePlanInputTabFourgrid.do',
    lecturePrerequisite: 'LectreBeforeGwamok.do', lecturePlanTab6: 'LectrePlanInputTabSixInfo.do', lectureStdCrtNum: 'popup/LectrePlanStdCrtNum.do',
};
export async function aggregateLecturePlan(request, token, subj) {
    if (typeof subj !== 'string' || !subj || subj.length > 128) throw new Error('INVALID_SUBJECT');
    const entries = await Promise.all(Object.entries(PLAN_ENDPOINTS).map(async ([key, endpoint]) => {
        try { return [key, await request(`https://klas.kw.ac.kr/std/cps/atnlc/${endpoint}`, token, { selectSubj: subj })]; }
        catch (error) {
            if (['SESSION_REQUIRED', 'SESSION_EXPIRED', 'AUTH_ACTION_REQUIRED', 'STALE_SESSION'].includes(error.code)) throw error;
            return [key, null];
        }
    }));
    return { success: true, data: Object.fromEntries(entries.filter(([, value]) => value !== null)) };
}
export async function aggregateLectureNotices(request, token, all = false) {
    const page = index => request('https://klas.kw.ac.kr/mst/sys/optrn/SelectPushMsgHisList.do', token, { pageInit: index === 0, currentPage: index, list: [], page: {} });
    const first = await page(0);
    const pages = first.page?.totalPages ?? 1;
    if (!Number.isInteger(pages) || pages < 0 || pages > 1000) throw new Error('INVALID_PAGE_COUNT');
    const notices = [...(first.list || [])];
    if (all) {
        // 페이지 순서를 유지하면서 한 번에 세 페이지만 조회한다.
        for (let index = 1; index < pages; index += 3) {
            const results = await Promise.all(Array.from({ length: Math.min(3, pages - index) }, (_, offset) => page(index + offset)));
            for (const result of results) notices.push(...(result.list || []));
        }
    }
    return { notices };
}

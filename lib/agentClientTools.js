import { KLAS } from './core/klas';
import { menuItems } from './profile/menuItems';

const COURSE_ENDPOINTS = {
    searchCourseInfo: 'https://klas.kw.ac.kr/std/lis/evltn/LctrumHomeStdInfo.do',
    searchTaskList: 'https://klas.kw.ac.kr/std/lis/evltn/TaskStdList.do'
};

const BOARD_PATHS = {
    notice: 'd052b8f845784c639f036b102fdc3023',
    qna: '573f918c23984ae8a88c398051bb1263',
    materials: '6972896bfe72408eb72926780e85d041',
    studentMaterials: '70778131bf7a421aba99dded74b3fb6b'
};

const LECTURE_PLAN_DETAIL_ENDPOINTS = {
    lecturePlan: 'LectrePlanData.do', lectureTime: 'LectreTimeInfo.do', lectureAssistant: 'LectreAstnt.do',
    lectureTeam: 'LectreTeam.do', lectureEngineerCourse: 'LectreEnginerGwamok.do',
    lecturePlanTab4: 'LectrePlanInputTabFourgrid.do', lecturePrerequisite: 'LectreBeforeGwamok.do',
    lecturePlanTab6: 'LectrePlanInputTabSixInfo.do', lectureStdCrtNum: 'popup/LectrePlanStdCrtNum.do'
};

export const TOOL_LABELS = {
    getSubjectList: '수강 과목 확인', searchCourseInfo: '강의 정보 조회', searchTaskList: '과제 목록 조회',
    getGrades: '성적 조회', getRanking: '석차 조회', getScholarships: '장학 내역 조회',
    getStudentProfile: '학적·학생 정보 조회', getAdvisor: '지도교수 조회', getLectureSchedule: '강의 시간표 조회',
    getOnlineLectures: '온라인 강의 조회', getKLASNotices: 'KLAS 알림 조회', getLectureBoardList: '강의 게시판 조회',
    getLectureBoardDetail: '게시글 상세 조회', getBoardAttachments: '게시글 첨부 조회', getLecturePlanFilters: '강의계획서 검색조건 조회',
    searchLecturePlans: '강의계획서 검색', getLecturePlanDetail: '강의계획서 상세 조회',
    getCalendarEvents: '개인 일정 조회', createCalendarEvent: '개인 일정 추가', updateCalendarEvent: '개인 일정 수정', deleteCalendarEvent: '개인 일정 삭제',
    getKWNoticeList: '최신 공지 조회', searchKWNoticeList: '공지사항 검색',
    getSchedules: '학사일정 조회', getHaksik: '학식 메뉴 조회', getHomepageSitemap: '학교 홈페이지 탐색',
    getContentFromUrl: '공식 페이지 읽기', getPortalMenus: 'KLAS 메뉴 확인'
};

export async function fetchAcademicProfile(sessionToken = '') {
    return requireSession(sessionToken, () => KLAS('https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreHakjukInfo.do', sessionToken, {}));
}

export async function executeClientTool(name, args = {}, sessionToken = '') {
    const session = sessionToken;
    switch (name) {
        case 'getSubjectList': return requireSession(session, () => KLAS('https://klas.kw.ac.kr/std/cmn/frame/YearhakgiAtnlcSbjectList.do', session, {}));
        case 'searchCourseInfo':
        case 'searchTaskList': return requireSession(session, () => KLAS(COURSE_ENDPOINTS[name], session, coursePayload(args)));
        case 'getGrades': return requireSession(session, async () => ({
            semesters: await KLAS('https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreSungjukInfo.do', session, {}),
            totals: await KLAS('https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreSungjukTot.do', session, {})
        }));
        case 'getRanking': return requireSession(session, () => KLAS('https://klas.kw.ac.kr/std/cps/inqire/StandStdList.do', session, {}));
        case 'getScholarships': return requireSession(session, () => KLAS('https://klas.kw.ac.kr/std/cps/inqire/JanghakHistoryStdList.do', session, {}));
        case 'getStudentProfile': return requireSession(session, async () => ({
            academic: await fetchAcademicProfile(session),
            learning: await KLAS('https://klas.kw.ac.kr/mst/lis/evltn/LrnSttusStdOne.do', session, {})
        }));
        case 'getAdvisor': return requireSession(session, () => KLAS('https://klas.kw.ac.kr/std/cmn/frame/StdHome.do', session, { searchYearhakgi: validYearHakgi(args.yearHakgi) }));
        case 'getLectureSchedule': return requireSession(session, () => KLAS('https://klas.kw.ac.kr/std/cmn/frame/LctrumSchdulInfo.do', session, lectureContext(args, false)));
        case 'getOnlineLectures': return requireSession(session, () => KLAS('https://klas.kw.ac.kr/std/lis/evltn/SelectOnlineCntntsStdList.do', session, lectureContext(args)));
        case 'getKLASNotices': return requireSession(session, () => KLAS('https://klas.kw.ac.kr/mst/sys/optrn/SelectPushMsgHisList.do', session, noticePayload(args)));
        case 'getLectureBoardList': return requireSession(session, () => KLAS(boardUrl(args.boardType, 'BoardStdList.do'), session, { ...lectureContext(args), currentPage: validPage(args.page) }));
        case 'getLectureBoardDetail': return requireSession(session, () => KLAS(boardUrl(args.boardType, 'BoardStdView.do'), session, {
            cmd: 'select', ...lectureContext(args), boardNo: requiredIdentifier(args.boardNo, 'boardNo'),
            masterNo: requiredIdentifier(args.masterNo, 'masterNo'), storageId: 'CLS_BOARD'
        }));
        case 'getBoardAttachments': return requireSession(session, () => KLAS('https://klas.kw.ac.kr/common/file/UploadFileList.do', session, {
            attachId: requiredIdentifier(args.attachId, 'attachId'), storageId: 'CLS_BOARD'
        }));
        case 'getLecturePlanFilters': return requireSession(session, () => lecturePlanFilters(session, args));
        case 'searchLecturePlans': return requireSession(session, () => KLAS('https://klas.kw.ac.kr/std/cps/atnlc/LectrePlanStdList.do', session, lecturePlanSearchPayload(args)));
        case 'getLecturePlanDetail': return requireSession(session, () => lecturePlanDetail(session, args));
        case 'getCalendarEvents': return requireSession(session, () => KLAS('https://klas.kw.ac.kr/std/ads/admst/MySchdulMonthTableList.do', session, monthRange(args)));
        case 'createCalendarEvent': return requireSession(session, () => KLAS('https://klas.kw.ac.kr/std/ads/admst/MySchdulSave.do', session, calendarEventPayload(args)));
        case 'updateCalendarEvent': return requireSession(session, () => KLAS('https://klas.kw.ac.kr/std/ads/admst/MySchdulSave.do', session, calendarEventPayload(args, true)));
        case 'deleteCalendarEvent': return requireSession(session, () => KLAS('https://klas.kw.ac.kr/std/ads/admst/MySchdulDelete.do', session, calendarEventPayload(args, true)));
        case 'getKWNoticeList': return fetchJson('/api/crawler/kwNotice');
        case 'searchKWNoticeList': return fetchJson(`/api/crawler/kwNotice?query=${encodeURIComponent(requiredString(args.query, 'query'))}`);
        case 'getSchedules': return fetchJson('/api/crawler/schedule');
        case 'getHaksik': return fetchJson('/api/crawler/cafeteria');
        case 'getHomepageSitemap': return fetchJson('/api/crawler/kwSitemap');
        case 'getContentFromUrl': return readOfficialPages(args.urls);
        case 'getPortalMenus': return menuItems;
        default: throw new Error(`지원하지 않는 도구입니다: ${name}`);
    }
}

function calendarEventPayload(args, requireId = false) {
    const start = validDate(args.startDate, 'startDate');
    const end = validDate(args.endDate, 'endDate');
    const startMinutes = validTime(args.startHour, args.startMinute, '시작');
    const endMinutes = validTime(args.endHour, args.endMinute, '종료');
    if (`${end} ${String(args.endHour).padStart(2, '0')}:${String(args.endMinute).padStart(2, '0')}`
        < `${start} ${String(args.startHour).padStart(2, '0')}:${String(args.startMinute).padStart(2, '0')}`) {
        throw new Error('종료 시각은 시작 시각보다 빨라서는 안 됩니다.');
    }
    return {
        gubun: '10', grcodeList: [], yearhakgiList: [], subjList: [], selectGrcode: null,
        selectYearhakgi: ',', selectSubj: null, title: requiredString(args.title, 'title').slice(0, 100),
        weightgubun: 'M', place: typeof args.place === 'string' ? args.place.slice(0, 100) : null,
        sdate: start, stimeHour: Math.floor(startMinutes / 60), stimeMin: startMinutes % 60,
        edate: end, etimeHour: Math.floor(endMinutes / 60), etimeMin: endMinutes % 60,
        contents: null, schdulId: requireId ? requiredIdentifier(args.scheduleId, 'scheduleId') : null,
        schdulColor: /^#[0-9A-Fa-f]{6}$/.test(args.color || '') ? args.color : '#87373B'
    };
}

function lectureContext(args, includeChange = true) {
    return {
        selectYearhakgi: validYearHakgi(args.yearHakgi),
        selectSubj: requiredString(args.courseCode, 'courseCode'),
        ...(includeChange ? { selectChangeYn: 'Y' } : {})
    };
}

function validYearHakgi(value) {
    const yearHakgi = value || localStorage.getItem('currentYearHakgi');
    if (typeof yearHakgi !== 'string' || !/^20\d{2},[1-4]$/.test(yearHakgi)) throw new Error('yearHakgi 값이 올바르지 않습니다.');
    return yearHakgi;
}

function noticePayload({ page = 0 }) {
    return { pageInit: page === 0, currentPage: validPage(page), list: [], page: {} };
}

function validPage(value = 0) {
    if (!Number.isInteger(value) || value < 0 || value > 100) throw new Error('page 값이 올바르지 않습니다.');
    return value;
}

function boardUrl(boardType, action) {
    const path = BOARD_PATHS[boardType];
    if (!path) throw new Error('지원하지 않는 강의 게시판입니다.');
    return `https://klas.kw.ac.kr/std/lis/sport/${path}/${action}`;
}

async function lecturePlanFilters(session, args) {
    const year = validYear(args.year);
    const hakgi = validHakgi(args.hakgi);
    const [subjects, departments] = await Promise.all([
        KLAS('https://klas.kw.ac.kr/std/cps/atnlc/CmmnGamokList.do', session, { stopFlag: '' }),
        KLAS('https://klas.kw.ac.kr/std/cps/atnlc/CmmnHakgwaList.do', session, { selectYear: year, selecthakgi: hakgi })
    ]);
    const majors = args.departmentCode
        ? await KLAS('https://klas.kw.ac.kr/std/cps/atnlc/CmmnMagerCodeList.do', session, { selecthakgwa: requiredString(args.departmentCode, 'departmentCode') })
        : [];
    return { subjects, departments, majors };
}

function lecturePlanSearchPayload(args) {
    return {
        selectYear: validYear(args.year), selecthakgi: validHakgi(args.hakgi), selectRadio: args.onlyMine ? 'my' : 'all',
        selectText: optionalString(args.courseName, 100), selectProfsr: optionalString(args.professor, 100),
        cmmnGamok: optionalString(args.commonSubjectCode, 40), selecthakgwa: optionalString(args.departmentCode, 40),
        selectMajor: optionalString(args.majorCode, 40)
    };
}

async function lecturePlanDetail(session, args) {
    const payload = { selectSubj: requiredString(args.courseCode, 'courseCode') };
    const entries = await Promise.all(Object.entries(LECTURE_PLAN_DETAIL_ENDPOINTS).map(async ([key, endpoint]) => [
        key, await KLAS(`https://klas.kw.ac.kr/std/cps/atnlc/${endpoint}`, session, payload)
    ]));
    return Object.fromEntries(entries);
}

function validYear(value) {
    if (!Number.isInteger(value) || value < 2000 || value > 2100) throw new Error('year 값이 올바르지 않습니다.');
    return value;
}

function validHakgi(value) {
    if (!Number.isInteger(value) || value < 1 || value > 4) throw new Error('hakgi 값이 올바르지 않습니다.');
    return value;
}

function requiredIdentifier(value, key) {
    if ((typeof value !== 'string' && typeof value !== 'number') || !/^[A-Za-z0-9_-]{1,100}$/.test(String(value))) throw new Error(`${key} 값이 올바르지 않습니다.`);
    return value;
}

function optionalString(value, maxLength) {
    return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function validDate(value, key) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00`))) {
        throw new Error(`${key} 날짜가 올바르지 않습니다.`);
    }
    return value;
}

function validTime(hour, minute, label) {
    if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
        throw new Error(`${label} 시간이 올바르지 않습니다.`);
    }
    return hour * 60 + minute;
}

function coursePayload(args) {
    const yearHakgi = localStorage.getItem('currentYearHakgi');
    const courseCode = requiredString(args.courseCode, 'courseCode');
    const courseLabel = requiredString(args.courseLabel, 'courseLabel');
    const courseName = requiredString(args.courseName, 'courseName');
    if (!yearHakgi) throw new Error('현재 학기 정보가 없습니다. 앱 홈을 새로고침해 주세요.');
    return { selectYearhakgi: yearHakgi, selectSubj: courseCode, selectChangeYn: 'Y', subjNm: courseLabel,
        subj: { value: courseCode, label: courseLabel, name: courseName } };
}

function monthRange({ year, month }) {
    if (!Number.isInteger(year) || !Number.isInteger(month) || year < 2020 || year > 2100 || month < 1 || month > 12) throw new Error('유효한 연도와 월이 필요합니다.');
    const mm = String(month).padStart(2, '0');
    return { start: `${year}-${mm}-01`, end: `${year}-${mm}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}` };
}

async function readOfficialPages(urls) {
    if (!Array.isArray(urls) || urls.length < 1 || urls.length > 3) throw new Error('한 번에 1~3개 URL만 읽을 수 있습니다.');
    const allowed = urls.map((value) => {
        const url = new URL(value);
        if (url.protocol !== 'https:' || !(url.hostname === 'kw.ac.kr' || url.hostname.endsWith('.kw.ac.kr'))) throw new Error('광운대학교 공식 HTTPS 페이지에만 접근할 수 있습니다.');
        return url.toString();
    });
    return Promise.all(allowed.map(async (url) => {
        const data = await fetchJson(`/api/crawler/turndown?url=${encodeURIComponent(url)}`);
        return { url, markdown: data.markdown };
    }));
}

async function requireSession(session, operation) {
    if (!session) throw new Error('KLAS 로그인 세션이 없습니다. 앱에서 다시 로그인해 주세요.');
    return operation();
}
async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`조회에 실패했습니다 (${response.status}).`);
    return response.json();
}
function requiredString(value, key) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${key} 값이 필요합니다.`);
    return value.trim();
}

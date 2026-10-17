export const KLAS_ORIGIN = 'https://klas.kw.ac.kr';
export const KLAS_PATHS = new Set([
    "/std/cps/inqire/AtnlcScreHakjukInfo.do",
    "/std/cps/inqire/AtnlcScreSungjukInfo.do",
    "/std/cps/inqire/AtnlcScreSungjukTot.do",
    "/std/cps/inqire/StandStdList.do",
    "/std/cps/inqire/JanghakHistoryStdList.do",
    "/mst/lis/evltn/LrnSttusStdOne.do",
    "/std/cmn/frame/StdHome.do",
    "/std/cmn/frame/YearhakgiAtnlcSbjectList.do",
    "/std/cmn/frame/LctrumSchdulInfo.do",
    "/std/lis/evltn/LctrumHomeStdInfo.do",
    "/std/lis/evltn/SelectOnlineCntntsStdList.do",
    "/std/lis/evltn/TaskStdList.do",
    "/mst/sys/optrn/SelectPushMsgHisList.do",
    "/common/file/UploadFileList.do",
    "/std/ads/admst/MySchdulMonthTableList.do",
    "/std/ads/admst/MySchdulSave.do",
    "/std/ads/admst/MySchdulDelete.do",
    "/std/cps/atnlc/CmmnGamokList.do",
    "/std/cps/atnlc/CmmnHakgwaList.do",
    "/std/cps/atnlc/CmmnMagerCodeList.do",
    "/std/cps/atnlc/LectrePlanStdList.do",
    "/std/cps/atnlc/LectrePlanData.do",
    "/std/cps/atnlc/LectreTimeInfo.do",
    "/std/cps/atnlc/LectreAstnt.do",
    "/std/cps/atnlc/LectreTeam.do",
    "/std/cps/atnlc/LectreEnginerGwamok.do",
    "/std/cps/atnlc/LectrePlanInputTabFourgrid.do",
    "/std/cps/atnlc/LectreBeforeGwamok.do",
    "/std/cps/atnlc/LectrePlanInputTabSixInfo.do",
    "/std/cps/atnlc/popup/LectrePlanStdCrtNum.do",
    "/std/lis/sport/d052b8f845784c639f036b102fdc3023/BoardStdList.do",
    "/std/lis/sport/d052b8f845784c639f036b102fdc3023/BoardStdView.do",
    "/std/lis/sport/573f918c23984ae8a88c398051bb1263/BoardStdList.do",
    "/std/lis/sport/573f918c23984ae8a88c398051bb1263/BoardStdView.do",
    "/std/lis/sport/6972896bfe72408eb72926780e85d041/BoardStdList.do",
    "/std/lis/sport/6972896bfe72408eb72926780e85d041/BoardStdView.do",
    "/std/lis/sport/70778131bf7a421aba99dded74b3fb6b/BoardStdList.do",
    "/std/lis/sport/70778131bf7a421aba99dded74b3fb6b/BoardStdView.do"
]);
export function klasUrl(value) {
    if (typeof value !== 'string' || value !== value.trim() || /[\\\x00-\x20\x7f]/.test(value)) throw new Error('INVALID_ENDPOINT');
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'klas.kw.ac.kr' || url.port || url.username || url.password || url.hash) throw new Error('INVALID_ENDPOINT');
    return url;
}
export function klasPath(value) {
    const url = klasUrl(value);
    if (url.search || !KLAS_PATHS.has(url.pathname) || value.includes('%') || /\/\.\.?\//.test(value)) throw new Error('INVALID_ENDPOINT');
    return url.pathname;
}
export function isKlasMutation(path) {
    return /\/MySchdul(Save|Delete)\.do$/.test(path);
}
export class KlasApiError extends Error {
    constructor(code, status) { super(code === 'OUTCOME_UNKNOWN' ? '처리 결과를 확인할 수 없습니다. 목록을 조회해 반영 여부를 확인하고 같은 변경을 자동으로 다시 실행하지 마세요.' : code); this.name = 'KlasApiError'; this.code = code; this.status = status; }
}

export const KLAS_PAGE_PATHS = new Set([
    '/std/cps/inqire/StandStdPage.do',
    '/std/cps/inqire/JanghakStdPage.do',
    '/std/cps/inqire/AtnlcScreStdPage.do',
    "/",
    "/mst/ads/admst/SklgrndTelNoMstPage.do",
    "/std/ads/admst/AstntRptStdPage.do",
    "/std/ads/admst/KwAttendStdPage.do",
    "/std/ads/admst/MySchdulPage.do",
    "/std/ads/admst/RsvTrnsfrnStdPage.do",
    "/std/ads/admst/SklstfAptdExamStdPage.do",
    "/std/cps/atnlc/AppDownloadPage.do",
    "/std/cps/atnlc/CdpAtendStdPage.do",
    "/std/cps/atnlc/ExchgHakjumStdPage.do",
    "/std/cps/atnlc/GiveupStdPage.do",
    "/std/cps/atnlc/TimetableStdPage.do",
    "/std/cps/inqire/DelHakjumStdPage.do",
    "/std/cps/inqire/GyoyangIsuStdPage.do",
    "/std/cps/inqire/IndividualPortfolio.do",
    "/std/cps/inqire/LctreEvlResultStdPage.do",
    "/std/cps/inqire/LctreEvlStdPage.do",
    "/std/cps/inqire/ToeicStdPage.do",
    "/std/egn/chck/BeforeSbjectStdPage.do",
    "/std/egn/chck/DgriChangeStdPage.do",
    "/std/egn/chck/LrnRsltStdPage.do",
    "/std/egn/chck/PrtFolioStdPage.do",
    "/std/egn/chck/popwin/BeforeSbjectGradeViewStdPage.do",
    "/std/egn/cnslt/CnsltDetailStdPage.do",
    "/std/egn/cnslt/SuhakPlanStdPage.do",
    "/std/egn/cnslt/TrnsPntRCnsltStdPage.do",
    "/std/egn/sesdg/EgnSurveyStdPage.do",
    "/std/egn/sesdg/EssayReprtStdPage.do",
    "/std/ext/grdtn/GrdtnYnImprtyResnStdPage.do",
    "/std/hak/cnslt/CnsltStsfdgRsrchStdPage.do",
    "/std/hak/cnslt/CnsltTimeStdPage.do",
    "/std/hak/cnslt/KwAbilUpStdPage.do",
    "/std/hak/cnslt/UdCnsAplyStdPage.do",
    "/std/hak/erollmnt/PartPayNhtPage.do",
    "/std/hak/erollmnt/PreSeterPage.do",
    "/std/hak/erollmnt/SenalClNtPage.do",
    "/std/hak/erollmnt/TutionEduPage.do",
    "/std/hak/erollmnt/TutionNtPage.do",
    "/std/hak/hakjuk/CntcSbjectStdPage.do",
    "/std/hak/hakjuk/CompnoMajorStdPage.do",
    "/std/hak/hakjuk/DetailMajorSelectStdPage.do",
    "/std/hak/hakjuk/LiberalMajorStdPage.do",
    "/std/hak/hakjuk/MicroMajorStdPage.do",
    "/std/hak/hakjuk/TmpabssklStdPage.do",
    "/std/lis/evltn/AnytmQuizStdPage.do",
    "/std/lis/evltn/DscsnStdPage.do",
    "/std/lis/evltn/LctrumHomeStdPage.do",
    "/std/lis/evltn/LrnSttusRtprgsStdPage.do",
    "/std/lis/evltn/LrnSttusStdPage.do",
    "/std/lis/evltn/OnlineCntntsStdPage.do",
    "/std/lis/evltn/OnlineTestStdPage.do",
    "/std/lis/evltn/PrjctStdPage.do",
    "/std/lis/evltn/TaskStdPage.do",
    "/std/lis/lctre/EClassStdPage.do",
    "/std/lis/sport/573f918c23984ae8a88c398051bb1263/BoardQnaListStdPage.do",
    "/std/lis/sport/6972896bfe72408eb72926780e85d041/BoardListStdPage.do",
    "/std/lis/sport/70778131bf7a421aba99dded74b3fb6b/BoardListStdPage.do",
    "/std/lis/sport/DicStdPage.do",
    "/std/lis/sport/QustnrStdPage.do",
    "/std/lis/sport/d052b8f845784c639f036b102fdc3023/BoardListStdPage.do",
    "/std/sys/optrn/MyNumberQrStdPage.do",
    "/std/sys/optrn/c9925e2c1341487ebc7595ba8b64376e/BoardListStdPage.do"
]);

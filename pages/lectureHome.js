import { useState, useEffect } from 'react';
import Spacer from './components/spacer';
import IonIcon from '@reacticons/ionicons';
import { KLAS } from './utils/klas';

export default function LectureHome() {
    const [data, setData] = useState(null);
    const [subjectInfo, setSubjectInfo] = useState(null);
    const [subjectPlaceTime, setSubjectPlaceTime] = useState(null);
    const [attendExpand, setAttendExpand] = useState(false);

    useEffect(() => {
        window.receivedData = function (token, subj, yearHakgi) {
            if (!token || !subj || !yearHakgi) return;
            fetchSubjectInfo(token, subj);
            fetchSubjectPlaceTime(token, subj, yearHakgi);

            KLAS("https://klas.kw.ac.kr/std/lis/evltn/LctrumHomeStdInfo.do", token, {
                "selectYearhakgi": yearHakgi,
                "selectSubj": subj,
                "selectChangeYn": "Y"
            })
                .then((data) => {
                    console.log(data);
                    setData(data);
                })
                .catch((error) => {
                    console.error(error);
                });
        };

    }, []);

    const fetchSubjectInfo = (token, subj) => {
        KLAS("https://klas.kw.ac.kr/std/cmn/frame/YearhakgiAtnlcSbjectList.do", token, {})
            .then(data => {
                const subject = data.flatMap(semester => semester.subjList).find(subject => subject.value === subj);
                setSubjectInfo(subject);
            })
            .catch(error => {
                console.error(error);
            });
    }

    const fetchSubjectPlaceTime = (token, subj, yearHakgi) => {
        KLAS("https://klas.kw.ac.kr/std/cmn/frame/LctrumSchdulInfo.do", token, {
            "selectYearhakgi": yearHakgi,
            "selectSubj": subj
        })
            .then((data) => {
                setSubjectPlaceTime(data);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    // 출석 현황 관련 함수
    const calculateStats = (data) => {
        let totalClasses = 0;
        let attendanceCount = 0;
        let lateCount = 0;
        let absentCount = 0;

        data.forEach(item => {
            ['pgr1', 'pgr2', 'pgr3', 'pgr4'].forEach(key => {
                const value = item[key];
                if (value && value !== '-') {
                    totalClasses++;
                    if (value === 'O') attendanceCount++;
                    if (value === 'L') lateCount++;
                    if (value === 'X') absentCount++;
                }
            });
        });

        const attendanceRate = totalClasses > 0 ? (attendanceCount / totalClasses) * 100 : 0;

        return {
            attendanceRate,
            lateCount,
            absentCount,
            totalClasses
        };
    };

    const getColor = (status) => {
        switch (status) {
            case 'O': return '#7099ff';  // 출석
            case 'L': return '#dd36cf';  // 지각
            case 'R': return '#FFA500';  // 조퇴
            case 'X': return '#ff596a';  // 결석
            case 'A': return '#FFA500';  // 공결
            default: return 'gray';      // 기본값
        }
    };


    if (!data || !subjectInfo || !subjectPlaceTime) return <main>
        <Spacer y={40} />
        <div className="skeleton" style={{ height: '30px', width: '30%', marginBottom: '10px' }} />
        <div className="skeleton" style={{ height: '10px', width: '40%' }} />
        <Spacer y={20} />
        <div className="skeleton" style={{ height: '80px', width: '100%' }} />
        <Spacer y={20} />
        <div className="skeleton" style={{ height: '80px', width: '100%' }} />
        <Spacer y={20} />
        <div className="skeleton" style={{ height: '80px', width: '100%' }} />
        <Spacer y={20} />
        <div className="skeleton" style={{ height: '80px', width: '100%' }} />
        <Spacer y={20} />
        <div className="skeleton" style={{ height: '80px', width: '100%' }} />
    </main>;
    const stats = calculateStats(data.atendSubList);

    return (
        <main>
            <Spacer y={20} />
            <h2>{subjectInfo.name}</h2>
            <span style={{ opacity: .5, fontSize: '14px' }}>{subjectInfo.label.split(') - ')[1]} | {subjectPlaceTime}</span>

            <Spacer y={30} />
            <h3>강의 공지사항
                <button onClick={() => Android.openBoardList("notice", "강의 공지사항")} style={{ float: "right", width: 'fit-content', marginTop: '-5px' }}>
                    <IonIcon name='add-outline' />
                </button>
            </h3>
            <Spacer y={15} />
            {data.noticeList.length > 0 ? (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    {data.noticeList.map((notice, index) => (
                        <div key={index} className="notice-item" onClick={() => Android.openBoardView("notice", notice.boardNo.toString(), notice.masterNo.toString())}>
                            <span><b>{notice.title}</b></span><br />
                            <span style={{ opacity: 0.6, fontSize: '12px' }}>
                                {new Date(notice.registDt).getFullYear()}-{(new Date(notice.registDt).getMonth() + 1).toString().padStart(2, '0')}-{new Date(notice.registDt).getDate().toString().padStart(2, '0')}</span><br />
                            <hr style={{ opacity: 0.3 }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px', paddingTop: '10px' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                        <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                <g fillRule="nonzero" stroke="var(--text-color)">
                                    <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                    <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                                </g>
                            </g>
                        </svg>
                        <span>아직 항목이 없어요</span>
                    </div>
                </div>
            )}

            <Spacer y={30} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px' }}>
                {(data.cntntCmpltCnt !== 0 || data.cntntList.length !== 0) && (
                    <div onClick={() => Android.openOnlineLecture()}
                        className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                        <span><b>강의 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                        <span style={{ opacity: .7, color: data.cntntCmpltCnt !== data.cntntList.length && 'var(--red)' }}>{data.cntntCmpltCnt}/{data.cntntList.length}</span>
                    </div>
                )}
                {(data.taskPrsntCnt !== 0 || data.taskCnt !== 0) && (
                    <div onClick={() => Android.evaluteKLASScript(`appModule.goTask()`)}
                        className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                        <span><b>과제 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                        <span style={{ opacity: .7, color: data.taskPrsntCnt !== data.taskCnt && 'var(--red)' }}>{data.taskPrsntCnt}/{data.taskCnt}</span>
                    </div>
                )}
                {(data.quizPrsntCnt !== 0 || data.quizCnt) !== 0 && (
                    <div onClick={() => Android.evaluteKLASScript(`appModule.goQuiz()`)}
                        className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                        <span><b>퀴즈 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                        <span style={{ opacity: .7, color: data.quizPrsntCnt !== data.quizCnt && 'var(--red)' }}>{data.quizPrsntCnt}/{data.quizCnt}</span>
                    </div>
                )}
                {data.pdsCnt !== 0 && (
                    <div onClick={() => Android.openBoardList("pds", "강의 자료실")}
                        className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                        <span><b>자료 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                        <span style={{ opacity: .7, color: data.pdsNewCnt == 1 && 'var(--red)' }}>{data.pdsCnt}</span>
                    </div>
                )}
                {(data.examPrsntCnt !== 0 || data.examCnt !== 0) && (
                    <div onClick={() => Android.evaluteKLASScript(`appModule.goExam()`)}
                        className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                        <span><b>시험 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                        <span style={{ opacity: .7, color: data.examPrsntCnt !== data.examCnt && 'var(--red)' }}>{data.examPrsntCnt}/{data.examCnt}</span>
                    </div>
                )}
                {(data.prjctPrsntCnt !== 0 || data.prjctCnt !== 0) && (
                    <div onClick={() => Android.evaluteKLASScript(`appModule.goPrjct()`)}
                        className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                        <span><b>팀프로젝트 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                        <span style={{ opacity: .7, color: data.prjctPrsntCnt !== data.prjctCnt && 'var(--red)' }}>{data.prjctPrsntCnt}/{data.prjctCnt}</span>
                    </div>
                )}
                {(data.dscsnJoinCnt !== 0 || data.dscsnCnt) !== 0 && (
                    <div onClick={() => Android.evaluteKLASScript(`appModule.goDscsn()`)}
                        className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                        <span><b>토론 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                        <span style={{ opacity: .7, color: data.dscsnJoinCnt !== data.dscsnCnt && 'var(--red)' }}>{data.dscsnJoinCnt}/{data.dscsnCnt}</span>
                    </div>
                )}
                {(data.surveyPrsntCnt !== 0 || data.surveyCnt) !== 0 && (
                    <div onClick={() => Android.evaluteKLASScript(`appModule.goSurvey()`)}
                        className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                        <span><b>설문 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                        <span style={{ opacity: .7, color: data.surveyPrsntCnt !== data.surveyCnt && 'var(--red)' }}>{data.surveyPrsntCnt}/{data.surveyCnt}</span>
                    </div>
                )}

                <div onClick={() => Android.evaluteKLASScript(`
                var link = 'https://klas.kw.ac.kr' + $("a[onclick*='BoardQnaListStdPage.do']").attr("onclick").replace("linkUrl('" , "").replace("');", "");
                location.href="https://klas.kw.ac.kr/std/lis/evltn/LctrumHomeStdPage.do";
                Android.openPage(link);
                `)}
                    className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                    <span><b>묻고답하기 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                </div>

                <div onClick={() => Android.evaluteKLASScript(`
                var link = 'https://klas.kw.ac.kr' + $("a:contains('수강생 자료실')").attr("onclick").replace("linkUrl('" , "").replace("');", "");
                location.href="https://klas.kw.ac.kr/std/lis/evltn/LctrumHomeStdPage.do";
                Android.openPage(link);
                `)}
                    className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                    <span><b>수강생 자료실 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                </div>

            </div>

            <Spacer y={30} />
            <h3>출석 현황</h3>
            <Spacer y={15} />

            <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                <h4 style={{ margin: '0', display: 'inline-block' }}>
                    <span>현재까지 출석률은</span> <span style={{ color: '#7099ff', fontSize: '18px' }}>{stats.attendanceRate.toFixed(1)}%</span> <span>예요.</span>
                </h4>
                <br />
                {(stats.lateCount == 0 && stats.absentCount == 0) ? <span style={{ opacity: .7 }}>지각과 결석이 한 번도 없어요!</span>
                    : <span style={{ opacity: .7 }}>지각 {stats.lateCount}회, 결석 {stats.absentCount}회가 있어요.</span>}
                <Spacer y={10} />
                <button onClick={() => setAttendExpand(!attendExpand)} style={{ background: 'var(--card-border)', width: 'fit-content' }}>{attendExpand ? '접기' : '자세히 보기'} <IonIcon style={{ position: 'relative', top: '2px' }} name={attendExpand ? 'chevron-up' : 'chevron-down'} /></button>

                {attendExpand && (<>
                    <Spacer y={20} />
                    {data.atendSubList.map((aSubitem, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>{aSubitem.weeklyseq}주차</span>
                            <span style={{ fontWeight: 'bold' }}>
                                <span style={{ color: getColor(aSubitem.pgr1) }}>{aSubitem.pgr1 || '-'}</span>,{' '}
                                <span style={{ color: getColor(aSubitem.pgr2) }}>{aSubitem.pgr2 || '-'}</span>,{' '}
                                <span style={{ color: getColor(aSubitem.pgr3) }}>{aSubitem.pgr3 || '-'}</span>,{' '}
                                <span style={{ color: getColor(aSubitem.pgr4) }}>{aSubitem.pgr4 || '-'}</span>
                            </span>
                        </div>
                    ))}
                </>
                )}
            </div>


            <Spacer y={30} />
            <h3>과제</h3>
            <Spacer y={15} />
            {data.taskTop.length > 0 ? (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    {data.taskTop.map((task, index) => (
                        <div key={index} className="notice-item" onClick={() => Android.evaluteKLASScript(`appModule.goTask()`)}>
                            <span><b>{task.title}</b></span><br />
                            <span style={{ opacity: 0.6, fontSize: '12px' }}>
                                <IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                                {task.startdate.slice(4, 6) + '-' + task.startdate.slice(6, 8) + ' ' + task.startdate.slice(8, 10) + ':' + task.startdate.slice(10, 12)} ~ {task.expiredate.slice(4, 6) + '-' + task.expiredate.slice(6, 8) + ' ' + task.expiredate.slice(8, 10) + ':' + task.expiredate.slice(10, 12)}
                            </span><br />
                            <span style={{ opacity: 0.6, fontSize: '12px' }}>
                                <IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='checkmark-outline' />
                                {task.submityn === 'Y' ? '제출 완료' : '미제출'}
                            </span><br />
                            <hr style={{ opacity: 0.3 }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px', paddingTop: '10px' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                        <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                <g fillRule="nonzero" stroke="var(--text-color)">
                                    <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                    <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                                </g>
                            </g>
                        </svg>
                        <span>아직 항목이 없어요</span>
                    </div>
                </div>
            )}

            <Spacer y={30} />
            <h3>온라인시험</h3>
            <Spacer y={15} />
            {data.examTop.length > 0 ? (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    {data.examTop.map((item, index) => (
                        <div key={index} className="notice-item">
                            <span><b>{item.papernm}</b></span><br />
                            <span style={{ opacity: 0.6, fontSize: '12px' }}>
                                <IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                                {item.sdates + ' ~ ' + item.edates}
                            </span><br />
                            <span style={{ opacity: 0.6, fontSize: '12px' }}>
                                <IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='checkmark-outline' />
                                {item.submit === 'Y' ? '제출 완료' : '미제출'}
                            </span><br />
                            <hr style={{ opacity: 0.3 }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px', paddingTop: '10px' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                        <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                <g fillRule="nonzero" stroke="var(--text-color)">
                                    <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                    <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                                </g>
                            </g>
                        </svg>
                        <span>아직 항목이 없어요</span>
                    </div>
                </div>
            )
            }

            <Spacer y={30} />
            <h3>수시퀴즈</h3>
            <Spacer y={15} />
            {data.anQuizTop.length > 0 ? (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    {data.anQuizTop.map((item, index) => (
                        <div key={index} className="notice-item">
                            <span><b>{item.papernm}</b></span><br />
                            <span style={{ opacity: 0.6, fontSize: '12px' }}>
                                <IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                                {task.startdate.slice(4, 6) + '-' + task.startdate.slice(6, 8) + ' ' + task.startdate.slice(8, 10) + ':' + task.startdate.slice(10, 12)} ~ {task.expiredate.slice(4, 6) + '-' + task.expiredate.slice(6, 8) + ' ' + task.expiredate.slice(8, 10) + ':' + task.expiredate.slice(10, 12)}
                            </span><br />
                            <span style={{ opacity: 0.6, fontSize: '12px' }}>
                                <IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='checkmark-outline' />
                                {item.submityn === 'Y' ? '제출 완료' : '미제출'}
                            </span><br />
                            <hr style={{ opacity: 0.3 }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px', paddingTop: '10px' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                        <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                <g fillRule="nonzero" stroke="var(--text-color)">
                                    <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                    <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                                </g>
                            </g>
                        </svg>
                        <span>아직 항목이 없어요</span>
                    </div>
                </div>
            )
            }

            <Spacer y={30} />
            <h3>팀프로젝트</h3>
            <Spacer y={15} />
            {data.prjctTop.length > 0 ? (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    {data.prjctTop.map((item, index) => (
                        <div key={index} className="notice-item">
                            <span><b>{item.title}</b></span><br />
                            <span style={{ opacity: 0.6, fontSize: '12px' }}>
                                <IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                                {item.sdates + ' ~ ' + item.edates}
                            </span><br />
                            <span style={{ opacity: 0.6, fontSize: '12px' }}>
                                <IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='checkmark-outline' />
                                {item.submit === 'Y' ? '제출 완료' : '미제출'}
                            </span><br />
                            <hr style={{ opacity: 0.3 }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px', paddingTop: '10px' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                        <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                <g fillRule="nonzero" stroke="var(--text-color)">
                                    <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                    <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                                </g>
                            </g>
                        </svg>
                        <span>아직 항목이 없어요</span>
                    </div>
                </div>
            )
            }

            <Spacer y={30} />
            <h3>토론</h3>
            <Spacer y={15} />
            {data.dscsnTop.length > 0 ? (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    {data.dscsnTop.map((item, index) => (
                        <div key={index} className="notice-item">
                            <span><b>{item.papernm}</b></span><br />
                            <span style={{ opacity: 0.6, fontSize: '12px' }}>
                                <IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                                {item.started + ' ~ ' + item.ended}
                            </span><br />
                            <span style={{ opacity: 0.6, fontSize: '12px' }}>
                                <IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='checkmark-outline' />
                                {item.toroncnt}
                            </span><br />
                            <hr style={{ opacity: 0.3 }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px', paddingTop: '10px' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                        <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                <g fillRule="nonzero" stroke="var(--text-color)">
                                    <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                    <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                                </g>
                            </g>
                        </svg>
                        <span>아직 항목이 없어요</span>
                    </div>
                </div>
            )
            }

            <Spacer y={90} />

            <div className='bottom-sheet-footer' style={{ position: 'fixed', bottom: '0', background: 'linear-gradient(to top, var(--background) 75%, transparent) 100%', paddingTop: '30px' }}>
                <button onClick={() => Android.openLecturePlan()} style={{ background: 'var(--button-background)', padding: '15px 20px', borderRadius: '15px', fontSize: '15px' }}>강의계획서</button>
                <button onClick={() => Android.openQRScan()} style={{ background: 'var(--card-background)', color: 'var(--text-color)', padding: '15px 20px', borderRadius: '15px', fontSize: '15px' }}>QR 출석</button>

            </div>
        </main>
    );
}
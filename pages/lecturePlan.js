import { useEffect, useState } from 'react';
import Spacer from './components/spacer';
import IonIcon from '@reacticons/ionicons';
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, Title, Tooltip, Legend);

export default function LectureHome() {
    const [data, setData] = useState(null);

    useEffect(() => {
        window.receivedData = function (token, subj) {
            if (!token || !subj) return;
            fetch("/api/lecturePlan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, subj }),
            })
                .then((response) => response.json())
                .then((data) => {
                    setData(data.data);
                })
                .catch((error) => {
                    console.error(error);
                });
        };

        Android.completePageLoad();
    }, [])


    if (!data) {
        return (
            <main>
                <Spacer y={10} />
                <div className="skeleton" style={{ height: '20px', width: '60px' }} />
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
            </main>
        );
    }

    const lecturePlan = data.lecturePlan[0];
    const lectureAssistant = data.lectureAssistant[0];

    return (
        <main>
            <Spacer y={10} />
            {data.lecturePlan[0].codeName1 && (
                <>
                    <span style={{ background: '#ff766160', color: 'var(--text-color)', padding: '5px', borderRadius: '10px', fontSize: '13px' }}>{data.lecturePlan[0].codeName1}</span>
                    <Spacer y={10} />
                </>
            )}
            <h2>{data.lecturePlan[0].gwamokKname}</h2>
            <span style={{ opacity: .5, fontSize: '14px' }}>{data.lecturePlan[0].openMajorCode}-{data.lecturePlan[0].openGrade}-{data.lecturePlan[0].openGwamokNo}-{data.lecturePlan[0].bunbanNo}</span>
            <Spacer y={20} />

            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='time-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>
                    {data.lectureTime.map((item, index) => (
                        <span key={index}>
                            {item.dayname1} {item.timeNo1}교시 ({item.locHname})
                            {index !== data.lectureTime.length - 1 ? ', ' : ''}
                        </span>
                    ))}
                </span>
            </span><br />
            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='people-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>{data.lectureStdCrtNum.currentNum || 'N/A'}명</span>
            </span><br />
            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='layers-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>{lecturePlan.hakjumNum}학점/{lecturePlan.sisuNum}시간</span>
            </span><br />
            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='apps-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>이론학점({lecturePlan.getScore1 || 0}), 실험학점({lecturePlan.getScore2 || 0}), 설계학점({lecturePlan.getScore3 || 0})</span>
            </span><br />
            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='desktop-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>
                    {lecturePlan.onlineOpt === "1" ? "원격 수업 100%, " : lecturePlan.blendedOpt === "1" ? "원격수업 50% 이상, " : ""}
                </span>
                <span style={{ opacity: .7 }}>
                    {[
                        lecturePlan.face100Opt === 'Y' && '100% 대면강의',
                        lecturePlan.faceliveOpt === 'Y' && '대면+실시간 화상강의',
                        lecturePlan.facerecOpt === 'Y' && '대면+사전녹화강의',
                        lecturePlan.faceliverecOpt === 'Y' && '대면+실시간 화상강의+사전녹화강의',
                        lecturePlan.recliveOpt === 'Y' && '실시간 화상강의+사전녹화강의',
                        lecturePlan.live100Opt === 'Y' && '100% 실시간 화상강의',
                        lecturePlan.rec100Opt === 'Y' && '100% 사전녹화강의'
                    ].filter(Boolean).join(', ') || '강의운영 방식 정보 없음'}
                </span>
            </span><br />

            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='golf-outline' />
                <span style={{ marginLeft: '5px', opacity: .7 }}>
                    {[
                        lecturePlan.tblOpt == '1' && 'TBL강의',
                        lecturePlan.pblOpt == '1' && 'PBL강의',
                        lecturePlan.seminarOpt == '1' && '세미나강의',
                        lecturePlan.typeSmall == '1' && '소규모강의',
                        lecturePlan.typeFusion == '1' && '융합강의',
                        lecturePlan.typeTeam == '1' && '팀티칭강의',
                        lecturePlan.typeWork == '1' && '일학습병행강의',
                        lecturePlan.typeForeigner == '1' && '외국인전용강의',
                        lecturePlan.typeElearn == '1' && '서울권역e-러닝',
                        lecturePlan.typeExperiment == '1' && '실험실습실기설계강의',
                        lecturePlan.typeJibjung == '1' && '집중이수제강의'
                    ].filter(Boolean).join(', ') || '강의유형 정보 없음'}
                </span>
            </span>
            {lecturePlan.engOpt === "1" && (
                <span style={{ fontSize: '15px' }}>
                    <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='text-outline' />
                    <span style={{ marginLeft: '5px', opacity: .7 }}>영어강의 {lecturePlan.englishBiyul}%</span>
                </span>
            )}
            {lecturePlan.frnOpt === "1" && (
                <span style={{ fontSize: '15px' }}>
                    <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='text-outline' />
                    <span style={{ marginLeft: '5px', opacity: .7 }}>제2외국어 강의 {lecturePlan.frnBiyul}%</span>
                </span>
            )}


            <Spacer y={30} />
            <h3>강사진</h3>
            <Spacer y={15} />

            <div className="card non-anim" style={{ paddingBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h5>{lecturePlan.memberName}</h5>
                        <span style={{ opacity: .7, marginTop: '5px' }}>{lecturePlan.jikgeubName}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span style={{ fontSize: '15px' }}>
                            <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='call-outline' />
                            <span style={{ marginLeft: '5px', opacity: .7 }}>{lecturePlan.telNo || "비공개"}</span>
                        </span>
                        <span style={{ fontSize: '15px' }}>
                            <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='phone-portrait-outline' />
                            <span style={{ marginLeft: '5px', opacity: .7 }}>{lecturePlan.hpNo || "비공개"}</span>
                        </span>
                        <span style={{ fontSize: '15px' }}>
                            <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='mail-outline' />
                            <span style={{ marginLeft: '5px', opacity: .7 }}>{lecturePlan.addinfoemail || "비공개"}</span>
                        </span>
                    </div>
                </div>
                <Spacer y={10} />
                {data.lectureTeam.length > 0 && (
                    <>
                        <hr style={{ opacity: 0.1 }} />
                        <Spacer y={10} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center' }}>
                                <h5>{data.lectureTeam[0].name}</h5>
                                <span style={{ opacity: .7, marginTop: '5px' }}>팀티칭/공동교수</span>
                            </div>
                        </div>
                    </>
                )}
                {data.lectureAssistant.length > 0 && (
                    <>
                        <hr style={{ opacity: 0.1 }} />
                        <Spacer y={10} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center' }}>
                                <h5>{lectureAssistant.name}</h5>
                                <span style={{ opacity: .7, marginTop: '5px' }}>담당조교</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <span style={{ fontSize: '15px' }}>
                                    <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='mail-outline' />
                                    <span style={{ marginLeft: '5px', opacity: .7 }}>{lectureAssistant.astntemail}</span>
                                </span>
                            </div>
                        </div>
                    </>
                )}

            </div>

            <Spacer y={30} />
            <h3>개요</h3><Spacer y={15} />
            <div className="card non-anim" id="notices" style={{ padding: '5px 15px' }}>
                <p style={{ opacity: .6, fontSize: '15px' }}>
                    {lecturePlan.summary?.split('\r\n').map((line, i) => (
                        <span key={i}>
                            {line}
                            {i < lecturePlan.summary.split('\r\n').length - 1 && <br />}
                        </span>
                    ))}
                </p>

                <p style={{ opacity: .6, fontSize: '15px' }}>
                    <b>대표역량: </b>{lecturePlan.gwamokAble}
                </p>
            </div>

            <Spacer y={30} />
            <h3>학습목표 및 학습방법</h3><Spacer y={15} />
            <div className="card non-anim" id="notices" style={{ padding: '5px 15px' }}>
                <p style={{ opacity: .6, fontSize: '15px' }}>
                    {lecturePlan.purpose?.split('\r\n').map((line, i) => (
                        <span key={i}>
                            {line}
                            {i < lecturePlan.purpose.split('\r\n').length - 1 && <br />}
                        </span>
                    ))}
                </p>
            </div>


            {data.lecturePlanTab4.length > 0 && (
                <>
                    <Spacer y={30} />
                    <h3>학습성과</h3><Spacer y={15} />
                    <div className="card non-anim" id="notices" style={{ padding: '20px 15px' }}>
                        {lecturePlan.reflectPer1 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort1}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result1 && lecturePlan.result1.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result1.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer2 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort2}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result2 && lecturePlan.result2.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result2.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer3 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort3}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result3 && lecturePlan.result3.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result3.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer4 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort4}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result4 && lecturePlan.result4.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result4.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer5 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort5}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result5 && lecturePlan.result5.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result5.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer6 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort6}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result6 && lecturePlan.result6.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result6.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer7 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort7}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result7 && lecturePlan.result7.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result7.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer8 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort8}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result8 && lecturePlan.result8.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result8.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer9 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort9}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result9 && lecturePlan.result9.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result9.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer10 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort10}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result10 && lecturePlan.result10.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result10.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer11 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort11}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result11 && lecturePlan.result11.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result11.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer12 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort12}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result12 && lecturePlan.result12.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result12.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer13 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort13}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result13 && lecturePlan.result13.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result13.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer14 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort14}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result14 && lecturePlan.result14.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result14.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer15 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort15}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result15 && lecturePlan.result15.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result15.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer16 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort16}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result16 && lecturePlan.result16.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result16.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer17 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort17}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result17 && lecturePlan.result17.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result17.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer18 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort18}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result18 && lecturePlan.result18.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result18.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer19 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort19}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result19 && lecturePlan.result19.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result19.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                        {lecturePlan.reflectPer20 && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{lecturePlan.studyResultShort20}</span>
                                <p style={{ opacity: .6, fontSize: '15px' }}>
                                    {lecturePlan.result20 && lecturePlan.result20.split('\r\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < lecturePlan.result20.split('\r\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}


            {data.lectureEngineerCourse.length > 0 && data.lectureEngineerCourse[0].engOpt === "Y" && (
                <>
                    <Spacer y={30} />
                    <h3>선후수과목</h3>
                    <Spacer y={15} />
                    <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                        {data.lecturePrerequisite.length > 0 && (
                            <div className="notice-item">
                                <span>(지정)선수과목</span> ·&nbsp;
                                <span style={{ opacity: 0.6, fontSize: '15px' }}>{data.lecturePrerequisite[0].beforeGwamokKname || "해당없음"}</span>
                                <hr style={{ opacity: 0.3 }} />
                            </div>
                        )}
                        <div className="notice-item">
                            <span>(권장)선수과목</span> ·&nbsp;
                            <span style={{ opacity: 0.6, fontSize: '15px' }}>{lecturePlan.preGwamok || "해당없음"}</span>
                            <hr style={{ opacity: 0.3 }} />
                        </div>
                        <div className="notice-item">
                            <span>(권장)병수과목</span> ·&nbsp;
                            <span style={{ opacity: 0.6, fontSize: '15px' }}>{lecturePlan.pairGwamok || "해당없음"}</span>
                            <hr style={{ opacity: 0.3 }} />
                        </div>
                        <div className="notice-item">
                            <span>(권장)후수과목</span> ·&nbsp;
                            <span style={{ opacity: 0.6, fontSize: '15px' }}>{lecturePlan.postGwamok || "해당없음"}</span>
                        </div>
                    </div>
                </>
            )}


            <Spacer y={30} />
            <h3>반영 비율</h3>
            <Spacer y={15} />
            <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                <span><b>성적 평가</b></span><br />
                <div style={{ position: 'relative', height: '50px' }}>
                    <Bar
                        data={{
                            labels: ['반영 비율'],
                            datasets: [
                                {
                                    data: [lecturePlan.attendBiyul || 0],
                                    backgroundColor: '#FF6B6B', // 부드러운 빨강
                                    label: '출석',
                                    barThickness: 15
                                },
                                {
                                    data: [lecturePlan.middleBiyul || 0],
                                    backgroundColor: '#4DABF7', // 부드러운 파랑
                                    label: '중간고사',
                                    barThickness: 15
                                },
                                {
                                    data: [lecturePlan.lastBiyul || 0],
                                    backgroundColor: '#FFA94D', // 부드러운 주황
                                    label: '기말고사',
                                    barThickness: 15
                                },
                                {
                                    data: [lecturePlan.reportBiyul || 0],
                                    backgroundColor: '#69DB7C', // 부드러운 초록
                                    label: '과제보고서',
                                    barThickness: 15
                                },
                                {
                                    data: [lecturePlan.learnBiyul || 0],
                                    backgroundColor: '#9775FA', // 부드러운 보라
                                    label: '수업태도',
                                    barThickness: 15
                                },
                                {
                                    data: [lecturePlan.quizBiyul || 0],
                                    backgroundColor: '#F783AC', // 부드러운 분홍
                                    label: '퀴즈',
                                    barThickness: 15
                                },
                                {
                                    data: [lecturePlan.gitaBiyul || 0],
                                    backgroundColor: '#3BC9DB', // 부드러운 청록
                                    label: '기타',
                                    barThickness: 15
                                }
                            ]
                        }}
                        options={{
                            indexAxis: 'y',
                            plugins: {
                                legend: {
                                    display: false,
                                    position: 'right'
                                },
                                datalabels: {
                                    display: true,
                                    color: '#000',
                                    anchor: 'end',
                                    align: 'start',
                                    formatter: (value, context) => context.dataset.label
                                }
                            },
                            scales: {
                                x: {
                                    display: false,
                                    stacked: true,
                                    max: 100,
                                    grid: { display: false }
                                },
                                y: {
                                    display: false,
                                    stacked: true,
                                    grid: { display: false }
                                }
                            },
                            maintainAspectRatio: false
                        }}
                    />
                </div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>
                    {lecturePlan.attendBiyul > 0 && <>출석: {lecturePlan.attendBiyul}%{' '}</>}
                    {lecturePlan.middleBiyul > 0 && <>· 중간고사: {lecturePlan.middleBiyul}%{' '}</>}
                    {lecturePlan.lastBiyul > 0 && <>· 기말고사: {lecturePlan.lastBiyul}%{' '}</>}
                    {lecturePlan.reportBiyul > 0 && <>· 과제보고서: {lecturePlan.reportBiyul}%{' '}</>}
                    {lecturePlan.learnBiyul > 0 && <>· 수업태도: {lecturePlan.learnBiyul}%{' '}</>}
                    {lecturePlan.quizBiyul > 0 && <>· 퀴즈: {lecturePlan.quizBiyul}%{' '}</>}
                    {lecturePlan.gitaBiyul > 0 && <>· 기타: {lecturePlan.gitaBiyul}%</>}
                </div>
                <Spacer y={10} />
                <span style={{ opacity: 0.6, fontSize: '14px' }}><b>세부설명: </b>
                    <span>
                        {lecturePlan.gitaDetail?.split('\r\n').map((line, i) => (
                            <span key={i}>
                                {line}
                                {i < lecturePlan.gitaDetail.split('\r\n').length - 1 && <br />}
                            </span>
                        ))}
                    </span>
                </span>


                {(lecturePlan.openCode == '11' || lecturePlan.openCode == '13' || lecturePlan.openCode == '91' || lecturePlan.openCode == '93' || lecturePlan.openCode == '21') && (
                    <>
                        <Spacer y={20} />
                        <span><b>VL역량</b></span><br />
                        <div style={{ position: 'relative', height: '50px' }}>
                            <Bar
                                data={{
                                    labels: ['VL역량'],
                                    datasets: [
                                        {
                                            data: [lecturePlan.pa1 || 0],
                                            backgroundColor: '#FF6B6B',
                                            label: '지적탐구',
                                            barThickness: 15
                                        },
                                        {
                                            data: [lecturePlan.pa2 || 0],
                                            backgroundColor: '#4DABF7',
                                            label: '글로벌리더십',
                                            barThickness: 15
                                        },
                                        {
                                            data: [lecturePlan.pa3 || 0],
                                            backgroundColor: '#FFA94D',
                                            label: '자기관리 및 개발',
                                            barThickness: 15
                                        },
                                        {
                                            data: [lecturePlan.pa5 || 0],
                                            backgroundColor: '#69DB7C',
                                            label: '창의융합',
                                            barThickness: 15
                                        },
                                        {
                                            data: [lecturePlan.pa6 || 0],
                                            backgroundColor: '#9775FA',
                                            label: '공존·공감',
                                            barThickness: 15
                                        },
                                        {
                                            data: [lecturePlan.pa7 || 0],
                                            backgroundColor: '#F783AC',
                                            label: '미래도전지향',
                                            barThickness: 15
                                        }
                                    ]
                                }}
                                options={{
                                    indexAxis: 'y',
                                    plugins: {
                                        legend: {
                                            display: false,
                                            position: 'right'
                                        },
                                        datalabels: {
                                            display: true,
                                            color: '#000',
                                            anchor: 'end',
                                            align: 'start',
                                            formatter: (value, context) => context.dataset.label
                                        }
                                    },
                                    scales: {
                                        x: {
                                            display: false,
                                            stacked: true,
                                            max: 100,
                                            grid: { display: false }
                                        },
                                        y: {
                                            display: false,
                                            stacked: true,
                                            grid: { display: false }
                                        }
                                    },
                                    maintainAspectRatio: false
                                }}
                            />
                        </div>
                        <div style={{ fontSize: '14px', opacity: 0.7 }}>
                            {lecturePlan.pa1 > 0 && <>지적탐구: {lecturePlan.pa1}%{' '}</>}
                            {lecturePlan.pa2 > 0 && <>· 글로벌리더십: {lecturePlan.pa2}%{' '}</>}
                            {lecturePlan.pa3 > 0 && <>· 자기관리 및 개발: {lecturePlan.pa3}%{' '}</>}
                            {lecturePlan.pa5 > 0 && <>· 창의융합: {lecturePlan.pa5}%{' '}</>}
                            {lecturePlan.pa6 > 0 && <>· 공존 공감: {lecturePlan.pa6}%{' '}</>}
                            {lecturePlan.pa7 > 0 && <>· 미래도전지향: {lecturePlan.pa7}%</>}
                        </div>
                    </>
                )}
            </div>

            <Spacer y={30} />
            <h3>교재</h3>
            <Spacer y={15} />
            <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                <div className="notice-item">
                    <span>주교재 · <b>{lecturePlan.bookName}</b></span><br />
                    <span style={{ opacity: 0.6, fontSize: '13px' }}>{lecturePlan.writeName} | {lecturePlan.companyName}({lecturePlan.printYear})</span>
                    {lecturePlan.book1Name && <hr style={{ opacity: 0.3 }} />}
                </div>
                {lecturePlan.book1Name && (
                    <div className="notice-item">
                        <span>부교재 · <b>{lecturePlan.book1Name}</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '13px' }}>{lecturePlan.write1Name} | {lecturePlan.company1Name}({lecturePlan.print1Year})</span>
                        {lecturePlan.book2Name && <hr style={{ opacity: 0.3 }} />}
                    </div>
                )}
                {lecturePlan.book2Name && (
                    <div className="notice-item">
                        <span>부교재 · <b>{lecturePlan.book2Name}</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '13px' }}>{lecturePlan.write2Name} | {lecturePlan.company2Name}({lecturePlan.print2Year})</span>
                        {lecturePlan.book3Name && <hr style={{ opacity: 0.3 }} />}
                    </div>
                )}
                {lecturePlan.book3Name && (
                    <div className="notice-item">
                        <span>부교재 · <b>{lecturePlan.book3Name}</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '13px' }}>{lecturePlan.write3Name} | {lecturePlan.company3Name}({lecturePlan.print3Year})</span>
                    </div>
                )}
            </div>

            <Spacer y={30} />
            <h3>강의 일정</h3>
            <Spacer y={15} />
            <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                {[...Array(16)].map((_, i) =>
                    lecturePlan[`week${i + 1}Lecture`] && (
                        <div className="notice-item" key={i}>
                            <span>{i + 1}주차 · <b>{lecturePlan[`week${i + 1}Lecture`]}</b></span><br />
                            <span style={{ opacity: 0.6, fontSize: '13px' }}>{lecturePlan[`week${i + 1}Bigo`]}</span>
                            <hr style={{ opacity: 0.3 }} />
                        </div>
                    )
                )}
                <div className="notice-item">
                    <span><b>기타</b></span><br />
                    <span style={{ opacity: 0.6, fontSize: '13px' }}>- 학기 중 결강이 있을 경우에는 15주차에 보강을 실시하고, 16주차에 기말고사 시행.<br />- 학기 중 결강이 없을 경우에는 15주차에 기말고사 시행 가능.<br />
                    </span>
                    <span style={{ opacity: 0.6, fontSize: '13px' }}>{lecturePlan.weekGita}</span>
                </div>
            </div>

            {(lecturePlan.cqiNow || lecturePlan.cqiSummary) && (<>
                <Spacer y={30} />
                <h3>CQI <span style={{ background: 'var(--button-background)', padding: '3px 5px', borderRadius: '10px', fontSize: '12px', position: 'relative', left: '5px', top: '-1px', opacity: .8 }}>KLAS+</span></h3>
                <Spacer y={5} />
                <span style={{ opacity: .6, fontSize: '14px' }}>이전 학기 강의평가 등을 바탕으로 담당 교수가 작성한 강의 개선보고서 내용이에요.</span>
                <Spacer y={15} />
                <div className="card non-anim" id="notices" style={{ padding: '5px 15px' }}>
                    <p style={{ opacity: .6, fontSize: '15px' }}>
                        {lecturePlan.cqiSummary}
                        {lecturePlan.cqiNow}
                    </p>
                </div>
            </>
            )}


            <Spacer y={30} />
        </main>
    );
}
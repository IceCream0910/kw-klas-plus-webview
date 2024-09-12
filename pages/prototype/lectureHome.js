import { useState } from 'react';
import Spacer from '../components/spacer';
import IonIcon from '@reacticons/ionicons';

export default function LectureHome() {
    const [dataIsEmpty, setDataIsEmpty] = useState(false);
    const [attendExpand, setAttendExpand] = useState(false);
    return (
        <main>
            <Spacer y={10} />

            <span style={{ background: '#ff766160', color: 'var(--text-color)', padding: '5px', borderRadius: '10px', fontSize: '13px' }}>이수구분</span>
            <Spacer y={10} />
            <h2>과목명</h2>
            <span style={{ opacity: .5, fontSize: '14px' }}>교수명 | 강의실</span>

            <Spacer y={30} />
            <h3>강의 공지사항</h3>
            <Spacer y={15} />
            {dataIsEmpty ? (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                        <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                <g fillRule="nonzero" stroke="var(--text-color)">
                                    <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                    <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                                </g>
                            </g>
                        </svg>
                        <span>아직 아무 내용도 없습니다!</span>
                    </div>
                </div>
            ) : (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    <div className="notice-item">
                        <span><b>게시글 제목</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}>YYYY-MM-DD</span>
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>게시글 제목</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}>YYYY-MM-DD</span>
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>게시글 제목</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}>YYYY-MM-DD</span>
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>게시글 제목</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}>YYYY-MM-DD</span>
                    </div>
                </div>
            )}

            <Spacer y={30} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px' }}>
                <div className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                    <span><b>강의 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                    <span style={{ opacity: .7 }}>1/10</span>
                </div>

                <div className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                    <span><b>토론 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                    <span style={{ opacity: .7 }}>1/10</span>
                </div>

                <div className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                    <span><b>팀프로젝트 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                    <span style={{ opacity: .7 }}>1/10</span>
                </div>

                <div className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                    <span><b>과제 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                    <span style={{ opacity: .7 }}>1/10</span>
                </div>

                <div className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                    <span><b>시험 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                    <span style={{ opacity: .7 }}>1/10</span>
                </div>

                <div className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                    <span><b>퀴즈 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                    <span style={{ opacity: .7 }}>1/10</span>
                </div>

                <div className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                    <span><b>설문 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                    <span style={{ opacity: .7 }}>1/10</span>
                </div>

                <div className="card" style={{ fontSize: '16px', padding: '15px', height: '50px', display: 'flex', alignContent: 'center', justifyContent: 'space-between' }}>
                    <span><b>자료 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-forward' /></b></span>
                    <span style={{ opacity: .7 }}>1/10</span>
                </div>

            </div>

            <Spacer y={30} />
            <h3>출석 현황</h3>
            <Spacer y={15} />

            <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                <h4 style={{ margin: '0', display: 'inline-block' }}>출석율 <span style={{ color: '#7099ff', fontSize: '18px' }}>50%</span></h4>
                <br />
                <span style={{ opacity: .7 }}>지각 1회, 결석 1회가 있어요.</span>
                <Spacer y={10} />
                <button onClick={() => setAttendExpand(!attendExpand)} style={{ background: 'var(--card-border)', width: 'fit-content' }}>자세히 보기 <IonIcon style={{ position: 'relative', top: '2px' }} name='chevron-down' /></button>

                {attendExpand && (<>
                    <Spacer y={20} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>1주차</span>
                        <span style={{ fontWeight: 'bold' }}>
                            <span style={{ color: '#7099ff' }}>O</span>, <span style={{ color: '#7099ff' }}>O</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>2주차</span>
                        <span style={{ fontWeight: 'bold' }}>
                            <span style={{ color: '#7099ff' }}>O</span>, <span style={{ color: '#ff596a' }}>X</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>3주차</span>
                        <span style={{ fontWeight: 'bold' }}>
                            <span style={{ color: '#dd36cf' }}>L</span>, <span style={{ color: '#FFA500' }}>A</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>4주차</span>
                        <span style={{ fontWeight: 'bold' }}>
                            <span style={{ color: 'gray' }}>-</span>, <span style={{ color: '#7099ff' }}>-</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>5주차</span>
                        <span style={{ fontWeight: 'bold' }}>
                            <span style={{ color: 'gray' }}>-</span>, <span style={{ color: '#7099ff' }}>-</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>6주차</span>
                        <span style={{ fontWeight: 'bold' }}>
                            <span style={{ color: 'gray' }}>-</span>, <span style={{ color: '#7099ff' }}>-</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>7주차</span>
                        <span style={{ fontWeight: 'bold' }}>
                            <span style={{ color: 'gray' }}>-</span>, <span style={{ color: '#7099ff' }}>-</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>8주차</span>
                        <span style={{ fontWeight: 'bold' }}>
                            <span style={{ color: 'gray' }}>-</span>, <span style={{ color: '#7099ff' }}>-</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>9주차</span>
                        <span style={{ fontWeight: 'bold' }}>
                            <span style={{ color: 'gray' }}>-</span>, <span style={{ color: '#7099ff' }}>-</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>10주차</span>
                        <span style={{ fontWeight: 'bold' }}>
                            <span style={{ color: 'gray' }}>-</span>, <span style={{ color: '#7099ff' }}>-</span>
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>11주차</span>
                        <span style={{ fontWeight: 'bold' }}>
                            <span style={{ color: 'gray' }}>-</span>, <span style={{ color: '#7099ff' }}>-</span>
                        </span>
                    </div>
                </>
                )}

            </div>


            <Spacer y={30} />
            <h3>과제</h3>
            <Spacer y={15} />
            {dataIsEmpty ? (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                        <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                <g fillRule="nonzero" stroke="var(--text-color)">
                                    <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                    <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                                </g>
                            </g>
                        </svg>
                        <span>아직 아무 내용도 없습니다!</span>
                    </div>
                </div>
            ) : (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    <div className="notice-item">
                        <span><b>과제명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>과제명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>과제명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>과제명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                    </div>
                </div>
            )}

            <Spacer y={30} />
            <h3>온라인시험</h3>
            <Spacer y={15} />
            {dataIsEmpty ? (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                        <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                <g fillRule="nonzero" stroke="var(--text-color)">
                                    <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                    <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                                </g>
                            </g>
                        </svg>
                        <span>아직 아무 내용도 없습니다!</span>
                    </div>
                </div>
            ) : (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    <div className="notice-item">
                        <span><b>시험명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>시험명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>시험명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>시험명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                    </div>
                </div>
            )}

            <Spacer y={30} />
            <h3>수시퀴즈</h3>
            <Spacer y={15} />
            {dataIsEmpty ? (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                        <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                <g fillRule="nonzero" stroke="var(--text-color)">
                                    <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                    <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                                </g>
                            </g>
                        </svg>
                        <span>아직 아무 내용도 없습니다!</span>
                    </div>
                </div>
            ) : (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    <div className="notice-item">
                        <span><b>시험명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>시험명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>시험명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>시험명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                    </div>
                </div>
            )}

            <Spacer y={30} />
            <h3>팀프로젝트</h3>
            <Spacer y={15} />
            {dataIsEmpty ? (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                        <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                <g fillRule="nonzero" stroke="var(--text-color)">
                                    <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                    <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                                </g>
                            </g>
                        </svg>
                        <span>아직 아무 내용도 없습니다!</span>
                    </div>
                </div>
            ) : (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    <div className="notice-item">
                        <span><b>팀프로젝트명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>팀프로젝트명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>팀프로젝트명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>팀프로젝트명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                    </div>
                </div>
            )}

            <Spacer y={30} />
            <h3>토론</h3>
            <Spacer y={15} />
            {dataIsEmpty ? (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                        <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                                <g fillRule="nonzero" stroke="var(--text-color)">
                                    <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                    <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa"></path>
                                </g>
                            </g>
                        </svg>
                        <span>아직 아무 내용도 없습니다!</span>
                    </div>
                </div>
            ) : (
                <div className="card non-anim" id="notices" style={{ paddingBottom: '20px' }}>
                    <div className="notice-item">
                        <span><b>과제명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>과제명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>과제명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                        <hr style={{ opacity: 0.3 }} />
                    </div>
                    <div className="notice-item">
                        <span><b>과제명</b></span><br />
                        <span style={{ opacity: 0.6, fontSize: '12px' }}><IonIcon style={{ position: 'relative', top: '2px', marginRight: '3px' }} name='time-outline' />
                            YYYY-MM-DD ~ YYYY-MM-DD</span><br />
                    </div>
                </div>
            )}

        </main>
    );
}
import IonIcon from '@reacticons/ionicons';
import { Skeleton, SkeletonBox } from 'skullet/react';
import KlasNativeBridge from '../../lib/core/klasNativeBridge';
import Card from '../common/Card';
import ToggleSwitch from '../common/ToggleSwitch';
import DeadlineContent from '../calendar/DeadlineContent';

const deadlinePlaceholder = (
    <>
        <div className="feed-deadline-filter">
            <SkeletonBox width="60%" height={16} />
            <div className="switch">
                <SkeletonBox width="100%" height="100%" radius="999px" style={{ transform: 'scale(0.8)' }} />
            </div>
        </div>
        <div className="deadline-grid feed-deadline-grid--sample">
            {[0, 1, 2].map((index) => (
                <Card key={index} isAnimated={false}>
                    <div className="feed-deadline-sample-lines">
                        <SkeletonBox width="45%" height={18} />
                        <SkeletonBox width="70%" height={20} />
                        <SkeletonBox width="55%" height={20} />
                        <SkeletonBox width="65%" height={20} />
                    </div>
                </Card>
            ))}
        </div>
    </>
);

export default function FeedDeadlines({ items, showToggle, excludeNotStarted, onToggle, yearHakgi }) {
    return (
        <div className={items?.length === 0 ? undefined : 'feed-deadlines'}>
            <Skeleton
                loading={items === null}
                label="남은 할 일 불러오는 중"
                skeleton={deadlinePlaceholder}
            >
                {items && (
                    <>
                        {showToggle && (
                            <ToggleSwitch
                                label="아직 시작일이 되지 않은 항목 숨기기"
                                checked={excludeNotStarted}
                                onChange={onToggle}
                                id="exclude-not-started"
                                className="feed-deadline-filter"
                            />
                        )}
                        <div id="remaining-deadline" className="deadline-grid">
                            {items.length === 0 ? (
                                <Card title="남은 할 일" isAnimated={false} style={{ paddingBottom: '30px' }}>
                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '10px', opacity: '.3' }}>
                                        <IonIcon name="checkmark-circle" style={{ fontSize: '50px', marginBottom: '5px' }} />
                                        <span>할 일을 모두 끝냈어요!</span>
                                    </div>
                                </Card>
                            ) : (
                                items.map((item) => (
                                    <Card key={item.subj} style={{ paddingBottom: '15px' }}>
                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', margin: '-5px -5px 0 0' }}>
                                            <b style={{ fontSize: '15px' }}>{item.name}</b>
                                            <div style={{ position: 'relative', top: '-8px', right: '-5px' }}>
                                                <button
                                                    style={{ width: 'fit-content', background: 'var(--background)', fontSize: '12px', padding: '8px 10px' }}
                                                    onClick={() => KlasNativeBridge.openLectureActivity(item.subj, item.name)}
                                                >
                                                    강의 홈
                                                </button>
                                            </div>
                                        </div>

                                        <div onClick={() => KlasNativeBridge.evaluate('/std/lis/evltn/OnlineCntntsStdPage.do', yearHakgi, item.subj)}>
                                            <DeadlineContent name="온라인 강의" data={item.onlineLecture} />
                                        </div>
                                        <div onClick={() => KlasNativeBridge.evaluate('/std/lis/evltn/TaskStdPage.do', yearHakgi, item.subj)}>
                                            <DeadlineContent name="과제" data={item.task} />
                                        </div>
                                        <div onClick={() => KlasNativeBridge.evaluate('/std/lis/evltn/PrjctStdPage.do', yearHakgi, item.subj)}>
                                            <DeadlineContent name="팀 프로젝트" data={item.teamTask} />
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </>
                )}
            </Skeleton>
        </div>
    );
}

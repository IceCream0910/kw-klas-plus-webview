import KlasNativeBridge from '../../lib/core/klasNativeBridge';
import IonIcon from '@reacticons/ionicons';
import { Skeleton, SkeletonBox, SkulletProvider } from 'skullet/react';

function ProfileIdentity({ profile, onCardClick }) {
    const data = profile?.data;
    const loading = !profile;
    const Container = data ? 'button' : 'div';
    const department = data && (profile?.stdInfo?.hakgwa || data.hakgwa);

    return (
        <Container
            className="profile-card-identity"
            type={data ? 'button' : undefined}
            onClick={data ? onCardClick : undefined}
        >
            <span className="profile-card-identity-fields">
                <strong className="rr-mask profile-card-name">
                    {loading ? <SkeletonBox width="6rem" height={16} /> : data?.kname ?? '학적 정보를 불러오지 못했어요'}
                </strong>
                <span className="profile-card-student">
                    {loading ? <SkeletonBox width="min(100%, 15rem)" height={12} /> : (
                        <>
                            {department && <span className="rr-mask">{department}{data.hakbun ? ' |' : ''}</span>}
                            {data?.hakbun && <span className="rr-mask">{data.hakbun}</span>}
                        </>
                    )}
                </span>
                <span className="rr-mask profile-card-enrollment">
                    {loading ? <SkeletonBox width="4rem" height={10} /> : data?.hakjukStatu}
                </span>
            </span>
            {data && <IonIcon name="chevron-forward-outline" aria-hidden="true" />}
        </Container>
    );
}

function ProfileGrades({ grade, loading = false }) {
    const summaries = [
        ['취득학점', grade?.credit],
        ['평균평점', grade?.averageGPA?.includeF],
        ['전공평점', grade?.majorGPA?.includeF]
    ];

    return (
        <div
            className="profile-card-grades"
            onClick={grade ? () => KlasNativeBridge.openPage('https://klasplus.yuntae.in/grade') : undefined}
        >
            {summaries.map(([label, value]) => (
                <div key={label}>
                    <span>{label}</span>
                    <h3 className="rr-mask">
                        {loading ? <SkeletonBox width="2.5rem" height={14} /> : value ?? '–'}
                    </h3>
                </div>
            ))}
        </div>
    );
}

export default function ProfileCard({ profile, totGrade, onCardClick }) {
    return (
        <div className="profile-card">
            <SkulletProvider reveal="together">
                <Skeleton
                    className="profile-card-section"
                    loading={!profile}
                    label="학적 정보 불러오는 중"
                    skeleton={<ProfileIdentity />}
                >
                    {profile && <ProfileIdentity profile={profile} onCardClick={onCardClick} />}
                </Skeleton>

                <Skeleton
                    className="profile-card-section"
                    loading={totGrade === undefined}
                    label="성적 불러오는 중"
                    skeleton={<ProfileGrades loading />}
                >
                    {totGrade !== undefined && <ProfileGrades grade={totGrade} />}
                </Skeleton>
            </SkulletProvider>
        </div>
    );
}

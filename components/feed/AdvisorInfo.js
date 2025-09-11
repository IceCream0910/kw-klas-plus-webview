import IonIcon from '@reacticons/ionicons';
import { openKlasPage } from '../../lib/core/androidBridge';
import { SkeletonLayouts } from '../common/Skeleton';
import Card from '../common/Card';


function AdvisorInfo({ advisor, isLoading }) {
    if (isLoading) {
        return <SkeletonLayouts.AdvisorInfo />;
    }

    if (!advisor) {
        return null;
    }

    const contactItems = [
        {
            icon: 'mail-outline',
            content: advisor.email,
            isClickable: false
        },
        {
            icon: 'call-outline',
            content: advisor.telNum,
            isClickable: false
        },
        {
            icon: 'location-outline',
            content: advisor.labLocation,
            isClickable: false
        },
        {
            icon: 'time-outline',
            content: advisor.counselTime ? `상담시간: ${advisor.counselTime}` : null,
            isClickable: false
        },
        {
            icon: 'globe-outline',
            content: advisor.homepage,
            isClickable: true,
            onClick: () => openKlasPage(advisor.homepage)
        }
    ].filter(item => item.content);

    return (
        <Card title="책임지도교수" isAnimated={false} style={{ paddingBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {advisor.kname || '정보 없음'}
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {contactItems.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <IonIcon name={item.icon} style={{ opacity: 0.7 }} />
                        {item.isClickable ? (
                            <span
                                onClick={item.onClick}
                                style={{
                                    fontSize: '14.4px',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                {item.content}
                            </span>
                        ) : (
                            <span style={{ fontSize: '14.4px' }}>
                                {item.content}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
}

export default AdvisorInfo;

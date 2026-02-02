import { UI_CONSTANTS } from '../../lib/core/constants';


function Skeleton({ width = '100%', height = UI_CONSTANTS.SKELETON_HEIGHT.MEDIUM, className = '', style = {} }) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width,
                height,
                ...style
            }}
        />
    );
}

function SkeletonGroup({ items, className = '' }) {
    return (
        <div className={className}>
            {items.map((item, index) => (
                <Skeleton
                    key={index}
                    width={item.width}
                    height={item.height}
                    style={{ marginBottom: '10px', ...item.style }}
                />
            ))}
        </div>
    );
}

export const SkeletonLayouts = {
    Card: () => (
        <Skeleton height={UI_CONSTANTS.SKELETON_HEIGHT.LARGE} />
    ),

    NoticeList: () => (
        <SkeletonGroup
            items={[
                { height: UI_CONSTANTS.SKELETON_HEIGHT.MEDIUM },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.MEDIUM },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.MEDIUM },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.MEDIUM },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.MEDIUM },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.MEDIUM }
            ]}
        />
    ),

    GradeCard: () => (
        <Skeleton height="70px" />
    ),

    CafeteriaInfo: () => (
        <SkeletonGroup
            items={[
                { height: UI_CONSTANTS.SKELETON_HEIGHT.SMALL, width: '30%', style: { marginTop: '-10px' } },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.SMALL, width: '50%' },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.SMALL, width: '40%' },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.SMALL, width: '70%', style: { marginBottom: '20px' } }
            ]}
        />
    ),

    CurrentStatus: () => (
        <SkeletonGroup
            items={[
                { height: '30px', width: '30%', style: { marginBottom: '10px' } },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.SMALL, width: '60%' }
            ]}
        />
    ),

    Chart: () => (
        <Skeleton height="200px" />
    ),

    DeadlineList: () => (
        <SkeletonGroup
            items={[
                { height: UI_CONSTANTS.SKELETON_HEIGHT.LARGE },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.LARGE },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.LARGE }
            ]}
        />
    ),

    AdvisorInfo: () => (
        <Skeleton height={UI_CONSTANTS.SKELETON_HEIGHT.EXTRA_LARGE} />
    ),

    Timetable: () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', padding: '15px' }}>

            {Array.from({ length: 5 }).map((_, hour) => (
                <div key={`row-${hour}`} style={{ display: 'contents' }}>
                    {Array.from({ length: 5 }).map((_, day) => (
                        <Skeleton key={`cell-${day}-${hour}`} height="80px" />
                    ))}
                </div>
            ))}
        </div>
    ),

    IdCard: () => (
        <div style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '10px'
        }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'start', marginBottom: '20px' }}>
                <Skeleton width="100px" height="130px" style={{ borderRadius: '16px', flexShrink: 0 }} />
                <div style={{ flex: 1, paddingTop: '5px' }}>
                    <Skeleton width="60%" height="30px" style={{ marginBottom: '10px' }} />
                    <Skeleton width="40%" height="20px" style={{ marginBottom: '15px' }} />
                    <Skeleton width="70%" height="15px" style={{ marginBottom: '5px' }} />
                    <Skeleton width="50%" height="15px" />
                </div>
            </div>
            <Skeleton width="100%" height="50px" />
        </div>
    )
};

export { SkeletonLayouts };
export default Skeleton;

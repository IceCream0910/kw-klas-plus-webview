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
    )
};

export default Skeleton;

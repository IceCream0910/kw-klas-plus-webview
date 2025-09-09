import { UI_CONSTANTS } from '../../lib/constants';

/**
 * 스켈레톤 UI 컴포넌트
 */
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

/**
 * 여러 스켈레톤을 그룹으로 표시하는 컴포넌트
 */
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

/**
 * 미리 정의된 스켈레톤 레이아웃들
 */
export const SkeletonLayouts = {
    // 카드 스켈레톤
    Card: () => (
        <Skeleton height={UI_CONSTANTS.SKELETON_HEIGHT.LARGE} />
    ),

    // 공지사항 목록 스켈레톤
    NoticeList: () => (
        <SkeletonGroup
            items={[
                { height: UI_CONSTANTS.SKELETON_HEIGHT.MEDIUM },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.MEDIUM },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.MEDIUM }
            ]}
        />
    ),

    // 성적 카드 스켈레톤
    GradeCard: () => (
        <Skeleton height="70px" />
    ),

    // 학식 정보 스켈레톤
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

    // 현재 상태 스켈레톤
    CurrentStatus: () => (
        <SkeletonGroup
            items={[
                { height: '30px', width: '30%', style: { marginBottom: '10px' } },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.SMALL, width: '60%' }
            ]}
        />
    ),

    // 차트 스켈레톤
    Chart: () => (
        <Skeleton height="200px" />
    ),

    // 마감일 목록 스켈레톤
    DeadlineList: () => (
        <SkeletonGroup
            items={[
                { height: UI_CONSTANTS.SKELETON_HEIGHT.LARGE },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.LARGE },
                { height: UI_CONSTANTS.SKELETON_HEIGHT.LARGE }
            ]}
        />
    ),

    // 교수 정보 스켈레톤
    AdvisorInfo: () => (
        <Skeleton height={UI_CONSTANTS.SKELETON_HEIGHT.EXTRA_LARGE} />
    )
};

export default Skeleton;

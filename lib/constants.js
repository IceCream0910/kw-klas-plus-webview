// 애플리케이션 전체에서 사용되는 상수들
export const TIME_CONSTANTS = {
    MINUTE_TO_MS: 60000,
    HOUR_TO_MS: 3600000,
    DAY_TO_MS: 86400000,
    UPDATE_INTERVAL: 60000, // 1분
};

export const DEADLINE_COLORS = {
    URGENT: 'var(--red)',     // 24시간 이내
    WARNING: 'var(--orange)', // 96시간 이내
    SAFE: 'var(--green)',     // 그 외
};

export const DEADLINE_THRESHOLDS = {
    URGENT: 24,   // hours
    WARNING: 96,  // hours
};

export const BUILDING_MAP_URLS = {
    '누리': 'https://naver.me/G65JGSGc',
    '문화': 'https://naver.me/FK5vCrqC',
    '한울': 'https://naver.me/5tJtisN6',
    '연구': 'https://naver.me/5eZJ0BvX',
    '옥의': 'https://naver.me/565F45w6',
    '비마': 'https://naver.me/xBwfkQLH',
    '참빛': 'https://naver.me/Gal5ZmBK',
    '새빛': 'https://naver.me/Gq8SGz6z',
    '화도': 'https://naver.me/5uIEX9an',
    '기념': 'https://naver.me/58NfGdrj'
};

export const WEEKEND_DAYS = [5, 6]; // Saturday, Sunday

export const KW_NOTICE_CATEGORIES = {
    ALL: "",
    ACADEMIC: "1"
};

export const PULL_TO_REFRESH_CONFIG = {
    distThreshold: 70,
    distMax: 80,
    distReload: 70,
    instructionsPullToRefresh: ' ',
    instructionsReleaseToRefresh: '새로고침하려면 놓기',
    instructionsRefreshing: '새로운 정보를 불러오는 중'
};

export const UI_CONSTANTS = {
    SKELETON_HEIGHT: {
        SMALL: '20px',
        MEDIUM: '50px',
        LARGE: '80px',
        EXTRA_LARGE: '150px'
    },
    CARD_BORDER_RADIUS: '15px',
    BUTTON_PADDING: '10px 15px'
};

const configuredAgentUrl = process.env.NEXT_PUBLIC_AGENT_API_URL
    || (process.env.NODE_ENV === 'development' ? 'http://localhost:8788' : '');

export const AGENT_API_URL = configuredAgentUrl.replace(/\/$/, '');

export const STARTER_PROMPTS = [
    { label: '이번 학기 기말고사 언제야?', icon: 'calendar-outline' },
    { label: '내 성적과 석차를 요약해줘', icon: 'stats-chart-outline' },
    { label: '최근 장학 내역을 알려줘', icon: 'school-outline' },
    { label: '오늘 학식 메뉴 뭐야?', icon: 'restaurant-outline' },
    { label: '최근 학교 공지사항을 요약해줘', icon: 'notifications-outline' },
    { label: '이번 주 학사일정 알려줘', icon: 'today-outline' },
    { label: '오늘 수업 강의실 확인해줘', icon: 'location-outline' },
    { label: '마감이 가까운 과제를 찾아줘', icon: 'checkmark-done-outline' },
    { label: '최근 강의 공지를 확인해줘', icon: 'megaphone-outline' },
    { label: '남은 온라인 강의를 알려줘', icon: 'play-circle-outline' },
    { label: '내 지도교수 정보를 알려줘', icon: 'person-outline' },
    { label: '이번 달 개인 일정을 보여줘', icon: 'calendar-number-outline' }
];

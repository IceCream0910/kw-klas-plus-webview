const links = [
    {
        emoji: '🔔',
        text: '공지사항',
        url: 'https://klasplus.yuntae.in/changelog'
    },
    {
        emoji: '📶',
        text: '서비스 상태',
        url: 'https://status.klasplus.yuntae.in/ko'
    },
    {
        emoji: '❓',
        text: '자주 묻는 질문(FAQ)',
        url: 'https://blog.yuntae.in/23363fe4-f23d-4677-8f71-7f33e502b13a'
    },
    {
        emoji: '🔒',
        text: '개인정보 처리방침',
        url: 'https://klasplus.yuntae.in/privacy'
    },
    {
        emoji: '🔧',
        text: '오픈소스 라이선스',
        url: 'https://blog.yuntae.in/11cfc9b9-3eca-802c-8c10-ebbccc3b2811'
    }
];

const handleLinkClick = (url) => {
    if (typeof window !== 'undefined' && window.Android) {
        window.Android.openExternalLink(url);
    }
};

const SettingsLinkSection = () => {
    return (
        <>
            {links.map((link, index) => (
                <button type="button" key={index} onClick={() => handleLinkClick(link.url)}>
                    <span className="tossface">{link.emoji}</span>
                    <span>{link.text}</span>
                </button>
            ))}
        </>
    );
};

export default SettingsLinkSection;

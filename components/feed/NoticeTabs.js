const tabs = [
    { id: "", label: "전체" },
    { id: "1", label: "학사" }
];

function NoticeTabs({ activeTab, onTabChange }) {
    return (
        <div style={{
            display: 'flex',
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'var(--background)',
            borderRadius: '15px',
            overflow: 'hidden',
            padding: '5px'
        }}>
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    style={{
                        padding: '6px 18px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: activeTab === tab.id ? 'var(--button-background)' : 'transparent',
                        color: activeTab === tab.id ? 'var(--button-text)' : 'var(--text-color)',
                        fontSize: '12px',
                        transition: 'background 0.2s'
                    }}
                >
                    {tab.label}
                </div>
            ))}
        </div>
    );
}

export default NoticeTabs;

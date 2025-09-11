import { useState, useEffect } from 'react';

const ThemeSelector = ({ active = "system" }) => {
    const [selectedTheme, setSelectedTheme] = useState('system');

    useEffect(() => {
        if (!active) return;
        setSelectedTheme(active);
    }, [active]);

    const themes = [
        { id: 'light', label: '밝은' },
        { id: 'dark', label: '어두운' },
        { id: 'system', label: '시스템 설정' }
    ];

    const containerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px',
        padding: '0 10px',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        flexWrap: 'wrap',
    };

    const themeItemStyle = (themeId) => ({
        width: '30%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s'
    });

    const iconContainerStyle = (themeId) => ({
        width: '100%',
        height: '70px',
        borderRadius: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: selectedTheme === themeId ? '2px solid #007AFF' : '2px solid transparent',
        position: 'relative'
    });

    const labelStyle = {
        fontSize: '14px',
        marginTop: '4px',
        opacity: .8
    };

    const textStyle = (themeId) => ({
        color: themeId === 'light' ? '#333' : '#fff',
        fontSize: '24px',
        fontWeight: '500',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    });

    const checkmarkStyle = {
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: '#007AFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '14px'
    };

    const handleThemeChange = (themeId) => {
        setSelectedTheme(themeId);
        if (typeof window !== 'undefined' && window.Android) {
            window.Android.changeAppTheme(themeId);
        }
    };

    return (
        <div style={containerStyle}>
            {themes.map((theme) => (
                <div
                    key={theme.id}
                    style={themeItemStyle(theme.id)}
                    onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onClick={() => handleThemeChange(theme.id)}
                >
                    <div style={iconContainerStyle(theme.id)}>
                        {theme.id === 'system' ? (
                            <>
                                <div style={{ width: '50%', height: '100%', backgroundColor: '#333', borderRadius: '13px 0 0 13px' }} />
                                <div style={{ width: '50%', height: '100%', backgroundColor: '#f5f5f5', borderRadius: '0 13px 13px 0' }} />
                            </>
                        ) : theme.id === 'light' ? (
                            <>
                                <div style={{ width: '100%', height: '100%', borderRadius: '13px', backgroundColor: '#f5f5f5' }} />
                            </>
                        ) : (
                            <>
                                <div style={{ width: '100%', height: '100%', borderRadius: '13px', backgroundColor: '#333' }} />
                            </>
                        )}
                        <span style={textStyle(theme.id)}>
                            A<span style={{ color: theme.id === 'system' ? '#333' : undefined }}>a</span>
                        </span>
                        {selectedTheme === theme.id && (
                            <div style={checkmarkStyle}>✓</div>
                        )}
                    </div>
                    <span style={labelStyle}>{theme.label}</span>
                </div>
            ))}
        </div>
    );
};

export default ThemeSelector;

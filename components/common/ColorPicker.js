import React, { useState, useEffect } from 'react';
import BottomSheet from './BottomSheet';
import { HexColorPicker } from 'react-colorful';

const PRESET_COLORS = [
    '#e95d5d', // Red
    '#e88a1e', // Orange
    '#ffae00', // Yellow
    '#0aa90a', // Green
    '#5688ff', // Blue
    '#7b6dff', // Purple
    '#3a3434', // Dark
    '#a0a0a0', // Gray
];

export default function ColorPicker({ open, onDismiss, color, onChange }) {
    const [selectedColor, setSelectedColor] = useState(color || PRESET_COLORS[0]);

    useEffect(() => {
        if (color) {
            setSelectedColor(color);
        }
    }, [color]);

    const handlePresetClick = (presetColor) => {
        setSelectedColor(presetColor);
    };

    const handleApply = () => {
        onChange(selectedColor);
        onDismiss();
    };

    return (
        <BottomSheet
            className="upper-sheet"
            open={open}
            onDismiss={onDismiss}
            nested={true}
        >
            <div style={styles.container}>
                <h3 style={styles.title}>색상 선택</h3>

                <div style={styles.presets}>
                    {PRESET_COLORS.map(c => (
                        <div
                            key={c}
                            onClick={() => handlePresetClick(c)}
                            style={{
                                ...styles.presetDot,
                                backgroundColor: c,
                                border: selectedColor.toLowerCase() === c.toLowerCase() ? '2px solid var(--text-color)' : '2px solid transparent'
                            }}
                        />
                    ))}
                    <div
                        style={{
                            ...styles.presetDot,
                            backgroundColor: selectedColor,
                            border: '2px solid var(--text-color)',
                            display: PRESET_COLORS.includes(selectedColor.toLowerCase()) ? 'none' : 'block'
                        }}
                    >
                        <span style={styles.presetCustomLabel}>★</span>
                    </div>
                </div>

                <style>{`
                    .custom-layout .react-colorful {
                        width: 100%;
                        height: 240px;
                    }
                    .custom-layout .react-colorful__pointer {
                        width: 24px;
                        height: 24px;
                    }
                    .custom-layout .react-colorful__hue {
                        height: 24px;
                        border-radius: 12px;
                        margin-top: 20px;
                    }
                    .custom-layout .react-colorful__saturation {
                        border-radius: 12px;
                        border-bottom: none;
                    }
                `}</style>

                <div className="custom-layout" style={styles.canvasContainer}>
                    <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
                </div>

                <div style={styles.resultContainer}>
                    <div style={{ ...styles.colorPreview, backgroundColor: selectedColor }} />
                    <span style={styles.hexText}>{selectedColor.toUpperCase()}</span>
                </div>
            </div>

            <div className='bottom-sheet-footer'>
                <BottomSheet.Close asChild>
                    <button type="button" style={styles.cancelBtn}>취소</button>
                </BottomSheet.Close>
                <button type="button" onClick={handleApply} style={styles.applyBtn}>적용</button>
            </div>
        </BottomSheet>
    );
}

const styles = {
    container: {
        padding: '20px',
        paddingBottom: '80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    title: {
        margin: 0,
        fontSize: '18px'
    },
    presets: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
    },
    presetDot: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    presetCustomLabel: {
        color: '#fff',
        fontSize: '12px',
        textShadow: '0 0 2px rgba(0,0,0,0.5)'
    },
    canvasContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
    },
    resultContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 15px',
        backgroundColor: 'var(--card-background)',
        borderRadius: '12px'
    },
    colorPreview: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: '1px solid var(--card-border)'
    },
    hexText: {
        fontSize: '16px',
        fontWeight: 'bold',
        fontFamily: 'monospace'
    },
    cancelBtn: {
        backgroundColor: 'var(--card-background)',
        color: 'var(--text-color)'
    },
    applyBtn: {
        backgroundColor: 'var(--button-background)',
        color: 'var(--button-text)',
        fontWeight: 'bold'
    }
};

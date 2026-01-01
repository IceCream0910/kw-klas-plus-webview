import React, { useMemo, useRef } from 'react';

const DEFAULT_CONFIG = {
    position: 'bottom',
    strength: 2,
    height: '6rem',
    opacity: 1,
    zIndex: 1000,
    target: 'parent',
    className: '',
    style: {}
};

const PRESETS = {
    top: { position: 'top', height: '6rem' },
    bottom: { position: 'bottom', height: '6rem' },
    header: { position: 'top', height: '8rem' },
    footer: { position: 'bottom', height: '8rem' }
};

const mergeConfigs = (...configs) => configs.reduce((acc, c) => ({ ...acc, ...c }), {});

function GradualBlur(props) {
    const containerRef = useRef(null);

    const config = useMemo(() => {
        const presetConfig = props.preset && PRESETS[props.preset] ? PRESETS[props.preset] : {};
        return mergeConfigs(DEFAULT_CONFIG, presetConfig, props);
    }, [props]);

    const blurLayers = [
        { blur: 57.97, maskStart: 0, maskMid1: 12.5, maskMid2: 25 },
        { blur: 26.25, maskStart: 12.5, maskMid1: 25, maskMid2: 37.5 },
        { blur: 11.89, maskStart: 25, maskMid1: 37.5, maskMid2: 50 },
        { blur: 5.38, maskStart: 37.5, maskMid1: 50, maskMid2: 62.5 },
        { blur: 2.44, maskStart: 50, maskMid1: 62.5, maskMid2: 75 },
        { blur: 1.10, maskStart: 62.5, maskMid1: 75, maskMid2: 87.5 },
        { blur: 0.5, maskStart: 75, maskMid1: 87.5, maskMid2: 100 }
    ];

    const adjustedBlurLayers = useMemo(() => {
        return blurLayers.map(layer => ({
            ...layer,
            blur: layer.blur * (config.strength / 2)
        }));
    }, [config.strength]);

    const containerStyle = useMemo(() => {
        const isVertical = ['top', 'bottom'].includes(config.position);
        const isPageTarget = config.target === 'page';

        const baseStyle = {
            position: isPageTarget ? 'fixed' : 'absolute',
            pointerEvents: 'none',
            zIndex: config.zIndex,
            ...config.style
        };

        if (isVertical) {
            baseStyle.height = config.height;
            baseStyle.width = '100%';
            baseStyle.left = 0;
            baseStyle.right = 0;

            if (config.position === 'top') {
                baseStyle.top = 0;
            } else if (config.position === 'bottom') {
                baseStyle.bottom = 0;
            }

            baseStyle.transformOrigin = config.position === 'top' ? 'center top' : 'center bottom';
        }

        return baseStyle;
    }, [config]);

    const getMaskGradient = (layer) => {
        if (config.position === 'top') {
            return `linear-gradient(to bottom, rgb(0, 0, 0) ${layer.maskStart}%, rgb(0, 0, 0) ${layer.maskMid1}%, rgba(0, 0, 0, 0) ${layer.maskMid2}%)`;
        } else {
            return `linear-gradient(to top, rgb(0, 0, 0) ${layer.maskStart}%, rgb(0, 0, 0) ${layer.maskMid1}%, rgba(0, 0, 0, 0) ${layer.maskMid2}%)`;
        }
    };

    return (
        <div ref={containerRef} style={containerStyle}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }}>
                {adjustedBlurLayers.map((layer, idx) => (
                    <div
                        key={`blur-${idx}`}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: idx + 2,
                            mask: getMaskGradient(layer),
                            WebkitMask: getMaskGradient(layer),
                            backdropFilter: `blur(${layer.blur.toFixed(2)}px)`,
                            WebkitBackdropFilter: `blur(${layer.blur.toFixed(2)}px)`,
                            opacity: config.opacity
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

const GradualBlurMemo = React.memo(GradualBlur);
GradualBlurMemo.displayName = 'GradualBlur';
GradualBlurMemo.PRESETS = PRESETS;
export default GradualBlurMemo;



import { useLayoutEffect, useRef } from 'react';
import MenuButton from './MenuButton';

const FavoriteSection = ({ menuItems, favorites, onMenuClick, onFavoriteToggle }) => {
    const sectionRef = useRef(null);
    const contentRef = useRef(null);
    const updateHeightRef = useRef(null);

    useLayoutEffect(() => {
        const section = sectionRef.current;
        const content = contentRef.current;
        if (!section.animate) return;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let targetHeight = parseFloat(getComputedStyle(content).height);
        let animation;
        const stopAnimation = () => {
            animation?.cancel();
            animation = undefined;
        };
        const updateHeight = () => {
            const nextHeight = parseFloat(getComputedStyle(content).height);
            if (nextHeight === targetHeight) return;

            const currentHeight = animation ? parseFloat(getComputedStyle(section).height) : targetHeight;
            targetHeight = nextHeight;
            stopAnimation();
            if (reducedMotion.matches || currentHeight === nextHeight) return;

            const transition = section.animate([
                { height: `${currentHeight}px`, overflow: 'clip' },
                { height: `${nextHeight}px`, overflow: 'clip' }
            ], { duration: 220, easing: 'ease-out' });
            animation = transition;
            transition.onfinish = () => {
                if (animation === transition) animation = undefined;
            };
        };

        updateHeightRef.current = updateHeight;
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateHeight);
        observer?.observe(content);
        reducedMotion.addEventListener('change', stopAnimation);
        return () => {
            updateHeightRef.current = null;
            observer?.disconnect();
            reducedMotion.removeEventListener('change', stopAnimation);
            stopAnimation();
        };
    }, []);

    useLayoutEffect(() => {
        // Measure insertions before paint so saved favorites do not flash at full height.
        updateHeightRef.current?.();
    }, [favorites]);

    const favoriteItems = menuItems.flatMap(category =>
        category.items.filter(item => favorites.includes(item.url))
    );

    return (
        <div ref={sectionRef}>
            <div ref={contentRef} className="profile-favorites-content">
                {favoriteItems.length > 0 && (
                    <>
                        <h5 style={{ marginLeft: '10px', marginTop: '30px', marginBottom: '10px' }}>즐겨찾기</h5>
                        {favoriteItems.map((item) => (
                            <MenuButton
                                key={item.url}
                                item={item}
                                isFavorite={true}
                                onMenuClick={onMenuClick}
                                onFavoriteToggle={onFavoriteToggle}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default FavoriteSection;

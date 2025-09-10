import MenuButton from './MenuButton';

const FavoriteSection = ({ menuItems, favorites, onMenuClick, onFavoriteToggle }) => {
    const favoriteItems = menuItems.flatMap(category =>
        category.items.filter(item => favorites.includes(item.url))
    );

    if (favoriteItems.length === 0) return null;

    return (
        <div>
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
        </div>
    );
};

export default FavoriteSection;

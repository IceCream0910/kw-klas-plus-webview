import Spacer from '../common/spacer';
import MenuButton from './MenuButton';

const MenuSection = ({ category, favorites, onMenuClick, onFavoriteToggle }) => (
    <div>
        {category.title ? (
            <h5 style={{ marginLeft: '10px', marginTop: '30px', marginBottom: '10px' }}>
                {category.title}
            </h5>
        ) : (
            <Spacer y={15} />
        )}
        {category.items.map((item, itemIndex) => (
            <MenuButton
                key={`item-${itemIndex}`}
                item={item}
                isFavorite={favorites.includes(item.url)}
                onMenuClick={onMenuClick}
                onFavoriteToggle={onFavoriteToggle}
            />
        ))}
    </div>
);

export default MenuSection;

import IonIcon from '@reacticons/ionicons';

const MenuButton = ({ item, isFavorite, onMenuClick, onFavoriteToggle }) => (
    <button onClick={() => onMenuClick(item.url)}>
        <span className="tossface">{item.icon}</span>
        <span>{item.name}</span>
        {item.badge && (
            <span style={{
                background: 'var(--button-background)',
                padding: '3px 5px',
                borderRadius: '10px',
                fontSize: '12px',
                position: 'relative',
                left: '5px',
                top: '-1px',
                opacity: 0.8
            }}>
                {item.badge}
            </span>
        )}
        <button
            onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle(item);
            }}
            style={{
                float: 'right',
                width: '20px',
                height: 'fit-content',
                padding: '0',
                opacity: isFavorite ? '.8' : '.5',
                color: isFavorite ? 'var(--red)' : 'inherit'
            }}
        >
            <IonIcon name={isFavorite ? 'star' : 'star-outline'} />
        </button>
    </button>
);

export default MenuButton;

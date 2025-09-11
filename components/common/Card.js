import { UI_CONSTANTS } from '../../lib/core/constants';

function Card({
    children,
    title,
    className = '',
    style = {},
    onClick,
    actionButton,
    isAnimated = true
}) {
    const cardClass = `card ${isAnimated ? '' : 'non-anim'} ${className}`;

    return (
        <div
            className={cardClass}
            style={{
                borderRadius: UI_CONSTANTS.CARD_BORDER_RADIUS,
                ...style
            }}
            onClick={onClick}
        >
            {title && (
                <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{title}</span>
                    {actionButton}
                </div>
            )}
            {children && (
                <div className="card-content">
                    {children}
                </div>
            )}
        </div>
    );
}

export default Card;

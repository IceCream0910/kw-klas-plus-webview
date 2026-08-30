function Spacer({ y, className, style }) {
    return (
        <div className={className} style={{ height: `${y}px`, ...style }} />
    );
}

export default Spacer;

import IonIcon from '@reacticons/ionicons';
import React from 'react';
import { Drawer } from 'vaul';

export default function BottomSheet({
    open,
    onDismiss,
    children,
    draggable = true,
    className = '',
    style = {},
    nested = false,
    title = '',
    ...props
}) {
    const RootComponent = nested ? Drawer.NestedRoot : Drawer.Root;

    return (
        <RootComponent
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen && onDismiss) {
                    onDismiss();
                }
            }}
            dismissible={draggable}
        >
            <Drawer.Portal>
                <Drawer.Overlay className={`vaul-overlay ${className === 'upper-sheet' ? 'upper-sheet-overlay' : ''}`} />
                <Drawer.Content
                    className={`vaul-content ${className}`}
                    style={style}
                    aria-describedby={undefined}
                    {...(!title ? { 'aria-labelledby': undefined } : {})}
                >
                    {draggable && <Drawer.Handle />}
                    {title && <Drawer.Title style={{ marginBottom: '30px' }}>{title}</Drawer.Title>}
                    {children}
                </Drawer.Content>
            </Drawer.Portal>
        </RootComponent>
    );
}

BottomSheet.Close = Drawer.Close;

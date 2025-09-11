import { BottomSheet } from 'react-spring-bottom-sheet';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import IonIcon from '@reacticons/ionicons';
import Spacer from '../common/spacer';

const MenuSettingsModal = ({ isOpen, onClose, menuOrder, onMenuReorder, onResetMenuOrder }) => (
    <BottomSheet
        open={isOpen}
        onDismiss={onClose}
        draggable={false}
    >
        <div style={{ maxHeight: '100dvh', padding: '20px', overflow: 'hidden' }}>
            <h2>메뉴 순서 편집</h2>
            <Spacer y={20} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.6, fontSize: '15px' }}>메뉴 순서를 드래그하여 변경하세요</span>
                <button
                    onClick={onResetMenuOrder}
                    style={{
                        background: 'var(--card-background)',
                        padding: '0',
                        width: '30px',
                        height: '30px',
                        fontSize: '16px',
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: '-5px'
                    }}
                >
                    <IonIcon name='refresh-outline' />
                </button>
            </div>
            <DragDropContext onDragEnd={onMenuReorder}>
                <Droppable droppableId="menu-list">
                    {(provided) => (
                        <ul style={{ padding: 0 }} {...provided.droppableProps} ref={provided.innerRef}>
                            {menuOrder.map((title, index) => (
                                <Draggable key={`draggable-${index}`} draggableId={title} index={index}>
                                    {(provided) => (
                                        <li
                                            className="menu-item-draggable"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                                ...provided.draggableProps.style
                                            }}
                                        >
                                            <IonIcon name='menu-outline' style={{ marginRight: '10px', opacity: 0.7 }} />
                                            {title}
                                        </li>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
            <Spacer y={90} />
        </div>

        <div className='bottom-sheet-footer'>
            <button onClick={onClose}>확인</button>
        </div>
    </BottomSheet>
);

export default MenuSettingsModal;

"use client";
import { useState, useEffect } from "react";
import IonIcon from '@reacticons/ionicons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Spacer from "../../components/common/spacer";

export default function MenuOrderModal() {
    const [menuOrder, setMenuOrder] = useState([]);

    useEffect(() => {
        const savedMenuOrder = localStorage.getItem('menuOrder');
        if (savedMenuOrder) {
            const parsedMenuOrder = JSON.parse(savedMenuOrder).filter(title => !title.includes("KLAS+"));
            setMenuOrder(parsedMenuOrder);
        } else {
            const defaultOrder = menuItems.map(item => item.title);
            setMenuOrder(defaultOrder);
        }
    }, []);

    const menuItems = [
        { title: "수강관리" },
        { title: "학습결과" },
        { title: "학적관리" },
        { title: "학습지원실" },
        { title: "온라인 강의" },
        { title: "학생(수강)상담" },
        { title: "학습성과 성취도 평가" },
        { title: "이수현황점검" },
        { title: "등록관리" },
        { title: "상담관리" },
        { title: "행정 서비스" }
    ];

    const handleMenuReorder = (result) => {
        if (!result.destination) return;

        const items = Array.from(menuOrder);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setMenuOrder(items);
        localStorage.setItem('menuOrder', JSON.stringify(items));
    };

    const handleResetMenuOrder = () => {
        const defaultOrder = menuItems.map(item => item.title);
        setMenuOrder(defaultOrder);
        localStorage.setItem('menuOrder', JSON.stringify(defaultOrder));
    };

    const handleClose = () => {
        try {
            Android.closeWebViewBottomSheet();
        } catch (e) {
            console.log("Error closing bottom sheet", e);
        }
    };

    return (
        <div style={{ maxHeight: '100dvh', padding: '20px', overflow: 'hidden' }}>
            <h2>메뉴 순서 편집</h2>
            <Spacer y={20} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: .6, fontSize: '15px' }}>메뉴 순서를 드래그하여 변경하세요</span>
                <button
                    onClick={handleResetMenuOrder}
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
            <DragDropContext onDragEnd={handleMenuReorder}>
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
                                            <IonIcon name='menu-outline' style={{ marginRight: '10px', opacity: .7 }} />
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
            <Spacer y={20} />

            <div className='bottom-sheet-footer'>
                <button onClick={handleClose}>확인</button>
            </div>
        </div>
    );
}

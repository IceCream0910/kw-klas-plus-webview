import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Html, Edges, Center } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { getBuildingMapUrl } from '../../lib/lecture/lectureUtils';

const BUILDING_DATA = {
    '화도': { meshName: 'TPX_Buildings_mesh9', label: '화도관' },
    '비마': { meshName: 'TPX_Buildings_mesh0', label: '비마관' },
    '복지': { meshName: 'TPX_Buildings_mesh16', label: '복지관' },
    '기념': { meshName: 'TPX_Buildings_mesh18', label: '기념관' },
    '옥의': { meshName: 'TPX_Buildings_mesh17', label: '옥의관' },
    '새빛': { meshName: 'TPX_Buildings_mesh7', label: '새빛관' },
    '참빛': { meshName: 'TPX_Buildings_mesh5', label: '참빛관' },
    '문화': { meshName: 'TPX_Buildings_mesh33', label: '문화관' },
    '연구': { meshName: 'TPX_Buildings_mesh34', label: '연구관' },
    '한울': { meshName: 'TPX_Buildings_mesh23', label: '한울관' },
    '누리': { meshName: 'TPX_Buildings_mesh39', label: '누리관' },
};

function CampusScene({ selectedId, onBuildingSelect }) {
    const obj = useLoader(OBJLoader, 'campusMap.obj');
    const [hoveredMesh, setHoveredMesh] = useState(null);

    const meshes = useMemo(() => obj?.children || [], [obj]);

    const getActiveMeshName = (id) => {
        if (!id) return null;
        const key = Object.keys(BUILDING_DATA).find(k => id.includes(k));
        return key ? BUILDING_DATA[key].meshName : null;
    };

    const activeMeshName = getActiveMeshName(selectedId);

    return (
        <group dispose={null} rotation={[0, 0, Math.PI / 250]}>
            <Center>
                {meshes.map((child) => {
                    if (child.type !== 'Mesh') return null;

                    const meshName = child.name;
                    const buildingKey = Object.keys(BUILDING_DATA).find(key =>
                        BUILDING_DATA[key].meshName === meshName
                    );
                    const buildingInfo = buildingKey ? BUILDING_DATA[buildingKey] : null;
                    const isGreenZone = meshName.includes('GreenAreas');
                    const isSelected = activeMeshName === meshName;
                    const isHovered = hoveredMesh === meshName;

                    // 녹지 렌더링
                    if (isGreenZone) {
                        return (
                            <mesh
                                key={meshName}
                                geometry={child.geometry}
                                rotation={child.rotation}
                                scale={child.scale}
                                style={{ pointerEvents: 'none' }}
                            >
                                <meshStandardMaterial
                                    color="#caf6cb"
                                    roughness={0.9}
                                    metalness={0}
                                />
                            </mesh>
                        );
                    }

                    // 건물 렌더링
                    return (
                        <mesh
                            key={meshName}
                            geometry={child.geometry}
                            rotation={child.rotation}
                            scale={child.scale}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (buildingKey) {
                                    onBuildingSelect(buildingKey);
                                } else {
                                    console.log('Clicked Mesh:', meshName);
                                }
                            }}
                            onPointerOver={(e) => {
                                e.stopPropagation();
                                if (buildingInfo) setHoveredMesh(meshName);
                            }}
                            onPointerOut={() => setHoveredMesh(null)}
                        >
                            <meshStandardMaterial
                                color={isSelected ? '#ff8686' : (isHovered ? '#ffd2d2' : '#ffffff')}
                                roughness={0.8}
                                metalness={0.1}
                                transparent={!buildingInfo}
                                opacity={buildingInfo ? 1 : 0.1}
                            />
                            <Edges
                                threshold={15}
                                color={isSelected ? '#ff8686' : '#cccccc'}
                            />
                            {(isSelected || isHovered) && buildingInfo && (
                                <Html distanceFactor={60} position={[0, 15, 0]} center>
                                    <div style={{
                                        background: isSelected ? '#6c8dff' : 'rgba(0,0,0,0.6)',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        whiteSpace: 'nowrap',
                                        fontWeight: isSelected ? 'bold' : 'normal',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}>
                                        {buildingInfo.label}
                                    </div>
                                </Html>
                            )}
                        </mesh>
                    );
                })}
            </Center>
        </group>
    );
}

const openExternalMap = (buildingName) => {
    const mapUrl = getBuildingMapUrl(buildingName);
    if (!mapUrl) return;
    try {
        if (window.Android && window.Android.openExternalLink) {
            window.Android.openExternalLink(mapUrl);
        } else {
            window.open(mapUrl, '_blank');
        }
    } catch (_err) {
        window.open(mapUrl, '_blank');
    }
};

export default function CampusMapSheet({ open, buildingName, onClose }) {
    const [selectedId, setSelectedId] = useState(buildingName || null);
    const controlsRef = useRef(null);

    useEffect(() => {
        setSelectedId(buildingName || null);
    }, [buildingName]);

    useEffect(() => {
        if (controlsRef.current) {
            const controls = controlsRef.current;
            const initialY = controls.target.y;
            const handleChange = () => {
                controls.target.y = initialY;
            };
            controls.addEventListener('change', handleChange);
            return () => controls.removeEventListener('change', handleChange);
        }
    }, []);

    const activeLabel = (selectedId) => {
        if (!selectedId) return null;
        const key = Object.keys(BUILDING_DATA).find(k => selectedId.includes(k));
        return key ? BUILDING_DATA[key].label : selectedId;
    };

    const currentLabel = activeLabel(selectedId);
    const hasExternalLink = !!getBuildingMapUrl(selectedId);

    const stopPropagation = (e) => {
        e.stopPropagation();
    };

    return (
        <BottomSheet
            open={open}
            onDismiss={onClose}
            expandOnContentDrag={false}
            scrollLocking={false}
        >
            <div style={{ padding: '4px 16px 30px 16px', pointerEvents: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                        <div style={{ fontSize: '13px', opacity: 0.6 }}>캠퍼스맵</div>
                        <div style={{ fontSize: '20px', fontWeight: 700 }}>
                            {currentLabel || '건물을 선택하세요'}
                        </div>
                    </div>
                </div>

                <div
                    onTouchStart={stopPropagation}
                    onTouchMove={stopPropagation}
                    onTouchEnd={stopPropagation}
                    style={{
                        width: '100%',
                        height: '200px',
                        background: '#e0e2e5',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1px solid #d1d5db',
                        marginBottom: '16px',
                        position: 'relative',
                        touchAction: 'none'
                    }}
                >
                    <Canvas
                        key={open}
                        camera={{ position: [0, -400, 200], fov: 55 }}
                        shadows
                        style={{ touchAction: 'none' }}
                        onCreated={({ gl }) => {
                            gl.domElement.style.touchAction = 'none';
                        }}
                    >
                        <Suspense fallback={<Html center><div style={{ color: '#7f7f7fff' }}>지도 로딩중...</div></Html>}>
                            <ambientLight intensity={0.7} />
                            <directionalLight position={[100, 100, 50]} intensity={1.4} castShadow />

                            <CampusScene
                                selectedId={selectedId}
                                onBuildingSelect={setSelectedId}
                            />

                            <OrbitControls
                                ref={controlsRef}
                                makeDefault
                                target={[0, 0, 0]}
                                minPolarAngle={Math.PI / 1.25}
                                maxPolarAngle={Math.PI / 1.25}
                                enableRotate={false}
                                enablePan={true}
                                screenSpacePanning={true}
                                panSpeed={0.8}
                                enableZoom={true}
                                zoomSpeed={1}
                                maxDistance={750}
                                minDistance={320}
                                mouseButtons={{
                                    LEFT: 2,
                                    MIDDLE: 0,
                                    RIGHT: 0
                                }}
                                touches={{
                                    ONE: 1, // 한 손가락 패닝 (TOUCH.PAN)
                                    TWO: 2  // 두 손가락 줌 (TOUCH.DOLLY_PAN)
                                }}
                            />
                        </Suspense>
                    </Canvas>

                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '11px',
                        color: '#6b7280',
                        pointerEvents: 'none',
                        background: 'rgba(255,255,255,0.5)',
                        padding: '4px 8px',
                        borderRadius: '10px',
                    }}>
                        터치로 이동, 핀치로 확대/축소
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={onClose}
                        style={{ background: 'var(--card-background)', color: 'var(--text-color)', padding: '15px 20px', borderRadius: '15px', fontSize: '15px', textAlign: 'center', flex: 1 }}
                    >
                        닫기
                    </button>
                    <button
                        onClick={() => openExternalMap(selectedId)}
                        disabled={!currentLabel || !hasExternalLink}
                        style={{ background: 'var(--button-background)', color: 'var(--text-color)', padding: '15px 20px', borderRadius: '15px', fontSize: '15px', textAlign: 'center', flex: 1 }}
                    >
                        지도 앱으로 열기
                    </button>
                </div>
            </div>
        </BottomSheet>
    );
}
import { useCallback, useState, useEffect } from 'react';
import Script from 'next/script';
import Head from 'next/head';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { parse } from 'node-html-parser';
import { KLAS } from '../lib/core/klas';
import { CHATKIT_API_URL, STARTER_PROMPTS, } from '../lib/chatkit-config';
import { menuItems } from "../lib/profile/menuItems";
import IonIcon from '@reacticons/ionicons';

const LoadingSpinner = () => (
    <motion.svg
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{ width: '18px', height: '18px', color: '#3b82f6' }}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </motion.svg>
);


async function getSubjectList() {
    const sessionId = localStorage.getItem('klasSessionToken');

    try {
        const data = await KLAS('https://klas.kw.ac.kr/std/cmn/frame/YearhakgiAtnlcSbjectList.do', sessionId, {});
        return data;
    } catch (error) {
        console.error(error);
        return { error: error.message };
    }
}

async function getPortalMenus() {
    return menuItems;
}


async function searchCourseInfo({ courseName, courseLabel, courseCode }) {
    const currentYearHakgi = localStorage.getItem('currentYearHakgi');
    const sessionId = localStorage.getItem('klasSessionToken');

    const body = {
        selectYearhakgi: currentYearHakgi,
        selectSubj: courseCode,
        selectChangeYn: "Y",
        subjNm: courseLabel,
        subj: {
            value: courseCode,
            label: courseLabel,
            name: courseName
        }
    };

    try {
        const data = await KLAS('https://klas.kw.ac.kr/std/lis/evltn/LctrumHomeStdInfo.do', sessionId, body);
        return data;
    } catch (error) {
        console.error(error);
        return { error: error.message };
    }
}

async function searchTaskList({ courseName, courseLabel, courseCode }) {
    const currentYearHakgi = localStorage.getItem('currentYearHakgi');
    const sessionId = localStorage.getItem('klasSessionToken');

    const body = {
        selectYearhakgi: currentYearHakgi,
        selectSubj: courseCode,
        selectChangeYn: "Y",
        subjNm: courseLabel,
        subj: {
            value: courseCode,
            label: courseLabel,
            name: courseName
        }
    };

    try {
        const data = await KLAS('https://klas.kw.ac.kr/std/lis/evltn/TaskStdList.do', sessionId, body);
        return data;
    } catch (error) {
        console.error(error);
        return { error: error.message };
    }
}

async function getKWNoticeList() {
    try {
        const response = await fetch('/api/crawler/kwNotice');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('에러 발생:', error.message);
        return [];
    }
}

async function searchKWNoticeList({ query }) {
    try {
        const response = await fetch('/api/crawler/kwNotice?url=' + query);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('에러 발생:', error.message);
        return [];
    }
}

async function getSchedules() {
    try {
        const response = await fetch('/api/crawler/schedule');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('에러 발생:', error.message);
        return null;
    }
}

async function getHaksik() {
    try {
        const response = await fetch('/api/crawler/cafeteria');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('에러 발생:', error.message);
        return null;
    }
}

async function getHomepageSitemap() {
    try {
        const response = await fetch('/api/crawler/kwSitemap');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('에러 발생:', error.message);
        return [];
    }
}

async function getContentFromUrl({ urls }) {
    if (!urls || !Array.isArray(urls)) {
        console.error('getContentFromUrl: urls parameter is not an array:', urls);
        return { error: 'urls parameter must be an array' };
    }

    const combinedData = [];
    for (const singleUrl of urls) {
        try {
            const response = await fetch('/api/crawler/turndown?url=' + singleUrl);
            const json = await response.json();
            combinedData.push(json.markdown);
        } catch (error) {
            console.error('에러 발생:', error.message);
        }
    }
    return combinedData;
}

export default function ChatKitComponent() {
    const [agentProcess, setAgentProcess] = useState({
        visible: false,
        title: '생각 중...',
        steps: []
    });

    useEffect(() => {
        if (!agentProcess.visible) {
            const timer = setTimeout(() => {
                setAgentProcess(prev => ({ ...prev, steps: [] }));
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [agentProcess.visible]);

    const handleResponseStart = useCallback(() => {
        setAgentProcess(prev => ({ ...prev, visible: true }));
    }, []);

    const handleMessageChunk = useCallback(() => {
        setAgentProcess(prev => ({ ...prev, visible: true }));
    }, []);

    const handleResponseEnd = useCallback(() => {
        console.log('AI response completed');
        setAgentProcess(prev => ({ ...prev, visible: false }));
    }, []);

    const handleError = useCallback(({ error }) => {
        console.error('ChatKit error:', error);
        setAgentProcess(prev => ({ ...prev, visible: false }));
    }, []);

    const getClientSecret = useCallback(async (existingSecret) => {
        const response = await fetch(CHATKIT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Failed to create ChatKit session');
        }

        const { client_secret } = await response.json();
        return client_secret;
    }, []);

    const prefersDark = typeof window !== 'undefined'
        && window.matchMedia
        && window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme = {
        colorScheme: prefersDark ? 'dark' : 'light',
        radius: 'pill',
        density: 'normal',
        color: {
            accent: {
                primary: '#87373B',
                level: 1
            }
        },
        typography: {
            baseSize: 16,
            fontFamily: '"OpenAI Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
            fontFamilyMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
            fontSources: [
                {
                    family: 'OpenAI Sans',
                    src: 'https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-Regular.woff2',
                    weight: 400,
                    style: 'normal',
                    display: 'swap'
                }
            ]
        }
    };

    const chatkit = useChatKit({
        api: { getClientSecret },
        theme,
        composer: {
            placeholder: '무엇이 궁금한가요?',
            attachments: {
                enabled: true,
                maxCount: 5,
                maxSize: 10485760
            }
        },
        threadItemActions: {
            feedback: true,
            retry: true
        },
        disclaimer: {
            text: 'AI가 생성한 응답은 정확하지 않을 수 있어요.',
        },
        startScreen: {
            greeting: '안녕하세요. 저는 KLAS AI예요.',
            prompts: STARTER_PROMPTS,

        },
        onResponseStart: handleResponseStart,
        onMessage: handleMessageChunk, // or try catching onMessage
        onResponseEnd: handleResponseEnd,
        onError: handleError,
        onClientTool: async (toolCall) => {
            const { name, params } = toolCall;
            console.log('Client tool called:', name, params);
            const stepId = Math.random().toString(36).substring(7);

            let toolDesc = '정보를 검색하는 중...';
            switch (name) {
                case 'getSubjectList': toolDesc = '수강 과목 목록을 가져오는 중...'; break;
                case 'searchCourseInfo': toolDesc = '강의 정보를 검색하는 중...'; break;
                case 'searchTaskList': toolDesc = '과제 목록을 검색하는 중...'; break;
                case 'getKWNoticeList': toolDesc = '광운대학교 공지사항을 가져오는 중...'; break;
                case 'searchKWNoticeList': toolDesc = '공지사항을 검색하는 중...'; break;
                case 'getSchedules': toolDesc = '학사 일정을 가져오는 중...'; break;
                case 'getHaksik': toolDesc = '학식 메뉴를 가져오는 중...'; break;
                case 'getHomepageSitemap': toolDesc = '홈페이지 사이트맵을 가져오는 중...'; break;
                case 'getContentFromUrl': toolDesc = '웹 페이지 내용을 읽는 중...'; break;
                case 'getPortalMenus': toolDesc = 'KLAS 메뉴를 확인하는 중...'; break;
            }

            setAgentProcess(prev => ({
                visible: true,
                title: '필요한 도구 호출 중',
                steps: [...prev.steps, { id: stepId, text: toolDesc, status: 'loading' }]
            }));

            try {
                switch (name) {
                    case 'getSubjectList':
                        return await getSubjectList();
                    case 'searchCourseInfo':
                        return await searchCourseInfo(params);
                    case 'searchTaskList':
                        return await searchTaskList(params);
                    case 'getKWNoticeList':
                        return await getKWNoticeList();
                    case 'searchKWNoticeList':
                        return await searchKWNoticeList(params);
                    case 'getSchedules':
                        return await getSchedules();
                    case 'getHaksik':
                        return await getHaksik();
                    case 'getHomepageSitemap':
                        return await getHomepageSitemap();
                    case 'getContentFromUrl':
                        return await getContentFromUrl(params);
                    case 'getPortalMenus':
                        return await getPortalMenus();
                    default:
                        console.warn(`Unhandled client tool: ${name}`);
                        throw new Error(`Unhandled client tool: ${name}`);
                }
            } catch (error) {
                console.error('Error calling client tool:', error);
                setAgentProcess(prev => ({
                    ...prev,
                    steps: prev.steps.map(step => step.id === stepId ? { ...step, status: 'error', text: '오류가 발생했습니다.' } : step)
                }));
            } finally {
                setAgentProcess(prev => ({
                    ...prev,
                    title: '답변 생성 중...',
                    steps: prev.steps.map(step => step.id === stepId ? { ...step, status: 'completed' } : step)
                }));
            }
        },
    });

    return (
        <main>
            <Toaster position="top-center" />

            <AnimatePresence>
                {agentProcess.visible && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'fixed',
                            bottom: '100px',
                            left: '50%',
                            x: '-50%',
                            zIndex: 9999,
                            width: '85%',
                            background: prefersDark ? 'rgba(28, 28, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            color: prefersDark ? '#ffffff' : '#000000',
                            borderRadius: '32px',
                            boxShadow: prefersDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)',
                            padding: '16px 20px',
                            border: prefersDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px',
                        }}
                    >
                        <motion.div layout="position" style={{ display: 'flex', alignItems: 'center', gap: '16px', fontWeight: 600, fontSize: '14px' }}>
                            <span className='shimmering'>{agentProcess.title}</span>
                        </motion.div>
                        {agentProcess.steps.length > 0 && (
                            <motion.div layout style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <AnimatePresence mode="popLayout">
                                    {agentProcess.steps.map((step, idx) => (
                                        <motion.div
                                            key={step.id}
                                            layout
                                            initial={{ opacity: 0, x: -10, height: 0 }}
                                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                                            exit={{ opacity: 0, scale: 0.9, height: 0 }}
                                            style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', position: 'relative', overflow: 'hidden' }}
                                        >
                                            {/* Connecting Line */}
                                            {idx !== agentProcess.steps.length - 1 && (
                                                <div style={{ position: 'absolute', left: '8.5px', top: '22px', bottom: '-14px', width: '2px', backgroundColor: prefersDark ? '#374151' : '#e5e7eb', borderRadius: '9999px' }} />
                                            )}
                                            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'transparent' }}>
                                                {step.status === 'loading' ? <LoadingSpinner /> : <IonIcon name="checkmark-circle" style={{ color: '#22c55e', fontSize: '18px' }} />}
                                            </div>
                                            <div style={{
                                                transition: 'color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                                                width: '100%',
                                                color: step.status === 'completed'
                                                    ? (prefersDark ? '#9ca3af' : '#6b7280')
                                                    : (prefersDark ? '#f3f4f6' : '#111827')
                                            }}>
                                                {step.text}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <ChatKit control={chatkit.control} style={{ height: '100dvh', width: 'calc(100% + 2em)', margin: '-1em' }} />

            <Script
                src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
                strategy="afterInteractive"
            />
        </main>
    );
}

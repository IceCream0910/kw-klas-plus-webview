import { useCallback } from 'react';
import Script from 'next/script';
import Head from 'next/head';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { parse } from 'node-html-parser';
import { KLAS } from '../lib/core/klas';
import { CHATKIT_API_URL, STARTER_PROMPTS, } from '../lib/chatkit-config';
import { menuItems } from "../lib/profile/menuItems";

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
    const handleError = useCallback(({ error }) => {
        console.error('ChatKit error:', error);
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
            },
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
        onResponseEnd: handleResponseEnd,
        onError: handleError,
        onClientTool: async (toolCall) => {
            const { name, params } = toolCall;
            console.log('Client tool called:', name, params);

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
        },
    });

    return (
        <main>
            <ChatKit control={chatkit.control} style={{ height: '100dvh', width: 'calc(100% + 2em)', margin: '-1em' }} />

            <Script
                src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
                strategy="afterInteractive"
            />
        </main>
    );
}

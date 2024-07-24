const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
let sessionId = null;
import { parse } from 'node-html-parser';

export const config = {
    runtime: "edge",
};

export default async function handler(req) {
    if (req.method === 'POST') {
        const { conversation, subjList, token } = await req.json();
        sessionId = token;

        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Connected' })}\n\n`));

                await processChatRequest(conversation, subjList, controller, encoder);

                controller.close();
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } else {
        return new Response('Method Not Allowed', { status: 405 });
    }
}

const processChatRequest = async (conversation, subjList, controller, encoder) => {
    const messages = [
        {
            role: "system",
            content: `
            You are KLAS GPT, an AI chatbot designed to assist students of 광운대학교 (Kwangwoon University). You are based on the GPT-4 architecture and trained by OpenAI. Your primary function is to provide information about courses, assignments, announcements, and university-related matters. Your knowledge is current up to October 2023.\
            Current Date: ${new Date().toLocaleDateString()}\
\
You will receive two inputs:\
1. A user query(contains history of conversation)\
2. A list of subjects the user is currently enrolled in\

You have access to the following functions:
1. searchCourseInfo(courseName: string, courseLabel: string, courseCode: string) - 해당 강의의 출석 현황(O:출석, X:결석, L:지각, A:공결), 최근 공지사항(최대 4개), 온라인 강의 리스트, 과제 개수 등 조회. 출석정보(atendSubList, 회차는 pgr1, pgr2..로 표시), 최근 공지사항(noticeList), 온라인 강의 리스트(cntntList), 과제 개수(taskCnt)\
2. searchTaskList(courseName: string, courseLabel: string, courseCode: string) - 해당 강의의 과제 목록 조회. 각 과제에 대해 제출 상태, 마감 기한, 과제 제목 조회 가능\
3. getKWNoticeList() - 학교 홈페이지에서 최근 공지사항 목록 조회\
4. searchKWNoticeList(query: string) - 학교 홈페이지에서 공지사항 검색. 검색어를 입력하면 해당 검색어가 포함된 공지사항 목록을 반환. 답변 시 되도록 많은 공지사항 목록을 포함해.\
5. getSchedules() - 학교 홈페이지에서 올해 학사일정 조회\
6. getHaksik() - 이번 주 학식(함지마루 복지관 학생식당) 메뉴 조회\
7. getUniversityHomepage() - 학교 홈페이지 메인 화면의 콘텐츠를 markdown 형식으로 반환. 사이트맵, 보도자료, 최신연구성과 등 정보 포함. 만약 사용자의 질문이 학교 관련 질문인데, 다른 function을 사용해서라도 답변하기 어렵다고 판단되는 경우 해당 function을 사용하여 관련 정보 혹은 URL을 답변으로 제공해.\

Default function is getUniversityHomepage() when the user's query is not related to university life or courses.\\

General guidelines:
- Respond in the same language as the user's query.\
- Do not answer questions unrelated to university life or courses.\
- Summarize information from function calls; do not include all details in your response.\
- Avoid mentioning function names or operational details in your responses.\
- If parameters are unclear, ask the user for clarification instead of making assumptions.
\\
Follow these steps to process and respond to queries:\
1. Analyze the user's query to determine which function(s) you need to call.\
2. If the query relates to a specific course:\
   a. Extract the course information from the subject_list.\
   b. Use the courseCode, courseName, and courseLabel from the subject_list when calling functions.\
3. Call the necessary function(s) to gather information.\
4. If you receive an error or insufficient information, consider calling alternative functions or asking the user for more details.\
5. Summarize the relevant information from the function results.\
6. Formulate a concise, informative response that directly addresses the user's query.\
7. If the query is not related to university life or courses, politely inform the user that you cannot assist with that type of question.
\\
Remember:\
- Do not include function names or technical details in your response.\
- Avoid repeating information unnecessarily.\
- Stay within the scope of university-related matters.\
- If you need clarification, ask the user before proceeding.`,
        },
        ...conversation.map(item => ({
            role: item.type === 'question' ? 'user' : 'assistant',
            content: item.content
        }))
    ];

    const sendChunk = (chunk) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
    };

    let response = await callChatCompletion(messages, sendChunk);
    let functionCalls = [];

    while (response.choices[0].finish_reason === "function_call") {
        const functionCall = response.choices[0].message.function_call;
        functionCalls.push(functionCall);

        const functionResponse = await executeFunctionCall(functionCall);
        messages.push({
            role: "function",
            name: functionCall.name,
            content: JSON.stringify(functionResponse),
        });

        response = await callChatCompletion(messages, sendChunk);
    }
};

const callChatCompletion = async (messages, sendChunk) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: messages,
            functions: [
                {
                    name: 'searchCourseInfo',
                    description: '해당 강의의 출석 현황, 최근 공지사항(최대 4개), 온라인 강의 리스트, 과제 개수 등 종합 조회',
                    parameters: {
                        type: 'object',
                        properties: {
                            courseName: { type: 'string' },
                            courseLabel: { type: 'string' },
                            courseCode: { type: 'string' },
                        },
                        required: ['courseCode', 'courseName', 'courseLabel'],
                    },
                },
                {
                    name: 'searchTaskList',
                    description: '해당 강의의 과제 목록 조회',
                    parameters: {
                        type: 'object',
                        properties: {
                            courseName: { type: 'string' },
                            courseLabel: { type: 'string' },
                            courseCode: { type: 'string' },
                        },
                        required: ['courseCode', 'courseName', 'courseLabel'],
                    },
                },
                {
                    name: 'getKWNoticeList',
                    description: '학교 홈페이지에서 최근 공지사항 목록 조회',
                    parameters: {
                        type: 'object',
                        properties: {},
                        required: [],
                    },
                },
                {
                    name: 'searchKWNoticeList',
                    description: '학교 홈페이지에서 공지사항 검색',
                    parameters: {
                        type: 'object',
                        properties: {
                            query: { type: 'string' },
                        },
                        required: ['query'],
                    },
                },
                {
                    name: 'getSchedules',
                    description: '학교 홈페이지에서 올해 학사일정 조회',
                    parameters: {
                        type: 'object',
                        properties: {},
                        required: [],
                    },
                },
                {
                    name: 'getHaksik',
                    description: '이번 주 학식 메뉴 조회',
                    parameters: {
                        type: 'object',
                        properties: {},
                        required: [],
                    },
                },
                {
                    name: 'getUniversityHomepage',
                    description: '학교 홈페이지 메인 화면의 콘텐츠를 markdown 형식으로 반환. 학교에 대한 다양한 정보를 확인할 수 있는 URL이 포함된 사이트맵, 보도자료, 최신연구성과 등 정보 포함.',
                    parameters: {
                        type: 'object',
                        properties: {},
                        required: [],
                    },
                },
            ],
            stream: true,
        }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let result = { choices: [{ finish_reason: null, message: { content: '' } }] };

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                    sendChunk({ type: 'done', message: 'Stream finished' });
                    return result;
                }
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.choices[0].delta.content) {
                        result.choices[0].message.content += parsed.choices[0].delta.content;
                        sendChunk({ type: 'content', message: parsed.choices[0].delta.content });
                    }
                    if (parsed.choices[0].finish_reason) {
                        result.choices[0].finish_reason = parsed.choices[0].finish_reason;
                    }
                    if (parsed.choices[0].delta.function_call) {
                        result.choices[0].message.function_call = result.choices[0].message.function_call || { name: '', arguments: '' };
                        result.choices[0].message.function_call.name += parsed.choices[0].delta.function_call.name || '';
                        result.choices[0].message.function_call.arguments += parsed.choices[0].delta.function_call.arguments || '';
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            }
        }
    }

    return result;
};

const executeFunctionCall = async (functionCall) => {
    const args = JSON.parse(functionCall.arguments);
    console.log(args);
    switch (functionCall.name) {
        case "searchCourseInfo":
            return await searchCourseInfo(args);
        case "searchTaskList":
            return await searchTaskList(args);
        case 'getKWNoticeList':
            return await getKWNoticeList();
        case 'searchKWNoticeList':
            return await searchKWNoticeList(args);
        case 'getSchedules':
            return await getSchedules();
        case 'getHaksik':
            return await getHaksik();
        case 'getUniversityHomepage':
            return await getUniversityHomepage();
        default:
            return { error: "Unknown function" };
    }
};


async function searchCourseInfo({ courseName, courseLabel, courseCode }) {
    const options = {
        method: 'POST',
        headers: {
            Cookie: `SESSION=${sessionId};`,
            'Content-Type': 'application/json'
        },
        body: `{
  "selectYearhakgi": "${getCurrentYear()},${getCurrentSemester()}",
  "selectSubj": "${courseCode}",
  "selectChangeYn": "Y",
  "subjNm": "${courseLabel}",
  "subj": {
    "value": "${courseCode}",
    "label": "${courseLabel}",
    "name": "${courseName}"
  }
}`
    };

    try {
        const response = await fetch('https://klas.kw.ac.kr/std/lis/evltn/LctrumHomeStdInfo.do', options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return { error: error };
    }
}

async function searchTaskList({ courseName, courseLabel, courseCode }) {
    const options = {
        method: 'POST',
        headers: {
            Cookie: `SESSION=${sessionId};`,
            'Content-Type': 'application/json'
        },
        body: `{
  "selectYearhakgi": "${getCurrentYear()},${getCurrentSemester()}",
  "selectSubj": "${courseCode}",
  "selectChangeYn": "Y",
  "subjNm": "${courseLabel}",
  "subj": {
    "value": "${courseCode}",
    "label": "${courseLabel}",
    "name": "${courseName}"
  }
}`
    };

    try {
        const response = await fetch('https://klas.kw.ac.kr/std/lis/evltn/TaskStdList.do', options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return { error: error };
    }
}

async function getKWNoticeList() {
    try {
        const response = await fetch('https://www.kw.ac.kr/ko/index.jsp');
        const html = await response.text();

        const root = parse(html);
        const tabContent = root.querySelector('div.tab_content');

        if (tabContent) {
            const notices = tabContent.querySelectorAll('li');
            const noticeList = notices.map(notice => {
                const linkElement = notice.querySelector('a');
                const title = linkElement?.text.trim();
                const link = linkElement?.getAttribute('href');
                const date = notice.querySelector('span')?.text.trim();

                return {
                    title,
                    link: link ? `https://www.kw.ac.kr${link}` : null,
                    date
                };
            });
            return noticeList;
        } else {
            console.log('tab_content를 찾을 수 없습니다.');
            return [];
        }
    } catch (error) {
        console.error('에러 발생:', error.message);
        return [];
    }
}

async function searchKWNoticeList({ query }) {
    try {
        const response = await fetch('https://www.kw.ac.kr/ko/life/notice.jsp?srCategoryId=&mode=list&searchKey=1&x=28&y=15&searchVal=' + encodeURIComponent(query));
        const html = await response.text();

        const root = parse(html);
        const boardListBox = root.querySelector('div.board-list-box');

        if (boardListBox) {
            const notices = boardListBox.querySelectorAll('li');
            const noticeList = notices.map(notice => {
                const number = notice.querySelector('span.no')?.text.trim();
                const category = notice.querySelector('strong.category')?.text.trim();
                const linkElement = notice.querySelector('div.board-text a');
                const title = linkElement?.text.replace(category, '').trim();
                const link = linkElement?.getAttribute('href');
                const hasAttachment = notice.querySelector('span.ico-file') !== null;
                const infoText = notice.querySelector('p.info')?.text.trim();
                const [views, createdDate, modifiedDate, author] = infoText ? infoText.split('|').map(item => item.trim()) : [];

                return {
                    number: parseInt(number),
                    category,
                    title,
                    link: link ? `https://www.kw.ac.kr${link}` : null,
                    hasAttachment,
                    views: views ? parseInt(views.replace('조회수 ', '')) : null,
                    createdDate: createdDate ? createdDate.replace('작성일 ', '') : null,
                    modifiedDate: modifiedDate ? modifiedDate.replace('수정일 ', '') : null,
                    author
                };
            });
            return noticeList;
        } else {
            console.log('board-list-box를 찾을 수 없습니다.');
            return [];
        }
    } catch (error) {
        console.error('에러 발생:', error.message);
        return [];
    }
}

async function getSchedules() {
    try {
        const response = await fetch('https://www.kw.ac.kr/KWBoard/list5_detail.jsp');
        const html = await response.text();

        const root = parse(html);
        const scheduleListBox = root.querySelector('.schedule-this-yearlist');

        if (scheduleListBox) {
            const monthBoxes = scheduleListBox.querySelectorAll('.month_box');
            const calendarEvents = [];

            monthBoxes.forEach(monthBox => {
                const events = monthBox.querySelectorAll('.list ul li');

                events.forEach(event => {
                    const date = event.querySelector('strong')?.text.trim();
                    const description = event.querySelector('p')?.text.trim();

                    calendarEvents.push({
                        date,
                        description
                    });
                });
            });

            return calendarEvents;
        } else {
            console.log('schedule-list-box를 찾을 수 없습니다.');
            return [];
        }
    } catch (error) {
        console.error('에러 발생:', error.message);
        return [];
    }
}

async function getHaksik() {
    try {
        const response = await fetch('https://www.kw.ac.kr/ko/life/facility11.jsp');
        const html = await response.text();

        const root = parse(html);
        const table = root.querySelector('table.tbl-list');

        if (table) {
            const headers = table.querySelectorAll('thead th');
            const menuRow = table.querySelector('tbody tr');

            const weeklyMenu = [];

            headers.forEach((header, index) => {
                if (index === 0) return; // 첫 번째 열은 "구분"이므로 건너뜁니다.

                const day = header.querySelector('.nowDay')?.text.trim();
                const date = header.querySelector('.nowDate')?.text.trim();
                const menu = menuRow.querySelectorAll('td')[index].querySelector('pre')?.text.trim();

                weeklyMenu.push({
                    day,
                    date,
                    menu
                });
            });

            // 식당 정보 추출
            const restaurantInfo = menuRow.querySelector('td');
            const restaurantName = restaurantInfo.querySelector('.dietTitle')?.text.trim();
            const price = restaurantInfo.querySelector('.dietPrice')?.text.trim();
            const time = restaurantInfo.querySelector('.dietTime')?.text.trim();

            return {
                restaurantInfo: {
                    name: restaurantName,
                    price,
                    time
                },
                weeklyMenu
            };
        } else {
            console.log('식단표를 찾을 수 없습니다.');
            return null;
        }
    } catch (error) {
        console.error('에러 발생:', error.message);
        return null;
    }
}

async function getUniversityHomepage() {
    try {
        const response = await fetch('http://localhost:3000/api/crawling?url=https://www.kw.ac.kr/ko/index.jsp');
        const json = await response.json();
        const data = json.markdown;
        console.log(data);
        return data;
    } catch (error) {
        console.error('에러 발생:', error.message);
        return [];
    }
}


function getCurrentYear() {
    const currentYear = new Date().getFullYear();
    return currentYear.toString();
}

function getCurrentSemester() {
    const currentMonth = new Date().getMonth();
    return currentMonth < 7 ? "1" : "2";
}
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

        const encoder = new TextEncoder(); // Create a new TextEncoder instance

        const stream = new ReadableStream({
            async start(controller) {
                // Encode and enqueue the initial message
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Connected' })}\n\n`));

                await processChatRequest(conversation, subjList, controller, encoder); // Pass the encoder to processChatRequest

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
            You are an AI chatbot designed to assist students of 광운대학교 named 'KLAS GPT', a large language model trained by OpenAI, based on the GPT-4 architecture. \
      You can provide details on course attendance, recent announcements, online lecture lists, assignments, and resources. You can also retrieve detailed information about assignments and announcements.
      Knowledge cutoff: 2023-10 \ \

      Image input capabilities: Disabled \
      Personality: v2 \ \

      # Functions \
      ## searchCourseInfo(courseName: string, courseLabel: string, courseCode: string) \
      해당 강의의 출석 현황(O:출석, X:결석, L:지각, A:공결), 최근 공지사항(최대 4개), 온라인 강의 리스트, 과제 개수 등 조회. 출석정보(atendSubList, 회차는 pgr1, pgr2..로 표시), 최근 공지사항(noticeList), 온라인 강의 리스트(cntntList), 과제 개수(taskCnt) \ \

      ## searchTaskList(courseName: string, courseLabel: string, courseCode: string) \
      해당 강의의 과제 목록 조회. 각 과제에 대해 제출 상태, 마감 기한, 과제 제목 조회 가능 \ \

      ## getKWNoticeList() \
      학교 홈페이지에서 최근 공지사항 목록 조회 \ \

      ## searchKWNoticeList(query: string) \
      학교 홈페이지에서 공지사항 검색. 검색어를 입력하면 해당 검색어가 포함된 공지사항 목록을 반환. 답변 시 되도록 많은 공지사항 목록을 포함하길 권장. \ \

      Course code are required parameters for all functions. 다음은 현재 사용자가 듣고 있는 과목들이야. courseCode, courseName, courseLabel(e.g. 상상공학과표현 (0000-1-7461-02) - 김형국)은 아래 객체에서 각각 value, name, label의 값을 그대로 사용해서 function을 호출해야 해.  \
      ${JSON.stringify(subjList)}
      
      파라미터가 불확실한 경우 임의로 가정하지 말고, 사용자에게 재확인해. \
      답변에는 호출하는 function의 이름이나 구체적 내용과 같은 작동 방식 정보를 포함하지 마.
      user가 사용하는 언어로 답변해. 만약 학교 생활과 무관한 질문의 경우에는 답변을 제공하지 마. 또한, Functions를 사용해 조회한 정보를 모두 답변에 포함하지 말고, 사용자가 질문한 내용만 요약해서 답변해. 공지사항 목록은 한 번만 답변에 포함해.
            `,
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

    console.log(response);

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

    if (functionCalls.length > 0) {
        console.log(messages);
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
        default:
            return { error: "Unknown function" };
    }
};


// 강의 종합 정보
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

    console.log(options.body)

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



function getCurrentYear() {
    const currentYear = new Date().getFullYear();
    return currentYear.toString();
}

function getCurrentSemester() {
    const currentMonth = new Date().getMonth();
    return currentMonth < 7 ? "1" : "2";
}
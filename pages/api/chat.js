const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
let sessionId = null;
let currentYearHakgi = null;
import { parse } from 'node-html-parser';

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method === 'POST') {
    const { conversation, subjList, token, yearHakgi } = await req.json();
    sessionId = token;
    currentYearHakgi = yearHakgi || new Date().getFullYear() + ',' + (new Date().getMonth() < 7 ? 1 : 2);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Connected' })}\n\n`));

        try {
          await processChatRequest(conversation, subjList, controller, encoder);
        } catch (error) {
          console.error('처리 중 오류 발생:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`));
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete', message: '처리 완료' })}\n\n`));
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
You are KLAS GPT, an AI chatbot designed to assist students of 광운대학교 (Kwangwoon University). You are based on GPT-4 and provide accurate university information up to October 2023. Your task is to respond to user queries in their language while maintaining a natural conversation flow.

<subject_list>
${subjList}
</subject_list>

Current Date: ${new Date().toLocaleDateString()}\

Core Capabilities:
1. Course Support:
   - Check enrolled subjects from the subject_list
   - Use exact course codes/names from subject_list
   - Handle assignments, schedules, and course information

2. Proactive Information Retrieval:
   - Check existing conversation history first to avoid redundant API calls
   - Prioritize notice search (searchKWNoticeList) for time-sensitive queries
   - Actively use sitemap (getHomepageSitemap) for structural information
   - Fetch detailed content (getContentFromUrl) when URL is identified

3. Smart Fallback:
   - Use getUniversityHomepage ONLY for non-university queries
   - Chain functions: Notice Search → Sitemap → URL Content when needed

Processing Flow:
1. Review conversation history first for existing information
2. For course queries:
   a. Validate course in subject_list
   b. Use exact course metadata
   c. Call course-specific functions (searchCourseInfo, searchTaskList)
3. For general university queries:
   a. Check conversation history
   b. If needed → Check sitemap (getHomepageSitemap)
   c. For identified URLs, read contents (getContentFromUrl)
   d. If insufficient, try notice search (searchKWNoticeList)
   e. Synthesize multi-source information

Detailed Instructions:
1. Begin by analyzing the user_query and checking the conversation_history for relevant information.
2. If the query is related to a course:
   - Verify the course exists in the subject_list
   - Use the exact course code and name from the subject_list
   - Utilize searchCourseInfo and searchTaskList functions as needed
3. For general university queries:
   - First, check the conversation_history for relevant information
   - If more information is needed, use getHomepageSitemap to find relevant menu items
   - When a relevant URL is found through getHomepageSitemap, ALWAYS use getContentFromUrl to fetch the page content
   - If the information is still insufficient, use searchKWNoticeList for recent notices
   - Synthesize information from multiple sources when necessary
4. For non-university queries, use getUniversityHomepage as a last resort

Response Guidelines:
- Reuse information from conversation history when available
- Always use tools for unversity-related queries
- Summarize key points from multiple sources
- Include 3-5 relevant notices when using searchKWNoticeList
- Always format URLs as hyperlinks ([텍스트](URL))
- For complex processes, provide step-by-step guidance with official links
- Contain the source of information in the response by link if using 'getContentFromUrl' tools
- Reject non-university queries immediately

Error Handling:
- If parameters are missing, ask specific clarification questions
- In case of API errors, fallback to sitemap/URL methods
- For potentially outdated information, note "2023년 10월 기준" and suggest verification

Important: When you use getHomepageSitemap to find a relevant menu item, you MUST follow up with a getContentFromUrl call to read the content of that page. This ensures you have the most up-to-date and detailed information.

Provide your response in the user's language, maintaining a natural conversation flow.
`
    },
    ...conversation.map(item => ({
      role: item.type === 'question' ? 'user' : 'assistant',
      content: item.content
    }))
  ];

  const sendChunk = (chunk) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
  };

  let shouldContinue = true;
  let iterationCount = 0;

  const toolKoreanNames = {
    searchCourseInfo: "강의 정보 조회",
    searchTaskList: "과제 목록 조회",
    getKWNoticeList: "학교 홈페이지에서 최근 공지사항 목록 조회",
    searchKWNoticeList: "학교 홈페이지에서 공지사항 검색",
    getSchedules: "학사 일정 조회",
    getHaksik: "학식 메뉴 조회",
    getHomepageSitemap: "학교 홈페이지 사이트맵 조회",
    getContentFromUrl: "URL 내용 확인",
  };

  while (shouldContinue && iterationCount < 5) {
    iterationCount++;
    const response = await callChatCompletion(messages, sendChunk);

    if (response.choices[0].finish_reason === "function_call") {
      const functionCall = response.choices[0].message.function_call;
      console.log('함수 호출 감지:', functionCall.name, '인수:', functionCall.arguments);

      sendChunk({
        type: 'tool_start',
        tool: functionCall.name,
        name: toolKoreanNames[functionCall.name],
        input: JSON.parse(functionCall.arguments)
      });

      const functionResponse = await executeFunctionCall(functionCall);
      console.log('함수 실행 결과:', functionCall.name, functionResponse);

      sendChunk({
        type: 'tool_end',
        tool: functionCall.name,
        name: toolKoreanNames[functionCall.name],
        output: functionResponse
      });

      messages.push({
        role: "function",
        name: functionCall.name,
        content: JSON.stringify(functionResponse),
      });
    } else {
      shouldContinue = false;
    }
  }
};

const callChatCompletion = async (messages, sendChunk) => {
  console.log('API 호출:', messages.slice(-1)[0].content.substring(0, 50) + '...');

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
          description: '해당 강의의 출석 현황(O:출석, X:결석, L:지각, A:공결), 최근 공지사항(최대 4개), 온라인 강의 리스트, 과제 개수 등 조회. 출석정보(atendSubList, 회차는 pgr1, pgr2..로 표시), 최근 공지사항(noticeList), 온라인 강의 리스트(cntntList), 과제 개수(taskCnt)',
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
          description: '해당 강의의 과제 목록 조회. 각 과제에 대해 제출 상태, 마감 기한, 과제 제목 조회 가능',
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
          description: '학교 홈페이지에서 공지사항 검색. 검색어를 입력하면 해당 검색어가 포함된 공지사항 목록을 반환. 답변 시 되도록 많은 공지사항 목록을 포함해.',
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
          description: '이번 주 학식(함지마루 복지관 학생식당) 메뉴 조회',
          parameters: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'getHomepageSitemap',
          description: '학교 홈페이지 사이트맵.',
          parameters: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'getContentFromUrl',
          description: '해당 URL의 콘텐츠를 가져옴',
          parameters: {
            type: 'object',
            properties: {
              urls: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['urls'],
          },
        },
      ],
      stream: true,
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result = { choices: [{ finish_reason: null, message: { content: '', function_call: null } }] };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;

      const dataStr = line.slice(6);
      if (dataStr === '[DONE]') break;

      try {
        const data = JSON.parse(dataStr);
        const delta = data.choices[0].delta;

        // 콘텐츠 스트리밍
        if (delta?.content) {
          result.choices[0].message.content += delta.content;
          sendChunk({ type: 'content', message: delta.content });
        }

        // 함수 호출 정보 수집
        if (delta?.function_call) {
          result.choices[0].message.function_call = result.choices[0].message.function_call || { name: '', arguments: '' };
          if (delta.function_call.name) {
            result.choices[0].message.function_call.name += delta.function_call.name;
          }
          if (delta.function_call.arguments) {
            result.choices[0].message.function_call.arguments += delta.function_call.arguments;
          }
        }

        // 완료 이유 업데이트
        if (data.choices[0].finish_reason) {
          result.choices[0].finish_reason = data.choices[0].finish_reason;
        }
      } catch (error) {
        console.error('JSON 파싱 오류:', error);
      }
    }
  }

  return result;
};

const executeFunctionCall = async (functionCall) => {
  console.log('함수 실행 시작:', functionCall.name);
  try {
    const args = JSON.parse(functionCall.arguments);
    let result;

    switch (functionCall.name) {
      case "searchCourseInfo":
        result = await searchCourseInfo(args);
        break;
      case "searchTaskList":
        result = await searchTaskList(args);
        break;
      case 'getKWNoticeList':
        result = await getKWNoticeList();
        break;
      case 'searchKWNoticeList':
        result = await searchKWNoticeList(args);
        break;
      case 'getSchedules':
        result = await getSchedules();
        break;
      case 'getHaksik':
        result = await getHaksik();
        break;
      case 'getHomepageSitemap':
        result = await getHomepageSitemap();
        break;
      case 'getContentFromUrl':
        result = await getContentFromUrl(args);
        break;
      default:
        result = { error: "알 수 없는 함수" };
    }

    console.log('함수 실행 완료:', functionCall.name);
    return result;
  } catch (error) {
    console.error('함수 실행 오류:', functionCall.name, error);
    return { error: error.message };
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
"selectYearhakgi": "${currentYearHakgi}",
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
"selectYearhakgi": "${currentYearHakgi}",
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
    const response = await fetch('https://www.kw.ac.kr/ko/life/notice.jsp?srCategoryId=&mode=list&searchKey=3&x=28&y=15&searchVal=' + encodeURIComponent(query));
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
        if (index === 0) return;

        const day = header.querySelector('.nowDay')?.text.trim();
        const date = header.querySelector('.nowDate')?.text.trim();
        const menu = menuRow.querySelectorAll('td')[index].querySelector('pre')?.text.trim();

        weeklyMenu.push({
          day,
          date,
          menu
        });
      });

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

async function getHomepageSitemap() {
  try {
    const response = await fetch('http://localhost:3000/api/crawler/kwSitemap');
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('에러 발생:', error.message);
    return [];
  }
}

async function getContentFromUrl({ urls }) {
  const combinedData = [];
  for (const singleUrl of urls) {
    try {
      const response = await fetch('https://klasplus.yuntae.in/api/crawler/crawling?url=' + singleUrl);
      const json = await response.json();
      combinedData.push(json.markdown);
    } catch (error) {
      console.error('에러 발생:', error.message);
    }
  }
  return combinedData;
}

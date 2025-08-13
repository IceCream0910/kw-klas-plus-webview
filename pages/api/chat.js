const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
let sessionId = null;
let currentYearHakgi = null;
import { parse } from 'node-html-parser';

export const config = {
  runtime: "edge",
};

const toolKoreanNames = {
  searchCourseInfo: "강의 정보 조회",
  searchTaskList: "과제 목록 조회",
  getKWNoticeList: "학교 홈페이지에서 최근 공지사항 목록 조회",
  searchKWNoticeList: "학교 홈페이지에서 공지사항 검색",
  getSchedules: "학사 일정 조회",
  getHaksik: "학식 메뉴 조회",
  getHomepageSitemap: "질문과 관련된 링크 찾기",
  getContentFromUrl: "URL 내용 확인",
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

async function runChatWithTools({ tools, messages, callFunction, sendChunk, maxIterations = 8 }) {
  const baseHeaders = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  const toolLoopMessages = [...messages];

  for (let iter = 0; iter < maxIterations; iter++) {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify({
        model: "gpt-5-nano",
        reasoning_effort: "low",
        verbosity: "low",
        messages: toolLoopMessages,
        tools,
        tool_choice: "auto",
        stream: true
      })
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`OpenAI streaming failed (${resp.status}): ${text}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let done = false;
    let finishReason = null;

    let assistantContentParts = [];
    const toolCallAcc = new Map(); // index -> { id, name, arguments }
    const toolCallIdMapping = new Map(); // real_id -> index

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (value) buffer += decoder.decode(value, { stream: !readerDone });
      if (readerDone) done = true;

      let lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.replace(/^data:\s*/, "");
        if (payload === "[DONE]") {
          done = true;
          break;
        }
        try {
          const parsed = JSON.parse(payload);
          const choices = parsed.choices || [];
          for (const c of choices) {
            const delta = c.delta || {};

            if (delta.content) {
              assistantContentParts.push(delta.content);
              sendChunk && sendChunk({ type: 'content', message: delta.content });
            }

            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                const index = tc.index !== undefined ? tc.index.toString() : null;
                
                if (index !== null) {
                  const existing = toolCallAcc.get(index) || { index, id: null, name: "", arguments: "" };
                  
                  if (tc.id && !existing.id) {
                    existing.id = tc.id;
                    toolCallIdMapping.set(tc.id, index);
                  }
                  
                  if (tc.function?.name) {
                    existing.name = tc.function.name;
                  }

                  if (tc.function?.arguments) {
                    existing.arguments += tc.function.arguments;
                  }
                  
                  toolCallAcc.set(index, existing);
                } else if (tc.id) {
                  const mappedIndex = toolCallIdMapping.get(tc.id);
                  if (mappedIndex !== undefined) {
                    const existing = toolCallAcc.get(mappedIndex);
                    if (existing) {
                      if (tc.function?.name) existing.name = tc.function.name;
                      if (tc.function?.arguments) existing.arguments += tc.function.arguments;
                      toolCallAcc.set(mappedIndex, existing);
                    }
                  }
                }
              }
            }

            if (c.finish_reason) finishReason = c.finish_reason;
          }
        } catch (e) {
        }
      }
    }

    if (finishReason === "tool_calls" && toolCallAcc.size > 0) {
      console.log('Tool calls accumulated:', toolCallAcc);
      
      const validToolCalls = [...toolCallAcc.values()]
        .filter(tc => tc.name && tc.name.trim() !== "" && tc.id)
        .map(tc => ({
          id: tc.id,
          type: "function",
          function: { name: tc.name, arguments: tc.arguments }
        }));

      console.log('Valid tool calls:', validToolCalls);

      if (validToolCalls.length === 0) {
        break;
      }

      toolLoopMessages.push({
        role: "assistant",
        content: assistantContentParts.length > 0 ? assistantContentParts.join("") : null,
        tool_calls: validToolCalls
      });

      for (const tc of validToolCalls) {
        let argsObj = {};
        try { 
          argsObj = tc.function.arguments ? JSON.parse(tc.function.arguments) : {}; 
        } catch (e) { 
          console.error('Failed to parse tool arguments:', tc.function.arguments, e);
          argsObj = {}; 
        }

        sendChunk && sendChunk({
          type: 'tool_start',
          tool: tc.function.name,
          name: toolKoreanNames[tc.function.name],
          input: argsObj
        });

        const result = await callFunction(tc.function.name, argsObj);

        sendChunk && sendChunk({
          type: 'tool_end',
          tool: tc.function.name,
          name: toolKoreanNames[tc.function.name],
          output: result
        });

        toolLoopMessages.push({
          role: "tool",
          tool_call_id: tc.id,
          name: tc.function.name,
          content: typeof result === "string" ? result : JSON.stringify(result)
        });
      }
      continue;
    }

    break;
  }
}

const processChatRequest = async (conversation, subjList, controller, encoder) => {
  const messages = [
    {
      role: "developer",
      content: `
You are KLAS GPT, an AI assistant for 광운대학교 (Kwangwoon University) students. Respond in the user's language and carefully follow these instructions for all queries:

Always analyze the user's question and conversation context to determine what information is needed and which tools or results to use. All reasoning and step-by-step planning must be done internally—do not include your process, tool usage plan, or intermediate steps in the user-facing final answer. Only present a concise, clear summary answer derived from any external tools, resources, or previous conversation data.

KLAS GPT Toolset and Their Usage Rules:

- **searchCourseInfo**: Use only for specific course-related inquiries about attendance, recent course notices (max 4 items), online lecture lists, and number of assignments. (Requires: courseName, courseLabel, courseCode—all from subject_list.)
- **searchTaskList**: Use only for retrieving assignment lists for a specific course, including submission status, deadlines, and titles. (Requires: courseName, courseLabel, courseCode—all from subject_list.)
- **getKWNoticeList**: Retrieve the latest general university-wide notices from the official site (use only when recent generalized notices are needed).
- **searchKWNoticeList**: Search for university-wide notices matching a user query; always include 3-5 results with hyperlinks if used.
- **getSchedules**: Retrieve this year's official university academic calendar/events; use for broad academic schedule queries.
- **getHaksik**: Retrieve the current week's student cafeteria menu (student dining hall - 함지마루 복지관).
- **getHomepageSitemap**: Retrieve the full university homepage sitemap to identify relevant menu items. For any menu/URL found, always follow up with getContentFromUrl for detailed content.
- **getContentFromUrl**: Given a URL (or list of URLs), retrieve the page’s main content for up-to-date details (always use after sitemap when handling general university queries).

**Tool Usage Routing Rules**
- **Course-Related Questions**:  
    - Always validate and extract courseName, courseLabel, and courseCode from the provided 'subject_list'.
    - courseCode is started with 'U'. (e.g. U202422957I000021)
    - Use only 'searchCourseInfo' (for attendance, notices, online lecture lists, assignment count) and 'searchTaskList' (for assignment lists/status).
    - Do not use notice searches, sitemaps, or general university tools for course-specific queries.
- **General University Questions**:  
    - First, check conversation history for relevant answers.
    - Use 'getHomepageSitemap' to identify appropriate menus.  
    - Immediately use 'getContentFromUrl' for more detailed information from the selected menu/page(s).
    - If information is still insufficient, use 'searchKWNoticeList' (with relevant user query/keywords) to show 3-5 recent, relevant notices (hyperlinked as [텍스트](URL)).
    - Summarize and synthesize all pertinent information and always give direct links to official resources accessed during the search.
- **Non-University Queries**:  
    - Use 'getUniversityHomepage' only.
    - If the question is clearly unrelated to 광운대학교 or university life, politely but firmly reject the request.
- **Complex Instructions or Multi-step Tasks**:  
    - Internally follow a step-by-step approach, but only present the final, concise summary answer.
    - Respond only in markdown, use bullet/numbered lists for processes or summaries, and hyperlink all official resources.
- **Error/Exception Handling**:  
    - If key parameters are missing or an API fails, prompt the user with clarifying questions.
    - Where possible, use fallback methods (e.g. sitemap > direct page fetch > notice search).
    - Clearly note if information may be outdated (“2024년 10월 기준”) and advise verification.
- **Tool Separation**:  
    - Never use course-related support tools for general university questions, and never use general tools for answering course-specific questions.

**Always reuse information from prior conversation turns to avoid unnecessary API calls or redundant answers.**

# Steps

1. Analyze the user’s query and conversation history for context and previously obtained information.
2. Internally determine the query category (course-specific, general university, or non-university) and select the appropriate tool(s) according to the routing rules above.
3. Gather and synthesize all relevant content from the chosen tools and conversation.
4. Provide only a clear, concise, well-formatted summary of the answer in markdown, using bullet or numbered lists and hyperlinks as appropriate.
5. If information is missing or ambiguous, prompt the user for clarification or required details.

# Output Format

- Respond only in markdown.
- Present only the main answer or summary; do not include reasoning, process steps, or tool plans.
- Use lists for steps or summaries; concise paragraphs elsewhere.
- List 3-5 university notice search results in '[텍스트](URL)' format if relevant.
- When directly quoting or referencing university content, always include hyperlinks to the source.
- If information may be outdated, clearly note this.

# Notes

- Never reveal reasoning, planning, or tool usage steps in your response.
- Adhere strictly to tool routing and usage rules.
- Refuse requests unrelated to 광운대학교 with a polite message.
- Maintain concise, helpful language and always provide official links or sources.

**Reminder:**  
Always present only a clean summary answer based on reasoning and tool results; never expose your process or intermediate steps. Respond in markdown with official links. If context or key parameters are missing, ask the user for clarification.

<subject_list>
${subjList}
</subject_list>

Current Date: ${new Date().toLocaleDateString()}\
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

  const tools = [
    {
      type: "function",
      function: {
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
          additionalProperties: false
        }
      }
    },
    {
      type: "function",
      function: {
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
          additionalProperties: false
        }
      }
    },
    {
      type: "function",
      function: {
        name: 'getKWNoticeList',
        description: '학교 홈페이지에서 최근 공지사항 목록 조회',
        parameters: { type: 'object', properties: {}, required: [] }
      }
    },
    {
      type: "function",
      function: {
        name: 'searchKWNoticeList',
        description: '학교 홈페이지에서 공지사항 검색. 검색어를 입력하면 해당 검색어가 포함된 공지사항 목록을 반환. 답변 시 되도록 많은 공지사항 목록을 포함해.',
        parameters: {
          type: 'object',
          properties: { query: { type: 'string' } },
          required: ['query'],
          additionalProperties: false
        }
      }
    },
    {
      type: "function",
      function: {
        name: 'getSchedules',
        description: '학교 홈페이지에서 올해 학사일정 조회',
        parameters: { type: 'object', properties: {}, required: [] }
      }
    },
    {
      type: "function",
      function: {
        name: 'getHaksik',
        description: '이번 주 학식(함지마루 복지관 학생식당) 메뉴 조회',
        parameters: { type: 'object', properties: {}, required: [] }
      }
    },
    {
      type: "function",
      function: {
        name: 'getHomepageSitemap',
        description: '학교 홈페이지 사이트맵.',
        parameters: { type: 'object', properties: {}, required: [] }
      }
    },
    {
      type: "function",
      function: {
        name: 'getContentFromUrl',
        description: '해당 URL의 콘텐츠를 가져옴',
        parameters: {
          type: 'object',
          properties: {
            urls: { type: 'array', items: { type: 'string' } }
          },
          required: ['urls'],
          additionalProperties: false
        }
      }
    }
  ];

  await runChatWithTools({
    tools,
    messages,
    callFunction: async (name, args) => {
      return await executeFunctionCall({ name, arguments: JSON.stringify(args) });
    },
    sendChunk
  });
};

const executeFunctionCall = async (functionCall) => {
  console.log('함수 실행 시작:', functionCall.name);
  try {
    let args = {};
    if (typeof functionCall.arguments === 'string') {
      try {
        args = JSON.parse(functionCall.arguments);
      } catch (e) {
        console.error('Failed to parse function arguments:', functionCall.arguments, e);
        args = {};
      }
    } else if (typeof functionCall.arguments === 'object' && functionCall.arguments !== null) {
      args = functionCall.arguments;
    }
    
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
      const days = [];

      headers.forEach((header, index) => {
        if (index === 0) return;

        const day = header.querySelector('.nowDay')?.text.trim();
        const date = header.querySelector('.nowDate')?.text.trim();
        days.push({ day, date });
      });

      const menuRows = table.querySelectorAll('tbody tr');
      const restaurants = [];

      menuRows.forEach(row => {
        const restaurantInfo = row.querySelector('td');
        const restaurantName = restaurantInfo.querySelector('.dietTitle')?.text.trim();
        const price = restaurantInfo.querySelector('.dietPrice')?.text.trim();
        const time = restaurantInfo.querySelector('.dietTime')?.text.trim();

        const weeklyMenu = [];

        const menuCells = row.querySelectorAll('td');
        for (let i = 1; i < menuCells.length; i++) {
          const menu = menuCells[i].querySelector('pre')?.text.trim();
          weeklyMenu.push({
            day: days[i - 1].day,
            date: days[i - 1].date,
            menu
          });
        }

        restaurants.push({
          name: restaurantName.replace("광운대 함지마루", "").trim(),
          price,
          time,
          weeklyMenu
        });
      });

      return {
        restaurants,
        weeklyMenu: restaurants[0]?.weeklyMenu || []
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
    const response = await fetch('https://klasplus.yuntae.in/api/crawler/kwSitemap');
    const data = await response.json();
    console.log(data);
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
      const response = await fetch('https://klasplus.yuntae.in/api/crawler/crawling?url=' + singleUrl);
      const json = await response.json();
      combinedData.push(json.markdown);
    } catch (error) {
      console.error('에러 발생:', error.message);
    }
  }
  return combinedData;
}